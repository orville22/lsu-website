'use client';
/*
 * C1.1 visual (Orville's comment, 19 Nov 2026): where ADH's water recovery happens,
 * drawn as a nephron. Filtrate runs down the loop of Henle and back up; the
 * descending limb lets water out, the thick ascending limb pumps salt out
 * without water, so the medulla gets saltier with depth (about 300 to about
 * 1,200 mmol/kg). The collecting duct then runs down through that salty tissue:
 * with ADH, aquaporin-2 lets water leave and the urine concentrates; without
 * ADH it stays dilute. A dashed box marks the patch of duct wall that the
 * close-up visual (c1-1-adh-water) zooms into.
 */
import { useState, type CSSProperties } from 'react';
import { Arrow, C, Droplet, Frame, Ion, Responsive, type Layout } from '../kit';
import { LoopBar, useLoop } from '../loop';

type Mode = 'high' | 'low';

const PHASES = ['Filtrate flows', 'Salt pumped out', 'Medulla gets saltier', 'ADH', 'Urine leaves'];
const DURATIONS = [2600, 2800, 2600, 2400, 4800];

const TEXT: Record<Mode, string[]> = {
  high: [
    'Filtrate from the glomerulus flows down the loop of Henle into the medulla, turns at the hairpin and climbs back up to the cortex.',
    'On the way down, water leaves the descending limb. On the way up, the thick ascending limb pumps salt out into the tissue, but it does not let water follow.',
    'Repeated along the loop, this leaves the medulla saltier with depth: about 300 mmol/kg near the cortex to about 1,200 mmol/kg at the tip.',
    'ADH is high. In the collecting duct it puts aquaporin-2 water channels into the cell membrane (the close-up below shows how).',
    'The collecting duct runs down through the salty medulla, so water leaves through the open channels and the urine concentrates, up to about 1,200 mmol/kg.',
  ],
  low: [
    'Filtrate from the glomerulus flows down the loop of Henle into the medulla, turns at the hairpin and climbs back up to the cortex.',
    'On the way down, water leaves the descending limb. On the way up, the thick ascending limb pumps salt out into the tissue, but it does not let water follow.',
    'Repeated along the loop, this leaves the medulla saltier with depth: about 300 mmol/kg near the cortex to about 1,200 mmol/kg at the tip.',
    'ADH is low. The aquaporin-2 channels stay inside the duct cells, so the duct wall stays closed to water.',
    'The urine passes through the salty medulla without giving up its water, and leaves dilute: the kidney clears free water.',
  ],
};

const flow = (dx: number, dy: number, delay: number, dur = 2.4) =>
  ({
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
    '--delay': `${delay}s`,
    '--dur': `${dur}s`,
  }) as CSSProperties;

/* Geometry, shared by both layouts (the drawing is 440 × 450). */
const CORTEX = { y: 36, h: 96 };
const MED = { y: 132, h: 286 };
const LOOP =
  'M106 84 C128 60 146 104 166 84 C182 68 200 92 200 118 L200 370 C200 404 252 404 252 370 L252 128 C252 102 272 90 292 98 C312 106 320 84 346 88 L360 88';
const DUCT = 'M360 74 L360 430';
const DEPTHS = [
  { y: MED.y + 42, v: '300' },
  { y: MED.y + 120, v: '600' },
  { y: MED.y + 200, v: '900' },
  { y: MED.y + 276, v: '1,200' },
];

function Tube({ d, w = 12, thick = false }: { d: string; w?: number; thick?: boolean }) {
  return (
    <g>
      <path
        d={d}
        fill="none"
        stroke={C.outline}
        strokeWidth={w + 4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={d}
        fill="none"
        stroke={thick ? 'var(--ix-tint-mustard)' : 'var(--ix-tint-water)'}
        strokeWidth={w}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function Badge({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={10} fill={C.accent} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.onAccent}>
        {n}
      </text>
    </g>
  );
}

function Nephron({
  id,
  p,
  mode,
  reduced,
}: {
  id: string;
  p: number;
  mode: Mode;
  reduced: boolean;
}) {
  const gid = `${id}-med`;
  const pumping = p >= 1;
  const graded = p >= 2;
  const open = mode === 'high' && p >= 3;
  const leaving = mode === 'high' && p >= 4;
  const urineOut = p >= 4;
  return (
    <g>
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--ix-solid-sodium)" stopOpacity={0.05} />
          <stop offset="1" stopColor="var(--ix-solid-sodium)" stopOpacity={0.5} />
        </linearGradient>
        <path id={`${id}-loop`} d={LOOP} />
        <path id={`${id}-duct`} d={DUCT} />
      </defs>

      {/* Kidney regions */}
      <rect x={20} y={CORTEX.y + 4} width={400} height={CORTEX.h + MED.h} rx={18} fill={C.drop} />
      <rect x={20} y={CORTEX.y} width={400} height={CORTEX.h} rx={18} fill="var(--ix-tint-pink)" />
      <rect x={20} y={MED.y} width={400} height={MED.h} fill="var(--ix-node)" />
      <rect
        x={20}
        y={MED.y}
        width={400}
        height={MED.h}
        fill={`url(#${gid})`}
        style={{ opacity: graded ? 1 : 0.15, transition: 'opacity 1.2s ease' }}
      />
      <rect
        x={20}
        y={CORTEX.y}
        width={400}
        height={CORTEX.h + MED.h}
        rx={18}
        fill="none"
        stroke={C.outline}
        strokeWidth={1.6}
      />
      <text x={32} y={CORTEX.y + 22} fontSize={12} fontWeight={700} fill={C.ink}>
        Cortex
      </text>
      <text x={32} y={MED.y + 22} fontSize={12} fontWeight={700} fill={C.ink}>
        Medulla
      </text>
      <g style={{ opacity: graded ? 1 : 0, transition: 'opacity 1.2s ease' }}>
        {DEPTHS.map((d, i) => (
          <text key={d.v} x={32} y={d.y} fontSize={11} fontWeight={700} fill={C.ink}>
            {d.v}
            {i === 0 ? ' mmol/kg' : ''}
          </text>
        ))}
      </g>

      {/* Glomerulus */}
      <circle cx={84} cy={84} r={25} fill="none" stroke={C.outline} strokeWidth={2} />
      <circle
        cx={84}
        cy={84}
        r={17}
        fill="var(--ix-tint-pink)"
        stroke="var(--ix-solid-pink)"
        strokeWidth={1.6}
      />
      <path
        d="M73 80c4-6 8 6 12 0s8 6 10 0M73 89c4-6 8 6 12 0s8 6 10 0"
        fill="none"
        stroke="var(--ix-solid-pink)"
        strokeWidth={1.4}
      />
      <text x={84} y={126} textAnchor="middle" fontSize={10} fontWeight={600} fill={C.muted}>
        glomerulus
      </text>

      {/* Tubule and loop, then the collecting duct */}
      <Tube d={LOOP} />
      <Tube d="M252 330 L252 150" w={16} thick />
      <Tube d={DUCT} w={18} />

      {/* Flowing filtrate */}
      {!reduced &&
        [0, 1.5, 3, 4.5].map((b) => (
          <circle key={`f${b}`} r={3.6} fill="var(--ix-solid-water)">
            <animateMotion dur="6s" begin={`-${b}s`} repeatCount="indefinite">
              <mpath href={`#${id}-loop`} />
            </animateMotion>
          </circle>
        ))}
      {!reduced &&
        [0, 1.4, 2.8].map((b) => (
          <circle
            key={`d${b}`}
            r={4}
            fill={urineOut && mode === 'high' ? 'var(--ix-solid-mustard)' : 'var(--ix-solid-water)'}
          >
            <animateMotion dur="4.2s" begin={`-${b}s`} repeatCount="indefinite">
              <mpath href={`#${id}-duct`} />
            </animateMotion>
          </circle>
        ))}

      {/* Descending limb: water out; thick ascending limb: salt out */}
      {pumping && (
        <g>
          {[190, 255, 320].map((y, i) => (
            <g key={`w${y}`} className="ix-flow" style={flow(-34, 0, i * 0.6)}>
              <Droplet x={188} y={y} s={0.8} />
            </g>
          ))}
          {[170, 230, 290].map((y, i) => (
            <g key={`s${y}`} className="ix-flow" style={flow(40, 0, i * 0.6 + 0.3)}>
              <Ion x={266} y={y} fill="var(--ix-solid-sodium)" r={5} />
            </g>
          ))}
        </g>
      )}

      {/* Collecting duct: ADH, channels, water leaving */}
      {open && (
        <g>
          {[178, 236, 294, 352].map((y) => (
            <rect
              key={`q${y}`}
              x={367}
              y={y}
              width={6}
              height={14}
              rx={2}
              fill="var(--ix-solid-water)"
            />
          ))}
          <rect x={382} y={146} width={34} height={20} rx={10} fill={C.accent} />
          <text
            x={399}
            y={160}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            fill={C.onAccent}
          >
            ADH
          </text>
        </g>
      )}
      {leaving &&
        [190, 250, 310, 368].map((y, i) => (
          <g key={`o${y}`} className="ix-flow" style={flow(30, 0, i * 0.5)}>
            <Droplet x={374} y={y} s={0.8} />
          </g>
        ))}

      {/* Where the close-up zooms in */}
      <rect
        x={344}
        y={268}
        width={32}
        height={46}
        rx={6}
        fill="none"
        stroke={C.ink}
        strokeWidth={1.4}
        strokeDasharray="4 3"
      />
      <text x={340} y={330} textAnchor="end" fontSize={10} fontWeight={600} fill={C.muted}>
        close-up below
      </text>

      {/* Urine out */}
      <Arrow d="M360 432 L360 448" id={id} />
      <text
        x={350}
        y={446}
        textAnchor="end"
        fontSize={11}
        fontWeight={700}
        fill={C.ink}
        style={{ opacity: urineOut ? 1 : 0, transition: 'opacity .6s' }}
      >
        {mode === 'high' ? 'urine: concentrated' : 'urine: dilute'}
      </text>

      {/* Numbered callouts, matching the key */}
      <Badge x={140} y={100} n={1} />
      <Badge x={170} y={230} n={2} />
      <Badge x={284} y={140} n={3} />
      <Badge x={336} y={200} n={4} />
    </g>
  );
}

export function NephronAdh() {
  const [mode, setMode] = useState<Mode>('high');
  const loop = useLoop(DURATIONS, mode);
  const p = loop.phase;
  const labels = PHASES.map((l, i) =>
    i === 3 ? (mode === 'high' ? 'ADH opens channels' : 'No ADH') : l,
  );
  const layout: Layout = {
    w: 440,
    h: 456,
    draw: (id) => <Nephron id={id} p={p} mode={mode} reduced={loop.reduced} />,
  };
  return (
    <Frame
      title="The loop of Henle makes the medulla salty, and ADH lets the collecting duct use it"
      keyText="One nephron, from the glomerulus in the cortex, down the loop of Henle into the medulla and back, then into the collecting duct. Shading shows how salty the tissue is."
      note="Teaching model, not to scale: a real kidney has about a million nephrons. It plays on a loop; pause it or tap a stage to hold it."
      wide
    >
      <div className="ix-choices" role="group" aria-label="ADH level">
        {(
          [
            ['high', 'ADH high'],
            ['low', 'ADH low'],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            type="button"
            className="ix-choice"
            aria-pressed={mode === k}
            onClick={() => setMode(k)}
          >
            {l}
          </button>
        ))}
      </div>
      <LoopBar labels={labels} {...loop} />
      <div className="ix-row ix-row-big">
        <Responsive
          name="c1-1-nephron-adh"
          label="A nephron: the loop of Henle and collecting duct in the cortex and medulla"
          wide={layout}
          narrow={layout}
        />
        <div className="ix-row-side">
          <div className="ix-readout" aria-live="polite">
            <p>
              <strong>{labels[p]}</strong>
            </p>
            <p className="ix-sub">{TEXT[mode][p]}</p>
          </div>
          <ol className="ix-legend ix-callouts">
            <li>
              <b>1</b> Glomerulus and proximal tubule: filtrate enters
            </li>
            <li>
              <b>2</b> Descending limb: water leaves
            </li>
            <li>
              <b>3</b> Thick ascending limb: salt pumped out, water can't follow
            </li>
            <li>
              <b>4</b> Collecting duct: with ADH, water leaves and urine concentrates
            </li>
          </ol>
        </div>
      </div>
    </Frame>
  );
}
