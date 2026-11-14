import { z } from 'zod';
import { assertOrigin, owner, errorResponse, readJson, rateLimit, HttpError } from '@/lib/security';
import { getAttempt, attemptView, saveAttempt } from '@/lib/attempts';
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    return Response.json(attemptView(await getAttempt((await params).id, await owner())), {
      headers: { 'Cache-Control': 'private, no-store' },
    });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await assertOrigin(req);
    const key = await owner();
    await rateLimit('save', 300, 600, key || 'unknown');
    const input = z
      .object({
        answers: z.record(z.string(), z.string()).refine((v) => Object.keys(v).length <= 20),
        submit: z.boolean().default(false),
      })
      .parse(await readJson(req));
    try {
      return Response.json(await saveAttempt((await params).id, key, input.answers, input.submit));
    } catch (e) {
      if (e instanceof Error && e.message.includes('does not belong'))
        throw new HttpError(400, e.message);
      throw e;
    }
  } catch (e) {
    return errorResponse(e);
  }
}
