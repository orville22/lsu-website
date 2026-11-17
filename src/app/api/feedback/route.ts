import { db } from '@/lib/db';
import { assertOrigin, errorResponse, HttpError, rateLimit, readJson } from '@/lib/security';
import { feedbackAuthor } from '@/lib/reviewer-session';
import { feedbackComment, feedbackSchema } from '@/lib/reviewers';
export const dynamic = 'force-dynamic';

/** Saves the guided page review from the feedback button. */
export async function POST(req: Request) {
  try {
    await assertOrigin(req);
    const author = await feedbackAuthor();
    if (!author) throw new HttpError(403, 'Open your invite link again to leave feedback.');
    await rateLimit('feedback', 60, 3600, author.reviewerId || author.actor || undefined);
    const parsed = feedbackSchema.safeParse(await readJson(req));
    if (!parsed.success)
      throw new HttpError(400, parsed.error.issues[0]?.message || 'Please check the form.');
    const { path, answers } = parsed.data;
    await db.feedback.create({
      data: {
        ...author,
        path,
        kind: 'page',
        rating: answers.clarity ?? null,
        answers,
        comment: feedbackComment(answers),
      },
    });
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
