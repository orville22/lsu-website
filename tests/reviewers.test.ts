import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  comingSoonEnabled,
  ALL_FEEDBACK_COLUMNS,
  FEEDBACK_QUESTIONS,
  feedbackComment,
  feedbackSchema,
  gateFor,
  inviteTokenShape,
  reviewerRequestSchema,
} from '../src/lib/reviewers';
import { inviteTokenHash, newInviteToken } from '../src/lib/reviewer-tokens';

test('coming-soon mode is on unless COMING_SOON=off', () => {
  assert.equal(comingSoonEnabled({}), true);
  assert.equal(comingSoonEnabled({ COMING_SOON: 'on' }), true);
  assert.equal(comingSoonEnabled({ COMING_SOON: 'OFF' }), false);
});

test('the gate keeps lessons, practice and private APIs closed to the public', () => {
  for (const p of [
    '/',
    '/learn',
    '/learn/clinical-chemistry/electrolytes/x',
    '/practice',
    '/watch',
  ])
    assert.equal(gateFor(p), 'page', p);
  for (const p of ['/api/attempts', '/api/feedback', '/api/attempts/abc'])
    assert.equal(gateFor(p), 'api', p);
});

test('the gate leaves sign-up, invites, admin and legal pages open', () => {
  for (const p of [
    '/coming-soon',
    '/privacy',
    '/subscribe/confirm',
    '/admin',
    '/invite/abc',
    '/robots.txt',
    '/sitemap.xml',
    '/api/subscribe',
    '/api/reviewers/request',
    '/api/admin/reviewers',
    '/api/auth/login',
    '/api/cron/cleanup',
  ])
    assert.equal(gateFor(p), 'open', p);
  // Prefix lookalikes stay closed.
  assert.equal(gateFor('/privacy-extra'), 'page');
  assert.equal(gateFor('/administer'), 'page');
  assert.equal(gateFor('/api/reviewers/request-all'), 'api');
});

test('invite tokens are URL-safe, unique and hashed', () => {
  const a = newInviteToken();
  const b = newInviteToken();
  assert.notEqual(a, b);
  assert.match(a, inviteTokenShape);
  assert.equal(inviteTokenHash(a).length, 64);
  assert.notEqual(inviteTokenHash(a), a);
  assert.doesNotMatch('../../etc', inviteTokenShape);
});

test('reviewer requests are validated and normalised', () => {
  const ok = reviewerRequestSchema.parse({
    name: '  Sam ',
    email: ' Sam@Example.com ',
    role: 'Student',
  });
  assert.deepEqual(ok, { name: 'Sam', email: 'sam@example.com', role: 'Student', note: '' });
  assert.equal(
    reviewerRequestSchema.safeParse({ name: 'S', email: 'x', role: 'Student' }).success,
    false,
  );
  assert.equal(
    reviewerRequestSchema.safeParse({ name: 'S', email: 's@e.com', role: 'Wizard' }).success,
    false,
  );
});

test('learner feedback needs an answer and details for a reported error', () => {
  const learner = feedbackSchema('learner');
  assert.equal(learner.safeParse({ path: '/learn', answers: {} }).success, false);
  assert.equal(learner.safeParse({ path: '/learn', answers: { accuracy: 'Yes' } }).success, false);
  assert.equal(learner.safeParse({ path: '/learn', answers: { clarity: 6 } }).success, false);
  assert.equal(
    learner.safeParse({ path: '/learn', answers: { level: 'Very hard' } }).success,
    false,
  );
  // Expert-only questions are refused on the learner form.
  assert.equal(
    learner.safeParse({ path: '/learn', answers: { depth: 'About right' } }).success,
    false,
  );
  assert.equal(
    learner.safeParse({ path: 'https://evil.test', answers: { clarity: 3 } }).success,
    false,
  );
  const f = learner.parse({
    path: '/learn/x',
    answers: {
      clarity: 4,
      accuracy: 'Yes',
      accuracyDetail: 'Units in table 2',
      change: 'More cases',
    },
  });
  assert.equal(feedbackComment(f.answers), 'Accuracy: Units in table 2\n\nMore cases');
  // A detail left behind after switching the answer back to "No" is dropped.
  const g = learner.parse({ path: '/x', answers: { accuracy: 'No', accuracyDetail: 'stale' } });
  assert.deepEqual(g.answers, { accuracy: 'No' });
});

test('expert feedback has its own questions and keeps the shared ones comparable', () => {
  const ids = (t: 'learner' | 'expert') => FEEDBACK_QUESTIONS[t].map((q) => q.id);
  for (const shared of ['clarity', 'accuracy', 'visuals', 'change'])
    assert.ok(ids('learner').includes(shared) && ids('expert').includes(shared), shared);
  assert.ok(ids('expert').includes('currency') && !ids('learner').includes('currency'));
  const expert = feedbackSchema('expert');
  assert.equal(
    expert.safeParse({ path: '/x', answers: { references: 'Some don’t' } }).success,
    false,
  );
  const f = expert.parse({
    path: '/x',
    answers: {
      currency: 'Yes',
      currencyDetail: '2024 guideline',
      references: 'Yes',
      depth: 'Too shallow',
    },
  });
  assert.equal(feedbackComment(f.answers), 'Out of date: 2024 guideline');
  assert.equal(new Set(ALL_FEEDBACK_COLUMNS.map((q) => q.id)).size, ALL_FEEDBACK_COLUMNS.length);
});
