import 'server-only';
import type { Prisma } from '@/generated/prisma/client';
import type { z } from 'zod';
import { HttpError } from './security';
import type { lessonSchema } from './validation';

type Tx = Prisma.TransactionClient;
const json = (v: unknown) => JSON.parse(JSON.stringify(v)) as Prisma.InputJsonValue;

/**
 * Creates or updates a lesson inside a transaction, with optimistic version
 * checks, review metadata and an audit entry. Used by the editor and the importer.
 */
export async function saveLesson(
  tx: Tx,
  actor: string,
  data: z.infer<typeof lessonSchema>,
  identifier: { id?: string; version?: number },
  action?: string,
) {
  const { reviewed, ...rest } = data;
  const published = rest.status === 'PUBLISHED' && reviewed;
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
    reviewedAt: published ? new Date() : null,
    reviewedBy: published ? actor : null,
    // Published or imported content is the author's own, never seeded demo content.
    ...(rest.status === 'PUBLISHED' || action?.startsWith('IMPORT') ? { isDemo: false } : {}),
  };
  let id = existing?.id;
  if (existing) {
    const changed = await tx.lesson.updateMany({
      where: { id: existing.id, version: identifier.version },
      data: { ...base, version: { increment: 1 } },
    });
    if (!changed.count) throw new HttpError(409, 'This lesson changed. Reload before editing.');
  } else {
    id = (await tx.lesson.create({ data: base })).id;
  }
  await tx.auditLog.create({
    data: {
      actor,
      action: action || (existing ? 'UPDATE' : 'CREATE'),
      entity: 'lesson',
      entityId: id!,
      before: existing ? json(existing) : undefined,
      after: json(data),
    },
  });
  return id!;
}
