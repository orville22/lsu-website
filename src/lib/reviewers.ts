import { randomBytes } from 'node:crypto';
import { z } from 'zod';
import type { PrismaClient } from '@/generated/prisma/client';
import { emailSchema, tokenHash } from './subscribers';

/**
 * Volunteer reviewer programme.
 *
 * - Anyone can ask to join; the request is stored as REQUESTED and nothing is emailed.
 * - Approving a request creates a personal access link. Only the token's SHA-256
 *   is stored; the link works until the reviewer is revoked or a new link is issued.
 * - Opening the link stores the token in an httpOnly cookie on that browser.
 *
 * Functions here take the Prisma client as an argument so they can be tested.
 */

export const REVIEWER_CONSENT_TEXT =
  'Store my details so Lab Science Unfiltered can review my request, email me an access link if it’s approved, and keep the feedback I send. I can ask for my details to be removed at any time.';

export const reviewerRoles = {
  STUDENT: 'Student',
  SCIENTIST: 'Laboratory scientist or technician',
  EDUCATOR: 'Educator',
  OTHER: 'Other',
} as const;

export const reviewerRequestSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(100, 'That name is too long.'),
  email: emailSchema,
  role: z.enum(Object.keys(reviewerRoles) as [keyof typeof reviewerRoles], {
    message: 'Choose the option that best describes you.',
  }),
  country: z.string().trim().max(80).default(''),
  note: z.string().trim().max(1000, 'Keep the note under 1,000 characters.').default(''),
  creditConsent: z.boolean().default(false),
  consent: z.literal(true, { message: 'Tick the box to agree to how your details are used.' }),
});

export type ReviewerRequest = z.infer<typeof reviewerRequestSchema>;

/**
 * Stores a request. A repeat request from an address that is already REQUESTED
 * or APPROVED changes nothing; a DECLINED or REVOKED address goes back to REQUESTED.
 * Callers give the same reply whatever happens.
 */
export async function requestReviewerAccess(db: PrismaClient, input: ReviewerRequest) {
  const existing = await db.reviewer.findUnique({ where: { email: input.email } });
  if (existing && (existing.status === 'REQUESTED' || existing.status === 'APPROVED')) return;
  const fields = {
    name: input.name,
    role: input.role,
    country: input.country,
    note: input.note,
    creditConsent: input.creditConsent,
    consentText: REVIEWER_CONSENT_TEXT,
    status: 'REQUESTED' as const,
    accessTokenHash: null,
  };
  await db.reviewer.upsert({
    where: { email: input.email },
    create: { email: input.email, ...fields },
    update: fields,
  });
}

/** Approves (or re-issues) access and returns the new token for the email link. */
export async function issueReviewerAccess(db: PrismaClient, id: string, now = new Date()) {
  const token = randomBytes(32).toString('base64url');
  const row = await db.reviewer.update({
    where: { id },
    data: { status: 'APPROVED', accessTokenHash: tokenHash(token), invitedAt: now },
  });
  return { token, reviewer: row };
}

export function reviewerAccessUrl(siteUrl: string, token: string) {
  return `${siteUrl.replace(/\/+$/, '')}/api/review/access?t=${encodeURIComponent(token)}`;
}

/** Returns the approved reviewer for a token, or null. */
export async function reviewerForToken(db: PrismaClient, token: string | undefined) {
  if (!token || token.length > 200) return null;
  const row = await db.reviewer.findUnique({ where: { accessTokenHash: tokenHash(token) } });
  return row && row.status === 'APPROVED' ? row : null;
}

const optionalText = (max: number) => z.string().trim().max(max).default('');

/** The five guiding questions. Every field is optional, but something must be filled in. */
export const reviewFeedbackSchema = z
  .object({
    kind: z.literal('REVIEW'),
    path: z.string().max(300).regex(/^\//),
    pageTitle: optionalText(200),
    clarity: z.number().int().min(1).max(5).nullable().default(null),
    level: z.enum(['TOO_BASIC', 'ABOUT_RIGHT', 'TOO_ADVANCED']).nullable().default(null),
    accuracy: optionalText(4000),
    illustrations: optionalText(4000),
    missing: optionalText(4000),
    comment: optionalText(4000),
  })
  .refine(
    (f) =>
      f.clarity !== null ||
      f.level !== null ||
      [f.accuracy, f.illustrations, f.missing, f.comment].some(Boolean),
    { message: 'Answer at least one question before sending.' },
  );

/** Anonymous error reports from anyone: free text only. */
export const errorReportSchema = z.object({
  kind: z.literal('ERROR'),
  path: z.string().max(300).regex(/^\//),
  pageTitle: optionalText(200),
  comment: z
    .string()
    .trim()
    .min(5, 'Describe the error in a few words.')
    .max(2000, 'Keep the report under 2,000 characters.'),
});

export const feedbackSchema = z.union([reviewFeedbackSchema, errorReportSchema]);

/** Unanswered requests are deleted after this many days. */
export const REVIEWER_REQUEST_DAYS = 180;
/** Declined and revoked reviewers are deleted after this many days. */
export const REVIEWER_INACTIVE_DAYS = 30;
/** Feedback is deleted this many days after it is sent. */
export const FEEDBACK_DAYS = 730;
