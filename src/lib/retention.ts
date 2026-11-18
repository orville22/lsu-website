import type { PrismaClient } from '@/generated/prisma/client';
import { SUBSCRIBER_CLEANUP_DAYS } from './subscribers';
import { FEEDBACK_DAYS, REVIEWER_INACTIVE_DAYS, REVIEWER_REQUEST_DAYS } from './reviewers';

/** Days anonymous quiz attempts are kept (ANONYMOUS_RETENTION_DAYS, default 30). */
export function retentionDays() {
  const days = Number(process.env.ANONYMOUS_RETENTION_DAYS || 30);
  if (!Number.isInteger(days) || days < 1)
    throw new Error('ANONYMOUS_RETENTION_DAYS must be a positive integer.');
  return days;
}

/**
 * Removes expired sessions and rate-limit rows, anonymous attempts past retention,
 * and email sign-ups that were never confirmed or were unsubscribed more than
 * SUBSCRIBER_CLEANUP_DAYS ago; stale reviewer requests, declined or revoked
 * reviewers, and feedback older than FEEDBACK_DAYS.
 */
export async function runRetentionCleanup(db: PrismaClient, days = retentionDays()) {
  const now = new Date();
  const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);
  const result = await db.$transaction([
    db.adminSession.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.rateLimit.deleteMany({ where: { expiresAt: { lt: now } } }),
    db.attempt.deleteMany({
      where: { learnerId: null, updatedAt: { lt: new Date(now.getTime() - days * 86400000) } },
    }),
    db.subscriber.deleteMany({
      where: {
        status: { in: ['PENDING', 'UNSUBSCRIBED'] },
        updatedAt: { lt: new Date(now.getTime() - SUBSCRIBER_CLEANUP_DAYS * 86400000) },
      },
    }),
    db.reviewer.deleteMany({
      where: {
        OR: [
          { status: 'REQUESTED', updatedAt: { lt: daysAgo(REVIEWER_REQUEST_DAYS) } },
          {
            status: { in: ['DECLINED', 'REVOKED'] },
            updatedAt: { lt: daysAgo(REVIEWER_INACTIVE_DAYS) },
          },
        ],
      },
    }),
    db.feedback.deleteMany({ where: { createdAt: { lt: daysAgo(FEEDBACK_DAYS) } } }),
  ]);
  return {
    expiredSessions: result[0].count,
    expiredLimiters: result[1].count,
    oldAnonymousAttempts: result[2].count,
    staleSubscribers: result[3].count,
    staleReviewers: result[4].count,
    oldFeedback: result[5].count,
    retentionDays: days,
  };
}
