import 'server-only';
import { db } from './db';
import {
  selectQuestions,
  scoreQuiz,
  publicQuestions,
  validateAnswers,
  type SnapshotQuestion,
  type Answers,
} from './quiz';
import { HttpError } from './security';
import { Prisma } from '@/generated/prisma/client';
import type { Difficulty } from './quiz';
import { randomInt } from 'node:crypto';
export const secureRandom = () => randomInt(0, 0x100000000) / 0x100000000;
export async function createAttempt(
  ownerHash: string,
  input: { categoryId?: string; subtopic?: string; difficulty?: Difficulty; demo?: boolean },
) {
  const recent = await db.attempt.findMany({
    where: { ownerHash, isDemo: !!input.demo },
    orderBy: { createdAt: 'desc' },
    take: 3,
    select: { questionIds: true },
  });
  const eligible = {
    ...(input.demo
      ? { isDemo: true, status: 'DRAFT' as const }
      : { status: 'PUBLISHED' as const, reviewedAt: { not: null } }),
    type: 'SINGLE_BEST_ANSWER',
    ...(input.categoryId ? { categoryId: input.categoryId } : {}),
    ...(input.subtopic ? { subtopic: input.subtopic } : {}),
    ...(input.difficulty ? { difficulty: input.difficulty } : {}),
  };
  const pool = await db.question.findMany({
    where: eligible,
    select: { id: true, categoryId: true, difficulty: true },
  });
  if (!pool.length)
    throw new HttpError(
      409,
      'No eligible questions are available for these filters. Try another topic or difficulty.',
    );
  const configured = (name: string, fallback: number) => {
    const n = Number(process.env[name]);
    return Number.isFinite(n) && n >= 0 && process.env[name] ? n : fallback;
  };
  const ids = selectQuestions(
    pool,
    20,
    {
      BEGINNER: configured('QUIZ_BEGINNER_WEIGHT', 0.4),
      INTERMEDIATE: configured('QUIZ_INTERMEDIATE_WEIGHT', 0.4),
      ADVANCED: configured('QUIZ_ADVANCED_WEIGHT', 0.2),
    },
    new Set(recent.flatMap((a) => a.questionIds)),
    secureRandom,
  );
  const questions = await db.question.findMany({
    where: { ...eligible, id: { in: ids } },
    include: {
      category: true,
      options: { orderBy: { position: 'asc' } },
      lessons: {
        include: { lesson: { include: { category: { include: { discipline: true } } } } },
      },
    },
  });
  if (questions.length !== ids.length)
    throw new HttpError(409, 'The question bank changed. Please start again.');
  const snapshot: SnapshotQuestion[] = ids.map((id) => {
    const q = questions.find((q) => q.id === id)!;
    if (q.options.filter((o) => o.isCorrect).length !== 1 || q.options.length < 4)
      throw new HttpError(
        409,
        'A question needs editorial attention. Please contact the administrator.',
      );
    const options = q.options.map((o) => ({
      id: o.id,
      text: o.text,
      isCorrect: o.isCorrect,
      explanation: o.explanation,
    }));
    for (let i = options.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [options[i], options[j]] = [options[j], options[i]];
    }
    return {
      id: q.id,
      text: q.text,
      categoryId: q.categoryId,
      categoryName: q.category.name,
      subtopic: q.subtopic,
      difficulty: q.difficulty,
      version: q.version,
      explanation: q.explanation,
      references: q.references as SnapshotQuestion['references'],
      options,
      lessons: q.lessons
        .filter((l) =>
          input.demo
            ? l.lesson.isDemo && l.lesson.status === 'DRAFT'
            : l.lesson.status === 'PUBLISHED' && l.lesson.reviewedAt,
        )
        .map(({ lesson: l, anchor }) => ({
          title: l.title,
          url:
            (input.demo
              ? `/demo/learn/${l.slug}`
              : `/learn/${l.category.discipline.slug}/${l.category.slug}/${l.slug}`) +
            (anchor ? `#${anchor}` : ''),
        })),
    };
  });
  return db.attempt.create({
    data: {
      ownerHash,
      isDemo: !!input.demo,
      mode: input.categoryId ? 'TOPIC' : 'RANDOM',
      questionIds: ids,
      snapshot: snapshot as unknown as Prisma.InputJsonValue,
    },
  });
}
export async function getAttempt(id: string, ownerHash: string | null) {
  if (!ownerHash)
    throw new HttpError(404, 'Attempt not found. Use the browser where you started it.');
  const a = await db.attempt.findFirst({ where: { id, ownerHash } });
  if (!a) throw new HttpError(404, 'Attempt not found. Use the browser where you started it.');
  return a;
}
export function attemptView(a: Awaited<ReturnType<typeof getAttempt>>) {
  const snapshot = a.snapshot as unknown as SnapshotQuestion[];
  return {
    id: a.id,
    isDemo: a.isDemo,
    submitted: !!a.submittedAt,
    questions: a.submittedAt ? snapshot : publicQuestions(snapshot),
    answers: a.answers,
    result: a.result,
    createdAt: a.createdAt,
  };
}
export async function saveAttempt(
  id: string,
  ownerHash: string | null,
  answers: Answers,
  submit: boolean,
) {
  return db.$transaction(async (tx) => {
    // The row lock serialises saves and submissions; the first submission wins.
    await tx.$queryRaw`SELECT "id" FROM "Attempt" WHERE "id"=${id} AND "ownerHash"=${ownerHash || ''} FOR UPDATE`;
    const a = await tx.attempt.findFirst({ where: { id, ownerHash: ownerHash || '' } });
    if (!a) throw new HttpError(404, 'Attempt not found.');
    if (a.submittedAt) return attemptView(a);
    const snapshot = a.snapshot as unknown as SnapshotQuestion[];
    validateAnswers(snapshot, answers);
    const result = submit ? scoreQuiz(snapshot, answers) : null;
    const updated = await tx.attempt.update({
      where: { id },
      data: {
        answers,
        ...(submit
          ? { result: result as unknown as Prisma.InputJsonValue, submittedAt: new Date() }
          : {}),
      },
    });
    return attemptView(updated);
  });
}
