import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { db } from './db';
import { reviewerForToken } from './reviewers';

export const REVIEWER_COOKIE = 'lsu_reviewer';
/** The browser stays signed in as a reviewer for 180 days, or until access is revoked. */
export const REVIEWER_COOKIE_MAX_AGE = 180 * 24 * 60 * 60;

export const reviewerCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: REVIEWER_COOKIE_MAX_AGE,
};

/** The approved reviewer signed in on this browser, if any. Cached per request. */
export const currentReviewer = cache(async () => {
  const token = (await cookies()).get(REVIEWER_COOKIE)?.value;
  const row = await reviewerForToken(db, token);
  if (!row) return null;
  // Record activity at most once an hour.
  if (!row.lastSeenAt || Date.now() - row.lastSeenAt.getTime() > 3600_000)
    await db.reviewer
      .update({ where: { id: row.id }, data: { lastSeenAt: new Date() } })
      .catch(() => {});
  return { id: row.id, name: row.name };
});
