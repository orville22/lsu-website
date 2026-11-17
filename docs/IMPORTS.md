# Imports and exports

- [Lesson import (Markdown)](#lesson-import-markdown)
- [Question import and export (CSV/JSON)](#question-import-and-export)

## Lesson import (Markdown)

Use `/admin` → **Import & export** → **Import a lesson from Markdown**, or **Import from Markdown** on the Lessons tab. Paste the lesson or choose a `.md` file, then **Check & preview**. Nothing is saved until you press **Import as Draft** or **Import and publish**.

Download [`public/lesson-import-template.md`](../public/lesson-import-template.md) for a complete example.

### Front matter

```yaml
---
title: Sodium: the story outside the cell   # or use a "# Title" line
slug: sodium-homeostasis                     # optional; made from the title
category: electrolytes                       # required: an existing category slug
subtopic: Sodium physiology                  # optional
difficulty: intermediate                     # beginner | intermediate | advanced
length: short                                # short | full (default short)
description: One or two sentences.           # or the first paragraph under the title
readingMinutes: 6                            # optional; estimated from word count
upcoming: no                                 # yes = list title under "Coming next" while a draft
author: Orville Malijan                      # optional; defaults to the signed-in admin
---
```

### Body

| Markdown                                                         | Becomes                              |
| ---------------------------------------------------------------- | ------------------------------------ |
| `## Learning objectives` + bullet list                           | Objectives (required)                |
| `## Key takeaways` + bullet list                                 | Takeaways (required)                 |
| `## References` + numbered list                                  | References, numbered in that order   |
| `## Any other heading` + paragraphs and lists                    | A lesson section                     |
| `### Sub-heading`                                                | A new block within the section       |
| `> **Heading**` or `> [!NOTE] Heading` then `> text`             | Callout                              |
| Pipe table, with `Table: caption` on the line before or after    | Table                                |
| `$$ … $$` (one or more lines)                                    | Equation (LaTeX)                     |
| `![description](https://… "caption")` on its own line            | Image (description is required)      |
| A YouTube link on its own line, or `[Title](https://youtu.be/…)` | Click-to-load video                  |
| `@interactive(key "Caption")` on its own line                    | Built-in illustration or interactive |

### Illustrations and interactives

Lesson diagrams and interactives are built into the site as components (`src/components/interactives`), so they follow the site's colours, fonts, dark mode and phone layout. Embed one with a line such as `@interactive(c1-1-normal-physiology "C1.1 interactive I2 · the two systems in normal physiology")`. The caption is optional and may carry citations. An unknown key blocks the import and the error lists the known keys. Current keys are in `src/lib/interactive-keys.ts`:

| Key                       | Lesson | What it is                                            |
| ------------------------- | ------ | ----------------------------------------------------- |
| `c1-1-concentration`      | C1.1   | I1: amount versus concentration (sliders and presets) |
| `c1-1-compartments`       | C1.1   | Visual 2: where water, sodium and potassium live      |
| `c1-1-two-systems`        | C1.1   | Visual 3: the two control systems                     |
| `c1-1-adh-switch`         | C1.1   | Visual 4: the ADH switch (draggable osmolality)       |
| `c1-1-jg-triggers`        | C1.1   | What switches on renin release                        |
| `c1-1-raas-cascade`       | C1.1   | Visual 5: the RAAS cascade                            |
| `c1-1-normal-physiology`  | C1.1   | I2: both systems in a healthy person                  |
| `c1-1-adh-switch-patient` | C1.1   | Visual 6: the ADH switch applied to the case patient  |
| `c1-1-heart-failure`      | C1.1   | Visual 7: why heart failure lowers sodium             |
| `c1-1-spot-urine`         | C1.1   | Visual 8: reading the spot urine                      |
| `c1-2-cell-tonicity`      | C1.2   | I2: effective and ineffective osmoles (a cell)        |
| `c1-2-gap-builder`        | C1.2   | I1: the gap builder (presets, sliders, factor)        |
| `c1-2-gap-time-course`    | C1.2   | Visual 2: osmolal gap and anion gap over time         |

To add one: write the component under `src/components/interactives/<lesson>/`, register it in `src/components/interactives/index.tsx` and add its key to `src/lib/interactive-keys.ts`. The test in `tests/interactives.test.tsx` renders every registered key.

Inline formatting follows the [lesson text format](LAUNCH.md#writing-lesson-text). The importer also converts common export habits: `_italic_`, `__bold__`, `<sup>`/`<sub>`, footnote citations `[^1]`, and wrapped lines within a paragraph.

### References

Write each reference as a Vancouver citation. The importer moves `doi:10.…` or `https://doi.org/10.…`, `PMID: …` and `Available from: https://…` out of the text into linked fields, so they aren't shown twice.

### Checks

Errors block the import: missing title, category, description, objectives, takeaways or content; unknown category; images without a description; and, when publishing, missing review confirmation, missing references or a citation number with no matching reference. Warnings don't block: references never cited, references without a DOI, PMID or link, and tables without captions.

### Updating a lesson

Re-import with the same `slug` and tick **Replace the existing lesson**. The lesson keeps its address and question links, its version number increases and the audit log records the change. To swap a short lesson for the full version, set `length: full` and import with **Publish now** so the page never goes offline; importing over a published lesson as a Draft unpublishes it until you publish again.

## Question import and export

Use `/admin` → **Import & export**. Download `public/question-import-template.csv` from the dashboard, replace the example row, choose a file or paste its contents, then **Validate & preview**. Correct all errors before **Import drafts**. Maximum 500 questions and a 1 MB request; file chooser enforces a 900 KB text limit to leave room for JSON encoding.

No partial import is accepted. Every row is validated again when committing; writes and audit records share a transaction. Imported statuses and review flags are ignored: all new records are Draft. Publication always needs a subsequent scientific review. Exact normalised text duplicates in the bank or file are rejected, including archived records. For a bank with the same questions, edit the existing records instead of importing again.

## CSV columns

| Column                             | Meaning                                                                       |
| ---------------------------------- | ----------------------------------------------------------------------------- |
| text                               | Question text, at least 10 characters                                         |
| categorySlug                       | Existing category slug, e.g. electrolytes                                     |
| subtopic                           | Optional topic text                                                           |
| difficulty                         | BEGINNER, INTERMEDIATE or ADVANCED                                            |
| optionA, optionB, optionC, optionD | Four nonempty distinct options                                                |
| correct                            | Exactly A, B, C or D                                                          |
| explanation                        | Detailed explanation, at least 20 characters                                  |
| explanationA … explanationD        | Optional feedback for individual options                                      |
| tags                               | Optional values separated by `                                                | `               |
| author                             | Author metadata; defaults to Imported draft                                   |
| references                         | JSON array with title and http(s) url properties; `[]` is allowed for a draft |
| lessonSlugs                        | Existing lesson slugs separated by `                                          | `; may be empty |

Use a spreadsheet’s standard CSV exporter; commas, quotes and line breaks require normal CSV quoting. A reference array inside a CSV field must be correctly quoted by the CSV exporter. Source lesson anchors can be added to the QuestionLesson relationship in a future richer linking UI; the MVP editor links lesson pages.

Errors show CSV record row numbers (header is row 1); a quoted multiline record counts as one record. A row with an invalid category, duplicate text, invalid key, malformed reference or unknown lesson blocks the entire batch.

## JSON

JSON is an array of objects with text, categorySlug, subtopic, difficulty, tags (array), author, references (array), lessonSlugs (array), options and explanation. `options` is an array of 4–10 objects:

```json
[
  {
    "text": "Replace with a scientifically reviewed question.",
    "categorySlug": "foundations",
    "subtopic": "Example",
    "difficulty": "BEGINNER",
    "tags": ["example"],
    "author": "Author name",
    "references": [],
    "lessonSlugs": [],
    "options": [
      { "text": "Option A", "isCorrect": true, "explanation": "" },
      { "text": "Option B", "isCorrect": false, "explanation": "" },
      { "text": "Option C", "isCorrect": false, "explanation": "" },
      { "text": "Option D", "isCorrect": false, "explanation": "" }
    ],
    "explanation": "Replace with a detailed explanation of the science."
  }
]
```

JSON exports preserve all options, metadata and answer keys. Reimport is a draft content transfer with new IDs, not an in-place restore. Restore a PostgreSQL backup to preserve exact IDs, statuses, attempts and audit history.

CSV exports support exactly four options and reject a bank containing additional options, preventing silent loss. Use JSON in that situation. CSV exports escape spreadsheet formula prefixes; this can add a leading apostrophe to affected text when read by a non-spreadsheet CSV parser. Use JSON for lossless text transfer.

Exports are authenticated downloads and contain answer keys. Store them as private backups.
