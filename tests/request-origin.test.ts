import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedOrigin } from '../src/lib/request-origin';

const siteUrl = 'http://localhost:3000';
function request(target: string, origin?: string, headers: Record<string, string> = {}) {
  return new Request(`${target}/api/auth`, {
    method: 'POST',
    headers: { ...(origin ? { Origin: origin } : {}), ...headers },
  });
}

test('accepts the exact configured origin in development and production', () => {
  for (const development of [true, false]) {
    assert.equal(isAllowedOrigin(request(siteUrl, siteUrl), siteUrl, development), true);
  }
});

test('accepts same-origin loopback aliases on the configured port only in development', () => {
  for (const target of ['http://127.0.0.1:3000', 'http://[::1]:3000']) {
    assert.equal(isAllowedOrigin(request(target, target), siteUrl, true), true);
    assert.equal(isAllowedOrigin(request(target, target), siteUrl, false), false);
  }
});

test('handles a normalised Next.js URL using the actual local Host header', () => {
  const incoming = request(siteUrl, 'http://127.0.0.1:3000', { Host: '127.0.0.1:3000' });
  assert.equal(isAllowedOrigin(incoming, siteUrl, true), true);
});

test('rejects foreign sites, lookalike hosts, different ports and different protocols', () => {
  for (const origin of [
    'https://attacker.example',
    'http://localhost.attacker.example:3000',
    'http://127.0.0.1:3001',
    'https://127.0.0.1:3000',
  ]) {
    assert.equal(isAllowedOrigin(request(origin, origin), siteUrl, true), false);
  }
  assert.equal(
    isAllowedOrigin(request('http://localhost:3000', 'http://127.0.0.1:3000'), siteUrl, true),
    false,
  );
});

test('rejects missing, null, malformed and non-serialised origins', () => {
  for (const origin of [undefined, 'null', 'not-a-url', `${siteUrl}/`, `${siteUrl}/path`]) {
    assert.equal(isAllowedOrigin(request(siteUrl, origin), siteUrl, true), false);
  }
});

test('rejects cross-site fetch metadata and never trusts forwarded host headers', () => {
  assert.equal(
    isAllowedOrigin(request(siteUrl, siteUrl, { 'Sec-Fetch-Site': 'cross-site' }), siteUrl, true),
    false,
  );
  const foreign = request('http://attacker.example:3000', 'http://127.0.0.1:3000', {
    'X-Forwarded-Host': '127.0.0.1:3000',
  });
  assert.equal(isAllowedOrigin(foreign, siteUrl, true), false);
  assert.equal(
    isAllowedOrigin(
      request('http://127.0.0.1:3000', 'http://127.0.0.1:3000'),
      'https://lsu.example',
      true,
    ),
    false,
  );
});
