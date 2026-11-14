import test from 'node:test';
import assert from 'node:assert/strict';
import {
  selectQuestions,
  scoreQuiz,
  validateAnswers,
  publicQuestions,
  type Candidate,
  type SnapshotQuestion,
} from '../src/lib/quiz';
const pool: Candidate[] = Array.from({ length: 300 }, (_, i) => ({
  id: `q${i}`,
  categoryId: `c${i % 13}`,
  difficulty: i < 100 ? 'BEGINNER' : i < 200 ? 'INTERMEDIATE' : 'ADVANCED',
}));
const snapshot: SnapshotQuestion[] = [
  {
    id: 'q1',
    text: 'Fixture',
    categoryId: 'c1',
    categoryName: 'Category 1',
    difficulty: 'BEGINNER',
    subtopic: '',
    version: 1,
    explanation: 'Hidden explanation',
    references: [],
    lessons: [],
    options: [
      { id: 'a', text: 'A', isCorrect: true, explanation: 'Secret' },
      { id: 'b', text: 'B', isCorrect: false, explanation: '' },
    ],
  },
];
test('category scores handle arbitrary administrator-provided names', () => {
  for (const categoryName of ['constructor', '__proto__']) {
    const result = scoreQuiz([{ ...snapshot[0], categoryName }], { q1: 'a' });
    assert.equal(result.categories[categoryName].correct, 1);
    assert.equal(result.categories[categoryName].total, 1);
  }
});
test('selects 20 unique questions with 8/8/4 difficulty balance', () => {
  const ids = selectQuestions(pool);
  assert.equal(ids.length, 20);
  assert.equal(new Set(ids).size, 20);
  const selected = pool.filter((q) => ids.includes(q.id));
  assert.equal(selected.filter((q) => q.difficulty === 'BEGINNER').length, 8);
  assert.equal(selected.filter((q) => q.difficulty === 'INTERMEDIATE').length, 8);
  assert.equal(selected.filter((q) => q.difficulty === 'ADVANCED').length, 4);
  assert.ok(new Set(selected.map((q) => q.categoryId)).size >= 10);
});
test('repeated attempts produce varied combinations', () => {
  const attempts = Array.from({ length: 8 }, () => selectQuestions(pool).join(','));
  assert.equal(new Set(attempts).size, 8);
});
test('avoids recent questions when fresh alternatives exist', () => {
  const recent = new Set(pool.filter((_, i) => i % 3 === 0).map((q) => q.id));
  assert.ok(selectQuestions(pool, 20, undefined, recent).every((id) => !recent.has(id)));
});
test('uses a shorter sparse pool once each, and backfills shortages', () => {
  const small = pool.slice(0, 7);
  assert.equal(selectQuestions([...small, ...small]).length, 7);
  assert.equal(selectQuestions([]).length, 0);
  assert.equal(selectQuestions(pool.slice(0, 25)).length, 20);
});
test('supports configurable weights and invalid zero weights safely', () => {
  const ids = selectQuestions(pool, 20, { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 1 });
  assert.ok(ids.every((id) => pool.find((q) => q.id === id)?.difficulty === 'ADVANCED'));
  assert.equal(selectQuestions(pool, 20, { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0 }).length, 20);
});
test('grades correct, incorrect and unanswered answers', () => {
  assert.equal(scoreQuiz(snapshot, { q1: 'a' }).percentage, 100);
  assert.equal(scoreQuiz(snapshot, { q1: 'b' }).correct, 0);
  const empty = scoreQuiz(snapshot, {});
  assert.equal(empty.correct, 0);
  assert.equal(empty.answered, 0);
  assert.equal(empty.categories['Category 1'].total, 1);
});
test('rejects answers to other questions and invalid option IDs', () => {
  assert.throws(() => validateAnswers(snapshot, { q1: 'wrong' }));
  assert.throws(() => validateAnswers(snapshot, { q2: 'a' }));
});
test('public projection excludes the key, explanations, lesson links and references', () => {
  const json = JSON.stringify(publicQuestions(snapshot));
  for (const hidden of [
    'isCorrect',
    'explanation',
    'Secret',
    'Hidden explanation',
    'references',
    'lessons',
  ])
    assert.ok(!json.includes(hidden));
  assert.deepEqual(publicQuestions(snapshot)[0].options, [
    { id: 'a', text: 'A' },
    { id: 'b', text: 'B' },
  ]);
});
