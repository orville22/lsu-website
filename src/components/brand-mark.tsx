/**
 * The LSU "Beam" mark: a cuvette with a light beam passing straight through it
 * and out of the tile. Brand colours are fixed in both themes (see the brand kit).
 */
export function BrandMark({ size = 44, shadow = true }: { size?: number; shadow?: boolean }) {
  return (
    <svg
      className="brand-logo-mark"
      width={(size * 134) / 120}
      height={size}
      viewBox="0 0 134 120"
      aria-hidden="true"
      focusable="false"
    >
      {shadow && <rect x="8" y="8" width="112" height="112" rx="30" fill="#e6bc5c" />}
      <rect width="112" height="112" rx="30" fill="#344fb4" />
      {/* the beam leaves the tile on the right */}
      <path d="M0 62 H127 a7 7 0 0 1 0 14 H0 Z" fill="#e6bc5c" />
      <path d="M38 44 V86 a6 6 0 0 0 6 6 H68 a6 6 0 0 0 6 -6 V44 Z" fill="#ebbcc3" />
      <path
        d="M34 22 V86 a10 10 0 0 0 10 10 H68 a10 10 0 0 0 10 -10 V22"
        fill="none"
        stroke="#fffaf0"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="38" y="62" width="36" height="14" fill="#e6bc5c" />
    </svg>
  );
}
