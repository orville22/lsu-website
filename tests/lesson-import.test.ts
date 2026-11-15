import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseLessonMarkdown, parseReference, normaliseInline } from '../src/lib/lesson-import';
import { lessonSchema } from '../src/lib/validation';

const sample = `---
title: Sodium basics
category: electrolytes
difficulty: Intermediate
length: short
subtopic: Sodium physiology
---

# Ignored because front matter has a title

Sodium and water, before you interpret a number.

## Learning objectives

- Explain what serum sodium measures [1].
- Recognise a measurement artefact.

## Concentration tells a story
Sodium is the principal extracellular cation [1]. This line
wraps onto a second line.

A second paragraph with Na<sup>+</sup> and _emphasis_ and __strength__ [^2].

> [!NOTE] Lab tip
> Check lipaemia when results disagree.

Table: Example results
| Method | Na⁺ |
| --- | --- |
| Indirect ISE | 126 |
| Direct ISE | 138 |

### After the table
More text.

$$
\\text{AG} = \\text{Na}^+ - (\\text{Cl}^- + \\text{HCO}_3^-)
$$

![Pump schematic](https://example.org/pump.png "Three Na⁺ out, two K⁺ in")

[Watch the explainer](https://youtu.be/abcdefghijk)

## Key takeaways
- Interpret sodium alongside water balance.

## References
1. Example A, Example B. A synthetic reference. Test J. 2020;1(2):3-4. doi:10.1000/xyz123. PMID: 123456.
2. Example Org. Synthetic guideline [Internet]. 2024 [cited 2026 Nov 15].
   Available from: https://example.org/guideline
`;

test('parses front matter, special sections and every block type', () => {
  const { lesson, errors, warnings } = parseLessonMarkdown(sample, { author: 'admin' });
  assert.deepEqual(errors, []);
  assert.equal(lesson.title, 'Sodium basics');
  assert.equal(lesson.slug, 'sodium-basics');
  assert.equal(lesson.categorySlug, 'electrolytes');
  assert.equal(lesson.difficulty, 'INTERMEDIATE');
  assert.equal(lesson.depth, 'SHORT');
  assert.equal(lesson.description, 'Sodium and water, before you interpret a number.');
  assert.deepEqual(lesson.objectives, [
    'Explain what serum sodium measures [1].',
    'Recognise a measurement artefact.',
  ]);
  assert.deepEqual(lesson.takeaways, ['Interpret sodium alongside water balance.']);
  assert.deepEqual(
    lesson.blocks.map((b) => b.type),
    ['text', 'callout', 'table', 'text', 'equation', 'image', 'video'],
  );
  const first = lesson.blocks[0];
  assert.ok(first.type === 'text');
  assert.equal(first.heading, 'Concentration tells a story');
  assert.equal(
    first.text,
    'Sodium is the principal extracellular cation [1]. This line wraps onto a second line.\nA second paragraph with Na^+^ and *emphasis* and **strength** [2].',
  );
  const callout = lesson.blocks[1];
  assert.ok(callout.type === 'callout' && callout.heading === 'Lab tip');
  const table = lesson.blocks[2];
  assert.ok(table.type === 'table');
  assert.equal(table.caption, 'Example results');
  assert.deepEqual(table.rows, [
    ['Indirect ISE', '126'],
    ['Direct ISE', '138'],
  ]);
  const after = lesson.blocks[3];
  assert.ok(after.type === 'text' && after.heading === 'After the table');
  const eq = lesson.blocks[4];
  assert.ok(eq.type === 'equation' && eq.latex.startsWith('\\text{AG}'));
  const img = lesson.blocks[5];
  assert.ok(img.type === 'image' && img.alt === 'Pump schematic');
  assert.equal(img.caption, 'Three Na⁺ out, two K⁺ in');
  const vid = lesson.blocks[6];
  assert.ok(vid.type === 'video' && vid.youtubeId === 'abcdefghijk');
  assert.equal(vid.title, 'Watch the explainer');
  assert.deepEqual(lesson.references, [
    {
      citation: 'Example A, Example B. A synthetic reference. Test J. 2020;1(2):3-4.',
      doi: '10.1000/xyz123',
      pmid: '123456',
    },
    {
      citation: 'Example Org. Synthetic guideline [Internet]. 2024 [cited 2026 Nov 15].',
      url: 'https://example.org/guideline',
    },
  ]);
  assert.deepEqual(warnings, []);
  // The parsed lesson is valid for publication as-is.
  const valid = lessonSchema.safeParse({
    ...lesson,
    categoryId: 'c',
    status: 'PUBLISHED',
    reviewed: true,
  });
  assert.equal(valid.success, true, JSON.stringify(valid.error?.issues));
});

test('reports missing essentials and citation problems', () => {
  const { errors, warnings } = parseLessonMarkdown('# Title only\n\n## Section\nClaim [3].');
  assert.ok(errors.some((e) => /category/.test(e)));
  assert.ok(errors.some((e) => /Learning objectives/.test(e)));
  assert.ok(errors.some((e) => /Key takeaways/.test(e)));
  assert.ok(warnings.some((w) => /\[3\]/.test(w)));
  assert.ok(warnings.some((w) => /No references/.test(w)));
});

test('reference parsing handles doi.org links and markdown links', () => {
  assert.deepEqual(
    parseReference('Smith J. Title. J. 2021;2:5. https://doi.org/10.1093/clinchem/hvab001'),
    { citation: 'Smith J. Title. J. 2021;2:5.', doi: '10.1093/clinchem/hvab001' },
  );
  assert.deepEqual(
    parseReference('CLSI. EP15-A3. Wayne, PA: CLSI; 2014. [Link](https://clsi.org/ep15)'),
    { citation: 'CLSI. EP15-A3. Wayne, PA: CLSI; 2014.', url: 'https://clsi.org/ep15' },
  );
});

test('inline normalisation leaves ordinary text alone', () => {
  assert.equal(normaliseInline('snake_case_name and 5 * 3'), 'snake_case_name and 5 * 3');
  assert.equal(normaliseInline('H<sub>2</sub>O <b>x</b>'), 'H~2~O x');
});

test('the downloadable template parses without errors', () => {
  const { errors } = parseLessonMarkdown(readFileSync('public/lesson-import-template.md', 'utf8'));
  assert.deepEqual(errors, []);
});
