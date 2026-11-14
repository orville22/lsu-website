import type { PrismaClient } from '@/generated/prisma/client';

/** Days anonymous quiz attempts are kept (ANONYMOUS_RETENTION_DAYS, default 30). */
export function retentionDays() {
  const days = Number(process.env.ANONYMOUS_RETENTION_DAYS || 30);
  if (!Number.isInteger(days) || days < 1)
    throw new Error('ANONYMOUS_RETENTION_DAYS must be a positive integer.');
  return days;
}

/** Removes expired sessions and rate-limit rows, and anonymous attempts past retention. */
export async function runRetentionCleanup(db: PrismaClient, days = retentionDays()) {
  const now = new Date();
  const result = await db.$transaction([
    db.adminSession.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.rateLimit.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.attempt.deleteMany({
      where: { learnerId: null, updatedAt: { lt: new Date(now.getTime() - days * 86400000) } },
    }),
  ]);
  return {
    expiredSessions: result[0].count,
    expiredLimiters: result[1].count,
    oldAnonymousAttempts: result[2].count,
    retentionDays: days,
  };
}
