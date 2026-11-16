import { db } from '@/lib/db';
import { errorResponse, HttpError, rateLimit } from '@/lib/security';
import { emailSettings, unsubscribe } from '@/lib/subscribers';
export const dynamic = 'force-dynamic';

/**
 * Two callers:
 * - the /subscribe/unsubscribe page (JSON body { s, t }), and
 * - mail providers using the List-Unsubscribe-Post one-click header (RFC 8058),
 *   which POST "List-Unsubscribe=One-Click" to the URL with s and t in the query.
 *
 * The HMAC signature authenticates the request, so there is deliberately no
 * Origin check: mail providers call this from their own servers.
 */
export async function POST(req: Request) {
  try {
    await rateLimit('subscribe-unsubscribe-ip', 60, 3600);
    const settings = emailSettings();
    if (!settings) throw new HttpError(503, 'Email is not configured.');
    const url = new URL(req.url);
    let s = url.searchParams.get('s') || '';
    let t = url.searchParams.get('t') || '';
    if ((!s || !t) && req.headers.get('content-type')?.includes('application/json')) {
      const raw = await req.text();
      if (raw.length > 2000) throw new HttpError(413, 'Request too large.');
      try {
        const body = JSON.parse(raw) as { s?: unknown; t?: unknown };
        s = typeof body.s === 'string' ? body.s : '';
        t = typeof body.t === 'string' ? body.t : '';
      } catch {
        throw new HttpError(400, 'Invalid JSON.');
      }
    }
    const status = await unsubscribe(db, s, t, settings.tokenSecret);
    if (status === 'invalid') throw new HttpError(404, 'This unsubscribe link isn’t valid.');
    return Response.json({ status });
  } catch (e) {
    return errorResponse(e);
  }
}
