# Lab Science Unfiltered — interface brand guidelines

LSU is bold, curious, playful and approachable. This direction supersedes the earlier restrained educational treatment. Scientific credibility comes from clear organisation, accurate diagrams, readable lessons and explicit review status. The existing Next.js application, content and learning behaviour remain intact.

## Verified reference and assets

Inspected on 10 November 2026: [founder’s homepage](https://orvillemalijan.com/), [learning section](https://orvillemalijan.com/learn), and the linked shared/homepage stylesheets. Direct HTTPS retrieval succeeded when the web text reader could not access them. Audit copies live in ignored `.local/brand-audit/` and `.local/expressive-refresh/`.

The personal site supplies the palette, Bricolage Grotesque typography, illustrated lab motifs and offset shadows. Its `orville.m` lightning wordmark is a separate personal identity. Retain LSU’s existing flask and two-line wordmark; no official replacement LSU logo was supplied.

| Verified source colour   | Value                             | LSU role                                                    |
| ------------------------ | --------------------------------- | ----------------------------------------------------------- |
| Paper / paper 2 / card   | `#f5eee0` / `#ebe1cc` / `#fffaf0` | Illustration details and occasional warm reading panels     |
| Ink / muted              | `#2b2622` / `#5a5248`             | Reading text and supporting copy                            |
| Cobalt                   | `#4862a8`                         | Source brand reference                                      |
| Tomato / tomato ink      | `#d9735c` / `#a3442f`             | Analytical topics, about section, semantic error emphasis   |
| Mustard                  | `#e6bc5c`                         | Quality control, practice CTA, takeaways and diagram energy |
| Green                    | `#3e6a55`                         | Foundations, clinical case feature and success feedback     |
| Pink                     | `#ebbcc3`                         | Featured lesson section and illustration details            |
| Line / shadow / charcoal | `#3a332d` / `#ddcfb4` / `#35302b` | Source structural colours and dark practice panel           |

The stronger cobalt `#344fb4`, cool light canvas `#f8f9fc`, white reading surfaces, functional tints, hover shades and dark theme are **proposed LSU interface choices**, not newly verified official brand colours. The original `--brand-*` values remain separately recorded in `src/app/design-tokens.css`.

No approved Lab Rat asset exists in this repository. `approvedBrandAssets.labRat` in `src/components/brand/mascot-artwork.tsx` is deliberately `null`. Welcome, takeaway and feedback components render no mascot or empty space until an approved image with alternative text and dimensions is supplied. Do not substitute a stock animal or present an invented character as final branding.

## Typography and reading

Bricolage Grotesque is the main sans-serif for headings, body and controls; JetBrains Mono supports short technical labels. Both are verified reference fonts, self-hosted with licences under `public/fonts/`. Fraunces was present in the reference and remains available as an existing asset, but the refreshed interface uses contemporary sans-serif emphasis instead of editorial italics.

Use confident 700-weight marketing headings, an expressive homepage headline around 52–74 px on desktop and around 34–48 px at smaller breakpoints. Other headings keep the established modest scale. Body text stays 16 px, lesson reading 17 px on desktop, with generous line spacing and an approximately 720 px reading width. Preserve the lesson contents sidebar, equations, tables and references.

## Colour, composition and components

- Use white or cool light reading surfaces between substantial coloured features. Avoid repeated cream section backgrounds.
- Homepage topics use green, cobalt, tomato and mustard, with matching flat sample-tube, ion, photometry and control-chart illustrations. `topic-presentation.ts` maps the existing taxonomy to this system. Lesson-specific artwork can vary while retaining its category colour.
- Featured lessons sit on a pink section with one prominent card and two compact companions. Preserve category, difficulty, reading time and draft/publication status.
- Practice uses charcoal, mustard and a schematic quality-control chart. Clinical cases use green with contrasting result tickets. Do not imply that a decorative QC chart is a real patient or control dataset.
- Video artwork depicts a science film frame and explicitly states that the library is in development. It has no fabricated thumbnail or play control.
- The homepage pump depicts three sodium ions moving out and two potassium ions moving in, with inside/outside labels, arrows and ATP involvement. It is a schematic, not an atomic protein model.
- Quizzes keep neutral question surfaces, clearly selectable answer rows and written feedback. Results use a strong cobalt summary and mustard score marker, without added celebration or changes to scoring.
- Keep draft/review notices and existing educational content. Colour never replaces status labels or answer feedback.

Shared colours, type sizes, spacing, radii and interaction durations live in `design-tokens.css`. `globals.css` retains the existing functional layouts; `experience.css` extends their visual treatment and responsive composition. Extend reusable components rather than duplicating page-specific markup. Administration retains its compact forms and tables.

## Interaction and accessibility

Use short, responsive hover and focus transitions. Button lifts, small card lifts and modest illustration rotation occur only on interaction; there are no continuously floating objects. `prefers-reduced-motion` disables animations, transitions and smooth scrolling. Preserve keyboard navigation, native radio controls, the skip link and visible focus outlines.

Light and dark semantic token contrast was checked: body text 14.22:1 / 14.58:1, supporting text 7.68:1 / 7.42:1, primary controls 7.18:1 / 9.28:1, and control boundaries 3.67:1 / 5.15:1. Semantic feedback pairs exceed 4.5:1. Solid brand panels use white on cobalt/green and brown-black on tomato/mustard/pink. Decorative strokes are not reading text.

See `docs/EXPRESSIVE_REFRESH.md` for validation and screenshots. Nothing is deployed by this refresh.
