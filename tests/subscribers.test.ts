import test from 'node:test';
import assert from 'node:assert/strict';
import type { PrismaClient } from '../src/generated/prisma/client';
import {
  CONFIRM_TTL_MS,
  confirmSubscription,
  emailSchema,
  emailSettings,
  requestSubscription,
  sourceSchema,
  tokenHash,
  unsubscribe,
  unsubscribeSignature,
  verifyUnsubscribeSignature,
} from '../src/lib/subscribers';

const secret = 'x'.repeat(40);

type Row = {
  id: string;
  email: string;
  status: 'PENDING' | 'CONFIRMED' | 'UNSUBSCRIBED';
  source: string;
  consentText: string;
  confirmTokenHash: string | null;
  confirmExpiresAt: Date | null;
  confirmSentAt: Date | null;
  confirmedAt: Date | null;
  unsubscribedAt: Date | null;
};

/** Just enough of the Prisma subscriber delegate for the functions under test. */
function fakeDb() {
  const rows: Row[] = [];
  const matches = (r: Row, where: Record<string, unknown>) =>
    Object.entries(where).every(([k, v]) =>
      v && typeof v === 'object' && 'not' in v
        ? r[k as keyof Row] !== (v as { not: unknown }).not
        : r[k as keyof Row] === v,
    );
  const subscriber = {
    async findUnique({ where }: { where: Record<string, unknown> }) {
      return rows.find((r) => matches(r, where)) ?? null;
    },
    async upsert({
      where,
      create,
      update,
    }: {
      where: { email: string };
      create: Partial<Row>;
      update: Partial<Row>;
    }) {
      const found = rows.find((r) => r.email === where.email);
      if (found) return Object.assign(found, update);
      const row = {
        id: `id${rows.length + 1}`,
        confirmedAt: null,
        ...create,
      } as Row;
      rows.push(row);
      return row;
    },
    async updateMany({ where, data }: { where: Record<string, unknown>; data: Partial<Row> }) {
      const hit = rows.filter((r) => matches(r, where));
      hit.forEach((r) => Object.assign(r, data));
      return { count: hit.length };
    },
  };
  return { db: { subscriber } as unknown as PrismaClient, rows };
}

test('normalises and validates email addresses', () => {
  assert.equal(emailSchema.parse('  Orville@Example.COM '), 'orville@example.com');
  for (const bad of ['', 'not-an-email', 'a@', `${'a'.repeat(250)}@x.io`, 42])
    assert.equal(emailSchema.safeParse(bad).success, false);
});

test('restricts the sign-up source label', () => {
  assert.equal(sourceSchema.parse('lesson:c1-1'), 'lesson:c1-1');
  assert.equal(sourceSchema.parse('<script>'), '');
  assert.equal(sourceSchema.parse(undefined), '');
});

test('treats email as unconfigured unless every setting is present', () => {
  const full = {
    RESEND_API_KEY: 're_test',
    EMAIL_FROM: 'LSU <a@b.com>',
    EMAIL_TOKEN_SECRET: secret,
    SITE_URL: 'https://labscienceunfiltered.com/',
  };
  assert.deepEqual(emailSettings(full), {
    apiKey: 're_test',
    from: 'LSU <a@b.com>',
    tokenSecret: secret,
    siteUrl: 'https://labscienceunfiltered.com',
  });
  assert.equal(emailSettings({ ...full, RESEND_API_KEY: '' }), null);
  assert.equal(emailSettings({ ...full, EMAIL_TOKEN_SECRET: 'short' }), null);
});

test('unsubscribe signatures are bound to the row and the secret', () => {
  const sig = unsubscribeSignature('abc', secret);
  assert.equal(verifyUnsubscribeSignature('abc', sig, secret), true);
  assert.equal(verifyUnsubscribeSignature('abd', sig, secret), false);
  assert.equal(verifyUnsubscribeSignature('abc', sig, 'y'.repeat(40)), false);
  assert.equal(verifyUnsubscribeSignature('abc', 'short', secret), false);
});

test('double opt-in: pending until confirmed, token single-use, hash only stored', async () => {
  const { db, rows } = fakeDb();
  const now = new Date('2026-11-17T00:00:00Z');
  const first = await requestSubscription(db, { email: 'a@b.com', source: 'home' }, now);
  assert.equal(first.action, 'send-confirmation');
  if (first.action !== 'send-confirmation') return;
  assert.equal(rows[0].status, 'PENDING');
  assert.equal(rows[0].confirmTokenHash, tokenHash(first.token));
  assert.notEqual(rows[0].confirmTokenHash, first.token);
  assert.equal(await confirmSubscription(db, 'wrong', now), 'invalid');
  assert.equal(await confirmSubscription(db, first.token, now), 'confirmed');
  assert.equal(rows[0].status, 'CONFIRMED');
  assert.equal(rows[0].confirmTokenHash, null);
  assert.equal(await confirmSubscription(db, first.token, now), 'invalid');
  // Signing up again once confirmed sends nothing and changes nothing.
  assert.deepEqual(await requestSubscription(db, { email: 'a@b.com', source: 'x' }, now), {
    action: 'none',
  });
  assert.equal(rows[0].source, 'home');
});

test('a repeated request replaces the old token; expired tokens are refused', async () => {
  const { db } = fakeDb();
  const now = new Date('2026-11-17T00:00:00Z');
  const a = await requestSubscription(db, { email: 'a@b.com', source: '' }, now);
  const b = await requestSubscription(db, { email: 'a@b.com', source: '' }, now);
  if (a.action !== 'send-confirmation' || b.action !== 'send-confirmation') throw new Error();
  assert.equal(await confirmSubscription(db, a.token, now), 'invalid');
  const late = new Date(now.getTime() + CONFIRM_TTL_MS + 1);
  assert.equal(await confirmSubscription(db, b.token, late), 'expired');
});

test('unsubscribe is signed, immediate and idempotent; re-subscribing needs a new confirmation', async () => {
  const { db, rows } = fakeDb();
  const now = new Date('2026-11-17T00:00:00Z');
  const s = await requestSubscription(db, { email: 'a@b.com', source: '' }, now);
  if (s.action !== 'send-confirmation') throw new Error();
  await confirmSubscription(db, s.token, now);
  const sig = unsubscribeSignature(s.id, secret);
  assert.equal(await unsubscribe(db, s.id, 'bad', secret, now), 'invalid');
  assert.equal(rows[0].status, 'CONFIRMED');
  assert.equal(await unsubscribe(db, s.id, sig, secret, now), 'unsubscribed');
  assert.equal(rows[0].status, 'UNSUBSCRIBED');
  assert.equal(await unsubscribe(db, s.id, sig, secret, now), 'unsubscribed');
  const again = await requestSubscription(db, { email: 'a@b.com', source: '' }, now);
  assert.equal(again.action, 'send-confirmation');
  assert.equal(rows[0].status, 'PENDING');
});
