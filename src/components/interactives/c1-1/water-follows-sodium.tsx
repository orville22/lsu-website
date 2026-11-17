'use client';
/*
 * C1.1 new visual (learner review #2): water follows sodium.
 * Aldosterone keeps sodium → osmolality edges up → ADH and thirst respond →
 * water is kept and drunk → the ECF grows while the sodium concentration
 * returns to where it started. That is why the sodium system sets volume.
 * Numbers are a toy model: ECF 18 L at 140 mmol/L; 72 mmol of sodium kept,
 * then 0.5 L of water.
 */
import { Arrow, C, Frame, Node, Responsive, type Layout, type NodeSpec } from '../kit';
import { StepControls, useSteps } from '../steps';

const STEPS = ['Start', 'Sodium kept', 'ADH and thirst', 'Water follows'];

export const STATES = [
  { na: 2520, litres: 18 },
  { na: 2592, litres: 18 },
  { na: 2592, litres: 18 },
  { na: 2592, litres: 18.5 },
];
export const conc = (i: number) => Math.round(STATES[i].na / STATES[i].litres);

const TEXT = [
  'A healthy extracellular fluid (ECF): sodium 140 mmol/L. Then the kidney is told to keep sodium.',
  'Aldosterone makes the kidney keep extra sodium. The same water now holds more sodium, so the concentration and the osmolality edge up.',
  'The osmoreceptors sense the higher osmolality. ADH rises and so does thirst.',
  'The kidney keeps water and the person drinks. The ECF grows until the sodium concentration is back where it started. More sodium has become more volume, not a higher sodium result.',
];

const DOTS = [
  [0.12, 0.2],
  [0.3, 0.12],
  [0.5, 0.24],
  [0.7, 0.14],
  [0.88, 0.22],
  [0.2, 0.42],
  [0.4, 0.5],
  [0.62, 0.4],
  [0.82, 0.5],
  [0.1, 0.68],
  [0.32, 0.76],
  [0.55, 0.66],
  [0.75, 0.78],
  [0.9, 0.7],
];
const EXTRA = [
  [0.45, 0.88],
  [0.68, 0.9],
];

function Tank({ x, y, w, h, step }: { x: number; y: number; w: number; h: number; step: number }) {
  const bottom = y + h;
  const level = step >= 3 ? h * 0.86 : h * 0.66;
  const dotH = h * 0.62;
  return (
    <g>
      <ellipse cx={x + w / 2} cy={bottom + 10} rx={w * 0.48} ry={7} fill={C.drop} />
      <rect
        className="ix-grow"
        x={x}
        y={bottom - level}
        width={w}
        height={level}
        fill={C.water}
        fillOpacity={0.22}
      />
      <path
        className="ix-anim"
        d={`M${x} ${bottom - h * 0.66}H${x + w}`}
        stroke={C.water}
        strokeWidth={2.5}
        style={{ transform: `translate(0, ${step >= 3 ? -(h * 0.2) : 0}px)` }}
      />
      {DOTS.map(([fx, fy]) => (
        <circle
          key={`${fx}-${fy}`}
          cx={x + 14 + fx * (w - 28)}
          cy={bottom - dotH + fy * (dotH - 10)}
          r={6}
          fill={C.sodium}
          stroke={C.outline}
          strokeWidth={1.2}
        />
      ))}
      {EXTRA.map(([fx, fy]) => (
        <circle
          key={`e${fx}`}
          className="ix-anim"
          cx={x + 14 + fx * (w - 28)}
          cy={bottom - dotH + fy * (dotH - 10)}
          r={7.5}
          fill={C.sodium}
          stroke={C.ink}
          strokeWidth={2}
          style={{ opacity: step >= 1 ? 1 : 0 }}
        />
      ))}
      <path
        d={`M${x - 6} ${y}H${x}V${bottom - 12}Q${x} ${bottom} ${x + 12} ${bottom}H${x + w - 12}Q${x + w} ${bottom} ${x + w} ${bottom - 12}V${y}H${x + w + 6}`}
        fill="none"
        stroke={C.outline}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <text
        x={x + w / 2}
        y={y - 10}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill={C.muted}
      >
        Extracellular fluid
      </text>
    </g>
  );
}

const ACTIVE: number[][] = [[], [0], [0, 1], [0, 1, 2]];

function Chain({
  id,
  nodes,
  step,
  links,
}: {
  id: string;
  nodes: NodeSpec[];
  step: number;
  links: string[];
}) {
  return (
    <g>
      {links.map((d, i) => (
        <g key={d} className="ix-anim" style={{ opacity: step > i + 1 ? 1 : 0.25 }}>
          <Arrow id={id} d={d} accent={step > i + 1} />
        </g>
      ))}
      {nodes.map((n, i) => (
        <g
          key={n.title}
          className="ix-anim"
          style={{ opacity: ACTIVE[step].includes(i) ? 1 : 0.35 }}
        >
          <Node {...n} tone={ACTIVE[step].at(-1) === i ? 'accent' : 'plain'} />
        </g>
      ))}
    </g>
  );
}

const nodeText: Omit<NodeSpec, 'x' | 'y' | 'w'>[] = [
  { title: 'Aldosterone', body: 'kidney keeps sodium', hue: 'sodium', icon: 'salt' },
  {
    title: 'Osmolality edges up',
    body: ['osmoreceptors respond:', 'ADH and thirst rise'],
    hue: 'mustard',
    icon: 'brain',
  },
  { title: 'Water kept and drunk', body: 'the ECF grows', hue: 'water', icon: 'drop' },
];

export function WaterFollowsSodium() {
  const s = useSteps(STEPS.length);
  const { step } = s;
  const wide: Layout = {
    w: 660,
    h: 300,
    draw: (id) => (
      <g>
        <Tank x={30} y={50} w={220} h={220} step={step} />
        <Chain
          id={id}
          step={step}
          nodes={nodeText.map((n, i) => ({ ...n, x: 480, y: 70 + i * 92, w: 240 }))}
          links={['M480 100V132', 'M480 192V224']}
        />
      </g>
    ),
  };
  const narrow: Layout = {
    w: 340,
    h: 560,
    draw: (id) => (
      <g>
        <Tank x={70} y={34} w={200} h={200} step={step} />
        <Chain
          id={id}
          step={step}
          nodes={nodeText.map((n, i) => ({ ...n, x: 170, y: 306 + i * 92, w: 260 }))}
          links={['M170 336V368', 'M170 428V460']}
        />
      </g>
    ),
  };
  const st = STATES[step];
  const c = conc(step);
  return (
    <Frame
      title="Keep sodium, and water follows: the ECF grows while the sodium result stays put"
      keyText="Orange dots are sodium; the blue fill is the extracellular fluid. Step through, or press Play."
      note="Teaching model: an ECF of 18 L, with the changes drawn larger than life. In the body the steps overlap, so the sodium result barely moves at all."
      wide
    >
      <StepControls labels={STEPS} {...s} />
      <Responsive
        name="c1-1-water-follows"
        label="Kept sodium raises osmolality, ADH and thirst follow, and the extra water restores the sodium concentration"
        wide={wide}
        narrow={narrow}
      />
      <div className={`ix-readout${c > 140 ? ' ix-readout-warn' : ''}`} aria-live="polite">
        <p>
          <strong>
            Step {step + 1}: {STEPS[step]}
          </strong>
        </p>
        <dl className="ix-stats">
          <div>
            <dt>Sodium in the ECF</dt>
            <dd className={step >= 1 ? 'ix-hot' : undefined}>
              {st.na.toLocaleString('en-AU')} mmol
            </dd>
          </div>
          <div>
            <dt>ECF volume</dt>
            <dd className={step >= 3 ? 'ix-hot' : undefined}>{st.litres.toFixed(1)} L</dd>
          </div>
          <div>
            <dt>Sodium result</dt>
            <dd>{c} mmol/L</dd>
          </div>
        </dl>
        <p className="ix-sub">{TEXT[step]}</p>
      </div>
    </Frame>
  );
}
