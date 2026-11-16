# Public launch: what visitors see

The public site shows only what has been published. Nothing links to an empty page.

## Sections

| Section                           | Shown to visitors when                                                    | Switch                      |
| --------------------------------- | ------------------------------------------------------------------------- | --------------------------- |
| Learn                             | Always. It shows an "on their way" message until the first lesson exists. | —                           |
| Module (topic)                    | It has at least one published lesson                                      | automatic                   |
| Practice (nav)                    | 20+ published, reviewed questions                                         | `practiceMinQuestions`      |
| Practice page                     | 5+ published questions (reachable from lessons)                           | `topicPracticeMinQuestions` |
| "Practise this topic" on a lesson | The lesson's module has 5+ published questions                            | `topicPracticeMinQuestions` |
| Clinical cases                    | Switched on                                                               | `casesEnabled`              |
| Watch                             | Switched on                                                               | `watchEnabled`              |
| YouTube link                      | A channel URL is set                                                      | `youtubeUrl`                |

Switches live in `src/lib/site-config.ts`. Signed-in administrators can still open Practice, Cases, Watch and every unpublished lesson to preview them.

## Short and full lessons

Each lesson has a **Lesson length**: Short or Full. Short lessons show a "Short lesson" badge and a note that the full version is in development. To upgrade, edit the same lesson and change it to Full: the URL stays the same, so links from YouTube descriptions and search results keep working.

## Coming next

Tick **list this title publicly under "Coming next"** on an unpublished lesson to announce it. Only the title and module are shown, never a link. The title disappears from the list once the lesson is published.

## Previews

Unpublished lessons open at `/demo/learn/{slug}` for signed-in administrators only (404 for everyone else). The admin lesson list has a Preview link for each one. Draft demonstration questions are administrator-only too.

## Writing lesson text

Text and callout blocks accept a small, safe format. Objectives, takeaways, table cells and captions accept the inline parts.

| Write                   | Result                         |
| ----------------------- | ------------------------------ |
| One paragraph per line  | Paragraphs                     |
| `- item`                | Bulleted list                  |
| `1. item`               | Numbered list                  |
| `**bold**`, `*italic*`  | **bold**, _italic_             |
| `H~2~O`, `Na^+^`        | Subscript, superscript         |
| `[1]`, `[1,3]`, `[2–4]` | Citations linked to references |
| `[text](https://…)`     | External link                  |

No spaces are allowed inside `~…~` or `^…^`, so "~5 mmol/L" stays as written.

## References

References are numbered in the order listed. Each has a Vancouver-formatted **citation** plus optional **DOI**, **PMID** and **URL**, which become links. DOIs can be pasted as `10.…`, `doi:10.…` or `https://doi.org/10.…`. Publishing a lesson is blocked if the text cites a number with no matching reference. Older `{ title, url }` references still display and are converted when the lesson is next saved.

## Database migration

`20261115000000_lesson_depth_upcoming` adds the lesson length and "Coming next" columns. It only adds columns with defaults, so it is safe to apply to production **before** deploying this code. Vercel builds do not run migrations; apply it once with the unpooled connection:

```sh
DATABASE_URL="<Neon unpooled URL>" npm run db:migrate
```

`20261117000000_email_subscribers` adds the `Subscriber` table for email sign-up. It only creates a new table, so apply it **before** deploying the code that uses it (the daily cleanup reads this table). Setup steps are in [EMAIL.md](EMAIL.md).

## Go-live checklist

1. Apply pending migrations to Neon (unpooled connection): `npm run db:migrate`.
2. Remove the seeded AI demo content: `npm run db:remove-demo`, check the list, then `npm run db:remove-demo -- --confirm`.
3. In Vercel → Settings → Environment Variables (Production), add `CRON_SECRET` (`openssl rand -hex 32`). Without it, the daily cleanup the privacy page promises will not run.
4. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` (`npm run admin:password`) so you can sign in and publish.
5. Check `contactUrl` in `src/lib/site-config.ts` points at your contact page.
6. Publish the first reviewed lessons.
