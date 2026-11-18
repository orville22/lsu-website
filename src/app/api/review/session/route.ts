import { cookies } from 'next/headers';
import { assertOrigin, errorResponse } from '@/lib/security';
import { REVIEWER_COOKIE } from '@/lib/reviewer-session';
export const dynamic = 'force-dynamic';

/** Signs this browser out of reviewer access. The personal link still works. */
export async function DELETE(req: Request) {
  try {
    await assertOrigin(req);
    (await cookies()).delete(REVIEWER_COOKIE);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
