export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type Candidate = { id: string; categoryId: string; difficulty: Difficulty };
export type SnapshotQuestion = Candidate & {
  text: string;
  categoryName: string;
  subtopic: string;
  version: number;
  explanation: string;
  references: { title: string; url: string }[];
  options: { id: string; text: string; isCorrect: boolean; explanation: string }[];
  lessons: { title: string; url: string }[];
};
export type Answers = Record<string, string>;
export type QuizResult = ReturnType<typeof scoreQuiz>;
export function selectQuestions(
  pool: Candidate[],
  count = 20,
  weights: Record<Difficulty, number> = { BEGINNER: 0.4, INTERMEDIATE: 0.4, ADVANCED: 0.2 },
  recent = new Set<string>(),
  random = Math.random,
): string[] {
  const unique = [...new Map(pool.map((q) => [q.id, q])).values()];
  const target = Math.min(count, unique.length);
  const selected: Candidate[] = [];
  const used = new Set<string>();
  const categories = new Map<string, number>();
  const pick = (eligible: Candidate[]) => {
    const fresh = eligible.filter((q) => !recent.has(q.id));
    const list = fresh.length ? fresh : eligible;
    if (!list.length) return;
    const min = Math.min(...list.map((q) => categories.get(q.categoryId) || 0));
    const balanced = list.filter((q) => (categories.get(q.categoryId) || 0) === min);
    const q = balanced[Math.min(balanced.length - 1, Math.floor(random() * balanced.length))];
    selected.push(q);
    used.add(q.id);
    categories.set(q.categoryId, (categories.get(q.categoryId) || 0) + 1);
  };
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  const normalized = sum > 0 ? weights : { BEGINNER: 0.4, INTERMEDIATE: 0.4, ADVANCED: 0.2 };
  const total = Object.values(normalized).reduce((a, b) => a + b, 0);
  const quotas = (Object.keys(normalized) as Difficulty[]).map((d) => ({
    d,
    exact: (target * normalized[d]) / total,
    n: Math.floor((target * normalized[d]) / total),
  }));
  let remaining = target - quotas.reduce((n, q) => n + q.n, 0);
  for (const q of [...quotas].sort((a, b) => b.exact - b.n - (a.exact - a.n))) {
    if (remaining-- > 0) q.n++;
  }
  for (const { d, n } of quotas)
    for (let i = 0; i < n; i++) pick(unique.filter((q) => q.difficulty === d && !used.has(q.id)));
  while (selected.length < target) pick(unique.filter((q) => !used.has(q.id)));
  for (let i = selected.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [selected[i], selected[j]] = [selected[j], selected[i]];
  }
  return selected.map((q) => q.id);
}
export function validateAnswers(questions: SnapshotQuestion[], answers: Answers) {
  for (const [id, option] of Object.entries(answers)) {
    const q = questions.find((q) => q.id === id);
    if (!q || !q.options.some((o) => o.id === option))
      throw new Error('Answer does not belong to this attempt.');
  }
}
export function scoreQuiz(questions: SnapshotQuestion[], answers: Answers) {
  validateAnswers(questions, answers);
  let correct = 0;
  const categories: Record<string, { correct: number; total: number }> = Object.create(null);
  for (const q of questions) {
    const isCorrect = q.options.find((o) => o.id === answers[q.id])?.isCorrect === true;
    if (isCorrect) correct++;
    const c = (categories[q.categoryName] ??= { correct: 0, total: 0 });
    c.total++;
    if (isCorrect) c.correct++;
    categories[q.categoryName] = c;
  }
  return {
    correct,
    total: questions.length,
    percentage: questions.length ? Math.round((correct / questions.length) * 100) : 0,
    answered: Object.keys(answers).length,
    categories,
  };
}
export function publicQuestions(questions: SnapshotQuestion[]) {
  return questions.map((q) => ({
    id: q.id,
    text: q.text,
    categoryName: q.categoryName,
    difficulty: q.difficulty,
    options: q.options.map((o) => ({ id: o.id, text: o.text })),
  }));
}
