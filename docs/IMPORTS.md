# Question import and export

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
