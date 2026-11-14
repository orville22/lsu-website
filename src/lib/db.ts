import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const globalDb = globalThis as unknown as { db?: PrismaClient; databaseUrl?: string };
const databaseUrl = process.env.DATABASE_URL;
export const db =
  globalDb.db && globalDb.databaseUrl === databaseUrl
    ? globalDb.db
    : new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
if (process.env.NODE_ENV !== 'production') {
  globalDb.db = db;
  globalDb.databaseUrl = databaseUrl;
}
