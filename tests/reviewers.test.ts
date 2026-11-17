import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  comingSoonEnabled,
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

test('feedback needs at least one answer and a location for a reported error', () => {
  assert.equal(feedbackSchema.safeParse({ path: '/learn', answers: {} }).success, false);
  assert.equal(
    feedbackSchema.safeParse({ path: '/learn', answers: { accuracy: 'Yes' } }).success,
    false,
  );
  assert.equal(
    feedbackSchema.safeParse({ path: '/learn', answers: { clarity: 6 } }).success,
    false,
  );
  assert.equal(
    feedbackSchema.safeParse({ path: '/learn', answers: { level: 'Very hard' } }).success,
    false,
  );
  const f = feedbackSchema.parse({
    path: '/learn/x',
    answers: {
      clarity: 4,
      accuracy: 'Yes',
      accuracyDetail: 'Units in table 2',
      change: 'More cases',
    },
  });
  assert.equal(feedbackComment(f.answers), 'Accuracy: Units in table 2\n\nMore cases');
  assert.equal(
    feedbackSchema.safeParse({ path: 'https://evil.test', answers: { clarity: 3 } }).success,
    false,
  );
});
