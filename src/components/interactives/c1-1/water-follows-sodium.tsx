'use client';
/*
 * C1.1 new visual (learner review #2): water follows sodium.
 * The extracellular fluid is drawn as a pool around a few cells, fed by the
 * kidney (sodium) and by drinking and the kidney keeping water. Plays on a loop:
 * aldosterone keeps sodium → the fluid becomes saltier → osmoreceptors switch on
 * ADH and thirst → water arrives, the pool grows and the concentration returns.
 * Toy numbers: ECF 18 L at 140 mmol/L; 72 mmol of sodium kept, then 0.5 L water.
 */
import type { CSSProperties } from 'react';
import {
  Arrow,
  C,
  CellBlob,
  Droplet,
  Frame,
  Ion,
  Node,
  Responsive,
  type Layout,
  type NodeSpec,
} from '../kit';
import { LoopBar, useLoop } from '../loop';

const PHASES = ['Baseline', 'Sodium retained', 'ADH and thirst', 'Water follows'];
const DURATIONS = [2400, 2800, 2600, 4600];

export const STATES = [
  { na: 2520, litres: 18 },
  { na: 2592, litres: 18 },
  { na: 2592, litres: 18 },
  { na: 2592, litres: 18.5 },
];
export const conc = (i: number) => Math.round(STATES[i].na / STATES[i].litres);

const TEXT = [
  'Baseline extracellular fluid (ECF), the fluid around the cells: sodium 140 mmol/L.',
  'Aldosterone increases renal sodium reabsorption. The same volume of water now holds more sodium, so the sodium concentration and osmolality rise slightly.',
  'The osmoreceptors sense the higher osmolality. ADH rises and so does thirst.',
  'The kidney retains water and intake increases. The ECF expands until the sodium concentration returns to baseline: the retained sodium adds volume, not concentration.',
];

/** A smooth organic outline with separate x and y radii. */
function pool(cx: number, cy: number, rx: number, ry: number) {
  const n = 10;
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + 0.06 * Math.sin(3 * a + 1.3) + 0.04 * Math.cos(4 * a + 0.4);
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
  });
  const p = (i: number) => pts[((i % n) + n) % n];
  let d = `M${p(0)[0].toFixed(1)} ${p(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = p(i - 1);
    const [x1, y1] = p(i);
    const [x2, y2] = p(i + 1);
    const [x3, y3] = p(i + 2);
    d += `C${(x1 + (x2 - x0) / 6).toFixed(1)} ${(y1 + (y2 - y0) / 6).toFixed(1)} ${(x2 - (x3 - x1) / 6).toFixed(1)} ${(y2 - (y3 - y1) / 6).toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  return `${d}Z`;
}

const NA = [
  [-0.62, -0.38],
  [-0.3, -0.62],
  [0.15, -0.55],
  [0.55, -0.45],
  [0.75, 0.22],
  [-0.8, -0.05],
  [-0.55, 0.45],
  [-0.28, 0.66],
  [0.32, 0.58],
  [0.6, 0.45],
  [-0.05, -0.2],
  [0.18, 0.12],
];
const EXTRA = [
  [-0.2, 0.2],
  [0.2, -0.28],
];
const CELLS = [
  [-0.45, 0.02, 1],
  [0.42, -0.02, 2],
  [0.0, 0.4, 3],
];

const flow = (dx: number, dy: number, delay: number, dur = 1.8) =>
  ({
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
    '--delay': `${delay}s`,
    '--dur': `${dur}s`,
  }) as CSSProperties;

function Pool({
  cx,
  cy,
  rx,
  ry,
  p,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  p: number;
}) {
  const grown = p >= 3;
  const salty = p === 1 || p === 2;
  const d = pool(cx, cy, rx, ry);
  return (
    <g>
      <g
        className="ix-anim-slow"
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          transformBox: 'view-box',
          transform: `scale(${grown ? 1.12 : 1})`,
        }}
      >
        <path d={d} transform="translate(0 5)" fill={C.drop} />
        <path d={d} fill="var(--ix-tint-water)" stroke={C.outline} strokeWidth={2.5} />
        <path
          className="ix-anim-slow"
          d={d}
          fill="var(--ix-solid-sodium)"
          style={{ opacity: salty ? 0.16 : 0 }}
        />
        <path
          d={pool(cx, cy, rx - 6, ry - 6)}
          fill="none"
          stroke={C.water}
          strokeOpacity={0.5}
          strokeWidth={1.5}
          strokeDasharray="10 8"
        />
      </g>
      {CELLS.map(([fx, fy, seed]) => (
        <CellBlob
          key={seed}
          cx={cx + fx * rx}
          cy={cy + fy * ry}
          r={Math.min(rx, ry) * 0.2}
          seed={seed}
        />
      ))}
      {NA.map(([fx, fy]) => (
        <Ion key={`${fx}${fy}`} x={cx + fx * rx} y={cy + fy * ry} r={6} fill={C.sodium} />
      ))}
      {EXTRA.map(([fx, fy]) => (
        <g key={`e${fx}`} className="ix-anim" style={{ opacity: p >= 1 ? 1 : 0 }}>
          <Ion x={cx + fx * rx} y={cy + fy * ry} r={7.5} fill={C.sodium} />
          <circle
            cx={cx + fx * rx}
            cy={cy + fy * ry}
            r={11}
            fill="none"
            stroke={C.ink}
            strokeWidth={1.5}
            strokeDasharray="3 3"
          />
        </g>
      ))}
      <text
        x={cx}
        y={cy - ry - 14}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight={600}
        fill={C.ink}
      >
        Extracellular fluid
      </text>
    </g>
  );
}

const N: Record<string, Omit<NodeSpec, 'x' | 'y' | 'w'>> = {
  kidney: {
    title: 'Kidney',
    body: ['aldosterone:', 'retains sodium'],
    hue: 'sodium',
    icon: 'kidney',
  },
  brain: {
    title: 'Osmoreceptors',
    body: ['ADH and', 'thirst rise'],
    hue: 'mustard',
    icon: 'brain',
  },
  water: {
    title: 'Water in',
    body: ['renal retention', 'and intake'],
    hue: 'water',
    icon: 'drop',
  },
};

function Lit({ n, on }: { n: NodeSpec; on: boolean }) {
  return (
    <g className="ix-anim" style={{ opacity: on ? 1 : 0.45 }}>
      <Node {...n} tone={on ? 'accent' : 'plain'} />
    </g>
  );
}

export function WaterFollowsSodium() {
  const loop = useLoop(DURATIONS);
  const p = loop.phase;
  const wide: Layout = {
    w: 700,
    h: 330,
    draw: (id) => (
      <g>
        <Pool cx={350} cy={180} rx={150} ry={112} p={p} />
        <Lit n={{ ...N.kidney, x: 84, y: 180, w: 140 }} on={p === 1} />
        <Lit n={{ ...N.brain, x: 610, y: 82, w: 150 }} on={p === 2} />
        <Lit n={{ ...N.water, x: 610, y: 270, w: 150 }} on={p === 3} />
        <g className="ix-anim" style={{ opacity: p === 1 ? 1 : 0.3 }}>
          <Arrow id={id} d="M156 180H188" accent={p === 1} />
        </g>
        <g className="ix-anim" style={{ opacity: p === 2 ? 1 : 0.3 }}>
          <Arrow id={id} d="M470 112Q500 82 532 82" accent={p === 2} />
        </g>
        <g className="ix-anim" style={{ opacity: p >= 2 ? 1 : 0.3 }}>
          <Arrow id={id} d="M610 114V238" accent={p === 3} dashed />
        </g>
        <g className="ix-anim" style={{ opacity: p === 3 ? 1 : 0.3 }}>
          <Arrow id={id} d="M532 270Q500 260 488 240" accent={p === 3} />
        </g>
        {p === 1 &&
          [0, 1, 2].map((i) => (
            <g key={`k${i}`} className="ix-flow" style={flow(90, 0, i * 0.6)}>
              <Ion x={150} y={180} r={6} fill={C.sodium} />
            </g>
          ))}
        {p === 3 &&
          [0, 1, 2, 3].map((i) => (
            <g key={`w${i}`} className="ix-flow" style={flow(-80, -50, i * 0.45)}>
              <Droplet x={540} y={272} />
            </g>
          ))}
      </g>
    ),
  };
  const narrow: Layout = {
    w: 340,
    h: 580,
    draw: (id) => (
      <g>
        <Pool cx={170} cy={150} rx={130} ry={98} p={p} />
        <Lit n={{ ...N.kidney, x: 170, y: 340, w: 230 }} on={p === 1} />
        <Lit n={{ ...N.brain, x: 170, y: 432, w: 230 }} on={p === 2} />
        <Lit n={{ ...N.water, x: 170, y: 524, w: 230 }} on={p === 3} />
        <Arrow id={id} d="M170 370V398" accent={p >= 2} />
        <Arrow id={id} d="M170 462V490" accent={p >= 3} />
        {p === 1 &&
          [0, 1, 2].map((i) => (
            <g key={`k${i}`} className="ix-flow" style={flow(0, -70, i * 0.6)}>
              <Ion x={170} y={300} r={6} fill={C.sodium} />
            </g>
          ))}
        {p === 3 &&
          [0, 1, 2, 3].map((i) => (
            <g key={`w${i}`} className="ix-flow" style={flow(0, 70, i * 0.45)}>
              <Droplet x={100 + i * 45} y={4} />
            </g>
          ))}
      </g>
    ),
  };
  const st = STATES[p];
  const c = conc(p);
  return (
    <Frame
      title="Sodium retention expands the ECF, and the serum sodium concentration is maintained"
      keyText="The shaded area is the ECF around the cells. Dots are sodium; ringed dots are sodium retained by the kidney."
      note="Teaching model: an ECF of 18 L, with the changes exaggerated for clarity. In vivo these steps overlap, so serum sodium barely changes."
      wide
    >
      <LoopBar labels={PHASES} {...loop} />
      <Responsive
        name="c1-1-water-follows"
        label="Kept sodium raises osmolality, ADH and thirst follow, and the extra water restores the sodium concentration"
        wide={wide}
        narrow={narrow}
      />
      <div
        className={`ix-readout ix-caption${c > 140 ? ' ix-readout-warn' : ''}`}
        aria-live="polite"
      >
        <p>
          <strong>{PHASES[p]}</strong>
        </p>
        <dl className="ix-stats">
          <div>
            <dt>Sodium in the ECF</dt>
            <dd className={p >= 1 ? 'ix-hot' : undefined}>{st.na.toLocaleString('en-AU')} mmol</dd>
          </div>
          <div>
            <dt>ECF volume</dt>
            <dd className={p >= 3 ? 'ix-hot' : undefined}>{st.litres.toFixed(1)} L</dd>
          </div>
          <div>
            <dt>Serum sodium</dt>
            <dd>{c} mmol/L</dd>
          </div>
        </dl>
        <p className="ix-sub">{TEXT[p]}</p>
      </div>
    </Frame>
  );
}
