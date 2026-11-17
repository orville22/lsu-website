# Coming-soon mode and volunteer reviewers

While coming-soon mode is on, the public sees `/coming-soon` in place of every page (the URL they typed stays in the address bar). Invited reviewers and signed-in administrators see the whole site, with a banner at the top and a **Feedback** button on every page.

## What the public sees

`/coming-soon` has:

- email sign-up (shown only when Resend is configured; see [EMAIL.md](EMAIL.md))
- a request form to become a reviewer (name, email, role, optional note; rate-limited, honeypot)
- a link to the YouTube channel (`siteConfig.youtubeUrl`)

Still open to everyone: `/privacy`, `/subscribe/*`, `/admin` (sign-in), `/invite/*`, `robots.txt`, `sitemap.xml` and the APIs those pages use. Every other API answers 403. The sitemap lists only the homepage and privacy page while coming soon. The rules live in `gateFor()` in `src/lib/reviewers.ts` and are enforced in `src/proxy.ts`.

## Inviting reviewers

**Admin → Reviewers**:

- **Requests** from the public form arrive as _Asked to review_. Use **Approve and email** (when Resend is configured) or **Approve, copy link** and send the link yourself.
- **Invite someone directly** adds a person and makes their link in one step.
- Each link is personal: `/invite/<token>`. Only the token's SHA-256 is stored, so the link is shown once. **New link** replaces it (the old one stops working).
- **Revoke** ends access on the reviewer's next page load. **Decline** closes a request without inviting. **Delete** removes the person; their feedback is kept without a name.

Opening a link sets the `lsu_reviewer` cookie (httpOnly, 90 days) and marks the reviewer _Active_. The proxy checks the cookie against the database on each request.

## Feedback

The Feedback button opens five guided questions (`FEEDBACK_QUESTIONS` in `src/lib/reviewers.ts`):

1. How clear was this page? (1–5)
2. Was the level right for you? (Too basic / About right / Too advanced)
3. Did you spot anything inaccurate or out of step with lab practice? (No / Yes, with where and what)
4. Did the diagrams and interactives help? (A lot / Somewhat / Not really / None on this page)
5. What one change would make this page more useful? (free text)

Answers are saved with the reviewer and page path. Read them under **Admin → Reviewers → Feedback**, tick **Dealt with**, or **Export all feedback (CSV)**. To change a question's wording, edit its `label`; to add a question, give it a new `id` and add it to `feedbackSchema`.

## Turning it off

Set `COMING_SOON=off` in Vercel → Settings → Environment Variables (Production) and redeploy. The site opens to everyone; reviewers keep the Feedback button. Remove the variable (or set any other value) to turn coming-soon mode back on.

## Release

This feature adds the `Reviewer` and `Feedback` tables (`prisma/migrations/20261118000000_reviewers_feedback`). Apply it before deploying:

```sh
DATABASE_URL="<Neon unpooled URL>" npm run db:migrate
```

When the review programme ends, delete reviewer rows and feedback (the privacy page promises this).
