import { z } from 'zod';
import { db } from '@/lib/db';
import { assertOrigin, errorResponse, rateLimit, readJson } from '@/lib/security';
import { confirmSubscription } from '@/lib/subscribers';
export const dynamic = 'force-dynamic';

/**
 * Confirmation is a POST from the /subscribe/confirm page, not a GET on the
 * emailed link, so link scanners and mail-client prefetching can't confirm an
 * address on the reader's behalf.
 */
export async function POST(req: Request) {
  try {
    await assertOrigin(req);
    await rateLimit('subscribe-confirm-ip', 30, 3600);
    const { token } = z.object({ token: z.string().max(200) }).parse(await readJson(req));
    const status = await confirmSubscription(db, token);
    return Response.json({ status }, { status: status === 'invalid' ? 404 : 200 });
  } catch (e) {
    return errorResponse(e);
  }
}
