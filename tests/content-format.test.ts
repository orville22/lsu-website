import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RichText } from '../src/components/rich-text';
import { citedNumbers, lessonSchema, referenceSchema } from '../src/lib/validation';

const html = (text: string) => renderToStaticMarkup(createElement(RichText, { text }));

test('rich text renders paragraphs, lists and inline marks without raw HTML', () => {
  const out = html(
    'First **bold** and *italic* point.\n- Na^+^ out\n- K^+^ in\n1. One\n2. Two\nH~2~O <script>x</script>',
  );
  assert.match(out, /<p>First <strong>bold<\/strong> and <em>italic<\/em> point\.<\/p>/);
  assert.match(out, /<ul><li>Na<sup>\+<\/sup> out<\/li><li>K<sup>\+<\/sup> in<\/li><\/ul>/);
  assert.match(out, /<ol><li>One<\/li><li>Two<\/li><\/ol>/);
  assert.match(out, /H<sub>2<\/sub>O &lt;script&gt;/);
  assert.doesNotMatch(out, /<script>/);
});

test('approximate-value tildes and asterisks with spaces stay literal', () => {
  const out = html('Roughly ~5 to ~10 mmol/L; 2 * 3 * 4.');
  assert.doesNotMatch(out, /<sub>|<em>/);
});

test('citations link to numbered references; only http(s) links are rendered', () => {
  const out = html(
    'Known effect [1] and [2–4], see [docs](https://example.org) [bad](javascript:x)',
  );
  assert.match(out, /href="#ref-1"/);
  assert.match(out, /href="#ref-2".*–.*href="#ref-4"/);
  assert.match(out, /<a href="https:\/\/example.org" target="_blank" rel="noreferrer">docs<\/a>/);
  assert.doesNotMatch(out, /href="javascript/);
});

test('citation numbers expand lists and ranges', () => {
  assert.deepEqual(
    citedNumbers('a [1] b [2,4] c [5–7] d [text](https://x.org)'),
    [1, 2, 4, 5, 6, 7],
  );
});

test('references accept legacy shape and normalise DOIs', () => {
  assert.deepEqual(referenceSchema.parse({ title: 'Old', url: 'https://x.org' }), {
    citation: 'Old',
    url: 'https://x.org',
  });
  const r = referenceSchema.parse({
    citation: 'Author A. Title. J. 2020;1:1-2.',
    doi: 'https://doi.org/10.1373/clinchem.2015.123456',
    pmid: '',
    url: '',
  });
  assert.equal(r.doi, '10.1373/clinchem.2015.123456');
  assert.equal(r.pmid, undefined);
  assert.equal(r.url, undefined);
  assert.equal(referenceSchema.safeParse({ citation: 'x', doi: 'not-a-doi' }).success, false);
  assert.equal(
    referenceSchema.safeParse({ citation: 'x', url: 'javascript:alert(1)' }).success,
    false,
  );
});

test('publishing a lesson requires every citation to have a reference', () => {
  const base = {
    categoryId: 'c',
    difficulty: 'BEGINNER',
    author: 'Orville',
    title: 'Sodium basics',
    slug: 'sodium-basics',
    description: 'A short lesson about sodium.',
    readingMinutes: 4,
    depth: 'SHORT',
    objectives: ['Explain sodium [1]'],
    takeaways: ['Context matters [2]'],
    blocks: [{ id: 'a', type: 'text', heading: 'H', text: 'Claim [1,3]' }],
    references: [{ citation: 'Ref one.' }, { citation: 'Ref two.' }],
    reviewed: true,
  };
  assert.equal(lessonSchema.safeParse({ ...base, status: 'DRAFT' }).success, true);
  const published = lessonSchema.safeParse({ ...base, status: 'PUBLISHED' });
  assert.equal(published.success, false);
  assert.match(JSON.stringify(published.error?.issues), /Citation \[3\] has no matching reference/);
  const fixed = lessonSchema.safeParse({
    ...base,
    status: 'PUBLISHED',
    references: [...base.references, { citation: 'Ref three.' }],
  });
  assert.equal(fixed.success, true);
});
