import { z } from 'zod';
import { db } from '@/lib/db';
import { assertOrigin, errorResponse, HttpError, rateLimit, readJson } from '@/lib/security';
import { reviewerRequestSchema } from '@/lib/reviewers';
export const dynamic = 'force-dynamic';

/** Same reply whether or not the address has asked before. */
const accepted = () =>
  Response.json({
    ok: true,
    message:
      'Thanks, we’ve got your request. If a place opens up, we’ll email you a personal link.',
  });

/** Public form on the coming-soon page: asks to join the reviewer programme. */
export async function POST(req: Request) {
  try {
    await assertOrigin(req);
    await rateLimit('reviewer-request-ip', 10, 3600);
    const raw = z
      .object({ company: z.string().max(200).optional() })
      .passthrough()
      .parse(await readJson(req));
    // Honeypot: hidden from people, often filled in by bots.
    if (raw.company) return accepted();
    const parsed = reviewerRequestSchema.safeParse(raw);
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0]?.message || 'Please check the form.');
    const { name, email, role, note } = parsed.data;
    await rateLimit('reviewer-request-email', 3, 86400, email);
    const existing = await db.reviewer.findUnique({ where: { email } });
    if (!existing)
      await db.reviewer.create({ data: { name, email, role, note, source: 'request' } });
    else if (existing.status === 'REQUESTED')
      await db.reviewer.update({ where: { id: existing.id }, data: { name, role, note } });
    // Invited, active, revoked or declined people keep their current status.
    return accepted();
  } catch (e) {
    return errorResponse(e);
  }
}
