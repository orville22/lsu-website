import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit, HttpError } from '@/lib/security';
import { reviewerForToken } from '@/lib/reviewers';
import { REVIEWER_COOKIE, reviewerCookieOptions } from '@/lib/reviewer-session';
export const dynamic = 'force-dynamic';

/**
 * The personal link in the invitation email. A valid token is stored in an
 * httpOnly cookie on this browser; the token itself is not used up, so the same
 * link works on the reviewer's other devices until access is revoked.
 */
export async function GET(req: Request) {
  const base = process.env.SITE_URL || new URL(req.url).origin;
  try {
    await rateLimit('reviewer-access', 30, 3600);
  } catch (e) {
    if (e instanceof HttpError && e.status === 429)
      return NextResponse.redirect(new URL('/review?access=limited', base), 303);
    throw e;
  }
  const token = new URL(req.url).searchParams.get('t') || '';
  const reviewer = await reviewerForToken(db, token);
  if (!reviewer) return NextResponse.redirect(new URL('/review?access=invalid', base), 303);
  const res = NextResponse.redirect(new URL('/review?access=granted', base), 303);
  res.cookies.set(REVIEWER_COOKIE, token, reviewerCookieOptions);
  res.headers.set('Cache-Control', 'no-store');
  res.headers.set('Referrer-Policy', 'no-referrer');
  return res;
}
