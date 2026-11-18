import { z } from 'zod';
import { db } from '@/lib/db';
import { assertOrigin, errorResponse, HttpError, readJson, requireAdmin } from '@/lib/security';
import { issueReviewerAccess, reviewerAccessUrl } from '@/lib/reviewers';
import { emailSettings } from '@/lib/subscribers';
import { reviewerInviteEmail, sendEmail } from '@/lib/email';
export const dynamic = 'force-dynamic';

const actionSchema = z.object({
  id: z.string().min(1).max(64),
  action: z.enum(['approve', 'resend', 'decline', 'revoke', 'delete']),
});

export async function POST(req: Request) {
  try {
    await assertOrigin(req);
    const actor = await requireAdmin();
    const { id, action } = actionSchema.parse(await readJson(req));
    const row = await db.reviewer.findUnique({ where: { id } });
    if (!row) throw new HttpError(404, 'Reviewer not found.');
    const log = (after: unknown) =>
      db.auditLog.create({
        data: {
          actor,
          action: `reviewer.${action}`,
          entity: 'Reviewer',
          entityId: id,
          before: { status: row.status },
          after: after as object,
        },
      });

    if (action === 'approve' || action === 'resend') {
      if (action === 'resend' && row.status !== 'APPROVED')
        throw new HttpError(400, 'Only approved reviewers can be sent a new link.');
      const settings = emailSettings();
      const siteUrl = settings?.siteUrl || process.env.SITE_URL || new URL(req.url).origin;
      const { token } = await issueReviewerAccess(db, id);
      const link = reviewerAccessUrl(siteUrl, token);
      await log({ status: 'APPROVED', newLink: true });
      let emailed = false;
      if (settings) {
        try {
          await sendEmail(settings, {
            to: row.email,
            ...reviewerInviteEmail(settings, { name: row.name, link }),
          });
          emailed = true;
        } catch {
          emailed = false;
        }
      }
      // The link is returned so it can be sent by hand if email isn't working.
      return Response.json({ ok: true, emailed, link });
    }
    if (action === 'delete') {
      await db.reviewer.delete({ where: { id } });
      await log({ deleted: true });
      return Response.json({ ok: true });
    }
    const status = action === 'decline' ? 'DECLINED' : 'REVOKED';
    await db.reviewer.update({ where: { id }, data: { status, accessTokenHash: null } });
    await log({ status });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
