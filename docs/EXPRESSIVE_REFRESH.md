# LSU expressive visual refresh

Completed locally, 11 November 2026. This refresh supersedes the earlier restrained aesthetic. No deployment or publication was performed.

## What changed

The homepage now pairs a larger sans-serif headline with a large cobalt sodium–potassium pump illustration. Its schematic retains three Na⁺ out, two K⁺ in, inside/outside labels, arrows and ATP involvement. Topic cards use substantial green, cobalt, tomato and mustard surfaces with flat scientific illustrations. Featured lessons use a pink background and varied card sizes. Practice, clinical cases, the upcoming video library and the founder introduction each have distinct compositions.

The learning hub and lessons share category accents and relevant lesson artwork. Lesson reading width, contents sidebar, draft/review notices, educational text, equations and references remain intact. Quizzes retain native answer controls and clear semantic feedback; results gain a stronger score summary. The existing light/dark themes and reduced-motion support remain available.

`src/app/design-tokens.css` centralises the palette, typography, spacing and interaction roles. `experience.css` extends the existing layouts and reusable components. `src/lib/topic-presentation.ts` contains presentation-only category/artwork mappings. See [brand guidelines](../BRAND_GUIDELINES.md) for verified source values versus proposed LSU choices.

## Validation

- **21 existing tests passed**, covering question selection, grading, import/validation and request-origin handling.
- **TypeScript check passed.**
- **Production build passed**, including all existing application routes. It ran in an ignored local staging copy with the same source and dependencies to avoid overwriting the running development server’s output. The nested staging directory produced an informational multiple-lockfile/workspace-root warning.
- **Existing Prettier check passed.** The separately maintained brand guide and editable share SVG were also formatted.
- Compared SHA-256 hashes for 21 pre-existing library, API, Prisma, package and lock files against the pre-refresh snapshot: **no changes**. No schema migration, content import or authentication change was made.
- Visually inspected homepage, learning hub, sodium lesson, practice hub and existing results at desktop, 768 px tablet and 390 px mobile widths. Also inspected the quiz question layout at all three widths, selected an answer, checked progress feedback, and verified that Tab reaches the visibly focused Next button.
- Verified the mobile navigation opens and closes. Restored light theme and the normal desktop viewport, leaving the homepage open.
- Inspected dark homepage/lesson/question surfaces. Checked readable text, draft notices, controls and coloured panels. No page-level horizontal overflow was visible. The mobile learning category rail intentionally scrolls within its own region.
- Source-token contrast checks passed for body/supporting text, actions, links, notices, feedback and input boundaries in both themes. Body contrast is 14.22:1 light / 14.58:1 dark; primary controls 7.18:1 / 9.28:1; input boundaries 3.67:1 / 5.15:1. Brand panels use white on cobalt/green and dark ink on tomato/mustard/pink. Reduced-motion rules disable animations, transitions and smooth scrolling.

The browser connection did not provide DOM/computed-style inspection, so responsive overflow and focus checks used the actual browser UI and screenshots rather than an automated DOM audit. This is not a full accessibility certification. Native captures were cropped to the website content to remove private browser tabs, bookmarks and toolbar information. Desktop before/after images use the same content width and crop height; the browser’s debugging notice reduces the visible after-capture viewport height.

A new unsubmitted draft-demo attempt was created only for question-layout/selection QA (`cmwap4wk50002h688gl6w536s`); it was not graded. The existing 20/20 results attempt used for screenshots was not changed.

## Screenshot comparison

| Page         | Before, desktop                                          | After, desktop                                   | After, tablet                                    | After, mobile                                    |
| ------------ | -------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ |
| Homepage     | [Before](expressive-refresh/homepage-before-desktop.jpg) | [After](expressive-refresh/homepage-desktop.jpg) | [Tablet](expressive-refresh/homepage-tablet.jpg) | [Mobile](expressive-refresh/homepage-mobile.jpg) |
| Learning hub | [Before](expressive-refresh/learn-before-desktop.jpg)    | [After](expressive-refresh/learn-desktop.jpg)    | [Tablet](expressive-refresh/learn-tablet.jpg)    | [Mobile](expressive-refresh/learn-mobile.jpg)    |
| Lesson       | [Before](expressive-refresh/lesson-before-desktop.jpg)   | [After](expressive-refresh/lesson-desktop.jpg)   | [Tablet](expressive-refresh/lesson-tablet.jpg)   | [Mobile](expressive-refresh/lesson-mobile.jpg)   |
| Practice hub | [Before](expressive-refresh/practice-before-desktop.jpg) | [After](expressive-refresh/practice-desktop.jpg) | [Tablet](expressive-refresh/practice-tablet.jpg) | [Mobile](expressive-refresh/practice-mobile.jpg) |
| Results      | [Before](expressive-refresh/results-before-desktop.jpg)  | [After](expressive-refresh/results-desktop.jpg)  | [Tablet](expressive-refresh/results-tablet.jpg)  | [Mobile](expressive-refresh/results-mobile.jpg)  |

Additional views: [topic cards](expressive-refresh/homepage-desktop-topics.jpg), [featured lessons and practice](expressive-refresh/homepage-desktop-lessons.jpg), [clinical case and video](expressive-refresh/homepage-desktop-practice-case.jpg), [about section](expressive-refresh/homepage-desktop-watch-about.jpg), [dark homepage](expressive-refresh/homepage-dark-desktop.jpg), [dark lesson](expressive-refresh/lesson-dark-desktop.jpg), [keyboard focus in quiz](expressive-refresh/quiz-dark-focus-desktop.jpg), [mobile quiz](expressive-refresh/quiz-mobile.jpg), [mobile navigation](expressive-refresh/mobile-menu.jpg), [mobile lesson takeaways](expressive-refresh/lesson-takeaways-mobile.jpg), [mobile answer review](expressive-refresh/results-review-mobile.jpg).

## Missing assets

No approved Lab Rat mascot or replacement official LSU logo was found. The current LSU name and flask wordmark remain. `approvedBrandAssets.labRat` is null, with welcome/tip/feedback hooks ready for a future approved image; no placeholder or invented mascot is rendered. Video artwork explicitly identifies the library as in development and does not imply a playable video. The editable share SVG names the brand font family; its generated PNG uses the local renderer’s sans-serif fallback.
