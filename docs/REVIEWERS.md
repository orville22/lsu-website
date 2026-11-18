# Volunteer reviewers

The public site stays open. Reviewers get extra access on top of it.

## How it works

1. **Volunteering.** Anyone can ask to join at `/review` (linked from the homepage, every
   lesson's "Early version" note and the footer). Requests are stored; nothing is emailed yet.
2. **Approving.** In **Admin → Reviewers**, select **Approve and email link**. The person gets an
   email with a personal link. If the email can't be sent, the link is shown on screen so you
   can send it yourself.
3. **Access.** Opening the link signs that browser in as a reviewer (cookie `lsu_reviewer`,
   180 days). The same link works on their other devices. **New link** replaces it;
   **Revoke** ends access everywhere.
4. **Lessons in review.** Set a lesson's status to **In review** to show it to reviewers only,
   at `/review/lessons/<slug>`, with a "not public yet" banner. These pages are hidden from
   Google and the sitemap. Their list is on the reviewer's `/review` page.
5. **Feedback.** Reviewers see a **Feedback** button on every page with five optional questions
   (clarity 1–5, accuracy, level, illustrations, what's missing) plus a free-text box.
   Anyone can also use **Report an error on this page** at the end of a published lesson;
   those reports are anonymous.
6. **Working through it.** **Admin → Feedback** groups open items by page. Mark items resolved
   as you deal with them, or export everything as CSV.

Signed-in administrators also see the Feedback button (outside the admin area), so you can try
it. Those test entries are saved without a reviewer name.

## Retention (daily cleanup job)

- Unanswered requests: deleted after 180 days.
- Declined or revoked reviewers: deleted 30 days after the decision.
- Feedback and error reports: deleted two years after they were sent. Deleting a reviewer keeps
  their feedback without their name.

## Switching it off

Set `reviewProgramme: false` in `src/lib/site-config.ts`. The `/review` page, lesson note,
homepage section, footer link and Feedback button all disappear; stored data is untouched.

## Revising a published lesson

Each lesson has one version, so edits to a published lesson go live when saved. While traffic is
low, reviewers comment on the live lesson and you revise it. A "draft revision" feature (live
version stays up while reviewers see the new one) can be added later.

## Expert reviewers

Each reviewer is on a track: **Learner** (the default) or **Expert** (senior colleagues and academics). Switch it with **Make expert** / **Make learner** in Admin → Reviewers. The track decides which questions the Feedback panel shows; it is stored with each submission, so later switches don't relabel old feedback. Administrators testing the panel get the expert questions.

| # | Learner | Expert |
| --- | --- | --- |
| 1 | How clear was this page? (1–5) | How clear would this page be for a student? (1–5) |
| 2 | Is anything inaccurate or out of date? | Is anything inaccurate? Where, and what should it say? |
| 3 | Is the level right for you? | Is anything out of date against current guidelines, standards or practice? |
| 4 | Did the illustrations help? Which one didn't? | Do the references support the claims they're attached to? Which don't? |
| 5 | What confused you, or what's missing? | Is the depth right for a laboratory science student or early-career scientist? |
| 6 | — | Do the illustrations help, and are they scientifically sound? |
| 7 | — | What's missing, or what could a learner misapply at the bench? |

Shared questions save to the same fields (clarity, level/depth, accuracy, illustrations, missing), so learner and expert answers line up in the CSV. Experts add `currency` (out of date) and `references`. Migration: `20261118130000_expert_reviewers` (adds three columns to Feedback and one to Reviewer, all with defaults).
