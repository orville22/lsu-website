# Volunteer reviewers (and optional coming-soon mode)

The site is public. Invited reviewers browse it like everyone else, plus a "Reviewer mode" banner and a **Feedback** button on every page. Signed-in administrators also get the Feedback button (with the expert questions).

## Asking to review

`/review` (linked in the footer as "Help review LSU") explains the programme and has the request form: name, email, role, optional note; rate-limited, with a honeypot. Requests arrive in **Admin → Reviewers** as _Asked to review_.

## Coming-soon mode (off)

Set `COMING_SOON=on` in Vercel and redeploy to hide the site: the public then sees `/coming-soon` (email sign-up, reviewer request form, YouTube link) in place of every page, while reviewers and administrators keep full access. `/privacy`, `/review`, `/subscribe/*`, `/admin`, `/invite/*`, `robots.txt`, `sitemap.xml` and the APIs those pages use stay open; other APIs answer 403. The rules live in `gateFor()` in `src/lib/reviewers.ts`, enforced in `src/proxy.ts`. Remove the variable to open the site again.

## Inviting reviewers

**Admin → Reviewers**:

- **Requests** from the public form arrive as _Asked to review_. Use **Approve and email** (when Resend is configured) or **Approve, copy link** and send the link yourself.
- **Invite someone directly** adds a person and makes their link in one step.
- Each link is personal: `/invite/<token>`. Only the token's SHA-256 is stored, so the link is shown once. **New link** replaces it (the old one stops working).
- **Revoke** ends access on the reviewer's next page load. **Decline** closes a request without inviting. **Delete** removes the person; their feedback is kept without a name.

Opening a link sets the `lsu_reviewer` cookie (httpOnly, 90 days) and marks the reviewer _Active_. The proxy checks the cookie against the database on each request.

## Feedback

Each reviewer is on a **track**: **Learner** (the default for public requests) or **Expert** (senior colleagues and academics). Choose it when you add someone, or switch it with **Make expert** / **Make learner**. Administrators get the expert questions.

The Feedback button opens the questions for the reviewer's track (`FEEDBACK_QUESTIONS` in `src/lib/reviewers.ts`).

**Learners (5)**

1. How clear was this page? (1–5)
2. Was the level right for you? (Too basic / About right / Too advanced)
3. Did you spot anything inaccurate or out of step with lab practice? (No / Yes, with where and what)
4. Did the diagrams and interactives help? (A lot / Somewhat / Not really / None on this page)
5. What one change would make this page more useful?

**Experts (7)**

1. How clear would this page be for a student? (1–5)
2. Did you spot anything inaccurate or out of step with lab practice? (No / Yes, with where and what)
3. Is anything out of date against current guidelines, standards or practice? (No / Yes, with what changed and where it's published)
4. Do the references support the claims they are attached to? (Yes / Some don't, with which / Didn't check)
5. Is the depth right for a laboratory science student or early-career scientist? (Too shallow / About right / Too deep)
6. Do the diagrams and interactives help, and are they scientifically sound? (A lot / Somewhat / Not really / None on this page)
7. What would you change? Include anything a learner could misapply at the bench.

Clarity, accuracy, visuals and the change question share ids across tracks, so learner and expert answers line up in the CSV. Read feedback under **Admin → Reviewers → Feedback**, tick **Dealt with**, or **Export all feedback (CSV)**. To change wording, edit a question's `label`; give a question with a new meaning a new `id`.

## Release

This feature adds the `Reviewer` and `Feedback` tables (`prisma/migrations/20261118000000_reviewers_feedback`). Apply it before deploying:

```sh
DATABASE_URL="<Neon unpooled URL>" npm run db:migrate
```

When the review programme ends, delete reviewer rows and feedback (the privacy page promises this).
