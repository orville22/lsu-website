/*
 * Small drawing kit shared by the lesson illustrations.
 *
 * Every diagram is drawn twice from the same pieces: a wide layout for tablets
 * and desktops and a narrow, taller layout for phones. CSS shows one of them
 * (see .ix-wide / .ix-narrow in interactives.css), so text never shrinks below
 * a readable size and no JavaScript is needed to choose. Titles, keys and
 * explanations sit in HTML around the SVG so they wrap naturally.
 */
import type { CSSProperties, ReactNode } from 'react';

export const C = {
  ink: 'var(--ix-ink)',
  muted: 'var(--ix-muted)',
  edge: 'var(--ix-edge)',
  outline: 'var(--ix-outline)',
  arrow: 'var(--ix-arrow)',
  drop: 'var(--ix-drop)',
  node: 'var(--ix-node)',
  accent: 'var(--ix-accent)',
  onAccent: 'var(--ix-on-accent)',
  accentBg: 'var(--ix-accent-bg)',
  questionBg: 'var(--ix-question-bg)',
  water: 'var(--ix-water)',
  sodium: 'var(--ix-sodium)',
  potassium: 'var(--ix-potassium)',
  warn: 'var(--ix-warn)',
  warnBg: 'var(--ix-warn-bg)',
  highlight: 'var(--ix-highlight)',
} as const;

export const TITLE = 13.5;
export const BODY = 12;
const LINE = 15;

export type Tone = 'plain' | 'accent' | 'question' | 'dashed' | 'warn';
/** Colour family: water system (cobalt), sodium system (tomato), signals (mustard), heart (pink), green. */
export type Hue = 'water' | 'sodium' | 'mustard' | 'pink' | 'green';
export type IconName =
  | 'drop'
  | 'salt'
  | 'brain'
  | 'heart'
  | 'kidney'
  | 'vessel'
  | 'gauge'
  | 'bolt'
  | 'gland'
  | 'hormone'
  | 'tube'
  | 'flask'
  | 'question';

export type NodeSpec = {
  /** Centre x and centre y. */
  x: number;
  y: number;
  w: number;
  h?: number;
  title: string;
  body?: string | string[];
  tone?: Tone;
  hue?: Hue;
  icon?: IconName;
};

/** Height a node needs for its text, if not given. */
export function nodeHeight(n: Pick<NodeSpec, 'body' | 'h'>) {
  if (n.h) return n.h;
  const lines = n.body ? (Array.isArray(n.body) ? n.body.length : 1) : 0;
  return 30 + lines * LINE;
}

const HUE_TINT: Record<Hue, string> = {
  water: 'var(--ix-tint-water)',
  sodium: 'var(--ix-tint-sodium)',
  mustard: 'var(--ix-tint-mustard)',
  pink: 'var(--ix-tint-pink)',
  green: 'var(--ix-tint-green)',
};
const HUE_SOLID: Record<Hue, string> = {
  water: 'var(--ix-solid-water)',
  sodium: 'var(--ix-solid-sodium)',
  mustard: 'var(--ix-solid-mustard)',
  pink: 'var(--ix-solid-pink)',
  green: 'var(--ix-solid-green)',
};
// Brand rule: white on cobalt and green, brown-black on tomato, mustard and pink.
const HUE_ON: Record<Hue, string> = {
  water: '#fff',
  sodium: 'var(--brand-ink)',
  mustard: 'var(--brand-ink)',
  pink: 'var(--brand-ink)',
  green: '#fff',
};

/** Icon glyphs drawn on a 24 × 24 grid, stroked. */
const GLYPHS: Record<IconName, ReactNode> = {
  drop: <path d="M12 3.5C9.5 7.5 6.5 10.5 6.5 14.2a5.5 5.5 0 0 0 11 0c0-3.7-3-6.7-5.5-10.7Z" />,
  salt: (
    <>
      <path d="M12 4.5 18.5 8v8L12 19.5 5.5 16V8Z" />
      <path d="M5.5 8 12 11.5 18.5 8M12 11.5v8" />
    </>
  ),
  brain: (
    <>
      <path d="M11.2 5.5a3 3 0 0 0-5 1.6 3 3 0 0 0-1.4 5.2 3 3 0 0 0 2.4 4.9 2.8 2.8 0 0 0 4 1.1Z" />
      <path d="M12.8 5.5a3 3 0 0 1 5 1.6 3 3 0 0 1 1.4 5.2 3 3 0 0 1-2.4 4.9 2.8 2.8 0 0 1-4 1.1Z" />
    </>
  ),
  heart: (
    <path d="M12 19.5s-7-4.3-7-9.6a3.9 3.9 0 0 1 7-2.4 3.9 3.9 0 0 1 7 2.4c0 5.3-7 9.6-7 9.6Z" />
  ),
  kidney: (
    <>
      <path d="M10.5 3.5C6.3 3.5 4 7.3 4 12s2.3 8.5 6.5 8.5c2.8 0 4.3-1.7 4.3-3.6 0-1.8-1.9-2.8-1.9-4.9s1.9-3.1 1.9-4.9c0-1.9-1.5-3.6-4.3-3.6Z" />
      <path d="M13.6 12h2.9l2.5 3.5" />
    </>
  ),
  vessel: (
    <>
      <path d="M3.5 8.5h17M3.5 15.5h17" />
      <path d="M8 12h7m-2.5-2.5L15 12l-2.5 2.5" />
    </>
  ),
  gauge: (
    <>
      <path d="M4.5 16.5a7.5 7.5 0 1 1 15 0" />
      <path d="M12 16.5 15.5 11" />
      <circle cx="12" cy="16.5" r="1.2" />
    </>
  ),
  bolt: <path d="M13.5 3.5 6.5 13.5h5l-1.5 7 7.5-10.5h-5Z" />,
  gland: <path d="M12 5c-4 2.7-7 6.6-7 11.5h14C19 11.6 16 7.7 12 5Z" />,
  hormone: (
    <>
      <circle cx="7" cy="14.5" r="2.6" />
      <circle cx="16.5" cy="8" r="2.6" />
      <circle cx="17" cy="17" r="2.6" />
      <path d="M9.2 13 14.3 9.4M9.6 15.2l4.8 1.3" />
    </>
  ),
  tube: (
    <>
      <path d="M9 3.5h6M10 3.5v13a2 2 0 0 0 4 0v-13" />
      <path d="M10 11h4" />
    </>
  ),
  flask: (
    <>
      <path d="M9.5 3.5h5M10.5 3.5v5.5L5.8 17.2a2 2 0 0 0 1.8 3h8.8a2 2 0 0 0 1.8-3L13.5 9V3.5" />
      <path d="M7.7 14.5h8.6" />
    </>
  ),
  question: (
    <>
      <path d="M9.3 9.2a2.8 2.8 0 1 1 3.9 2.6c-.8.4-1.2 1-1.2 1.8v.9" />
      <circle cx="12" cy="17.6" r=".6" />
    </>
  ),
};

/** A round "sticker" badge holding an icon, with a hard offset shadow. */
export function Badge({
  x,
  y,
  icon,
  hue = 'water',
  r = 14,
}: {
  x: number;
  y: number;
  icon: IconName;
  hue?: Hue;
  r?: number;
}) {
  const k = (r * 2 * 0.8) / 24;
  return (
    <g>
      <circle cx={x} cy={y + 2.5} r={r} fill={C.drop} />
      <circle cx={x} cy={y} r={r} fill={HUE_SOLID[hue]} stroke={C.outline} strokeWidth={1.5} />
      <g
        transform={`translate(${x - 12 * k} ${y - 12 * k}) scale(${k})`}
        fill="none"
        stroke={HUE_ON[hue]}
        strokeWidth={1.7 / k}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {GLYPHS[icon]}
      </g>
    </g>
  );
}

export function Node(n: NodeSpec) {
  const h = nodeHeight(n);
  const lines = n.body ? (Array.isArray(n.body) ? n.body : [n.body]) : [];
  const tone = n.tone ?? 'plain';
  const fill =
    tone === 'accent'
      ? C.accent
      : tone === 'warn'
        ? C.warn
        : tone === 'question'
          ? C.questionBg
          : n.hue
            ? HUE_TINT[n.hue]
            : C.node;
  const titleFill = tone === 'accent' ? C.onAccent : C.ink;
  const bodyFill = tone === 'accent' ? C.onAccent : C.muted;
  const textBlock = 17 + lines.length * LINE;
  const top = n.y - textBlock / 2;
  const x0 = n.x - n.w / 2;
  const y0 = n.y - h / 2;
  return (
    <g>
      {tone !== 'dashed' && <rect x={x0} y={y0 + 4} width={n.w} height={h} rx={12} fill={C.drop} />}
      <rect
        x={x0}
        y={y0}
        width={n.w}
        height={h}
        rx={12}
        fill={tone === 'dashed' ? 'none' : fill}
        stroke={tone === 'dashed' ? C.arrow : C.outline}
        strokeWidth={1.5}
        strokeDasharray={tone === 'dashed' ? '5 4' : undefined}
      />
      <text
        x={n.x}
        y={top + 13}
        textAnchor="middle"
        fontSize={TITLE}
        fontWeight={600}
        fill={titleFill}
      >
        {n.title}
      </text>
      {lines.map((l, i) => (
        <text
          key={i}
          x={n.x}
          y={top + 13 + (i + 1) * LINE + 1}
          textAnchor="middle"
          fontSize={BODY}
          fill={bodyFill}
          opacity={tone === 'accent' ? 0.88 : 1}
        >
          {l}
        </text>
      ))}
      {n.icon &&
        (n.w >= 220 ? (
          <Badge
            x={x0 + 6}
            y={y0 + 3}
            icon={n.icon}
            hue={tone === 'accent' ? 'mustard' : (n.hue ?? 'water')}
            r={15}
          />
        ) : (
          // Narrow boxes: a smaller sticker on the corner, clear of the title.
          <Badge
            x={x0 + 1}
            y={y0 - 4}
            icon={n.icon}
            hue={tone === 'accent' ? 'mustard' : (n.hue ?? 'water')}
            r={12}
          />
        ))}
    </g>
  );
}

/** An ion or particle: a flat ball with an outline, a highlight and a soft drop. */
export function Ion({ x, y, fill, r = 7 }: { x: number; y: number; fill: string; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y + 2} r={r} fill={C.drop} />
      <circle cx={x} cy={y} r={r} fill={fill} stroke={C.outline} strokeWidth={1.2} />
      <path
        d={`M${x - r * 0.45} ${y - r * 0.15}a${r * 0.5} ${r * 0.5} 0 0 1 ${r * 0.4} -${r * 0.35}`}
        stroke={C.highlight}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}

/** Edges of a node, for drawing arrows between them. */
export const edges = (n: NodeSpec) => {
  const h = nodeHeight(n);
  return {
    top: n.y - h / 2,
    bottom: n.y + h / 2,
    left: n.x - n.w / 2,
    right: n.x + n.w / 2,
  };
};

export function Arrow({
  d,
  id,
  accent,
  dashed,
}: {
  d: string;
  /** Marker id prefix of the SVG this arrow sits in. */
  id: string;
  accent?: boolean;
  dashed?: boolean;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={accent ? C.accent : C.arrow}
      strokeWidth={accent ? 2.5 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashed ? '5 4' : undefined}
      markerEnd={`url(#${id}-${accent ? 'accent' : 'arrow'})`}
    />
  );
}

/** Edge label, e.g. "yes" / "no". */
export function Label({
  x,
  y,
  children,
  anchor = 'middle',
  strong,
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: 'start' | 'middle' | 'end';
  strong?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={BODY}
      fontWeight={strong ? 600 : 400}
      fill={strong ? C.ink : C.muted}
    >
      {children}
    </text>
  );
}

function Markers({ id }: { id: string }) {
  return (
    <defs>
      {(['arrow', 'accent'] as const).map((k) => (
        <marker
          key={k}
          id={`${id}-${k}`}
          viewBox="0 0 10 10"
          refX={8}
          refY={5}
          markerWidth={4.2}
          markerHeight={4.2}
          orient="auto-start-reverse"
        >
          <path
            d="M1 1L9 5L1 9Q2.6 5 1 1z"
            fill={k === 'accent' ? C.accent : C.arrow}
            stroke={k === 'accent' ? C.accent : C.arrow}
            strokeWidth={1}
            strokeLinejoin="round"
          />
        </marker>
      ))}
    </defs>
  );
}

export type Layout = { w: number; h: number; draw: (id: string) => ReactNode };

/** Two SVGs, one per layout; CSS shows the one that fits. */
export function Responsive({
  name,
  label,
  wide,
  narrow,
}: {
  /** Unique per diagram; used for marker ids. */
  name: string;
  label: string;
  wide: Layout;
  narrow: Layout;
}) {
  return (
    <>
      {(
        [
          ['wide', wide],
          ['narrow', narrow],
        ] as const
      ).map(([kind, l]) => {
        const id = `ix-${name}-${kind}`;
        return (
          <svg
            key={kind}
            className={`ix-svg ix-${kind}`}
            viewBox={`0 0 ${l.w} ${l.h}`}
            role="img"
            aria-label={label}
          >
            <Markers id={id} />
            {l.draw(id)}
          </svg>
        );
      })}
    </>
  );
}

/** Frame shared by every illustration: title, optional key, the drawing, a note. */
export function Frame({
  title,
  keyText,
  note,
  children,
  wide,
}: {
  title: string;
  keyText?: ReactNode;
  note?: ReactNode;
  children: ReactNode;
  /** Let the frame use the full width of the lesson column. */
  wide?: boolean;
}) {
  return (
    <div className={`ix${wide ? ' ix-full' : ''}`}>
      <p className="ix-title">{title}</p>
      {keyText && <p className="ix-key">{keyText}</p>}
      {children}
      {note && <p className="ix-note">{note}</p>}
    </div>
  );
}

/* ---------- Richer elements (organic cells, water drops) ---------- */

/** A smooth, slightly irregular closed outline around (cx, cy). Same seed, same shape. */
export function blobPath(cx: number, cy: number, r: number, seed = 1, wobble = 0.05) {
  const n = 12;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + wobble * Math.sin(3 * a + seed) + wobble * 0.6 * Math.cos(5 * a + seed * 2);
    return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k];
  });
  const p = (i: number) => pts[((i % n) + n) % n];
  let d = `M${p(0)[0].toFixed(1)} ${p(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = p(i - 1);
    const [x1, y1] = p(i);
    const [x2, y2] = p(i + 1);
    const [x3, y3] = p(i + 2);
    const c1 = [x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6];
    const c2 = [x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return `${d}Z`;
}

/**
 * A cell: organic outline, a two-line membrane (the lipid bilayer, suggested),
 * a tinted cytoplasm and a nucleus. `scale` swells or shrinks it about its centre
 * with a smooth transition; `swell` instead loops a slow swell (CSS animation).
 */
export function CellBlob({
  cx,
  cy,
  r,
  seed = 1,
  scale = 1,
  swell,
  fill = 'var(--ix-tint-green)',
  nucleus = true,
  slow,
  children,
}: {
  cx: number;
  cy: number;
  r: number;
  seed?: number;
  scale?: number;
  /** Loop a slow change to this scale and back. */
  swell?: number;
  fill?: string;
  nucleus?: boolean;
  /** Use a slow transition when `scale` changes. */
  slow?: boolean;
  children?: ReactNode;
}) {
  const outer = blobPath(cx, cy, r, seed);
  const inner = blobPath(cx, cy, r - 4, seed);
  const style = {
    transformOrigin: `${cx}px ${cy}px`,
    transformBox: 'view-box',
    ...(swell ? { '--s': swell } : { transform: `scale(${scale})` }),
  } as CSSProperties;
  return (
    <g className={swell ? 'ix-swell' : slow ? 'ix-anim-slow' : 'ix-anim'} style={style}>
      <path d={outer} transform="translate(0 4)" fill={C.drop} />
      <path d={outer} fill={fill} stroke={C.outline} strokeWidth={2.5} />
      <path d={inner} fill="none" stroke={C.outline} strokeOpacity={0.35} strokeWidth={1.2} />
      <path
        d={`M${cx - r * 0.62} ${cy - r * 0.3}a${r * 0.7} ${r * 0.7} 0 0 1 ${r * 0.42} -${r * 0.42}`}
        stroke={C.highlight}
        strokeWidth={3.5}
        strokeLinecap="round"
        fill="none"
      />
      {nucleus && (
        <path
          d={blobPath(cx + r * 0.18, cy + r * 0.12, r * 0.28, seed + 3, 0.08)}
          fill="var(--ix-solid-green)"
          fillOpacity={0.35}
          stroke={C.outline}
          strokeOpacity={0.6}
          strokeWidth={1.2}
        />
      )}
      {children}
    </g>
  );
}

/** A water drop with an outline and a highlight. */
export function Droplet({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path
        d="M0 -8C-3 -3.5 -6 -1 -6 2.5a6 6 0 0 0 12 0C6 -1 3 -3.5 0 -8Z"
        fill={C.water}
        stroke={C.outline}
        strokeWidth={1.2}
      />
      <path
        d="M-2.6 1.5a3 3 0 0 0 1.4 2.6"
        stroke={C.highlight}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
      />
    </g>
  );
}
