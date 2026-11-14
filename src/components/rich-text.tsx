import { Fragment, type ReactNode } from 'react';

/*
 * A deliberately small, safe text format for lesson content. It produces React
 * elements only (never raw HTML), so authored text cannot inject markup.
 *
 * Blocks (one per line):
 *   - item / * item      bulleted list
 *   1. item              numbered list
 *   any other line       paragraph
 *
 * Inline:
 *   **bold**   *italic*   H~2~O (subscript)   Na^+^ (superscript)
 *   [1]  [1,3]  [2–4]    numbered citations linking to the reference list
 *   [text](https://…)    external link
 */

const inlinePattern = new RegExp(
  [
    String.raw`\*\*(?<bold>.+?)\*\*`,
    String.raw`\*(?<italic>[^*\s](?:[^*]*[^*\s])?)\*`,
    String.raw`~(?<sub>[^~\s]+)~`,
    String.raw`\^(?<sup>[^^\s]+)\^`,
    String.raw`\[(?<linkText>[^\]]+)\]\((?<href>https?:\/\/[^\s)]+)\)`,
    String.raw`\[(?<cite>\d{1,3}(?:\s*[,–-]\s*\d{1,3})*)\](?!\()`,
  ].join('|'),
  'g',
);

function Citation({ spec }: { spec: string }) {
  // Keep the author's separators but link every number to its reference.
  const parts = spec.split(/(\d+)/).filter(Boolean);
  return (
    <span className="citation">
      [
      {parts.map((p, i) =>
        /^\d+$/.test(p) ? (
          <a key={i} href={`#ref-${p}`} aria-label={`Reference ${p}`}>
            {p}
          </a>
        ) : (
          <Fragment key={i}>{p.replace(/\s+/g, '')}</Fragment>
        ),
      )}
      ]
    </span>
  );
}

export function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(inlinePattern)) {
    const g = m.groups!;
    if (m.index! > last) out.push(text.slice(last, m.index));
    if (g.bold !== undefined) out.push(<strong key={key++}>{renderInline(g.bold)}</strong>);
    else if (g.italic !== undefined) out.push(<em key={key++}>{renderInline(g.italic)}</em>);
    else if (g.sub !== undefined) out.push(<sub key={key++}>{g.sub}</sub>);
    else if (g.sup !== undefined) out.push(<sup key={key++}>{g.sup}</sup>);
    else if (g.href !== undefined)
      out.push(
        <a key={key++} href={g.href} target="_blank" rel="noreferrer">
          {renderInline(g.linkText)}
        </a>,
      );
    else if (g.cite !== undefined) out.push(<Citation key={key++} spec={g.cite} />);
    last = m.index! + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Chunk = { kind: 'p'; text: string } | { kind: 'ul' | 'ol'; items: string[] };

export function parseBlocks(text: string): Chunk[] {
  const chunks: Chunk[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+[.)]\s+(.*)$/.exec(line);
    const kind = bullet ? 'ul' : numbered ? 'ol' : 'p';
    const content = (bullet || numbered)?.[1] ?? line;
    const prev = chunks.at(-1);
    if (kind !== 'p' && prev?.kind === kind) prev.items.push(content);
    else if (kind === 'p') chunks.push({ kind, text: content });
    else chunks.push({ kind, items: [content] });
  }
  return chunks;
}

/** Multi-paragraph rich text. */
export function RichText({ text }: { text: string }) {
  return (
    <>
      {parseBlocks(text).map((c, i) =>
        c.kind === 'p' ? (
          <p key={i}>{renderInline(c.text)}</p>
        ) : c.kind === 'ul' ? (
          <ul key={i}>
            {c.items.map((item, j) => (
              <li key={j}>{renderInline(item)}</li>
            ))}
          </ul>
        ) : (
          <ol key={i}>
            {c.items.map((item, j) => (
              <li key={j}>{renderInline(item)}</li>
            ))}
          </ol>
        ),
      )}
    </>
  );
}

/** Single-line rich text (list items, table cells, captions). */
export function InlineText({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}
