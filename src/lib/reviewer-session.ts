import 'server-only';
import { cookies } from 'next/headers';
import { db } from './db';
import { admin } from './security';
import { REVIEWER_COOKIE } from './reviewers';
import { inviteTokenHash } from './reviewer-tokens';

/** The reviewer behind the current request, if their invite is still valid. */
export async function currentReviewer() {
  const token = (await cookies()).get(REVIEWER_COOKIE)?.value;
  if (!token) return null;
  const r = await db.reviewer.findUnique({ where: { tokenHash: inviteTokenHash(token) } });
  return r && (r.status === 'ACTIVE' || r.status === 'INVITED') ? r : null;
}

/** Who may leave feedback: a valid reviewer, or a signed-in administrator. */
export async function feedbackAuthor() {
  const r = await currentReviewer();
  if (r) return { reviewerId: r.id, actor: null as string | null };
  const s = await admin();
  if (s) return { reviewerId: null as string | null, actor: s.actor };
  return null;
}
