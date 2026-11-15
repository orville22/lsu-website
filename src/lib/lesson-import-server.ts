import 'server-only';
import { z } from 'zod';
import { db } from './db';
import { HttpError } from './security';
import { lessonSchema } from './validation';
import { parseLessonMarkdown } from './lesson-import';
import { saveLesson } from './lesson-save';
import { lessonUrl } from './content';

const requestSchema = z.object({
  markdown: z.string().min(1, 'Paste or choose a Markdown lesson.').max(500_000),
  commit: z.boolean().default(false),
  /** Publish immediately (requires the review attestation). Otherwise saved as Draft. */
  publish: z.boolean().default(false),
  reviewed: z.boolean().default(false),
  /** Confirms replacing an existing lesson with the same slug, keeping its URL. */
  replace: z.boolean().default(false),
});

/** Previews or imports a Markdown lesson. Preview never writes to the database. */
export async function importLesson(actor: string, body: unknown) {
  const req = requestSchema.parse(body);
  const { lesson, errors, warnings } = parseLessonMarkdown(req.markdown, { author: actor });
  const [category, existing] = await Promise.all([
    lesson.categorySlug
      ? db.category.findUnique({
          where: { slug: lesson.categorySlug },
          include: { discipline: true },
        })
      : null,
    lesson.slug
      ? db.lesson.findUnique({
          where: { slug: lesson.slug },
          include: { category: { include: { discipline: true } } },
        })
      : null,
  ]);
  if (lesson.categorySlug && !category) {
    const slugs = (await db.category.findMany({ select: { slug: true }, orderBy: { slug: 'asc' } }))
      .map((c) => c.slug)
      .join(', ');
    errors.push(`Unknown category “${lesson.categorySlug}”. Use one of: ${slugs}.`);
  }
  const status = req.publish ? 'PUBLISHED' : 'DRAFT';
  const { categorySlug: _, ...fields } = lesson;
  const candidate = {
    ...fields,
    categoryId: category?.id || 'unknown',
    status,
    reviewed: req.reviewed,
  };
  const checked = lessonSchema.safeParse(candidate);
  if (!checked.success)
    for (const i of checked.error.issues) {
      const where = i.path.length ? `${i.path.join('.')}: ` : '';
      const msg = `${where}${i.message}`;
      if (
        !errors.includes(msg) &&
        !(req.publish && !req.reviewed && /review confirmation/.test(msg))
      )
        errors.push(msg);
    }
  if (req.publish && !req.reviewed) errors.push('Publishing needs the review confirmation ticked.');
  if (existing?.status === 'PUBLISHED' && !req.publish)
    warnings.push(
      'This replaces a published lesson. Importing as Draft takes the live page offline until you publish it again.',
    );
  if (existing?.isDemo) warnings.push('This replaces a seeded demonstration lesson.');

  const summary = {
    title: lesson.title,
    slug: lesson.slug,
    category: category?.name || lesson.categorySlug,
    difficulty: lesson.difficulty,
    depth: lesson.depth,
    readingMinutes: lesson.readingMinutes,
    objectives: lesson.objectives.length,
    takeaways: lesson.takeaways.length,
    sections: lesson.blocks.flatMap((b) => (b.type === 'text' && b.heading ? [b.heading] : [])),
    blocks: lesson.blocks.reduce<Record<string, number>>(
      (n, b) => ({ ...n, [b.type]: (n[b.type] || 0) + 1 }),
      {},
    ),
    references: lesson.references.map((r) => r.citation),
    existing: existing
      ? { status: existing.status, version: existing.version, title: existing.title }
      : null,
  };
  if (!req.commit) return { summary, errors, warnings };

  if (errors.length || !checked.success || !category)
    throw new HttpError(400, `Import blocked: ${errors[0] || 'the lesson is not valid.'}`);
  if (existing && !req.replace)
    throw new HttpError(
      409,
      `A lesson with the slug “${lesson.slug}” already exists. Tick “Replace the existing lesson” to update it at the same address.`,
    );
  const id = await db.$transaction((tx) =>
    saveLesson(
      tx,
      actor,
      checked.data,
      existing ? { id: existing.id, version: existing.version } : {},
      existing ? 'IMPORT_REPLACE' : 'IMPORT',
    ),
  );
  const saved = await db.lesson.findUniqueOrThrow({
    where: { id },
    include: { category: { include: { discipline: true } } },
  });
  return { id, status: saved.status, url: lessonUrl(saved), summary, warnings };
}
