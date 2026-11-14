import test from 'node:test';
import assert from 'node:assert/strict';
import Papa from 'papaparse';
import { parseImport } from '../src/lib/import';
import { questionSchema, lessonSchema } from '../src/lib/validation';
const context = {
  categories: [{ id: 'cat', slug: 'electrolytes' }],
  lessons: [{ id: 'lesson', slug: 'sodium' }],
  existingTexts: [],
};
const row = {
  text: 'A valid demonstration question?',
  categorySlug: 'electrolytes',
  difficulty: 'BEGINNER',
  optionA: 'One',
  optionB: 'Two',
  optionC: 'Three',
  optionD: 'Four',
  correct: 'B',
  explanation: 'A detailed explanation of the fixture answer.',
  tags: 'one|two',
  references: '[]',
  lessonSlugs: 'sodium',
};
test('CSV parser supports quoted multiline questions and forces Draft', () => {
  const r = parseImport(
    Papa.unparse([{ ...row, text: 'A valid question, with a comma\nand a new line?' }]),
    'csv',
    context,
  );
  assert.equal(r.errors.length, 0);
  assert.equal(r.rows[0].data.status, 'DRAFT');
  assert.equal(r.rows[0].data.options.filter((o) => o.isCorrect).length, 1);
  assert.equal(r.rows[0].data.lessonIds[0], 'lesson');
});
test('rejects unknown categories, invalid answer keys and duplicate text with row numbers', () => {
  const r = parseImport(
    Papa.unparse([row, { ...row, categorySlug: 'unknown' }, { ...row, correct: 'Z' }, { ...row }]),
    'csv',
    context,
  );
  assert.equal(r.errors.length, 3);
  assert.deepEqual(
    r.errors.map((e) => e.row),
    [3, 4, 5],
  );
});
test('JSON roundtrip imports options and ignores Published state from backups', () => {
  const r = parseImport(
    JSON.stringify([
      {
        ...row,
        options: ['One', 'Two', 'Three', 'Four'].map((text, i) => ({ text, isCorrect: i === 1 })),
        references: [],
        status: 'PUBLISHED',
        reviewed: true,
      },
    ]),
    'json',
    context,
  );
  assert.equal(r.errors.length, 0);
  assert.equal(r.rows[0].data.status, 'DRAFT');
  assert.equal(r.rows[0].data.reviewed, false);
});
test('rejects duplicate against existing bank and malformed input', () => {
  assert.equal(
    parseImport(Papa.unparse([row]), 'csv', { ...context, existingTexts: [row.text.toUpperCase()] })
      .errors.length,
    1,
  );
  assert.equal(parseImport('{invalid', 'json', context).errors[0].row, 0);
  assert.equal(parseImport('[]', 'json', context).errors.length, 1);
});
test('question validation requires four unique options, exactly one key, and review before publication', () => {
  const data = parseImport(Papa.unparse([row]), 'csv', context).rows[0].data;
  assert.ok(questionSchema.safeParse(data).success);
  assert.ok(!questionSchema.safeParse({ ...data, status: 'PUBLISHED' }).success);
  assert.ok(!questionSchema.safeParse({ ...data, options: data.options.slice(0, 3) }).success);
  assert.ok(
    !questionSchema.safeParse({
      ...data,
      options: data.options.map((o) => ({ ...o, isCorrect: true })),
    }).success,
  );
});
test('content schemas reject unsafe URLs and duplicate anchor IDs', () => {
  const base = {
    title: 'A valid lesson',
    slug: 'valid-lesson',
    description: 'A lesson description.',
    categoryId: 'cat',
    subtopic: '',
    difficulty: 'BEGINNER',
    status: 'DRAFT',
    author: 'Author',
    references: [],
    readingMinutes: 5,
    objectives: ['Objective'],
    takeaways: ['Takeaway'],
    blocks: [
      { id: 'one', type: 'image', url: 'javascript:alert(1)', alt: 'An image', caption: '' },
    ],
  };
  assert.ok(!lessonSchema.safeParse(base).success);
  assert.ok(
    !lessonSchema.safeParse({
      ...base,
      blocks: [
        { id: 'one', type: 'text', heading: 'One', text: 'Text' },
        { id: 'one', type: 'text', heading: 'Two', text: 'Text' },
      ],
    }).success,
  );
});
