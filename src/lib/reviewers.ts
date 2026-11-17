import { z } from 'zod';

/**
 * Coming-soon mode and the volunteer reviewer programme.
 *
 * While coming-soon mode is on, the public sees /coming-soon in place of every
 * page. Invited reviewers open a personal link (/invite/<token>) that sets the
 * lsu_reviewer cookie, and signed-in administrators keep full access.
 * Only the SHA-256 of each invite token is stored, so a link can be shown once
 * and then only revoked or replaced.
 *
 * This file is shared by the server, the proxy, the browser and the tests, so it
 * must not import Node.js modules. Token helpers live in reviewer-tokens.ts.
 */

export const REVIEWER_COOKIE = 'lsu_reviewer';
/** Invite cookies last 90 days; revoking the reviewer ends access immediately. */
export const REVIEWER_COOKIE_MAX_AGE = 60 * 60 * 24 * 90;

/** On unless COMING_SOON=off is set in the environment. */
export function comingSoonEnabled(env: Partial<Record<string, string>> = process.env) {
  return (env.COMING_SOON || '').toLowerCase() !== 'off';
}

export const inviteTokenShape = /^[A-Za-z0-9_-]{32,64}$/;

/** Pages anyone can open while the site is coming soon. */
const OPEN_PAGES = [/^\/coming-soon\/?$/, /^\/privacy\/?$/, /^\/subscribe(\/|$)/, /^\/admin(\/|$)/];
/** API routes anyone can call; each one does its own checks. */
const OPEN_API = [
  /^\/api\/subscribe(\/|$)/,
  /^\/api\/reviewers\/request\/?$/,
  /^\/api\/auth(\/|$)/,
  /^\/api\/admin(\/|$)/,
  /^\/api\/cron(\/|$)/,
];
/** Files that must stay reachable (search engines, link previews, icons). */
const OPEN_FILES =
  /^\/(robots\.txt|sitemap\.xml|favicon\.ico|icon[^/]*|apple-icon[^/]*|opengraph-image[^/]*|twitter-image[^/]*|manifest\.webmanifest)$/;

/**
 * What a visitor without reviewer or administrator access gets for a path:
 * "open" (serve as usual), "page" (show the coming-soon page) or "api" (refuse).
 */
export function gateFor(pathname: string): 'open' | 'page' | 'api' {
  if (pathname.startsWith('/invite/')) return 'open';
  if (OPEN_FILES.test(pathname)) return 'open';
  if (pathname.startsWith('/api/')) return OPEN_API.some((r) => r.test(pathname)) ? 'open' : 'api';
  if (OPEN_PAGES.some((r) => r.test(pathname))) return 'open';
  return 'page';
}

export const REVIEWER_ROLES = [
  'Student',
  'Practising laboratory scientist',
  'Educator',
  'Other healthcare professional',
  'Other',
] as const;

export const reviewerRequestSchema = z.object({
  name: z.string().trim().min(1, 'Enter your name.').max(100, 'That name is too long.'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254, 'That email address is too long.')
    .pipe(z.email('Enter a valid email address.')),
  role: z.enum(REVIEWER_ROLES, { message: 'Choose the option that fits you best.' }),
  note: z.string().trim().max(1000, 'Please keep this under 1,000 characters.').default(''),
});

/**
 * The guided questions shown by the feedback button. Ids are stored with each
 * answer, so change wording freely but add new ids rather than reusing old ones.
 */
export const FEEDBACK_QUESTIONS = [
  {
    id: 'clarity',
    type: 'scale',
    label: 'How clear was this page?',
    low: 'Hard to follow',
    high: 'Very clear',
  },
  {
    id: 'level',
    type: 'choice',
    label: 'Was the level right for you?',
    options: ['Too basic', 'About right', 'Too advanced'],
  },
  {
    id: 'accuracy',
    type: 'choice',
    label: 'Did you spot anything inaccurate or out of step with lab practice?',
    options: ['No', 'Yes'],
    detail: {
      when: 'Yes',
      label: 'Where, and what should it say?',
      placeholder: 'e.g. Second paragraph under “Osmolal gap”: the reference interval…',
    },
  },
  {
    id: 'visuals',
    type: 'choice',
    label: 'Did the diagrams and interactives help?',
    options: ['A lot', 'Somewhat', 'Not really', 'None on this page'],
  },
  {
    id: 'change',
    type: 'text',
    label: 'What one change would make this page more useful?',
    placeholder: 'Anything unclear, missing or worth adding. Anything else is welcome here too.',
  },
] as const;

const choice = (options: readonly string[]) =>
  z
    .string()
    .refine((v) => options.includes(v), 'Choose one of the options.')
    .optional();
const text = z.string().trim().max(2000, 'Please keep each answer under 2,000 characters.');

export const feedbackSchema = z
  .object({
    path: z
      .string()
      .max(300)
      .regex(/^\/[^\s]*$/, 'Invalid page.'),
    answers: z.object({
      clarity: z.number().int().min(1).max(5).optional(),
      level: choice(FEEDBACK_QUESTIONS[1].options),
      accuracy: choice(FEEDBACK_QUESTIONS[2].options),
      accuracyDetail: text.optional(),
      visuals: choice(FEEDBACK_QUESTIONS[3].options),
      change: text.optional(),
    }),
  })
  .refine((f) => Object.values(f.answers).some((v) => v !== undefined && v !== ''), {
    message: 'Answer at least one question before sending.',
  })
  .refine((f) => f.answers.accuracy !== 'Yes' || !!f.answers.accuracyDetail, {
    message: 'Tell us where the problem is so we can fix it.',
  });

export type FeedbackAnswers = z.infer<typeof feedbackSchema>['answers'];

/** The free-text answers joined into one string, for the list view and CSV. */
export function feedbackComment(a: FeedbackAnswers) {
  return [a.accuracyDetail && `Accuracy: ${a.accuracyDetail}`, a.change]
    .filter(Boolean)
    .join('\n\n');
}
