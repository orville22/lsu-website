'use client';
/*
 * C1.1 visual 5: the RAAS cascade, with natriuretic peptides as the counterweight.
 * A step-through: each step lights in turn and a pulse runs along the arrow to
 * the next. Play advances it automatically.
 */
import { Arrow, C, Frame, Label, Node, Responsive, edges, type NodeSpec } from '../kit';
import { StepControls, useSteps } from '../steps';

const STEPS: Omit<NodeSpec, 'x' | 'y' | 'w'>[] = [
  {
    icon: 'vessel',
    hue: 'sodium',
    title: 'Reduced EABV',
    body: ['effective arterial', 'blood volume falls'],
  },
  { icon: 'kidney', hue: 'sodium', title: 'Renin', body: 'juxtaglomerular cells' },
  { icon: 'hormone', hue: 'sodium', title: 'Angiotensin I', body: 'from angiotensinogen' },
  { icon: 'hormone', hue: 'sodium', title: 'Angiotensin II', body: 'made by ACE' },
  { icon: 'gland', hue: 'sodium', title: 'Aldosterone', body: 'adrenal cortex' },
  { icon: 'kidney', hue: 'sodium', title: 'More ENaC activity', body: 'principal cells' },
  { icon: 'salt', hue: 'sodium', title: 'Sodium kept', body: 'potassium excreted' },
];
const COUNTER: Omit<NodeSpec, 'x' | 'y' | 'w'> = {
  icon: 'heart',
  hue: 'pink',
  title: 'ANP and BNP',
  body: 'push sodium out',
};

const PHASES = [
  'Reduced EABV',
  'Renin',
  'Angiotensin I',
  'Angiotensin II',
  'Aldosterone',
  'ENaC',
  'Sodium kept',
  'Counterweight',
];
const TEXT = [
  'The effective arterial blood volume (EABV) falls: the arteries are underfilled, less pressure reaches the kidney, less salt reaches the macula densa, and the sympathetic nerves fire.',
  'Juxtaglomerular cells in the afferent arteriole release renin.',
  'Renin cuts angiotensinogen, made by the liver, into angiotensin I.',
  'Angiotensin-converting enzyme (ACE) turns angiotensin I into angiotensin II. It also constricts blood vessels and stimulates thirst and ADH.',
  'Angiotensin II drives aldosterone release from the adrenal cortex.',
  'Aldosterone increases the activity of epithelial sodium channels (ENaC) in the principal cells.',
  'More sodium is reabsorbed and potassium is excreted in exchange. With ADH and thirst, water follows the sodium.',
  'When too much volume stretches the heart’s chambers, ANP and BNP push the kidney to excrete sodium instead.',
];

function Lit({ n, i, p }: { n: NodeSpec; i: number; p: number }) {
  const on = p === i;
  const done = p > i && p < 7;
  return (
    <g className="ix-anim" style={{ opacity: on || done || p === 7 ? 1 : 0.35 }}>
      <Node {...n} tone={on ? 'accent' : n.tone} />
    </g>
  );
}

/** An arrow from a to b that lights once the step after it is reached, with a pulse running along it. */
function Link({
  id,
  a,
  b,
  i,
  p,
}: {
  id: string;
  a: [number, number];
  b: [number, number];
  i: number;
  p: number;
}) {
  const reached = p > i && p < 7;
  return (
    <g>
      <g className="ix-anim" style={{ opacity: reached ? 1 : 0.35 }}>
        <Arrow id={id} d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} accent={reached} />
      </g>
      <circle
        className="ix-anim"
        cx={a[0]}
        cy={a[1]}
        r={6}
        fill={C.accent}
        stroke={C.outline}
        strokeWidth={1.2}
        style={{
          opacity: p === i + 1 ? 1 : 0,
          transformBox: 'view-box',
          transform: p === i + 1 ? `translate(${b[0] - a[0]}px, ${b[1] - a[1]}px)` : 'none',
        }}
      />
    </g>
  );
}

export function RaasCascade() {
  const s = useSteps(PHASES.length, 2600);
  const p = s.step;
  return (
    <Frame
      title="A fall in effective arterial blood volume sets off a cascade that ends with the kidney keeping sodium"
      note="Step through, or press Play to run it."
      wide
    >
      <StepControls labels={PHASES} {...s} />
      <Responsive
        name="raas"
        label="A fall in effective arterial blood volume triggers a cascade that ends with the kidney keeping sodium"
        wide={{
          w: 760,
          h: 272,
          draw: (id) => {
            const W = 164,
              xs = [106, 290, 474, 658],
              ra = 52,
              rb = 188;
            const pos: [number, number][] = [
              [xs[0], ra],
              [xs[1], ra],
              [xs[2], ra],
              [xs[3], ra],
              [xs[3], rb],
              [xs[2], rb],
              [xs[1], rb],
            ];
            const n: NodeSpec[] = STEPS.map((s, i) => ({
              ...s,
              x: pos[i][0],
              y: pos[i][1],
              w: W,
              h: 60,
            }));
            const c: NodeSpec = { ...COUNTER, x: xs[0], y: rb, w: W, h: 60 };
            const links: [[number, number], [number, number]][] = [
              [
                [edges(n[0]).right, ra],
                [edges(n[1]).left, ra],
              ],
              [
                [edges(n[1]).right, ra],
                [edges(n[2]).left, ra],
              ],
              [
                [edges(n[2]).right, ra],
                [edges(n[3]).left, ra],
              ],
              [
                [xs[3], edges(n[3]).bottom],
                [xs[3], edges(n[4]).top],
              ],
              [
                [edges(n[4]).left, rb],
                [edges(n[5]).right, rb],
              ],
              [
                [edges(n[5]).left, rb],
                [edges(n[6]).right, rb],
              ],
            ];
            return (
              <>
                {links.map(([a, b], i) => (
                  <Link key={i} id={id} a={a} b={b} i={i} p={p} />
                ))}
                {n.map((s, i) => (
                  <Lit key={i} n={s} i={i} p={p} />
                ))}
                <g className="ix-anim" style={{ opacity: p === 7 ? 1 : 0.45 }}>
                  <Node {...c} tone={p === 7 ? 'accent' : 'dashed'} />
                </g>
                <Label x={xs[0]} y={rb + 52}>
                  the counterweight
                </Label>
              </>
            );
          },
        }}
        narrow={{
          w: 360,
          h: 690,
          draw: (id) => {
            const n: NodeSpec[] = STEPS.map((s, i) => ({
              ...s,
              x: 180,
              y: 40 + i * 82,
              w: 240,
              h: 60,
            }));
            const c: NodeSpec = { ...COUNTER, x: 180, y: 646, w: 240, h: 60 };
            return (
              <>
                {n.slice(0, -1).map((s, i) => (
                  <Link
                    key={i}
                    id={id}
                    a={[180, edges(s).bottom]}
                    b={[180, edges(n[i + 1]).top]}
                    i={i}
                    p={p}
                  />
                ))}
                {n.map((s, i) => (
                  <Lit key={i} n={s} i={i} p={p} />
                ))}
                <g className="ix-anim" style={{ opacity: p === 7 ? 1 : 0.45 }}>
                  <Node {...c} tone={p === 7 ? 'accent' : 'dashed'} />
                </g>
                <Label x={180} y={606}>
                  The counterweight
                </Label>
              </>
            );
          },
        }}
      />
      <div className="ix-readout ix-caption" aria-live="polite">
        <p>
          <strong>{PHASES[p]}</strong>
        </p>
        <p className="ix-sub">{TEXT[p]}</p>
      </div>
    </Frame>
  );
}
