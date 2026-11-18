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

export const REVIEWER_TRACKS = ['learner', 'expert'] as const;
export type ReviewerTrack = (typeof REVIEWER_TRACKS)[number];
export const TRACK_LABELS: Record<ReviewerTrack, string> = {
  learner: 'Learner',
  expert: 'Expert',
};

type Detail = { when: string; label: string; placeholder: string };
export type FeedbackQuestion =
  | { id: string; type: 'scale'; label: string; low: string; high: string }
  | { id: string; type: 'choice'; label: string; options: readonly string[]; detail?: Detail }
  | { id: string; type: 'text'; label: string; placeholder: string };

/*
 * The guided questions shown by the feedback button, one set per track.
 * Answers are stored keyed by question id (and `<id>Detail` for follow-up
 * boxes), so change wording freely but give a changed meaning a new id.
 * A question shared by both tracks keeps the same id, so answers can be
 * compared across learners and experts.
 */
const clarity = (label: string): FeedbackQuestion => ({
  id: 'clarity',
  type: 'scale',
  label,
  low: 'Hard to follow',
  high: 'Very clear',
});
const accuracy: FeedbackQuestion = {
  id: 'accuracy',
  type: 'choice',
  label: 'Did you spot anything inaccurate or out of step with lab practice?',
  options: ['No', 'Yes'],
  detail: {
    when: 'Yes',
    label: 'Where, and what should it say?',
    placeholder: 'e.g. Second paragraph under “Osmolal gap”: the reference interval…',
  },
};
const visuals = (label: string): FeedbackQuestion => ({
  id: 'visuals',
  type: 'choice',
  label,
  options: ['A lot', 'Somewhat', 'Not really', 'None on this page'],
});

export const FEEDBACK_QUESTIONS: Record<ReviewerTrack, readonly FeedbackQuestion[]> = {
  learner: [
    clarity('How clear was this page?'),
    {
      id: 'level',
      type: 'choice',
      label: 'Was the level right for you?',
      options: ['Too basic', 'About right', 'Too advanced'],
    },
    accuracy,
    visuals('Did the diagrams and interactives help?'),
    {
      id: 'change',
      type: 'text',
      label: 'What one change would make this page more useful?',
      placeholder: 'Anything unclear, missing or worth adding. Anything else is welcome here too.',
    },
  ],
  expert: [
    clarity('How clear would this page be for a student?'),
    accuracy,
    {
      id: 'currency',
      type: 'choice',
      label: 'Is anything out of date against current guidelines, standards or practice?',
      options: ['No', 'Yes'],
      detail: {
        when: 'Yes',
        label: 'What has changed, and where is it published?',
        placeholder: 'e.g. The 2024 guideline now recommends…',
      },
    },
    {
      id: 'references',
      type: 'choice',
      label: 'Do the references support the claims they are attached to?',
      options: ['Yes', 'Some don’t', 'Didn’t check'],
      detail: {
        when: 'Some don’t',
        label: 'Which references, and what is wrong?',
        placeholder: 'e.g. Reference 7 is about serum, but the claim is about urine…',
      },
    },
    {
      id: 'depth',
      type: 'choice',
      label: 'Is the depth right for a laboratory science student or early-career scientist?',
      options: ['Too shallow', 'About right', 'Too deep'],
    },
    visuals('Do the diagrams and interactives help, and are they scientifically sound?'),
    {
      id: 'change',
      type: 'text',
      label: 'What would you change? Include anything a learner could misapply at the bench.',
      placeholder: 'Corrections, missing caveats, practical pitfalls or anything else.',
    },
  ],
};

/** Every question across both tracks, once each, in a stable order (for CSV). */
export const ALL_FEEDBACK_COLUMNS = (() => {
  const seen = new Map<string, FeedbackQuestion>();
  for (const t of REVIEWER_TRACKS)
    for (const q of FEEDBACK_QUESTIONS[t]) if (!seen.has(q.id)) seen.set(q.id, q);
  return [...seen.values()];
})();

export type FeedbackAnswers = Record<string, string | number | undefined>;

const text = z.string().trim().max(2000, 'Please keep each answer under 2,000 characters.');

/** Validates answers against the question set for the reviewer's track. */
export function feedbackSchema(track: ReviewerTrack) {
  const qs = FEEDBACK_QUESTIONS[track];
  const shape: Record<string, z.ZodType> = {};
  for (const q of qs) {
    if (q.type === 'scale') shape[q.id] = z.number().int().min(1).max(5).optional();
    else if (q.type === 'text') shape[q.id] = text.optional();
    else {
      shape[q.id] = z
        .string()
        .refine((v) => q.options.includes(v), 'Choose one of the options.')
        .optional();
      if (q.detail) shape[`${q.id}Detail`] = text.optional();
    }
  }
  return z
    .object({
      path: z
        .string()
        .max(300)
        .regex(/^\/[^\s]*$/, 'Invalid page.'),
      answers: z.object(shape).strict(),
    })
    .transform((f) => {
      // Drop follow-up text whose trigger answer wasn't chosen, and empty strings.
      const answers: FeedbackAnswers = {};
      for (const [k, v] of Object.entries(f.answers as FeedbackAnswers))
        if (v !== undefined && v !== '') answers[k] = v;
      for (const q of qs)
        if (q.type === 'choice' && q.detail && answers[q.id] !== q.detail.when)
          delete answers[`${q.id}Detail`];
      return { path: f.path, answers };
    })
    .refine((f) => Object.keys(f.answers).length > 0, {
      message: 'Answer at least one question before sending.',
    })
    .refine(
      (f) =>
        qs.every(
          (q) =>
            q.type !== 'choice' ||
            !q.detail ||
            f.answers[q.id] !== q.detail.when ||
            !!f.answers[`${q.id}Detail`],
        ),
      { message: 'Please add the details for the issue you flagged so we can fix it.' },
    );
}

const SHORT: Record<string, string> = {
  accuracy: 'Accuracy',
  currency: 'Out of date',
  references: 'References',
};

/** The free-text answers joined into one string, for search and CSV. */
export function feedbackComment(a: FeedbackAnswers) {
  return [
    ...Object.keys(SHORT)
      .filter((id) => a[`${id}Detail`])
      .map((id) => `${SHORT[id]}: ${a[`${id}Detail`]}`),
    a.change,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/** Short column labels for the admin view and CSV. */
export const FEEDBACK_SHORT_LABELS: Record<string, string> = {
  clarity: 'Clarity',
  level: 'Level',
  accuracy: 'Inaccuracy',
  currency: 'Out of date',
  references: 'References',
  depth: 'Depth',
  visuals: 'Visuals helped',
  change: 'Change',
};
