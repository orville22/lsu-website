/**
 * Converts a lesson written in Markdown (for example, exported from the lesson
 * master copy in Claude Docs) into the structured lesson the site stores.
 * Pure function: no database access, so it can run in tests and in the browser.
 *
 * See docs/IMPORTS.md and public/lesson-import-template.md for the format.
 */
import type { Block, Reference } from './validation';
import { citedNumbers } from './validation';
import { interactiveKeys, isInteractiveKey } from './interactive-keys';

export type ParsedLesson = {
  title: string;
  slug: string;
  categorySlug: string;
  subtopic: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  depth: 'SHORT' | 'FULL';
  readingMinutes: number;
  listAsUpcoming: boolean;
  author: string;
  description: string;
  objectives: string[];
  takeaways: string[];
  blocks: Block[];
  references: Reference[];
};
export type ImportResult = {
  lesson: ParsedLesson;
  /** Problems that block import. */
  errors: string[];
  /** Worth checking, but not blocking. */
  warnings: string[];
};

const OBJECTIVES = /^(learning objectives|objectives|what you.ll (take away|learn))$/i;
const TAKEAWAYS = /^(key takeaways|takeaways|summary|key points)$/i;
const REFERENCES = /^(references|bibliography|sources)$/i;

export function slugify(s: string) {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Normalises Markdown habits from other editors into the site's text format. */
export function normaliseInline(text: string) {
  return (
    text
      // HTML sub/superscript → ~x~ / ^x^ (spaces are not allowed inside)
      .replace(/<sup>\s*([^<\s]+)\s*<\/sup>/gi, '^$1^')
      .replace(/<sub>\s*([^<\s]+)\s*<\/sub>/gi, '~$1~')
      // Footnote-style citations [^1] → [1]
      .replace(/\[\^(\d+)\]/g, '[$1]')
      // __bold__ → **bold**; _italic_ → *italic* (only at word boundaries)
      .replace(/(^|[^\w])__(\S(?:.*?\S)?)__(?=[^\w]|$)/g, '$1**$2**')
      .replace(/(^|[^\w*])_(\S(?:[^_]*?\S)?)_(?=[^\w]|$)/g, '$1*$2*')
      // Escaped Markdown characters
      .replace(/\\([*_[\]()#>~^-])/g, '$1')
      // Any other HTML tags are dropped
      .replace(/<\/?[a-z][^>]*>/gi, '')
      .trim()
  );
}

function frontMatter(src: string): { meta: Record<string, string>; body: string } {
  const m = /^﻿?---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/.exec(src);
  if (!m) return { meta: {}, body: src };
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = /^\s*([A-Za-z][\w-]*)\s*:\s*(.*?)\s*$/.exec(line);
    if (kv) meta[kv[1].toLowerCase()] = kv[2].replace(/^(["'])(.*)\1$/, '$2');
  }
  return { meta, body: src.slice(m[0].length) };
}

/** Joins wrapped lines into paragraphs; keeps list items as separate lines. */
function proseToText(lines: string[]) {
  const out: string[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push(normaliseInline(para.join(' ')));
    para = [];
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const item = /^(?:[-*+]|\d+[.)])\s+/.exec(line);
    if (item) {
      flush();
      const marker = /^\d/.test(item[0]) ? `${item[0].match(/\d+/)![0]}. ` : '- ';
      out.push(marker + normaliseInline(line.slice(item[0].length)));
    } else if (
      /^\s{2,}\S/.test(raw) &&
      out.length &&
      /^(- |\d+\. )/.test(out.at(-1)!) &&
      !para.length
    ) {
      // Continuation of the previous list item
      out[out.length - 1] += ' ' + normaliseInline(line);
    } else para.push(line);
  }
  flush();
  return out.filter(Boolean).join('\n');
}

function listItems(lines: string[]) {
  return proseToText(lines)
    .split('\n')
    .map((l) => l.replace(/^(- |\d+\. )/, '').trim())
    .filter(Boolean);
}

/** "Author A. Title. J. 2020;1:2. doi:10.x/y. PMID: 123. Available from: https://…" */
export function parseReference(raw: string): Reference {
  let text = normaliseInline(raw);
  let doi: string | undefined;
  let pmid: string | undefined;
  let url: string | undefined;
  const take = (re: RegExp) => {
    const m = re.exec(text);
    if (m) text = (text.slice(0, m.index) + text.slice(m.index + m[0].length)).trim();
    return m;
  };
  // Markdown links: keep only the target (labels like "Link" aren't part of a citation)
  text = text.replace(/\[[^\]]+\]\((https?:\/\/[^\s)]+)\)/g, '$1');
  const d =
    take(/\s*doi:\s*(10\.\d{4,9}\/\S+?)[.,;]?(?=\s|$)/i) ||
    take(
      /\s*(?:Available from:\s*)?https?:\/\/(?:dx\.)?doi\.org\/(10\.\d{4,9}\/\S+?)[.,;]?(?=\s|$)/i,
    );
  if (d) doi = d[1];
  const p = take(/\s*PMID:\s*(\d{1,9})\.?/i);
  if (p) pmid = p[1];
  const u =
    take(/\s*Available (?:from|at):\s*<?(https?:\/\/[^\s>]+?)>?[.,;]?(?=\s|$)/i) ||
    take(/\s*<?(https?:\/\/[^\s>]+?)>?[.,;]?(?=\s|$)/i);
  if (u) url = u[1];
  // Tidy leftover punctuation where identifiers were removed
  text = text
    .replace(/\s+([.,;])/g, '$1')
    .replace(/[.\s]*$/, '.')
    .replace(/\.\.$/, '.');
  return {
    citation: text,
    ...(doi ? { doi } : {}),
    ...(pmid ? { pmid } : {}),
    ...(url ? { url } : {}),
  };
}

function youtubeId(s: string) {
  const m =
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(
      s,
    );
  return m?.[1];
}

type Section = { heading: string; lines: string[] };

export function parseLessonMarkdown(src: string, defaults: { author?: string } = {}): ImportResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const { meta, body } = frontMatter(src.replace(/\r\n/g, '\n'));
  const lines = body.split('\n');

  // H1 = title; text before the first H2 = description (if not in front matter)
  let h1 = '';
  const intro: string[] = [];
  const sections: Section[] = [];
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    const h = !inFence && /^(#{1,3})\s+(.*?)\s*#*\s*$/.exec(line);
    if (h && h[1] === '#' && !h1 && !sections.length) h1 = normaliseInline(h[2]);
    else if (h && h[1] === '##') sections.push({ heading: normaliseInline(h[2]), lines: [] });
    else if (sections.length) sections.at(-1)!.lines.push(line);
    else intro.push(line);
  }

  const title = normaliseInline(meta.title || h1);
  const description = normaliseInline(meta.description || proseToText(intro).split('\n')[0] || '');
  const objectives: string[] = [];
  const takeaways: string[] = [];
  const references: Reference[] = [];
  const blocks: Block[] = [];
  const ids = new Set<string>();
  const uniqueId = (base: string) => {
    let id = slugify(base) || 'section';
    for (let n = 2; ids.has(id); n++) id = `${slugify(base) || 'section'}-${n}`;
    ids.add(id);
    return id;
  };

  for (const s of sections) {
    if (OBJECTIVES.test(s.heading)) {
      objectives.push(...listItems(s.lines));
      continue;
    }
    if (TAKEAWAYS.test(s.heading)) {
      takeaways.push(...listItems(s.lines));
      continue;
    }
    if (REFERENCES.test(s.heading)) {
      // Numbered or bulleted entries; wrapped lines continue the previous entry
      const entries: string[] = [];
      for (const raw of s.lines) {
        const line = raw.trim();
        if (!line) continue;
        const start = /^(?:\[\d+\]|\d+[.)]|[-*+])\s+/.exec(line);
        if (start) entries.push(line.slice(start[0].length));
        else if (entries.length) entries[entries.length - 1] += ' ' + line;
        else entries.push(line);
      }
      references.push(...entries.map(parseReference));
      continue;
    }
    // A normal section: prose becomes text blocks; special elements split it.
    let heading = s.heading;
    let prose: string[] = [];
    const flushProse = () => {
      const text = proseToText(prose);
      prose = [];
      // A heading with no prose (e.g. directly before a table) still becomes a block, so it shows.
      if (!text && !heading) return;
      blocks.push({
        id: uniqueId(heading || `${s.heading} continued`),
        type: 'text',
        heading,
        text,
      });
      heading = '';
    };
    const L = s.lines;
    for (let i = 0; i < L.length; i++) {
      const line = L[i];
      const t = line.trim();
      // Equation: $$ … $$ (one or several lines)
      if (t.startsWith('$$')) {
        flushProse();
        let latex = t.slice(2);
        if (latex.trimEnd().endsWith('$$') && latex.trim().length > 2)
          latex = latex.trimEnd().slice(0, -2);
        else {
          const parts = [latex];
          while (++i < L.length && !L[i].trim().endsWith('$$')) parts.push(L[i]);
          if (i < L.length) parts.push(L[i].trim().slice(0, -2));
          latex = parts.join('\n');
        }
        blocks.push({
          id: uniqueId(`${s.heading} equation`),
          type: 'equation',
          latex: latex.trim(),
        });
        continue;
      }
      // Callout: a blockquote. "> [!NOTE] Title" or "> **Title**" sets the heading.
      if (t.startsWith('>')) {
        flushProse();
        const q: string[] = [];
        while (i < L.length && L[i].trim().startsWith('>'))
          q.push(L[i++].trim().replace(/^>\s?/, ''));
        i--;
        let calloutHeading = 'Key point';
        const admon = /^\[!(\w+)\]\s*(.*)$/.exec(q[0] || '');
        const bold = /^\*\*(.+?)\*\*\s*$/.exec(q[0] || '');
        if (admon) {
          calloutHeading = admon[2]
            ? normaliseInline(admon[2])
            : admon[1][0] + admon[1].slice(1).toLowerCase();
          q.shift();
        } else if (bold) {
          calloutHeading = normaliseInline(bold[1]);
          q.shift();
        }
        blocks.push({
          id: uniqueId(calloutHeading),
          type: 'callout',
          heading: calloutHeading,
          text: proseToText(q),
        });
        continue;
      }
      // Table: pipe rows with a separator line; optional "Table: caption" before or after
      if (t.startsWith('|') && /^\s*\|?\s*:?-{2,}/.test(L[i + 1] || '')) {
        let caption = '';
        let last = prose.length - 1;
        while (last >= 0 && !prose[last].trim()) last--;
        if (last >= 0 && /^table:/i.test(prose[last].trim())) {
          caption = prose[last].trim().replace(/^table:\s*/i, '');
          prose.splice(last, 1);
        }
        flushProse();
        const cells = (row: string) =>
          row
            .trim()
            .replace(/^\||\|$/g, '')
            .split('|')
            .map((c) => normaliseInline(c));
        const headers = cells(t);
        i += 2;
        const rows: string[][] = [];
        while (i < L.length && L[i].trim().startsWith('|')) rows.push(cells(L[i++]));
        // Caption after the table (on the next non-blank line)
        let j = i;
        while (j < L.length && !L[j].trim()) j++;
        if (!caption && j < L.length && /^table:/i.test(L[j].trim())) {
          caption = L[j].trim().replace(/^table:\s*/i, '');
          i = j;
        } else i--;
        if (!caption) warnings.push(`A table in “${s.heading}” has no caption (add “Table: …”).`);
        blocks.push({
          id: uniqueId(caption || `${s.heading} table`),
          type: 'table',
          caption: normaliseInline(caption),
          headers,
          rows,
        });
        continue;
      }
      // Image on its own line: ![alt](https://… "caption")
      const img = /^!\[([^\]]*)\]\((https?:\/\/[^\s)]+)(?:\s+"([^"]*)")?\)$/.exec(t);
      if (img) {
        flushProse();
        if (!img[1].trim())
          errors.push(`An image in “${s.heading}” needs a description: ![description](url).`);
        blocks.push({
          id: uniqueId(img[1] || `${s.heading} image`),
          type: 'image',
          url: img[2],
          alt: normaliseInline(img[1]) || 'Image',
          caption: normaliseInline(img[3] || ''),
        });
        continue;
      }
      // YouTube on its own line: a bare URL, [Title](url) or @youtube(ID "Title")
      const yt =
        /^@youtube\(\s*([A-Za-z0-9_-]{11})\s*(?:"([^"]*)")?\s*\)$/.exec(t) ||
        (() => {
          const link = /^\[([^\]]+)\]\((\S+)\)$/.exec(t);
          const id = youtubeId(link ? link[2] : /^<?https?:\/\/\S+>?$/.test(t) ? t : '');
          return id ? [t, id, link?.[1]] : null;
        })();
      if (yt) {
        flushProse();
        blocks.push({
          id: uniqueId(`${s.heading} video`),
          type: 'video',
          youtubeId: yt[1],
          title: normaliseInline(yt[2] || s.heading || 'Video'),
        });
        continue;
      }
      // Illustration or interactive on its own line: @interactive(key "Caption")
      const ix = /^@interactive\(\s*([a-z0-9-]+)\s*(?:"([^"]*)")?\s*\)$/.exec(t);
      if (ix) {
        flushProse();
        if (!isInteractiveKey(ix[1])) {
          errors.push(
            `Unknown interactive “${ix[1]}” in “${s.heading}”. Known: ${interactiveKeys.join(', ')}.`,
          );
          continue;
        }
        blocks.push({
          id: uniqueId(`${s.heading} ${ix[1]}`),
          type: 'interactive',
          name: ix[1],
          caption: normaliseInline(ix[2] || ''),
        });
        continue;
      }
      if (/^#{3,}\s/.test(t)) {
        // Sub-headings start a new text block within the section
        flushProse();
        heading = normaliseInline(t.replace(/^#+\s*/, ''));
        continue;
      }
      prose.push(line);
    }
    flushProse();
  }

  // Front matter fields
  const difficulty = (meta.difficulty || 'beginner').toUpperCase();
  if (!['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].includes(difficulty))
    errors.push(
      `Difficulty must be beginner, intermediate or advanced (got “${meta.difficulty}”).`,
    );
  const length = (meta.length || meta.depth || 'short').toLowerCase();
  if (!['short', 'full'].includes(length))
    errors.push(`Length must be short or full (got “${length}”).`);
  const words = [
    description,
    ...objectives,
    ...takeaways,
    ...blocks.map((b) => ('text' in b ? b.text : '')),
  ]
    .join(' ')
    .split(/\s+/).length;
  const readingMinutes =
    Number(meta.readingminutes || meta['reading-minutes'] || meta.minutes) ||
    Math.max(1, Math.round(words / 200));

  if (!title) errors.push('Add a title: a “# Title” line or “title:” in the front matter.');
  if (!meta.category)
    errors.push('Add “category:” to the front matter (a category slug such as electrolytes).');
  if (description.length < 10)
    errors.push(
      'Add a description: “description:” in the front matter, or a paragraph under the title.',
    );
  if (!objectives.length)
    errors.push('Add a “## Learning objectives” section with a bulleted list.');
  if (!takeaways.length) errors.push('Add a “## Key takeaways” section with a bulleted list.');
  if (!blocks.length)
    errors.push('Add at least one content section (“## Heading” followed by text).');

  const lesson: ParsedLesson = {
    title,
    slug: meta.slug || slugify(title),
    categorySlug: (meta.category || '').trim(),
    subtopic: normaliseInline(meta.subtopic || ''),
    difficulty: difficulty as ParsedLesson['difficulty'],
    depth: length === 'full' ? 'FULL' : 'SHORT',
    readingMinutes,
    listAsUpcoming: /^(true|yes|1)$/i.test(meta.upcoming || ''),
    author: meta.author || defaults.author || 'Lab Science Unfiltered',
    description,
    objectives,
    takeaways,
    blocks,
    references,
  };

  // Citation cross-check
  const texts = [
    ...objectives,
    ...takeaways,
    ...blocks.flatMap((b) =>
      b.type === 'text' || b.type === 'callout'
        ? [b.text]
        : b.type === 'table'
          ? [b.caption, ...b.rows.flat()]
          : b.type === 'image' || b.type === 'interactive'
            ? [b.caption]
            : [],
    ),
  ];
  const cited = new Set(texts.flatMap(citedNumbers));
  const missing = [...cited].filter((n) => n < 1 || n > references.length).sort((a, b) => a - b);
  if (missing.length)
    warnings.push(
      `Cited but not in References: ${missing.map((n) => `[${n}]`).join(', ')}. Publishing will be blocked until fixed.`,
    );
  const uncited = references.map((_, i) => i + 1).filter((n) => !cited.has(n));
  if (uncited.length && references.length)
    warnings.push(
      `References never cited in the text: ${uncited.map((n) => `[${n}]`).join(', ')}.`,
    );
  if (!references.length) warnings.push('No references found. Publishing requires at least one.');
  references.forEach((r, i) => {
    if (!r.doi && !r.url && !r.pmid)
      warnings.push(`Reference [${i + 1}] has no DOI, PMID or link.`);
  });

  return { lesson, errors, warnings };
}
