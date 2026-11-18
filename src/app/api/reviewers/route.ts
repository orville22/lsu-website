import { z } from 'zod';
import { db } from '@/lib/db';
import { assertOrigin, errorResponse, HttpError, rateLimit, readJson } from '@/lib/security';
import { requestReviewerAccess, reviewerRequestSchema } from '@/lib/reviewers';
export const dynamic = 'force-dynamic';

/** Same reply whether the address is new, pending or already approved. */
const accepted = () =>
  Response.json({
    ok: true,
    message: 'Thanks for volunteering. We’ll email your personal reviewer link once it’s approved.',
  });

export async function POST(req: Request) {
  try {
    await assertOrigin(req);
    await rateLimit('reviewer-request-ip', 10, 3600);
    const body = z
      .object({ company: z.string().max(200).optional() })
      .passthrough()
      .parse(await readJson(req));
    if (body.company) return accepted();
    const parsed = reviewerRequestSchema.safeParse(body);
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0]?.message || 'Please check the form.');
    await rateLimit('reviewer-request-email', 3, 86400, parsed.data.email);
    await requestReviewerAccess(db, parsed.data);
    return accepted();
  } catch (e) {
    return errorResponse(e);
  }
}
