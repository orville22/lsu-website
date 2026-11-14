import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const days = Number(process.env.ANONYMOUS_RETENTION_DAYS || 30);
if (!Number.isInteger(days) || days < 1)
  throw new Error('ANONYMOUS_RETENTION_DAYS must be a positive integer.');
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  const result = await db.$transaction([
    db.adminSession.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
    db.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } }),
    db.attempt.deleteMany({
      where: { learnerId: null, updatedAt: { lt: new Date(Date.now() - days * 86400000) } },
    }),
  ]);
  console.log({
    expiredSessions: result[0].count,
    expiredLimiters: result[1].count,
    oldAnonymousAttempts: result[2].count,
  });
} finally {
  await db.$disconnect();
}
