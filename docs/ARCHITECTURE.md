# Architecture and decisions

## Runtime and application

Next.js App Router with server-rendered content pages and small client components for navigation, quizzes and editorial forms. TypeScript is strict. Tailwind’s PostCSS integration is configured; CSS design tokens and reusable semantic classes define the visual system. There is no animation library or remote font dependency. Reduced motion is respected.

Framework setup follows the official [Next.js installation guide](https://nextjs.org/docs/app/getting-started/installation). Prisma 7 uses the [generated TypeScript client and PostgreSQL adapter](https://www.prisma.io/docs/orm/v7/prisma-schema/overview/generators). Stable Prisma 7.10.1 was selected instead of npm’s release-candidate `latest` tag. Dependencies are pinned with a committed lockfile. Node 22.12+ covers the actual dependency tree.

## Data model

Discipline → Category → Lesson / Question. Subtopics are currently validated text fields with UI filters, avoiding a separate editorial taxonomy until needed. Questions have separate ordered answer options and a many-to-many lesson join with an optional section anchor. Lessons use schema-validated JSON blocks and references. Question types have a discriminator; only SINGLE_BEST_ANSWER is eligible in the current engine. Future types will need their own validation and scoring strategy.

Question and lesson versions increment on edits. Publication requires reference data and a positive review attestation. A changed version must be reviewed again to remain published. Demo rows are Draft and explicitly flagged; they enter only an explicitly requested demo attempt. Future learner accounts can own attempts through the nullable Learner relationship.

## Quiz engine

1. Establish an opaque anonymous cookie; store only its SHA-256 hash as the owner.
2. Query eligible IDs/category/difficulty only, applying the requested topic/subtopic/difficulty. Standard eligibility requires Published plus non-null reviewedAt and supported type. Demo eligibility requires Draft plus isDemo.
3. Select up to 20 IDs without replacement. Default quotas are 8 beginner, 8 intermediate, 4 advanced; quotas use configured weights and largest remainders. Backfill sparse difficulty groups. Prefer fresh questions and less-represented eligible categories. Three prior attempts provide the recent set. Cryptographic random integers supply production randomness.
4. Fetch only the selected full records and recheck eligibility. Save their exact ID sequence and full versioned snapshot, with shuffled options, on the server.
5. Before submission, project only question text, category, difficulty and option IDs/text. No correct flags, explanations or references cross the server/client boundary.
6. Validate each answer against this attempt’s snapshot. Lock the attempt row for saves and submissions. Grade on the server; first successful submission wins. Later writes return the frozen submitted result.
7. Results expose the snapshot and concept explanations to the same anonymous browser owner. Unanswered questions score zero. No automatic public pages are created for question-bank records.

Anonymous identity is cookie-based, not an account or cross-device identity. Cookie clearing loses access to previous attempts. Browser-local drafts recover changes after refresh; queued saves are ordered within a tab. Across tabs, the last save before submission wins. Attempts have no time limit in this MVP. Snapshots intentionally preserve educational feedback across question edits or deletion; a linked lesson can become unavailable if archived after the attempt started.

Candidate metadata is queried with indexes and full question contents are fetched only for the selected IDs. This supports thousands of questions without a schema change. At much larger scale, replace in-memory candidate selection with sampled or precomputed eligible ID buckets.

## Administration and security

A single environment-configured administrator identity is a deliberate MVP choice. Passwords use salted scrypt; the setup script hides password entry. Session tokens use 256 random bits, are hashed in PostgreSQL, expire after eight hours, and travel only in HttpOnly, SameSite=Lax cookies (Secure in production). Deploy behind HTTPS. Rotating the password hash does not by itself revoke existing sessions; remove AdminSession rows to revoke them. Multi-admin accounts, MFA and reset emails are future work.

Every admin API checks the session. Production mutations require an Origin matching SITE_URL, and all environments reject cross-site fetch metadata. In development only, a loopback SITE_URL also permits localhost, 127.0.0.1 and IPv6 loopback aliases on the configured protocol and port, provided the Origin matches the actual request Host. Forwarded host headers are ignored by this check. Sensitive operations have atomic PostgreSQL rate limits. Proxy IPs are used only with explicit TRUST_PROXY=true; the reverse proxy must replace forwarded headers. Without that configuration all callers share a limiter bucket.

Zod validates payloads, publication gates and URLs on the server. Request payloads are capped at 1 MB after reading and checked by Content-Length before reading; the reverse proxy must enforce its own body limit for chunked or oversized traffic. React escapes text; rich HTML is not accepted. KaTeX uses trust:false, restricted expansion and no raw author HTML. Image/reference URLs allow only HTTP(S); YouTube IDs use a restrictive pattern. There is no filesystem upload endpoint. Content audit records and backups contain answer keys and must stay administrator-only.

Bulk imports validate every row before creating any questions; the transaction rolls back on any error. CSV formula escaping protects exports. Duplicate detection normalises exact text; it is not fuzzy semantic plagiarism detection. Optimistic versions protect content edits. All Prisma operations use parameterised queries. Logs contain error names, not submitted content or credentials. There is no tracking or third-party request on the homepage.

## Deployment boundary

This is a normal Node.js/PostgreSQL application, not a Cloudflare Worker build. The local-only Sites workflow was used; there is no hosting identity or deployment manifest. No cloud resources were created. Deploy only after the owner selects hosting, approves privacy settings, and reviews scientific content. The founder’s existing personal website is only linked.
