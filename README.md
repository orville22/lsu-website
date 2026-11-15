# Lab Science Unfiltered

A database-backed clinical laboratory science learning platform built with Next.js App Router, TypeScript, Tailwind CSS, PostgreSQL and Prisma.

Production: **https://lsu-website.vercel.app**, hosted on Vercel with a Neon Free PostgreSQL database. Pushes to `main` deploy automatically. Production secrets are stored in Vercel; local `.env` and `.local` data remain excluded from Git.

## Quick start

Use **Node.js 22.12+** and **PostgreSQL 16+**. Node 22 is required by the selected stable dependency tree. The lockfile pins installed versions; use `npm ci` rather than upgrading individual framework packages.

```sh
npm ci
cp .env.example .env
```

Create an empty PostgreSQL database and set `DATABASE_URL` in `.env`. Generate a session secret with `openssl rand -hex 32` and set `SESSION_SECRET`. Set `SITE_URL` to the exact browser origin, initially `http://localhost:3000`.

```sh
npm run db:generate
npm run db:migrate
npm run db:seed
npm run admin:password
```

The password command hides input and prints a salted scrypt hash. Paste that hash into `ADMIN_PASSWORD_HASH` in `.env`, and set `ADMIN_USERNAME`. Do not put the plaintext password in source code or shell arguments. Restart the application after changing environment variables.

```sh
npm run dev
```

Open **http://localhost:3000**. Sign in at `/admin` with the credentials you configured. Admin sign-in stays disabled until credentials and the session secret are configured. No default password is supplied.

Local development also accepts `http://127.0.0.1:3000` when `SITE_URL` uses `localhost` on the same port. Mutations must still originate from the address you opened. In production, use the exact origin configured in `SITE_URL`; an origin rejection now includes that address. Restart the server after changing configuration.

### This workspace’s isolated local database

During implementation an isolated PostgreSQL cluster was created under ignored `.local/postgres`, using the `lsu` role and database on `127.0.0.1:55432`. The ignored `.env` points to it and contains a random session secret. Admin credentials are intentionally unconfigured. The cluster is for local development and uses local trust authentication; production must use authenticated database connections.

```sh
pg_ctl -D .local/postgres -l .local/postgres.log -o '-p 55432 -h 127.0.0.1 -k /tmp' start
# Stop the isolated cluster when finished:
pg_ctl -D .local/postgres stop
```

The host’s Node 20 is older than the chosen dependency tree. An ignored Node 22 runtime is available for this workspace:

```sh
export PATH="$PWD/.local/runtime/node_modules/.bin:$PATH"
node --version
npm run dev
```

For another computer, install Node 22 normally; `.local` is not part of the application source.

## What works

- Responsive homepage and navigation, light/dark themes, learning search, category/difficulty/subtopic filters, breadcrumbs and structured lessons.
- Safe lesson blocks: text, callouts, equations (KaTeX), tables, externally hosted images and click-to-load YouTube embeds.
- Anonymous random/topic practice; configurable 40/40/20 difficulty selection, topic coverage, recent-question avoidance and smaller-pool notices.
- Durable attempts, ordered question IDs, immutable question/option snapshots, browser-local recovery, previous/next navigation and an unanswered-question confirmation.
- Server-only scoring, complete explanations, per-topic performance and links to eligible lessons. The answer key is excluded from pre-submission JSON and server-rendered client props.
- Admin login with scrypt password verification, opaque hashed database sessions, same-origin checks, database-backed rate limits and authorisation on every admin handler.
- Admin question/lesson creation and editing, archival, confirmed deletion, search/filtering, review confirmation, draft/review/published/archived states, author/reviewer metadata and audit history.
- CSV/JSON validation and preview, row-specific errors, duplicate detection, transactional draft-only imports and question-bank JSON/CSV export.
- Category/discipline creation, database-derived dashboard statistics and optimistic version checks for edits.
- A fictional case with stepwise reveals; video-library categories with honest upcoming states.
- Metadata, canonical public URLs, branded social image, sitemap and robots exclusions for attempts, drafts and administration.

## Scientific content and publication

The idempotent seed creates **10 AI-generated draft lessons and 20 draft questions** for local testing. It never publishes material and does not overwrite existing records. Unpublished lessons are previewable at `/demo/learn/...` by signed-in administrators only. The standard question pool is initially empty; signed-in administrators can enable **Use draft demonstration questions** in `/practice` to test a 20-question quiz. Sections without published content are hidden from visitors; see [docs/LAUNCH.md](docs/LAUNCH.md).

In `/admin`, verify content and references, set status to Published, and explicitly confirm scientific review for that save. Publishing records the reviewer/date and removes the demonstration flag. A reviewed published question can then enter standard practice. Published lessons use `/learn/{discipline}/{category}/{lesson}`. Links to lessons that are not eligible at attempt creation are omitted. Missing references block publication. References supplied with a draft are reading suggestions, not a claim that the draft has been verified.

The demonstration sodium–potassium illustration is an explanatory schematic. Clinical examples and intervals are illustrative, not universal procedures or decision limits.

## Verification

```sh
npm test
npm run typecheck
npm run build
npm run test:integration
```

Unit tests do not need a database. Integration tests require the migrated/seeded local database and free loopback port 3100. They launch their own Next development server, generate temporary administrator credentials in memory, create synthetic test fixtures and remove their own fixtures in `finally`. Run against a disposable development database, never production. They test auth, publication gates, immutable snapshots, quiz ownership, absence of pre-submission keys, persistence, invalid answers, scoring, concurrent/double submissions, imports/exports and public routes. Browser QA is documented in `docs/VERIFICATION.md`.

## Documentation

- [Brand guidelines](BRAND_GUIDELINES.md) and [brand verification/screenshots](docs/BRAND_VERIFICATION.md)
- [Architecture and decisions](docs/ARCHITECTURE.md)
- [Database migration guide](docs/DATABASE.md)
- [Import formats](docs/IMPORTS.md): [Markdown lesson template](public/lesson-import-template.md) and [question CSV template](public/question-import-template.csv)
- [Deployment guide](docs/DEPLOYMENT.md)
- [Public launch: visibility, short lessons, lesson text format and references](docs/LAUNCH.md)
- [Verification and remaining work](docs/VERIFICATION.md)

## Deliberate scope limits

Exam simulation, learner accounts, dedicated case/video authoring, image-upload storage, advanced analytics and a full visual rich-text editor are follow-on work. Lesson block editing and hosted media URLs work in the current admin interface. The video library contains no fabricated videos. Existing personal website content has not been migrated or changed.
