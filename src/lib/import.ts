import Papa from 'papaparse';
import { questionSchema, type QuestionInput } from './validation';
type Context = {
  categories: { id: string; slug: string }[];
  lessons: { id: string; slug: string }[];
  existingTexts: string[];
};
export const normalize = (v: string) =>
  v
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
export type ImportPreview = {
  rows: { row: number; data: QuestionInput }[];
  errors: { row: number; message: string }[];
};
export function parseImport(raw: string, format: 'csv' | 'json', context: Context): ImportPreview {
  const errors: ImportPreview['errors'] = [];
  const rows: ImportPreview['rows'] = [];
  let input: unknown[] = [];
  if (format === 'json') {
    try {
      const data = JSON.parse(raw);
      if (!Array.isArray(data)) throw new Error('Expected a JSON array.');
      input = data;
    } catch (e) {
      return {
        rows,
        errors: [{ row: 0, message: e instanceof Error ? e.message : 'Invalid JSON.' }],
      };
    }
  } else {
    const parsed = Papa.parse<Record<string, string>>(raw, {
      header: true,
      skipEmptyLines: 'greedy',
    });
    for (const e of parsed.errors) errors.push({ row: (e.row ?? 0) + 2, message: e.message });
    input = parsed.data;
  }
  if (input.length > 500)
    return { rows: [], errors: [{ row: 0, message: 'Import at most 500 questions per batch.' }] };
  if (!input.length)
    return { rows: [], errors: [{ row: 0, message: 'The file contains no questions.' }] };
  const seen = new Set(context.existingTexts.map(normalize));
  input.forEach((item, index) => {
    const row = index + (format === 'csv' ? 2 : 1);
    if (!item || typeof item !== 'object') {
      errors.push({ row, message: 'Expected a question object.' });
      return;
    }
    const r = item as Record<string, unknown>;
    try {
      const category = context.categories.find((c) => c.slug === r.categorySlug);
      if (!category) throw new Error('Unknown categorySlug. Create the category first.');
      const requested =
        typeof r.lessonSlugs === 'string'
          ? r.lessonSlugs.split('|').filter(Boolean)
          : Array.isArray(r.lessonSlugs)
            ? r.lessonSlugs
            : [];
      const linked = requested.map((s) => {
        const l = context.lessons.find((l) => l.slug === s);
        if (!l) throw new Error(`Unknown lesson slug: ${s}`);
        return l.id;
      });
      const options =
        format === 'csv'
          ? ['A', 'B', 'C', 'D'].map((letter) => ({
              text: r[`option${letter}`],
              isCorrect: r.correct === letter,
              explanation: r[`explanation${letter}`] || '',
            }))
          : r.options;
      let refs = r.references;
      if (typeof refs === 'string') refs = refs ? JSON.parse(refs) : [];
      const data = questionSchema.parse({
        text: r.text,
        explanation: r.explanation,
        categoryId: category.id,
        subtopic: r.subtopic || '',
        difficulty: r.difficulty || 'BEGINNER',
        tags: typeof r.tags === 'string' ? r.tags.split('|').filter(Boolean) : r.tags || [],
        author: r.author || 'Imported draft',
        options,
        references: refs || [],
        lessonIds: linked,
        status: 'DRAFT',
        reviewed: false,
      });
      const key = normalize(data.text);
      if (seen.has(key))
        throw new Error('Potential duplicate question text (in the bank or this file).');
      seen.add(key);
      rows.push({ row, data });
    } catch (e) {
      const message =
        e && typeof e === 'object' && 'issues' in e
          ? JSON.stringify(e.issues)
          : e instanceof Error
            ? e.message
            : 'Invalid row.';
      errors.push({ row, message });
    }
  });
  return { rows, errors };
}
