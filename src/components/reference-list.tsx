import { referenceSchema, type Reference } from '@/lib/validation';

/** Parses stored references (current or legacy shape); drops anything invalid. */
export function toReferences(raw: unknown): Reference[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((r) => {
    const parsed = referenceSchema.safeParse(r);
    return parsed.success ? [parsed.data] : [];
  });
}

/** Vancouver-style numbered list. Items get #ref-N anchors for in-text citations. */
export function ReferenceList({
  references,
  anchors = true,
}: {
  references: Reference[];
  anchors?: boolean;
}) {
  return (
    <ol className="reference-list">
      {references.map((r, i) => (
        <li key={i} id={anchors ? `ref-${i + 1}` : undefined}>
          <span>{r.citation}</span>
          {r.doi && (
            <>
              {' '}
              doi:{' '}
              <a href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer">
                {r.doi}
              </a>
            </>
          )}
          {r.pmid && (
            <>
              {' '}
              PMID:{' '}
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/`}
                target="_blank"
                rel="noreferrer"
              >
                {r.pmid}
              </a>
            </>
          )}
          {r.url && (
            <>
              {' '}
              Available from:{' '}
              <a href={r.url} target="_blank" rel="noreferrer" className="reference-url">
                {r.url}
              </a>
            </>
          )}
        </li>
      ))}
    </ol>
  );
}
