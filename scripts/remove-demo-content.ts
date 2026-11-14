/**
 * Removes the AI-generated demonstration content created by `npm run db:seed`.
 *
 *   npm run db:remove-demo              # dry run: lists what would be removed
 *   npm run db:remove-demo -- --confirm # removes it
 *
 * Only rows flagged isDemo that are still Draft are touched. Anything you have
 * edited and published has isDemo cleared and is never removed. Categories,
 * disciplines and your own lessons and questions are left alone.
 */
import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const confirm = process.argv.includes('--confirm');
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const demo = { isDemo: true, status: 'DRAFT' as const };

try {
  const host = new URL(process.env.DATABASE_URL || 'postgresql://unset').hostname;
  const [lessons, questions, attempts, linkedFromReal] = await Promise.all([
    db.lesson.findMany({ where: demo, select: { id: true, slug: true, title: true } }),
    db.question.findMany({ where: demo, select: { id: true, text: true } }),
    db.attempt.count({ where: { isDemo: true } }),
    // Your own questions linked to a demo lesson lose only that link.
    db.questionLesson.count({ where: { lesson: demo, question: { isDemo: false } } }),
  ]);
  console.log(`Database host: ${host}`);
  console.log(`\nDemo lessons (${lessons.length}):`);
  for (const l of lessons) console.log(`  - ${l.title} (${l.slug})`);
  console.log(`\nDemo questions: ${questions.length}`);
  console.log(`Demo quiz attempts: ${attempts}`);
  if (linkedFromReal)
    console.log(
      `Links from your own questions to demo lessons (will be removed): ${linkedFromReal}`,
    );

  if (!lessons.length && !questions.length && !attempts) {
    console.log('\nNothing to remove.');
  } else if (!confirm) {
    console.log('\nDry run only. Re-run with --confirm to remove these records.');
  } else {
    const result = await db.$transaction(async (tx) => {
      const removedAttempts = await tx.attempt.deleteMany({ where: { isDemo: true } });
      // AnswerOption and QuestionLesson rows cascade with their question/lesson.
      const removedQuestions = await tx.question.deleteMany({ where: demo });
      const removedLessons = await tx.lesson.deleteMany({ where: demo });
      await tx.auditLog.create({
        data: {
          actor: 'remove-demo-content script',
          action: 'DELETE_DEMO',
          entity: 'seed',
          entityId: 'demo-content',
          before: {
            lessons: lessons.map((l) => l.slug),
            questions: questions.length,
            attempts,
          },
        },
      });
      return {
        lessons: removedLessons.count,
        questions: removedQuestions.count,
        attempts: removedAttempts.count,
      };
    });
    console.log('\nRemoved:', result);
  }
} finally {
  await db.$disconnect();
}
