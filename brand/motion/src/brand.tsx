import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';

/** LSU brand tokens for video. Keep in step with the Design System. */
export const colour = {
  ink: '#2b2622',
  charcoal: '#35302b',
  cobalt: '#344fb4',
  tomato: '#d9735c',
  tomatoInk: '#a3442f',
  mustard: '#e6bc5c',
  green: '#3e6a55',
  pink: '#ebbcc3',
  paper: '#fffaf0',
  white: '#ffffff',
} as const;

/** Category colours used on the website, for chapter cards. */
export const tone = {
  cobalt: { bg: colour.cobalt, fg: colour.paper, accent: colour.mustard },
  tomato: { bg: colour.tomato, fg: colour.ink, accent: colour.paper },
  mustard: { bg: colour.mustard, fg: colour.ink, accent: colour.cobalt },
  green: { bg: colour.green, fg: colour.paper, accent: colour.mustard },
  charcoal: { bg: colour.charcoal, fg: colour.paper, accent: colour.mustard },
} as const;
export type Tone = keyof typeof tone;

export const font = {
  sans: '"Bricolage Grotesque", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
};

// Self-hosted OFL fonts (same files as the website), so renders never need the network.
loadFont({
  family: 'Bricolage Grotesque',
  url: staticFile('fonts/bricolage-grotesque-latin.woff2'),
  weight: '200 800',
});
loadFont({
  family: 'JetBrains Mono',
  url: staticFile('fonts/jetbrains-mono-latin.woff2'),
  weight: '400 800',
});

/** Geometry of the Beam mark, in its own 112-unit space. */
export const GLASS = 'M34 22 V86 a10 10 0 0 0 10 10 H68 a10 10 0 0 0 10 -10 V22';
export const LIQUID = 'M38 44 V86 a6 6 0 0 0 6 6 H68 a6 6 0 0 0 6 -6 V44 Z';
/** Approximate length of the glass path, for draw-on animation. */
export const GLASS_LENGTH = 2 * 64 + 24 + Math.PI * 10 + 0;

/** Full-colour mark with tile and offset shadow (static). */
export const Mark: React.FC<{ size: number; shadow?: boolean }> = ({ size, shadow = true }) => (
  <svg width={(size * 134) / 112} height={(size * 120) / 112} viewBox="0 0 134 120">
    <defs>
      <clipPath id="mark-clip">
        <rect x="0" y="0" width="134" height="112" />
      </clipPath>
    </defs>
    {shadow && <rect x="8" y="8" width="112" height="112" rx="30" fill={colour.mustard} />}
    <rect width="112" height="112" rx="30" fill={colour.cobalt} />
    <rect x="-6" y="62" width="140" height="14" rx="7" fill={colour.mustard} clipPath="url(#mark-clip)" />
    <path d={LIQUID} fill={colour.pink} />
    <path
      d={GLASS}
      fill="none"
      stroke={colour.paper}
      strokeWidth="9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="38" y="62" width="36" height="14" fill={colour.mustard} />
  </svg>
);

/** The wordmark's full stop. */
export const Dot: React.FC<{ size: number; colour: string }> = ({ size, colour: c }) => (
  <span
    style={{
      display: 'inline-block',
      width: size * 0.21,
      height: size * 0.21,
      borderRadius: '50%',
      background: c,
      marginLeft: size * 0.03,
    }}
  />
);
