import 'server-only';
import { cookies, headers } from 'next/headers';
import { createHash, randomBytes, scryptSync, timingSafeEqual, createHmac } from 'node:crypto';
import { db } from './db';
import { isAllowedOrigin } from './request-origin';
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export const hash = (v: string) => createHash('sha256').update(v).digest('hex');
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};
export async function owner(create = false) {
  const jar = await cookies();
  let token = jar.get('lsu_visitor')?.value;
  if (!token && create) {
    token = randomBytes(32).toString('hex');
    jar.set('lsu_visitor', token, { ...cookieOptions, maxAge: 60 * 60 * 24 * 30 });
  }
  return token ? hash(token) : null;
}
export async function admin() {
  const token = (await cookies()).get('lsu_admin')?.value;
  if (!token) return null;
  const s = await db.adminSession.findUnique({ where: { tokenHash: hash(token) } });
  return s && s.expiresAt > new Date() ? s : null;
}
export async function requireAdmin() {
  const session = await admin();
  if (!session) throw new HttpError(401, 'Administrator sign-in required.');
  return session.actor;
}
export async function assertOrigin(request: Request) {
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  if (!isAllowedOrigin(request, siteUrl, process.env.NODE_ENV === 'development'))
    throw new HttpError(
      403,
      `Request origin rejected. Open ${new URL(siteUrl).origin} and try again.`,
    );
}
export async function rateLimit(scope: string, limit: number, seconds: number, identity?: string) {
  const h = await headers();
  const ip =
    process.env.TRUST_PROXY === 'true'
      ? h.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
      : 'local';
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32)
    throw new HttpError(503, 'Set a SESSION_SECRET of at least 32 characters.');
  const key = createHmac('sha256', secret)
    .update(`${scope}:${identity || ip}`)
    .digest('hex');
  const expiresAt = new Date(Date.now() + seconds * 1000);
  const rows = await db.$queryRaw<
    { count: number }[]
  >`INSERT INTO "RateLimit" ("key", "count", "expiresAt") VALUES (${key}, 1, ${expiresAt}) ON CONFLICT ("key") DO UPDATE SET "count" = CASE WHEN "RateLimit"."expiresAt" < NOW() THEN 1 ELSE "RateLimit"."count" + 1 END, "expiresAt" = CASE WHEN "RateLimit"."expiresAt" < NOW() THEN ${expiresAt} ELSE "RateLimit"."expiresAt" END RETURNING "count"`;
  if (rows[0].count > limit) throw new HttpError(429, 'Too many requests. Please try again later.');
}
export async function login(username: string, password: string) {
  const configured = process.env.ADMIN_PASSWORD_HASH || '';
  const [salt, expected] = configured.split(':');
  if (!salt || !expected || !process.env.SESSION_SECRET)
    throw new HttpError(
      503,
      'Administrator credentials are not configured. Follow the local setup guide.',
    );
  const actual = scryptSync(password, salt, 64);
  const check = Buffer.from(expected, 'hex');
  if (
    username !== process.env.ADMIN_USERNAME ||
    check.length !== actual.length ||
    !timingSafeEqual(check, actual)
  )
    throw new HttpError(401, 'Invalid username or password.');
  const token = randomBytes(32).toString('hex');
  await db.adminSession.create({
    data: {
      tokenHash: hash(token),
      actor: username,
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
  });
  (await cookies()).set('lsu_admin', token, { ...cookieOptions, maxAge: 8 * 60 * 60 });
}
export async function logout() {
  const jar = await cookies();
  const token = jar.get('lsu_admin')?.value;
  if (token) await db.adminSession.deleteMany({ where: { tokenHash: hash(token) } });
  jar.delete('lsu_admin');
}
export async function readJson(request: Request) {
  if (Number(request.headers.get('content-length') || 0) > 1_000_000)
    throw new HttpError(413, 'Request exceeds 1 MB.');
  const raw = await request.text();
  if (Buffer.byteLength(raw) > 1_000_000) throw new HttpError(413, 'Request exceeds 1 MB.');
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'Invalid JSON.');
  }
}
export function errorResponse(error: unknown) {
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  if (error && typeof error === 'object' && 'issues' in error)
    return Response.json(
      { error: 'Please check the form.', issues: error.issues },
      { status: 400 },
    );
  console.error('Request failed', error instanceof Error ? error.name : 'unknown');
  return Response.json(
    { error: 'The request could not be completed. Check your database connection and try again.' },
    { status: 500 },
  );
}
