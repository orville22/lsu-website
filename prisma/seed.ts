import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { categoryDefinitions } from '../src/lib/catalog';
import { lessonSeeds, questionSeeds } from './seed-data';
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
  const discipline = await db.discipline.upsert({
    where: { slug: 'clinical-chemistry' },
    create: { slug: 'clinical-chemistry', name: 'Clinical Chemistry' },
    update: {},
  });
  for (const [slug, name, description] of categoryDefinitions)
    await db.category.upsert({
      where: { slug },
      create: { slug, name, description, disciplineId: discipline.id },
      update: {},
    });
  for (const lesson of lessonSeeds) {
    const category = await db.category.findUniqueOrThrow({ where: { slug: lesson.category } });
    const { category: _, ...data } = lesson;
    await db.lesson.upsert({
      where: { slug: data.slug },
      create: {
        ...data,
        categoryId: category.id,
        status: 'DRAFT',
        isDemo: true,
        author: 'AI-generated demonstration — founder review required',
      },
      update: {},
    });
  }
  for (let i = 0; i < questionSeeds.length; i++) {
    const q = questionSeeds[i];
    const category = await db.category.findUniqueOrThrow({ where: { slug: q.category } });
    const lesson = await db.lesson.findUniqueOrThrow({ where: { slug: q.lesson } });
    await db.question.upsert({
      where: { id: `demo-question-${i + 1}` },
      create: {
        id: `demo-question-${i + 1}`,
        text: q.text,
        explanation: q.explanation,
        categoryId: category.id,
        subtopic: q.subtopic || '',
        difficulty: q.difficulty,
        tags: ['demonstration'],
        references: lesson.references!,
        author: 'AI-generated demonstration — founder review required',
        status: 'DRAFT',
        isDemo: true,
        options: {
          create: q.options.map((text, position) => ({
            text,
            position,
            isCorrect: position === q.correct,
          })),
        },
        lessons: { create: { lessonId: lesson.id } },
      },
      update: {},
    });
  }
  console.log(
    `Seeded ${lessonSeeds.length} draft lessons and ${questionSeeds.length} draft questions. Nothing published. Existing content preserved.`,
  );
}
main().finally(() => db.$disconnect());
