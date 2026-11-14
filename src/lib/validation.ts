import { z } from 'zod';
export const statusSchema = z.enum(['DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED']);
export const difficultySchema = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']);
export const safeUrl = z
  .string()
  .url()
  .refine((v) => /^https?:\/\//.test(v), 'Use an http(s) URL');
export const referenceSchema = z.object({ title: z.string().min(1).max(500), url: safeUrl });
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
  });
export type Block = z.infer<typeof blockSchema>;
export type Reference = z.infer<typeof referenceSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
