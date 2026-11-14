import { z } from 'zod';
import Papa from 'papaparse';
import { db } from '@/lib/db';
import { Prisma } from '@/generated/prisma/client';
import {
  assertOrigin,
  requireAdmin,
  readJson,
  errorResponse,
  HttpError,
  rateLimit,
} from '@/lib/security';
import { questionSchema, lessonSchema } from '@/lib/validation';
import { parseImport, normalize } from '@/lib/import';
const json = (v: unknown) => JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;
const idSchema = z.object({ id: z.string().min(1), version: z.number().int().min(1) });
type Params = { params: Promise<{ resource: string }> };
export async function GET(req: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { resource } = await params;
    if (resource !== 'export') throw new HttpError(404, 'Not found.');
    const questions = await db.question.findMany({
      include: {
        category: true,
        options: { orderBy: { position: 'asc' } },
        lessons: { include: { lesson: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    const records = questions.map((q) => ({
      id: q.id,
      text: q.text,
      explanation: q.explanation,
      categorySlug: q.category.slug,
      subtopic: q.subtopic,
      difficulty: q.difficulty,
      tags: q.tags,
      author: q.author,
      references: q.references,
      lessonSlugs: q.lessons.map((l) => l.lesson.slug),
      options: q.options.map((o) => ({
        text: o.text,
        isCorrect: o.isCorrect,
        explanation: o.explanation,
      })),
      status: q.status,
      version: q.version,
      reviewedAt: q.reviewedAt,
      reviewedBy: q.reviewedBy,
    }));
    if (new URL(req.url).searchParams.get('format') === 'csv') {
      if (records.some((r) => r.options.length !== 4))
        throw new HttpError(
          400,
          'CSV supports exactly four options. Use JSON to back up this bank without losing options.',
        );
      const rows = records.map((r) => ({
        text: r.text,
        categorySlug: r.categorySlug,
        subtopic: r.subtopic,
        difficulty: r.difficulty,
        optionA: r.options[0].text,
        optionB: r.options[1].text,
        optionC: r.options[2].text,
        optionD: r.options[3].text,
        correct: String.fromCharCode(65 + r.options.findIndex((o) => o.isCorrect)),
        explanation: r.explanation,
        explanationA: r.options[0].explanation,
        explanationB: r.options[1].explanation,
        explanationC: r.options[2].explanation,
        explanationD: r.options[3].explanation,
        tags: r.tags.join('|'),
        author: r.author,
        references: JSON.stringify(r.references),
        lessonSlugs: r.lessonSlugs.join('|'),
      }));
      return new Response(Papa.unparse(rows, { escapeFormulae: true }), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="lsu-questions.csv"',
          'Cache-Control': 'no-store',
        },
      });
    }
    return new Response(JSON.stringify(records, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="lsu-questions.json"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(req: Request, { params }: Params) {
  try {
    await assertOrigin(req);
    const actor = await requireAdmin();
    await rateLimit('admin', 100, 600, actor);
    const { resource } = await params;
    const body = await readJson(req);
    if (resource === 'import') {
      const data = z
        .object({
          raw: z.string().max(900000),
          format: z.enum(['csv', 'json']),
          commit: z.boolean().default(false),
        })
        .parse(body);
      const context = {
        categories: await db.category.findMany({ select: { id: true, slug: true } }),
        lessons: await db.lesson.findMany({ select: { id: true, slug: true } }),
        existingTexts: (await db.question.findMany({ select: { text: true } })).map((q) => q.text),
      };
      const preview = parseImport(data.raw, data.format, context);
      if (!data.commit)
        return Response.json({
          count: preview.rows.length,
          errors: preview.errors,
          preview: preview.rows.slice(0, 10).map((r) => ({
            row: r.row,
            text: r.data.text,
            difficulty: r.data.difficulty,
            status: 'DRAFT',
          })),
        });
      if (preview.errors.length)
        throw new HttpError(400, 'Import blocked: resolve every row error first.');
      await db.$transaction(
        async (tx) => {
          for (const { data: q } of preview.rows) {
            const { options, lessonIds, reviewed: _, ...rest } = q;
            const created = await tx.question.create({
              data: {
                ...rest,
                references: json(rest.references),
                options: { create: options.map((o, position) => ({ ...o, position })) },
                lessons: { create: lessonIds.map((lessonId) => ({ lessonId })) },
              },
            });
            await tx.auditLog.create({
              data: {
                actor,
                action: 'IMPORT',
                entity: 'question',
                entityId: created.id,
                after: json(q),
              },
            });
          }
        },
        { isolationLevel: 'Serializable' },
      );
      return Response.json({ imported: preview.rows.length });
    }
    if (resource === 'categories') {
      const c = z
        .object({
          name: z.string().min(2).max(200),
          slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
          description: z.string().max(1000).default(''),
          disciplineId: z.string().min(1),
        })
        .parse(body);
      const result = await db.$transaction(async (tx) => {
        const r = await tx.category.create({ data: c });
        await tx.auditLog.create({
          data: { actor, action: 'CREATE', entity: 'category', entityId: r.id, after: json(r) },
        });
        return r;
      });
      return Response.json({ id: result.id });
    }
    if (resource === 'disciplines') {
      const d = z
        .object({
          name: z.string().min(2).max(200),
          slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
        })
        .parse(body);
      const result = await db.$transaction(async (tx) => {
        const r = await tx.discipline.create({ data: d });
        await tx.auditLog.create({
          data: { actor, action: 'CREATE', entity: 'discipline', entityId: r.id, after: json(r) },
        });
        return r;
      });
      return Response.json({ id: result.id });
    }
    if (resource !== 'questions' && resource !== 'lessons') throw new HttpError(404, 'Not found.');
    const identifier = z
      .object({ id: z.string().optional(), version: z.number().int().min(1).optional() })
      .parse(body);
    const parsed = resource === 'questions' ? questionSchema.parse(body) : lessonSchema.parse(body);
    const { reviewed, ...input } = parsed;
    const review = {
      reviewedAt: input.status === 'PUBLISHED' && reviewed ? new Date() : null,
      reviewedBy: input.status === 'PUBLISHED' && reviewed ? actor : null,
    };
    const result = await db.$transaction(async (tx) => {
      if (identifier.id && !identifier.version)
        throw new HttpError(400, 'A version is required when editing.');
      if (resource === 'questions') {
        const data = questionSchema.parse(body);
        const { options, lessonIds, reviewed: _, ...rest } = data;
        const existing = identifier.id
          ? await tx.question.findUnique({
              where: { id: identifier.id },
              include: { options: true, lessons: true },
            })
          : null;
        if (identifier.id && !existing) throw new HttpError(404, 'Question not found.');
        if (existing && existing.version !== identifier.version)
          throw new HttpError(409, 'This question changed. Reload before editing.');
        const others = await tx.question.findMany({
          where: { id: { not: identifier.id } },
          select: { text: true },
        });
        if (others.some((q) => normalize(q.text) === normalize(data.text)))
          throw new HttpError(
            409,
            'Potential duplicate question text. Search the bank before creating it.',
          );
        const base = {
          ...rest,
          references: json(rest.references),
          ...review,
          ...(rest.status === 'PUBLISHED' ? { isDemo: false } : {}),
        };
        let id = existing?.id;
        if (existing) {
          const changed = await tx.question.updateMany({
            where: { id: existing.id, version: identifier.version },
            data: { ...base, version: { increment: 1 } },
          });
          if (!changed.count)
            throw new HttpError(409, 'This question changed. Reload before editing.');
          await tx.answerOption.deleteMany({ where: { questionId: id } });
          await tx.questionLesson.deleteMany({ where: { questionId: id } });
        } else {
          id = (await tx.question.create({ data: base })).id;
        }
        await tx.answerOption.createMany({
          data: options.map((o, position) => ({ ...o, position, questionId: id! })),
        });
        if (lessonIds.length)
          await tx.questionLesson.createMany({
            data: lessonIds.map((lessonId) => ({ questionId: id!, lessonId })),
          });
        await tx.auditLog.create({
          data: {
            actor,
            action: existing ? 'UPDATE' : 'CREATE',
            entity: 'question',
            entityId: id!,
            before: existing ? json(existing) : undefined,
            after: json(data),
          },
        });
        return id;
      } else {
        const data = lessonSchema.parse(body);
        const { reviewed: _, ...rest } = data;
        const existing = identifier.id
          ? await tx.lesson.findUnique({ where: { id: identifier.id } })
          : null;
        if (identifier.id && !existing) throw new HttpError(404, 'Lesson not found.');
        if (existing && existing.version !== identifier.version)
          throw new HttpError(409, 'This lesson changed. Reload before editing.');
        const base = {
          ...rest,
          blocks: json(rest.blocks),
          references: json(rest.references),
          ...review,
          ...(rest.status === 'PUBLISHED' ? { isDemo: false } : {}),
        };
        let id = existing?.id;
        if (existing) {
          const changed = await tx.lesson.updateMany({
            where: { id: existing.id, version: identifier.version },
            data: { ...base, version: { increment: 1 } },
          });
          if (!changed.count)
            throw new HttpError(409, 'This lesson changed. Reload before editing.');
        } else {
          id = (await tx.lesson.create({ data: base })).id;
        }
        await tx.auditLog.create({
          data: {
            actor,
            action: existing ? 'UPDATE' : 'CREATE',
            entity: 'lesson',
            entityId: id!,
            before: existing ? json(existing) : undefined,
            after: json(data),
          },
        });
        return id;
      }
    });
    return Response.json({ id: result });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function DELETE(req: Request, { params }: Params) {
  try {
    await assertOrigin(req);
    const actor = await requireAdmin();
    const { resource } = await params;
    if (resource !== 'questions' && resource !== 'lessons') throw new HttpError(404, 'Not found.');
    const data = idSchema.extend({ confirmation: z.literal('DELETE') }).parse(await readJson(req));
    await db.$transaction(async (tx) => {
      const existing =
        resource === 'questions'
          ? await tx.question.findUnique({
              where: { id: data.id },
              include: { options: true, lessons: true },
            })
          : await tx.lesson.findUnique({ where: { id: data.id } });
      if (!existing) throw new HttpError(404, 'Content not found.');
      const result =
        resource === 'questions'
          ? await tx.question.deleteMany({ where: { id: data.id, version: data.version } })
          : await tx.lesson.deleteMany({ where: { id: data.id, version: data.version } });
      if (!result.count) throw new HttpError(409, 'Content changed. Reload before deleting.');
      await tx.auditLog.create({
        data: {
          actor,
          action: 'DELETE',
          entity: resource,
          entityId: data.id,
          before: json(existing),
        },
      });
    });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
