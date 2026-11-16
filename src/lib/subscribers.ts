import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import type { PrismaClient } from '@/generated/prisma/client';

/**
 * Email sign-up with double opt-in.
 *
 * - A submission creates (or refreshes) a PENDING row and emails a single-use
 *   confirmation link. Only the token's SHA-256 is stored.
 * - The address counts as subscribed only after the link is used (CONFIRMED).
 * - Unsubscribe links are HMAC-signed with EMAIL_TOKEN_SECRET over the row id,
 *   so they can be regenerated for every future email without storing a token.
 *
 * Functions here take the Prisma client as an argument so they can be tested
 * against a disposable database.
 */

/** Shown beside every sign-up form and stored with each row as the consent record. */
export const CONSENT_TEXT =
  'Email me when new lessons are published, plus occasional Lab Science Unfiltered updates. Unsubscribe at any time.';

/** Confirmation links stay valid for seven days. */
export const CONFIRM_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, 'That email address is too long.')
  .pipe(z.email('Enter a valid email address.'));

export const sourceSchema = z
  .string()
  .max(120)
  .regex(/^[a-z0-9:_-]*$/i)
  .catch('');

export type EmailSettings = {
  apiKey: string;
  from: string;
  tokenSecret: string;
  siteUrl: string;
};

/** Returns the email settings, or null when sign-up is not configured. */
export function emailSettings(
  env: Partial<Record<string, string>> = process.env,
): EmailSettings | null {
  const apiKey = env.RESEND_API_KEY || '';
  const from = env.EMAIL_FROM || '';
  const tokenSecret = env.EMAIL_TOKEN_SECRET || '';
  const siteUrl = env.SITE_URL || '';
  if (!apiKey || !from || tokenSecret.length < 32 || !siteUrl) return null;
  return { apiKey, from, tokenSecret, siteUrl: siteUrl.replace(/\/+$/, '') };
}

export const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');

export function unsubscribeSignature(id: string, secret: string) {
  return createHmac('sha256', secret).update(`unsubscribe:${id}`).digest('hex');
}

export function verifyUnsubscribeSignature(id: string, signature: string, secret: string) {
  const expected = Buffer.from(unsubscribeSignature(id, secret));
  const actual = Buffer.from(signature);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function unsubscribeUrl(id: string, settings: EmailSettings) {
  const sig = unsubscribeSignature(id, settings.tokenSecret);
  return `${settings.siteUrl}/subscribe/unsubscribe?s=${encodeURIComponent(id)}&t=${sig}`;
}

/** One-click endpoint for the List-Unsubscribe header (RFC 8058). */
export function oneClickUnsubscribeUrl(id: string, settings: EmailSettings) {
  const sig = unsubscribeSignature(id, settings.tokenSecret);
  return `${settings.siteUrl}/api/subscribe/unsubscribe?s=${encodeURIComponent(id)}&t=${sig}`;
}

export type SubscribeOutcome =
  /** A confirmation email should be sent with this token. */
  | { action: 'send-confirmation'; id: string; email: string; token: string }
  /** Already confirmed: nothing to send. The response stays identical. */
  | { action: 'none' };

/**
 * Records a sign-up request. Callers must give the same response whatever the
 * outcome, so the form never reveals whether an address is already subscribed.
 */
export async function requestSubscription(
  db: PrismaClient,
  input: { email: string; source: string },
  now = new Date(),
): Promise<SubscribeOutcome> {
  const existing = await db.subscriber.findUnique({ where: { email: input.email } });
  if (existing?.status === 'CONFIRMED') return { action: 'none' };
  const token = randomBytes(32).toString('base64url');
  const fields = {
    status: 'PENDING' as const,
    source: input.source,
    consentText: CONSENT_TEXT,
    confirmTokenHash: tokenHash(token),
    confirmExpiresAt: new Date(now.getTime() + CONFIRM_TTL_MS),
    confirmSentAt: now,
    unsubscribedAt: null,
  };
  const row = await db.subscriber.upsert({
    where: { email: input.email },
    create: { email: input.email, ...fields },
    update: fields,
  });
  return { action: 'send-confirmation', id: row.id, email: row.email, token };
}

export type ConfirmOutcome = 'confirmed' | 'already-confirmed' | 'expired' | 'invalid';

export async function confirmSubscription(
  db: PrismaClient,
  token: string,
  now = new Date(),
): Promise<ConfirmOutcome> {
  if (!token || token.length > 200) return 'invalid';
  const row = await db.subscriber.findUnique({ where: { confirmTokenHash: tokenHash(token) } });
  if (!row) return 'invalid';
  if (row.status === 'CONFIRMED') return 'already-confirmed';
  if (!row.confirmExpiresAt || row.confirmExpiresAt < now) return 'expired';
  // The token hash in the WHERE clause makes this single-use even under a race.
  const updated = await db.subscriber.updateMany({
    where: { id: row.id, confirmTokenHash: row.confirmTokenHash, status: 'PENDING' },
    data: {
      status: 'CONFIRMED',
      confirmedAt: now,
      confirmTokenHash: null,
      confirmExpiresAt: null,
      unsubscribedAt: null,
    },
  });
  return updated.count === 1 ? 'confirmed' : 'already-confirmed';
}

export type UnsubscribeOutcome = 'unsubscribed' | 'invalid';

/** Idempotent: a repeated or late click still reports success. */
export async function unsubscribe(
  db: PrismaClient,
  id: string,
  signature: string,
  secret: string,
  now = new Date(),
): Promise<UnsubscribeOutcome> {
  if (!id || id.length > 64 || !verifyUnsubscribeSignature(id, signature, secret)) return 'invalid';
  await db.subscriber.updateMany({
    where: { id, status: { not: 'UNSUBSCRIBED' } },
    data: {
      status: 'UNSUBSCRIBED',
      unsubscribedAt: now,
      confirmTokenHash: null,
      confirmExpiresAt: null,
    },
  });
  return 'unsubscribed';
}

/** Unconfirmed and unsubscribed rows are kept this long, then deleted. */
export const SUBSCRIBER_CLEANUP_DAYS = 30;
