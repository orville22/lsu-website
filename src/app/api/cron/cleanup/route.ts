import { timingSafeEqual } from 'node:crypto';
import { db } from '@/lib/db';
import { runRetentionCleanup } from '@/lib/retention';
export const dynamic = 'force-dynamic';
/**
 * Daily retention cleanup, called by Vercel Cron (see vercel.json).
 * Vercel sends "Authorization: Bearer <CRON_SECRET>"; anything else is refused.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 32)
    return Response.json({ error: 'CRON_SECRET is not configured.' }, { status: 503 });
  const expected = Buffer.from(`Bearer ${secret}`);
  const actual = Buffer.from(req.headers.get('authorization') || '');
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    return Response.json({ error: 'Unauthorised.' }, { status: 401 });
  try {
    const result = await runRetentionCleanup(db);
    console.log('retention cleanup', result);
    return Response.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    console.error('retention cleanup failed', e instanceof Error ? e.name : 'unknown');
    return Response.json({ error: 'Cleanup failed.' }, { status: 500 });
  }
}
