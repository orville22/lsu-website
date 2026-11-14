import 'dotenv/config';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomBytes, scryptSync } from 'node:crypto';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { readFileSync } from 'node:fs';
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const origin = 'http://localhost:3100';
const password = randomBytes(24).toString('hex');
const salt = randomBytes(16).toString('hex');
const actor = `integration-${randomBytes(5).toString('hex')}`;
const marker = actor;
let output = '';
let cookie = '';
let visitor = '';
const attempts: string[] = [];
const createdQuestions: string[] = [];
const createdLessons: string[] = [];
let categoryId = '';
const server = spawn(
  process.execPath,
  [
    'node_modules/next/dist/bin/next',
    'dev',
    '--webpack',
    '--hostname',
    '127.0.0.1',
    '--port',
    '3100',
  ],
  {
    env: {
      ...process.env,
      SITE_URL: origin,
      ADMIN_USERNAME: actor,
      ADMIN_PASSWORD_HASH: `${salt}:${scryptSync(password, salt, 64).toString('hex')}`,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);
server.stdout.on('data', (d) => {
  output += d.toString();
});
server.stderr.on('data', (d) => {
  output += d.toString();
});
async function api(path: string, method = 'GET', body?: unknown, auth = '') {
  const r = await fetch(origin + path, {
    method,
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      ...(auth ? { Cookie: auth } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return r;
}
async function okJson(r: Response) {
  const data = await r.json();
  assert.ok(r.ok, `${r.status}: ${JSON.stringify(data)}`);
  return data;
}
let checks = 0;
function pass(label: string) {
  checks++;
  console.log(`PASS ${label}`);
}
try {
  for (let i = 0; i < 90; i++) {
    if (server.exitCode !== null) throw new Error(`Test server stopped: ${output}`);
    try {
      const r = await fetch(origin + '/icon.svg');
      if (r.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
    if (i === 89) throw new Error(`Test server failed: ${output}`);
  }
  const auth = await api('/api/auth', 'POST', { username: actor, password });
  assert.equal(auth.status, 200);
  cookie = auth.headers.get('set-cookie')!.split(';')[0];
  pass('administrator login');
  assert.equal((await api('/api/admin/export')).status, 401);
  assert.equal(
    (
      await fetch(origin + '/api/admin/questions', {
        method: 'POST',
        headers: {
          Origin: 'https://invalid.example',
          'Content-Type': 'application/json',
          Cookie: cookie,
        },
        body: '{}',
      })
    ).status,
    403,
  );
  pass('admin authorisation and cross-origin rejection');
  {
    // Launch gating: empty sections stay hidden from visitors, visible to administrators.
    const publishedQuestions = await db.question.count({
      where: { status: 'PUBLISHED', reviewedAt: { not: null } },
    });
    const home = await (await fetch(origin + '/')).text();
    assert.ok(!home.includes('href="/admin"'), 'footer must not link to administration');
    assert.ok(!home.includes('href="/watch"'), 'watch hidden until enabled');
    assert.ok(!home.includes('href="/cases"'), 'cases hidden until enabled');
    if (publishedQuestions < 5) {
      assert.ok(!home.includes('href="/practice"'), 'practice hidden without questions');
      assert.equal((await fetch(origin + '/practice')).status, 404);
      assert.equal((await api('/practice', 'GET', undefined, cookie)).status, 200);
    }
    for (const page of ['/watch', '/cases', '/cases/a-low-sodium-result']) {
      assert.equal((await fetch(origin + page)).status, 404, page);
      assert.equal((await api(page, 'GET', undefined, cookie)).status, 200, page);
    }
    const sitemap = await (await fetch(origin + '/sitemap.xml')).text();
    assert.ok(!sitemap.includes('/watch') && !sitemap.includes('/cases'));
    pass('empty sections hidden from visitors and previewable by administrators');
  }
  const discipline = await db.discipline.findUniqueOrThrow({
    where: { slug: 'clinical-chemistry' },
  });
  const cat = await db.category.create({
    data: { slug: marker, name: `Test fixtures ${marker}`, disciplineId: discipline.id },
  });
  categoryId = cat.id;
  const question = {
    text: `${marker} Synthetic scoring fixture: choose designated option A.`,
    explanation: 'Synthetic integration fixture; the designated answer is option A.',
    categoryId,
    subtopic: 'fixture',
    difficulty: 'BEGINNER',
    status: 'DRAFT',
    author: actor,
    tags: ['integration'],
    references: [
      { title: 'Local integration test fixture', url: 'https://example.com/test-fixture' },
    ],
    lessonIds: [],
    options: ['Designated A', 'Alternative B', 'Alternative C', 'Alternative D'].map((text, i) => ({
      text,
      isCorrect: i === 0,
      explanation: '',
    })),
    reviewed: false,
  };
  const draft = await okJson(await api('/api/admin/questions', 'POST', question, cookie));
  createdQuestions.push(draft.id);
  assert.equal((await db.question.findUniqueOrThrow({ where: { id: draft.id } })).status, 'DRAFT');
  assert.equal(
    (
      await api(
        '/api/admin/questions',
        'POST',
        { ...question, id: draft.id, version: 1, status: 'PUBLISHED' },
        cookie,
      )
    ).status,
    400,
  );
  pass('draft creation and publication review gate');
  const pub = await okJson(
    await api(
      '/api/admin/questions',
      'POST',
      { ...question, id: draft.id, version: 1, status: 'PUBLISHED', reviewed: true },
      cookie,
    ),
  );
  assert.equal(pub.id, draft.id);
  assert.ok((await db.question.findUniqueOrThrow({ where: { id: draft.id } })).reviewedAt);
  assert.equal(
    (await api('/api/admin/questions', 'POST', { ...question, id: draft.id, version: 1 }, cookie))
      .status,
    409,
  );
  pass('reviewed publication and stale edit protection');
  const lessonBody = {
    title: `${marker} Synthetic lesson fixture`,
    slug: marker,
    description: 'A synthetic lesson for integration testing.',
    categoryId,
    subtopic: 'fixture',
    difficulty: 'BEGINNER',
    status: 'DRAFT',
    author: actor,
    references: [],
    readingMinutes: 2,
    objectives: ['Test safe rendering'],
    takeaways: ['Fixture only'],
    blocks: [
      {
        id: 'section-one',
        type: 'text',
        heading: 'Fixture',
        text: 'Synthetic content, no scientific claims.',
      },
    ],
    reviewed: false,
  };
  const lesson = await okJson(await api('/api/admin/lessons', 'POST', lessonBody, cookie));
  createdLessons.push(lesson.id);
  assert.equal((await api(`/learn/clinical-chemistry/${marker}/${marker}`)).status, 404);
  assert.equal((await api(`/demo/learn/${marker}`)).status, 404);
  assert.equal((await api(`/demo/learn/${marker}`, 'GET', undefined, cookie)).status, 200);
  pass('lesson management, unpublished route exclusion and admin-only preview');
  {
    const cited = {
      ...lessonBody,
      id: lesson.id,
      version: 1,
      depth: 'SHORT',
      status: 'PUBLISHED',
      reviewed: true,
      blocks: [
        {
          id: 'section-one',
          type: 'text',
          heading: 'Fixture',
          text: 'Synthetic claim [1].\nSecond claim [2] with **emphasis**.\n- Na^+^ item',
        },
      ],
      references: [
        {
          citation: 'Fixture A. Synthetic reference one. Test J. 2020;1:1-2.',
          doi: 'doi:10.1000/xyz123',
        },
      ],
    };
    const missing = await api('/api/admin/lessons', 'POST', cited, cookie);
    assert.equal(missing.status, 400);
    assert.match(JSON.stringify(await missing.json()), /Citation \[2\]/);
    await okJson(
      await api(
        '/api/admin/lessons',
        'POST',
        {
          ...cited,
          references: [...cited.references, { citation: 'Fixture B. Two.', pmid: '123' }],
        },
        cookie,
      ),
    );
    const page = await api(`/learn/clinical-chemistry/${marker}/${marker}`);
    assert.equal(page.status, 200);
    const body = await page.text();
    for (const expected of [
      'id="ref-1"',
      'href="#ref-2"',
      'https://doi.org/10.1000/xyz123',
      'pubmed.ncbi.nlm.nih.gov/123/',
      'Short lesson',
      '<strong>emphasis</strong>',
      'Na<sup>+</sup>',
    ])
      assert.ok(body.includes(expected), expected);
    assert.ok(!body.includes('Unpublished preview'));
    pass('citation gate, short-lesson badge and Vancouver references render');
  }
  const startResponse = await api('/api/attempts', 'POST', { categoryId });
  const a = await okJson(startResponse);
  attempts.push(a.id);
  visitor = startResponse.headers.get('set-cookie')!.split(';')[0];
  assert.equal(a.count, 1);
  const first = await okJson(await api(`/api/attempts/${a.id}`, 'GET', undefined, visitor));
  assert.equal(first.questions.length, 1);
  for (const hidden of ['isCorrect', 'explanation', 'references'])
    assert.ok(!JSON.stringify(first.questions).includes(hidden));
  assert.equal((await api(`/api/attempts/${a.id}`)).status, 404);
  pass('short quiz, ownership and no answer-key leakage');
  const option = first.questions[0].options.find(
    (o: { text: string }) => o.text === 'Designated A',
  );
  assert.equal(
    (
      await api(
        `/api/attempts/${a.id}`,
        'PATCH',
        { answers: { [draft.id]: 'bad-option' } },
        visitor,
      )
    ).status,
    400,
  );
  const answers = { [draft.id]: option.id };
  await okJson(await api(`/api/attempts/${a.id}`, 'PATCH', { answers }, visitor));
  const refreshed = await okJson(await api(`/api/attempts/${a.id}`, 'GET', undefined, visitor));
  assert.deepEqual(refreshed.answers, answers);
  pass('answer validation and refresh persistence');
  const responses = await Promise.all([
    api(`/api/attempts/${a.id}`, 'PATCH', { answers, submit: true }, visitor),
    api(`/api/attempts/${a.id}`, 'PATCH', { answers, submit: true }, visitor),
  ]);
  for (const r of responses) {
    const result = await okJson(r);
    assert.equal(result.result.percentage, 100);
    assert.ok(result.questions[0].explanation);
  }
  const again = await okJson(
    await api(`/api/attempts/${a.id}`, 'PATCH', { answers: {}, submit: true }, visitor),
  );
  assert.equal(again.result.percentage, 100);
  pass('server scoring, concurrent and repeated submission idempotency');
  assert.equal((await api('/api/attempts', 'POST', { demo: true }, visitor)).status, 403);
  const adminVisitor = `${visitor}; ${cookie}`;
  const demoResponse = await api('/api/attempts', 'POST', { demo: true }, adminVisitor);
  const demo = await okJson(demoResponse);
  attempts.push(demo.id);
  assert.equal(demo.count, 20);
  const demoView = await okJson(
    await api(`/api/attempts/${demo.id}`, 'GET', undefined, adminVisitor),
  );
  assert.equal(new Set(demoView.questions.map((q: { id: string }) => q.id)).size, 20);
  pass('draft demo restricted to administrators; 20 questions without duplicates');
  const csv = readFileSync('public/question-import-template.csv', 'utf8').replace(
    'REPLACE THIS:',
    marker,
  );
  const invalid = csv.replace('foundations', 'does-not-exist');
  const invalidPreview = await okJson(
    await api('/api/admin/import', 'POST', { raw: invalid, format: 'csv' }, cookie),
  );
  assert.equal(invalidPreview.errors[0].row, 2);
  assert.equal(
    (await api('/api/admin/import', 'POST', { raw: invalid, format: 'csv', commit: true }, cookie))
      .status,
    400,
  );
  const preview = await okJson(
    await api('/api/admin/import', 'POST', { raw: csv, format: 'csv' }, cookie),
  );
  assert.equal(preview.count, 1);
  const imported = await okJson(
    await api('/api/admin/import', 'POST', { raw: csv, format: 'csv', commit: true }, cookie),
  );
  assert.equal(imported.imported, 1);
  const importedQuestion = await db.question.findFirstOrThrow({
    where: { text: { startsWith: marker }, id: { not: draft.id } },
  });
  createdQuestions.push(importedQuestion.id);
  assert.equal(importedQuestion.status, 'DRAFT');
  pass('row-specific import preview and draft-only transactional import');
  const exported = await okJson(await api('/api/admin/export', 'GET', undefined, cookie));
  assert.ok(exported.some((q: { id: string }) => q.id === draft.id));
  const audit = await db.auditLog.count({ where: { actor } });
  assert.ok(audit >= 4);
  pass('backup export and audit records');
  await okJson(
    await api(
      '/api/admin/questions',
      'DELETE',
      { id: draft.id, version: 2, confirmation: 'DELETE' },
      cookie,
    ),
  );
  const frozen = await okJson(await api(`/api/attempts/${a.id}`, 'GET', undefined, visitor));
  assert.equal(frozen.result.percentage, 100);
  pass('question deletion preserves completed attempt snapshot');
  // Exercise the real Published pool at full quiz size with non-scientific fixtures.
  for (let i = 0; i < 25; i++) {
    const fixture = await db.question.create({
      data: {
        text: `${marker} full-pool synthetic fixture ${i}: choose designated A.`,
        explanation: 'Synthetic scoring fixture. Designated A is the test answer.',
        categoryId,
        difficulty: i < 9 ? 'BEGINNER' : i < 17 ? 'INTERMEDIATE' : 'ADVANCED',
        status: 'PUBLISHED',
        reviewedAt: new Date(),
        reviewedBy: actor,
        author: actor,
        references: [],
        tags: ['integration'],
        options: { create: question.options.map((o, position) => ({ ...o, position })) },
      },
    });
    createdQuestions.push(fixture.id);
  }
  const fullStart = await okJson(await api('/api/attempts', 'POST', { categoryId }, visitor));
  attempts.push(fullStart.id);
  assert.equal(fullStart.count, 20);
  const full = await okJson(await api(`/api/attempts/${fullStart.id}`, 'GET', undefined, visitor));
  assert.equal(new Set(full.questions.map((q: { id: string }) => q.id)).size, 20);
  for (const [difficulty, expected] of [
    ['BEGINNER', 8],
    ['INTERMEDIATE', 8],
    ['ADVANCED', 4],
  ]) {
    assert.equal(
      full.questions.filter((q: { difficulty: string }) => q.difficulty === difficulty).length,
      expected,
    );
  }
  const pageHtml = await (await api(`/practice/${fullStart.id}`, 'GET', undefined, visitor)).text();
  assert.ok(!pageHtml.includes('isCorrect'));
  assert.ok(!pageHtml.includes('Designated A is the test answer.'));
  const fullAnswers = Object.fromEntries(
    full.questions.map((q: { id: string; options: { id: string; text: string }[] }) => [
      q.id,
      q.options.find((o) => o.text === 'Designated A')!.id,
    ]),
  );
  const fullResult = await okJson(
    await api(
      `/api/attempts/${fullStart.id}`,
      'PATCH',
      { answers: fullAnswers, submit: true },
      visitor,
    ),
  );
  assert.equal(fullResult.result.correct, 20);
  assert.equal(fullResult.result.percentage, 100);
  pass('20-question reviewed pool, 8/8/4 quotas, safe server rendering and full scoring');
  {
    const home = await (await fetch(origin + '/')).text();
    assert.ok(home.includes('href="/practice"'), 'practice appears once 20 questions are reviewed');
  }
  for (const page of [
    '/',
    '/learn',
    '/practice',
    '/privacy',
    '/sitemap.xml',
    '/robots.txt',
    '/opengraph-image.png',
  ])
    assert.equal((await fetch(origin + page)).status, 200, page);
  pass('public routes, sitemap, robots and social image');
  console.log(`${checks} database-backed integration checks passed.`);
} catch (e) {
  console.error(e);
  console.error(output.slice(-5000));
  process.exitCode = 1;
} finally {
  server.kill('SIGTERM');
  await db.attempt.deleteMany({ where: { id: { in: attempts } } });
  await db.question.deleteMany({ where: { id: { in: createdQuestions } } });
  await db.lesson.deleteMany({ where: { id: { in: createdLessons } } });
  await db.auditLog.deleteMany({ where: { actor } });
  await db.adminSession.deleteMany({ where: { actor } });
  if (categoryId) await db.category.delete({ where: { id: categoryId } });
  await db.$disconnect();
}
