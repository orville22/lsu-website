import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { runRetentionCleanup } from '../src/lib/retention';
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
try {
  console.log(await runRetentionCleanup(db));
} finally {
  await db.$disconnect();
}
