import test from 'node:test';
import assert from 'node:assert/strict';
import type { PrismaClient } from '../src/generated/prisma/client';
import {
  feedbackSchema,
  issueReviewerAccess,
  requestReviewerAccess,
  reviewerAccessUrl,
  reviewerForToken,
  reviewerRequestSchema,
  asTrack,
} from '../src/lib/reviewers';
import { tokenHash } from '../src/lib/subscribers';

type Row = Record<string, unknown> & { id: string; email: string; status: string };

/** Just enough of the Prisma reviewer delegate for the functions under test. */
function fakeDb() {
  const rows: Row[] = [];
  const find = (where: Record<string, unknown>) =>
    rows.find((r) => Object.entries(where).every(([k, v]) => r[k] === v)) ?? null;
  const reviewer = {
    findUnique: async ({ where }: { where: Record<string, unknown> }) => find(where),
    upsert: async ({
      where,
      create,
      update,
    }: {
      where: { email: string };
      create: Omit<Row, 'id'>;
      update: Partial<Row>;
    }) => {
      const existing = find(where);
      if (existing) return Object.assign(existing, update);
      const row = { id: `r${rows.length + 1}`, ...create } as Row;
      rows.push(row);
      return row;
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Row> }) => {
      const row = find(where);
      if (!row) throw new Error('not found');
      return Object.assign(row, data);
    },
  };
  return { rows, db: { reviewer } as unknown as PrismaClient };
}

const request = (over: Record<string, unknown> = {}) =>
  reviewerRequestSchema.parse({
    name: ' Ana Lab ',
    email: ' Ana@Example.com ',
    role: 'SCIENTIST',
    consent: true,
    ...over,
  });

test('request form: normalises input and requires consent and a role', () => {
  const r = request();
  assert.equal(r.name, 'Ana Lab');
  assert.equal(r.email, 'ana@example.com');
  assert.equal(r.creditConsent, false);
  assert.equal(reviewerRequestSchema.safeParse({ ...r, consent: false }).success, false);
  assert.equal(reviewerRequestSchema.safeParse({ ...r, role: 'BOSS' }).success, false);
  assert.equal(reviewerRequestSchema.safeParse({ ...r, name: '' }).success, false);
});

test('a repeat request does not reset an approved reviewer', async () => {
  const { db, rows } = fakeDb();
  await requestReviewerAccess(db, request());
  assert.equal(rows[0].status, 'REQUESTED');
  const { token } = await issueReviewerAccess(db, rows[0].id);
  await requestReviewerAccess(db, request({ name: 'Someone Else' }));
  assert.equal(rows[0].status, 'APPROVED');
  assert.equal(rows[0].name, 'Ana Lab');
  assert.equal((await reviewerForToken(db, token))?.id, rows[0].id);
});

test('a declined person can ask again', async () => {
  const { db, rows } = fakeDb();
  await requestReviewerAccess(db, request());
  rows[0].status = 'DECLINED';
  await requestReviewerAccess(db, request());
  assert.equal(rows[0].status, 'REQUESTED');
});

test('access tokens: only the hash is stored, and a new link replaces the old one', async () => {
  const { db, rows } = fakeDb();
  await requestReviewerAccess(db, request());
  const first = await issueReviewerAccess(db, rows[0].id);
  assert.equal(rows[0].accessTokenHash, tokenHash(first.token));
  assert.notEqual(rows[0].accessTokenHash, first.token);
  const second = await issueReviewerAccess(db, rows[0].id);
  assert.equal(await reviewerForToken(db, first.token), null);
  assert.ok(await reviewerForToken(db, second.token));
  rows[0].status = 'REVOKED';
  assert.equal(await reviewerForToken(db, second.token), null);
  assert.equal(await reviewerForToken(db, undefined), null);
  assert.equal(await reviewerForToken(db, 'x'.repeat(500)), null);
  assert.match(
    reviewerAccessUrl('https://www.example.com/', second.token),
    /^https:\/\/www\.example\.com\/api\/review\/access\?t=/,
  );
});

test('feedback: a review needs at least one answer; error reports need text', () => {
  const base = { kind: 'REVIEW', path: '/learn/x' };
  assert.equal(feedbackSchema.safeParse(base).success, false);
  assert.equal(feedbackSchema.safeParse({ ...base, clarity: 4 }).success, true);
  assert.equal(feedbackSchema.safeParse({ ...base, clarity: 6 }).success, false);
  assert.equal(feedbackSchema.safeParse({ ...base, missing: 'More on ADH' }).success, true);
  assert.equal(
    feedbackSchema.safeParse({ ...base, path: 'https://evil', clarity: 3 }).success,
    false,
  );
  assert.equal(
    feedbackSchema.safeParse({ kind: 'ERROR', path: '/x', comment: 'no' }).success,
    false,
  );
  assert.equal(
    feedbackSchema.safeParse({ kind: 'ERROR', path: '/x', comment: 'Typo in the table' }).success,
    true,
  );
});

test('expert track: only "expert" is an expert; currency and references count as answers', () => {
  assert.equal(asTrack('expert'), 'expert');
  assert.equal(asTrack('learner'), 'learner');
  assert.equal(asTrack(null), 'learner');
  assert.equal(asTrack('EXPERT'), 'learner');
  const base = { kind: 'REVIEW', path: '/learn/x' };
  assert.equal(feedbackSchema.safeParse({ ...base, currency: '2024 guideline' }).success, true);
  assert.equal(
    feedbackSchema.safeParse({ ...base, references: 'Ref 3 is about urine' }).success,
    true,
  );
  assert.equal(feedbackSchema.safeParse({ ...base, currency: '   ' }).success, false);
});
