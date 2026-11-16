import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { interactives, Interactive } from '../src/components/interactives';
import { interactiveKeys } from '../src/lib/interactive-keys';
import { result, interpret } from '../src/components/interactives/c1-1/concentration-beaker';
import { adhState } from '../src/components/interactives/c1-1/adh-switch';
import { SITUATIONS } from '../src/components/interactives/c1-1/normal-physiology';
import { parseLessonMarkdown } from '../src/lib/lesson-import';
import { blockSchema } from '../src/lib/validation';

test('every registered key has a component that renders', () => {
  assert.deepEqual(Object.keys(interactives).sort(), [...interactiveKeys].sort());
  for (const k of interactiveKeys) {
    const html = renderToStaticMarkup(createElement(Interactive, { name: k, caption: 'C [1]' }));
    assert.match(html, /class="ix-title"/, k);
    assert.match(html, /<figcaption>/, k);
    // Marker ids must be unique within the page fragment.
    const ids = [...html.matchAll(/<marker id="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, `${k} marker ids`);
    // Every url(#…) reference resolves to a marker in the same fragment.
    for (const m of html.matchAll(/url\(#([^)]+)\)/g))
      assert.ok(ids.includes(m[1]), `${k} ${m[1]}`);
  }
});

test('beaker model matches the three lesson beakers', () => {
  assert.equal(result(14, 1), 140);
  assert.equal(result(14, 1.12), 125);
  assert.equal(result(15, 1.2), 125);
  assert.match(interpret(15, 1.2), /too much water/);
  assert.match(interpret(12, 1), /sodium has been lost/);
  assert.match(interpret(14, 0.9), /water has been lost/);
});

test('ADH switch turns on at the threshold', () => {
  assert.equal(adhState(283).on, false);
  assert.equal(adhState(284).on, true);
  assert.equal(adhState(298).level, 1);
});

test('simulation levels stay on the five-step scale', () => {
  for (const s of SITUATIONS) {
    assert.equal(s.levels.length, 8, s.key);
    for (const l of s.levels) assert.ok(l >= 0 && l <= 4, s.key);
  }
});

test('importer reads @interactive lines and rejects unknown keys', () => {
  const md = `---
title: Water and sodium
category: electrolytes
---
Intro paragraph for the lesson.

## Learning objectives
- One.

## Core concepts
Text before [1].

@interactive(c1-1-normal-physiology "C1.1 interactive I2 · the two systems [1]")

@interactive(c1-1-nope)

## Key takeaways
- Two.

## References
1. Example A. Title. J. 2020;1:1. doi:10.1000/x1.
`;
  const { lesson, errors, warnings } = parseLessonMarkdown(md);
  const ix = lesson.blocks.find((b) => b.type === 'interactive');
  assert.ok(ix && ix.type === 'interactive');
  assert.equal(ix.name, 'c1-1-normal-physiology');
  assert.equal(ix.caption, 'C1.1 interactive I2 · the two systems [1]');
  assert.ok(blockSchema.safeParse(ix).success);
  assert.equal(errors.length, 1);
  assert.match(errors[0], /Unknown interactive “c1-1-nope”/);
  assert.ok(!warnings.some((w) => /never cited/.test(w)));
});
