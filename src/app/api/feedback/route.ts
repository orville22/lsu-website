import { db } from '@/lib/db';
import { admin, assertOrigin, errorResponse, HttpError, rateLimit, readJson } from '@/lib/security';
import { asTrack, feedbackSchema } from '@/lib/reviewers';
import { currentReviewer } from '@/lib/reviewer-session';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    await assertOrigin(req);
    const parsed = feedbackSchema.safeParse(await readJson(req));
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0]?.message || 'Please check the form.');
    const f = parsed.data;
    if (f.kind === 'REVIEW') {
      const reviewer = await currentReviewer();
      // Administrators may try the form; their test entries are saved without a reviewer.
      const isAdmin = !reviewer && !!(await admin());
      if (!reviewer && !isAdmin)
        throw new HttpError(403, 'Reviewer access has ended on this browser.');
      await rateLimit('feedback-review', 60, 3600, reviewer?.id);
      // The track comes from the reviewer record, never from the form. Administrators test the expert form.
      const track = reviewer ? asTrack(reviewer.track) : 'expert';
      // Expert-only answers are dropped from learner submissions.
      const data = track === 'expert' ? f : { ...f, currency: '', references: '' };
      await db.feedback.create({ data: { ...data, track, reviewerId: reviewer?.id ?? null } });
    } else {
      await rateLimit('feedback-error', 10, 3600);
      await db.feedback.create({
        data: { kind: 'ERROR', path: f.path, pageTitle: f.pageTitle, comment: f.comment },
      });
    }
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
