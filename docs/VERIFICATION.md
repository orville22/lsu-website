# Verification and remaining work

Verified locally on 10 November 2026 (Australia/Melbourne), with Node 22, PostgreSQL and the committed dependency lockfile. No public deployment was attempted.

## Automated checks

- `npm test`: **21 passing tests**. Covers 20-question uniqueness, 8/8/4 difficulty quotas, topic breadth, varied combinations, recent avoidance, sparse pools, configurable weights, correct/incorrect/unanswered scoring, invalid answer IDs, answer-key projection, multiline CSV, row errors, duplicate detection, JSON draft reset, publication gates, unsafe content URLs/anchors and origin validation. Origin regression tests cover development loopback aliases, strict production matching, missing/malformed origins, different protocols/ports, cross-site fetch metadata and untrusted forwarded host headers.
- `npm run typecheck`: **passed** with strict TypeScript.
- `npm run build`: **passed**, Next.js 16.4.6 production Webpack build. Public shells and social image pre-render where appropriate; content, admin and attempts render dynamically.
- Initial PostgreSQL migration: **applied successfully** to an empty isolated database. Draft seed: **10 lessons and 20 questions**, no published seed rows.
- `npm run test:integration`: **14 passing database-backed checks**. Includes admin login, denied unauthorised export, denied foreign Origin, draft creation, blocked unreviewed publication, successful synthetic reviewed publication, stale-edit conflict, draft route exclusion, smaller topic pool, attempt ownership, pre-submission answer-key exclusion, answer validation, refresh persistence, scoring, concurrent/double submission, a 20-question demo and a full reviewed 20-question fixture pool with 8/8/4 quotas, server-rendered key exclusion, row-specific import errors, draft-only import, export, audit history, snapshot preservation after deletion, public routes, sitemap, robots and social image. Synthetic test content is removed afterward.
- Dependency audit at installation: no reported vulnerabilities.

## Browser verification

Chrome desktop and responsive viewports at **390 px mobile** and **768 px tablet** were inspected using the production build. Verified mobile menu opening/navigation, the explicit draft-demo switch, quiz creation, option selection, saved answer recovery after refresh, unanswered-question confirmation with initial focus on the cancel button, submission, percentage/topic results, full answer explanations, and a working concept link to a draft lesson. The related lesson and its topic-practice link render at tablet width.

Native Chrome accessibility state was used because the browser plugin’s DOM navigation wrappers returned a timeout-options error. Responsive viewport control and native screenshots worked. Browser QA is a targeted walkthrough rather than a comprehensive screen-reader audit, cross-browser matrix or formal WCAG certification.

## Known limits and follow-on work

- All seed scientific content is AI-generated Draft and needs founder review, reference verification and normal editorial development. Standard practice intentionally starts with no eligible production questions.
- The single administrator must be configured in the environment. There is no default login, multi-admin RBAC, MFA or password-reset flow. Production identity-provider integration remains a separate hosting/security decision.
- Structured block editing works; a full WYSIWYG editor and managed image-upload storage are not implemented. Images use administrator-provided hosted URLs.
- The case section includes one clearly fictional interactive draft. Dedicated case authoring is deferred. The watch section honestly shows upcoming categories; no real LSU videos were supplied. Video embeds work in lesson blocks.
- Exam simulation, learner accounts, bookmarks, progress charts, personalisation and advanced analytics remain future features.
- Category and discipline creation work; renaming/merging/deleting taxonomy entries are not exposed by the MVP admin UI.
- Lesson anchors are supported in the database relationship and renderer; the current question editor selects whole lessons. A richer anchor picker is follow-on work.
- Admin lists show up to 100 filtered records. Larger-scale pagination, fuzzy duplicate matching, and SQL-based quiz sampling can be added without replacing the schema.
- A lesson archived after an attempt starts may make a frozen historical related link unavailable. The lesson route returns 404 and never renders unpublished material.
- No content security policy or external penetration test was added. Body-size limits must also be enforced by the selected production proxy. HTTPS, secrets, database TLS/roles, backup restoration, privacy wording and retention scheduling need production-specific validation.
- PostgreSQL schema invariants must be respected by any out-of-band tools; correct-answer cardinality is validated by the API and rechecked when starting a quiz.
- Browser local-storage restrictions can affect offline answer recovery. Server saves still require connectivity; there is no service worker or offline quiz mode.

The build uses Next.js’s documented Webpack option because Turbopack’s internal build helper could not bind its local port in this managed environment. The framework and requested stack are unchanged.
