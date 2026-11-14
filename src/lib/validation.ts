import { z } from 'zod';
export const statusSchema = z.enum(['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED']);
export const difficultySchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
export const safeUrl = z
  .string()
  .url()
  .refine((v) => /^https?:\/\//.test(v), 'Use an http(s) URL');
const emptyToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : typeof v === 'string' ? v.trim() : v;
/** Accepts "10.x/…", "doi:10.x/…" or "https://doi.org/10.x/…" and stores the bare DOI. */
const doiSchema = z.preprocess(
  (v) =>
    typeof v === 'string'
      ? emptyToUndefined(v.trim().replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/i, ''))
      : v,
  z
    .string()
    .regex(/^10\.\d{4,9}\/\S+$/, 'Use a DOI such as 10.1373/clinchem.2015.123456')
    .max(300)
    .optional(),
);
/**
 * A reference is a pre-formatted Vancouver citation plus optional identifiers.
 * Legacy records stored as { title, url } are accepted and converted.
 */
export const referenceSchema = z.preprocess(
  (v) =>
    v && typeof v === 'object' && !('citation' in v) && 'title' in v
      ? { citation: (v as { title: unknown }).title, url: (v as { url?: unknown }).url }
      : v,
  z.object({
    citation: z.string().trim().min(1, 'Each reference needs a citation.').max(1500),
    doi: doiSchema,
    pmid: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .regex(/^\d{1,9}$/, 'PMID must be digits only.')
        .optional(),
    ),
    url: z.preprocess(emptyToUndefined, safeUrl.optional()),
  }),
);
/** Citation numbers used in text, e.g. "[1]", "[2,4]", "[3–5]" → [1], [2, 4], [3, 4, 5]. */
export const citationPattern = /\[(\d{1,3}(?:\s*[,–-]\s*\d{1,3})*)\](?!\()/g;
export function citedNumbers(text: string): number[] {
  const found: number[] = [];
  for (const m of text.matchAll(citationPattern)) {
    for (const part of m[1].split(',')) {
      const [a, b] = part.split(/[–-]/).map((n) => Number(n.trim()));
      if (b === undefined) found.push(a);
      else for (let n = a; n <= b && n - a < 50; n++) found.push(n);
    }
  }
  return found;
}
const blockBase = {
  id: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(80),
};
export const blockSchema = z.discriminatedUnion('type', [
  z.object({
    ...blockBase,
    type: z.literal('text'),
    heading: z.string().max(300),
    text: z.string().max(20000),
  }),
  z.object({
    ...blockBase,
    type: z.literal('callout'),
    heading: z.string().max(300),
    text: z.string().max(5000),
  }),
  z.object({ ...blockBase, type: z.literal('equation'), latex: z.string().max(2000) }),
  z.object({
    ...blockBase,
    type: z.literal('table'),
    caption: z.string().max(500),
    headers: z.array(z.string().max(200)).min(1).max(10),
    rows: z.array(z.array(z.string().max(1000)).max(10)).max(100),
  }),
  z.object({
    ...blockBase,
    type: z.literal('image'),
    url: safeUrl,
    alt: z.string().min(1).max(500),
    caption: z.string().max(500),
  }),
  z.object({
    ...blockBase,
    type: z.literal('video'),
    youtubeId: z.string().regex(/^[a-zA-Z0-9_-]{11}$/),
    title: z.string().min(1).max(300),
  }),
]);
const common = {
  categoryId: z.string().min(1),
  subtopic: z.string().max(200).default(''),
  difficulty: difficultySchema,
  status: statusSchema,
  author: z.string().min(1).max(200),
  references: z.array(referenceSchema).max(50),
  reviewed: z.boolean().default(false),
};
export const questionSchema = z
  .object({
    ...common,
    text: z.string().min(10).max(10000),
    explanation: z.string().min(20).max(20000),
    tags: z.array(z.string().max(80)).max(30),
    options: z
      .array(
        z.object({
          text: z.string().min(1).max(3000),
          isCorrect: z.boolean(),
          explanation: z.string().max(3000).default(''),
        }),
      )
      .min(4)
      .max(10),
    lessonIds: z.array(z.string()).max(20).default([]),
  })
  .superRefine((v, c) => {
    if (v.options.filter((o) => o.isCorrect).length !== 1)
      c.addIssue({
        code: 'custom',
        message: 'Exactly one answer must be correct.',
        path: ['options'],
      });
    if (new Set(v.options.map((o) => o.text.trim().toLowerCase())).size !== v.options.length)
      c.addIssue({
        code: 'custom',
        message: 'Answer options must be distinct.',
        path: ['options'],
      });
    if (v.status === 'PUBLISHED' && (!v.reviewed || !v.references.length))
      c.addIssue({
        code: 'custom',
        message: 'Publishing requires review confirmation and at least one reference.',
      });
  });
export const lessonSchema = z
  .object({
    ...common,
    title: z.string().min(5).max(300),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(150),
    description: z.string().min(10).max(1000),
    readingMinutes: z.number().int().min(1).max(180),
    depth: z.enum(['SHORT', 'FULL']).default('FULL'),
    listAsUpcoming: z.boolean().default(false),
    objectives: z.array(z.string().min(1).max(500)).min(1).max(20),
    blocks: z.array(blockSchema).min(1).max(100),
    takeaways: z.array(z.string().min(1).max(1000)).min(1).max(20),
  })
  .superRefine((v, c) => {
    if (new Set(v.blocks.map((b) => b.id)).size !== v.blocks.length)
      c.addIssue({ code: 'custom', message: 'Section IDs must be unique.' });
    if (v.status === 'PUBLISHED' && (!v.reviewed || !v.references.length))
      c.addIssue({
        code: 'custom',
        message: 'Publishing requires review confirmation and at least one reference.',
      });
    if (v.status === 'PUBLISHED') {
      const missing = [...new Set(lessonCitations(v))].filter(
        (n) => n < 1 || n > v.references.length,
      );
      if (missing.length)
        c.addIssue({
          code: 'custom',
          path: ['references'],
          message: `Citation ${missing.map((n) => `[${n}]`).join(', ')} has no matching reference. Add it or fix the number.`,
        });
    }
  });
/** Every citation number used anywhere in a lesson's text. */
export function lessonCitations(l: {
  objectives: string[];
  takeaways: string[];
  blocks: Block[];
}): number[] {
  const texts = [...l.objectives, ...l.takeaways];
  for (const b of l.blocks) {
    if (b.type === 'text' || b.type === 'callout') texts.push(b.text);
    if (b.type === 'table') texts.push(b.caption, ...b.rows.flat());
    if (b.type === 'image') texts.push(b.caption);
  }
  return texts.flatMap(citedNumbers);
}
export type Block = z.infer<typeof blockSchema>;
export type Reference = z.infer<typeof referenceSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
