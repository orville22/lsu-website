import { z } from 'zod';
import { assertOrigin, rateLimit, login, logout, errorResponse, readJson } from '@/lib/security';
export async function POST(req: Request) {
  try {
    await assertOrigin(req);
    await rateLimit('login', 8, 900);
    const { username, password } = z
      .object({ username: z.string().min(1).max(100), password: z.string().min(1).max(500) })
      .parse(await readJson(req));
    await login(username, password);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function DELETE(req: Request) {
  try {
    await assertOrigin(req);
    await logout();
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
