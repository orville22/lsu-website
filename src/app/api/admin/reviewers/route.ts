import { z } from 'zod';
import { db } from '@/lib/db';
import { assertOrigin, errorResponse, HttpError, readJson, requireAdmin } from '@/lib/security';
import { emailSettings } from '@/lib/subscribers';
import { reviewerInviteEmail, sendEmail } from '@/lib/email';
import { REVIEWER_ROLES, REVIEWER_TRACKS, reviewerRequestSchema } from '@/lib/reviewers';
import { inviteTokenHash, newInviteToken } from '@/lib/reviewer-tokens';
export const dynamic = 'force-dynamic';

const body = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('add'),
    name: z.unknown(),
    email: z.unknown(),
    role: z.unknown().optional(),
    track: z.enum(REVIEWER_TRACKS).default('learner'),
    send: z.boolean().default(false),
  }),
  z.object({ action: z.literal('track'), id: z.string(), track: z.enum(REVIEWER_TRACKS) }),
  z.object({ action: z.literal('invite'), id: z.string(), send: z.boolean().default(false) }),
  z.object({ action: z.enum(['revoke', 'decline', 'delete']), id: z.string() }),
]);

function siteUrl() {
  return (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

/** Issues a fresh personal link. Any earlier link for this reviewer stops working. */
async function issue(id: string, send: boolean) {
  const token = newInviteToken();
  const r = await db.reviewer.update({
    where: { id },
    data: { status: 'INVITED', tokenHash: inviteTokenHash(token), invitedAt: new Date() },
  });
  const link = `${siteUrl()}/invite/${token}`;
  let emailed = false;
  if (send) {
    const settings = emailSettings();
    if (!settings) throw new HttpError(503, 'Email isn’t configured. Copy the link instead.');
    await sendEmail(settings, {
      to: r.email,
      ...reviewerInviteEmail(settings, { name: r.name, link }),
    });
    emailed = true;
  }
  return { link, emailed };
}

export async function POST(req: Request) {
  try {
    await assertOrigin(req);
    const actor = await requireAdmin();
    const b = body.parse(await readJson(req));
    const log = (action: string, entityId: string, after?: object) =>
      db.auditLog.create({ data: { actor, action, entity: 'Reviewer', entityId, after } });

    if (b.action === 'add') {
      const parsed = reviewerRequestSchema.safeParse({
        name: b.name,
        email: b.email,
        role: b.role || REVIEWER_ROLES[REVIEWER_ROLES.length - 1],
        note: '',
      });
      if (!parsed.success)
        throw new HttpError(400, parsed.error.issues[0]?.message || 'Please check the form.');
      const existing = await db.reviewer.findUnique({ where: { email: parsed.data.email } });
      if (existing) throw new HttpError(409, 'That email address is already on the list.');
      const r = await db.reviewer.create({
        data: { ...parsed.data, source: 'admin', track: b.track },
      });
      await log('reviewer.add', r.id, { email: r.email });
      try {
        return Response.json({ ok: true, ...(await issue(r.id, b.send)) });
      } catch (e) {
        if (e instanceof HttpError) throw e;
        throw new HttpError(
          502,
          'The reviewer was added, but the email didn’t send. Copy the link instead.',
        );
      }
    }

    const r = await db.reviewer.findUnique({ where: { id: b.id } });
    if (!r) throw new HttpError(404, 'Reviewer not found.');
    if (b.action === 'invite') {
      try {
        const out = await issue(r.id, b.send);
        await log('reviewer.invite', r.id, { emailed: out.emailed });
        return Response.json({ ok: true, ...out });
      } catch (e) {
        if (e instanceof HttpError) throw e;
        throw new HttpError(
          502,
          'A new link was made, but the email didn’t send. Copy the link instead.',
        );
      }
    }
    if (b.action === 'track') {
      await db.reviewer.update({ where: { id: r.id }, data: { track: b.track } });
      await log('reviewer.track', r.id, { track: b.track });
      return Response.json({ ok: true });
    }
    if (b.action === 'delete') {
      await db.reviewer.delete({ where: { id: r.id } });
      await log('reviewer.delete', r.id);
      return Response.json({ ok: true });
    }
    await db.reviewer.update({
      where: { id: r.id },
      data: { status: b.action === 'revoke' ? 'REVOKED' : 'DECLINED', tokenHash: null },
    });
    await log(`reviewer.${b.action}`, r.id);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
