# Deployment guide

Production is hosted at **https://lsu-website.vercel.app** on Vercel, connected to the `orville22/lsu-website` GitHub repository. The `lsu-postgres` database uses the Neon Free plan in the same region as the Vercel functions (`iad1`). It is connected to Production only; Preview deployments need a separate database configuration.

Vercel stores `DATABASE_URL`, the provider connection variables, `SITE_URL`, and `SESSION_SECRET` as production environment variables. Administrator credentials remain unconfigured, so admin sign-in is disabled. The initial migration and draft-only seed were applied during the first database-backed release on 14 November 2026. No scientific content was published.

`vercel.json` pins the Next.js framework and the normal `npm run build` command. Pushes to `main` deploy automatically. Subsequent schema migrations must be applied once per release using the unpooled database connection; normal builds do not migrate or seed the database.

## Prepare

1. Review the scientific drafts and publish only approved content. Demo routes are visibly labelled and excluded from indexing. Remove or restrict demo previews if the owner does not want draft examples on a public production installation.
2. Complete `/privacy` with the real operator, providers, contact method, retention policy, jurisdiction and effective date.
3. Provision a separate authenticated PostgreSQL database with verified TLS where needed. Restrict network access and use a least-privilege runtime role; use a migration role for schema changes when possible.
4. Configure HTTPS and the exact public `SITE_URL`. Set `DATABASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` and a random `SESSION_SECRET` in the host’s secret manager. Never expose these with NEXT_PUBLIC_ prefixes.
5. Configure the reverse proxy to enforce a 1 MB request-body limit, remove client-supplied forwarded headers, and overwrite X-Forwarded-For. Only then set TRUST_PROXY=true. Otherwise leave it false and understand that rate limiting is shared across users.
6. Select a database backup/restore plan and retention period. Schedule `npm run db:cleanup` with the chosen `ANONYMOUS_RETENTION_DAYS`. This project does not create a schedule.

## Build and release

```sh
npm ci
npm run db:generate
npm test
npm run typecheck
npm run build
npm run db:migrate
npm start
```

The scripts use Next.js’s supported Webpack flag because Turbopack’s internal local helper was blocked in the implementation environment. This is a bundler choice, not a change of framework. `npm start` binds loopback by default; expose it through your reverse proxy. A managed platform may supply its own Next.js startup command. Do not use a static export: attempts, authentication and content management need the server.

Run database-backed integration tests against a disposable staging database before release; never use the integration script on production. Deploy the exact lockfile and schema that were tested. Migrations should run once per release, not concurrently in every application worker. Do not seed automatically on production startup.

## Verify after a separately approved deployment

- Confirm HTTPS, canonical URLs, sitemap and social image resolve at the real domain.
- Check the anonymous standard quiz with reviewed published questions and the fewer-than-20 behaviour.
- Inspect browser requests to confirm correct flags/explanations are absent before submission.
- Confirm administrator sign-in, content editing, review gating, import validation and private backup download.
- Check body-size enforcement, forwarded-header handling, cookie Secure/HttpOnly/SameSite flags, and database role/network restrictions.
- Smoke-test mobile navigation, radio keyboard interaction and the unanswered-question dialog.
- Validate database restoration and cleanup scheduling.

## Operating notes

Administrator sessions last eight hours. To revoke all active sessions, remove AdminSession records via a controlled database operation; changing the password hash alone does not revoke existing sessions. A multi-admin identity provider with MFA can replace the single-admin mechanism later.

No third-party analytics, marketing cookies, learner emails or patient data collection are implemented. If those are added, revise the privacy policy and data model accordingly. The project has no dependency on the founder’s personal website beyond external portfolio links.
