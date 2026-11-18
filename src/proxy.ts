import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server';
import { createHash } from 'node:crypto';
import { db } from '@/lib/db';
import { REVIEWER_COOKIE, comingSoonEnabled, gateFor } from '@/lib/reviewers';
import { inviteTokenHash } from '@/lib/reviewer-tokens';

/**
 * Coming-soon gate. Runs on the Node.js runtime (the Next.js 16 default for
 * proxy), so it can check the database: a revoked reviewer loses access on
 * their next request, not when their cookie expires.
 *
 * It also tells the root layout who is viewing through request headers. Any
 * client-supplied copies of those headers are removed first.
 */
const VIEWER = 'x-lsu-viewer';
const NAME = 'x-lsu-reviewer-name';
const GATE = 'x-lsu-gate';
const TRACK = 'x-lsu-track';
const SEEN_EVERY_MS = 10 * 60 * 1000;

type Viewer =
  { kind: 'admin' } | { kind: 'reviewer'; id: string; name: string; track: string } | null;

async function viewerFor(request: NextRequest, event: NextFetchEvent): Promise<Viewer> {
  const adminToken = request.cookies.get('lsu_admin')?.value;
  const reviewerToken = request.cookies.get(REVIEWER_COOKIE)?.value;
  try {
    if (adminToken) {
      const tokenHash = createHash('sha256').update(adminToken).digest('hex');
      const s = await db.adminSession.findUnique({ where: { tokenHash } });
      if (s && s.expiresAt > new Date()) return { kind: 'admin' };
    }
    if (reviewerToken) {
      const r = await db.reviewer.findUnique({
        where: { tokenHash: inviteTokenHash(reviewerToken) },
        select: { id: true, name: true, status: true, lastSeenAt: true, track: true },
      });
      if (r && (r.status === 'ACTIVE' || r.status === 'INVITED')) {
        if (!r.lastSeenAt || Date.now() - r.lastSeenAt.getTime() > SEEN_EVERY_MS)
          event.waitUntil(
            db.reviewer.update({ where: { id: r.id }, data: { lastSeenAt: new Date() } }).then(
              () => undefined,
              () => undefined,
            ),
          );
        return { kind: 'reviewer', id: r.id, name: r.name, track: r.track };
      }
    }
  } catch {
    // Database unavailable: fall through and treat the visitor as public.
  }
  return null;
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const headers = new Headers(request.headers);
  headers.delete(VIEWER);
  headers.delete(NAME);
  headers.delete(GATE);
  headers.delete(TRACK);

  const hasCookie = request.cookies.has('lsu_admin') || request.cookies.has(REVIEWER_COOKIE);
  const viewer = hasCookie ? await viewerFor(request, event) : null;
  if (viewer) {
    headers.set(VIEWER, viewer.kind);
    if (viewer.kind === 'reviewer') {
      headers.set(NAME, encodeURIComponent(viewer.name));
      headers.set(TRACK, viewer.track === 'expert' ? 'expert' : 'learner');
    }
  }

  if (comingSoonEnabled() && !viewer) {
    headers.set(GATE, 'closed');
    const gate = gateFor(request.nextUrl.pathname);
    if (gate === 'api')
      return Response.json({ error: 'Lab Science Unfiltered is not open yet.' }, { status: 403 });
    if (gate === 'page') {
      const url = request.nextUrl.clone();
      url.pathname = '/coming-soon';
      url.search = '';
      return NextResponse.rewrite(url, { request: { headers } });
    }
  }
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    // Everything except build output and files with an extension (images, fonts).
    '/((?!_next/static|_next/image|.*\\.[a-zA-Z0-9]+$).*)',
  ],
};
