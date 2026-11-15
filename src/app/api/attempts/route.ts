import { z } from 'zod';
import {
  assertOrigin,
  owner,
  rateLimit,
  errorResponse,
  readJson,
  admin,
  HttpError,
} from '@/lib/security';
import { createAttempt } from '@/lib/attempts';
export async function POST(req: Request) {
  try {
    await assertOrigin(req);
    await rateLimit('start-ip', 120, 3600);
    const key = (await owner(true))!;
    await rateLimit('start-owner', 30, 3600, key);
    const input = z
      .object({
        categoryId: z.string().optional(),
        subtopic: z.string().max(200).optional(),
        difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
        demo: z.boolean().optional(),
      })
      .parse(await readJson(req));
    if (input.demo && !(await admin()))
      throw new HttpError(403, 'Demonstration questions are available to administrators only.');
    const a = await createAttempt(key, input);
    return Response.json({ id: a.id, count: a.questionIds.length }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
