import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { REVIEWER_COOKIE, REVIEWER_COOKIE_MAX_AGE, inviteTokenShape } from '@/lib/reviewers';
import { inviteTokenHash } from '@/lib/reviewer-tokens';
export const dynamic = 'force-dynamic';

/** Opens a personal invite link: sets the reviewer cookie and goes to the homepage. */
type Params = { params: Promise<{ token: string }> };
export async function GET(req: Request, { params }: Params) {
  const { token } = await params;
  const base = process.env.SITE_URL || new URL(req.url).origin;
  const fail = () => NextResponse.redirect(new URL('/coming-soon?invite=invalid', base));
  if (!inviteTokenShape.test(token)) return fail();
  try {
    const r = await db.reviewer.findUnique({ where: { tokenHash: inviteTokenHash(token) } });
    if (!r || (r.status !== 'INVITED' && r.status !== 'ACTIVE')) return fail();
    const now = new Date();
    await db.reviewer.update({
      where: { id: r.id },
      data: { status: 'ACTIVE', firstSeenAt: r.firstSeenAt ?? now, lastSeenAt: now },
    });
    const res = NextResponse.redirect(new URL('/?welcome=reviewer', base));
    res.cookies.set(REVIEWER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REVIEWER_COOKIE_MAX_AGE,
    });
    res.headers.set('Cache-Control', 'no-store');
    res.headers.set('Referrer-Policy', 'no-referrer');
    return res;
  } catch {
    return fail();
  }
}
