'use client';
/*
 * C1.1 visual 5 · the RAAS cascade, as one illustrated scene (redrawn after
 * Orville's review, 19 Nov 2026). The circulation is a loop; the organs sit on
 * it. Each step animates what that organ does:
 *   1 Reduced EABV: less pressure reaches the kidney; JG cells sense it.
 *   2 Renin: JG cells release renin into the blood.
 *   3 Angiotensin I: the liver releases angiotensinogen; renin cuts it.
 *   4 Angiotensin II: ACE on the vessel lining (much of it in the lungs) clips it.
 *   5 Aldosterone: angiotensin II reaches the adrenal cortex; aldosterone goes out.
 *   6 ENaC: aldosterone adds sodium channels to the collecting-duct cell.
 *   7 Sodium kept: sodium moves from urine to blood, potassium the other way,
 *     water follows (with ADH and thirst) and filling recovers.
 *   8 Counterweight: a stretched heart releases ANP/BNP, and the kidney lets sodium go.
 * Glyphs: renin = a cutting wedge; angiotensinogen / angiotensin I / II =
 * chains of 14 / 10 / 8 beads; aldosterone = hexagon; ANP/BNP = diamond.
 * Teaching model: positions are schematic, chain lengths are a reminder of
 * the cuts, not a structure.
 */
import type { CSSProperties, ReactNode } from 'react';
import { Arrow, C, Droplet, Frame, Ion, Responsive, type Layout } from '../kit';
import { useReducedMotion } from '../loop';
import { StepControls, useSteps } from '../steps';

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
  'The effective arterial blood volume (EABV) falls: the arteries are underfilled, less pressure reaches the kidney, less salt reaches the macula densa, and the sympathetic nerves fire. The juxtaglomerular (JG) cells in the wall of the afferent arteriole sense it.',
  'Juxtaglomerular cells in the afferent arteriole release renin into the blood.',
  'The liver releases angiotensinogen into the blood all the time. Renin cuts it, freeing angiotensin I.',
  'Angiotensin-converting enzyme (ACE) on the lining of blood vessels, much of it in the lungs, clips angiotensin I into angiotensin II. Angiotensin II also constricts blood vessels and stimulates thirst and ADH.',
  'Angiotensin II reaches the adrenal cortex, which releases aldosterone.',
  'Aldosterone increases the activity of epithelial sodium channels (ENaC) in the principal cells of the collecting duct.',
  'More sodium is reabsorbed from the urine and potassium is excreted in exchange. With ADH and thirst, water follows the sodium, and filling recovers.',
  'When too much volume stretches the heart’s chambers, they release ANP and BNP, which push the kidney to excrete sodium instead.',
];

/* ---------- Scene geometry (760 × 430) ---------- */

/* The circulation: a clockwise loop. Top track y = 96, bottom track y = 320. */
const RING =
  'M120 96 H640 A60 60 0 0 1 700 156 V260 A60 60 0 0 1 640 320 H120 A60 60 0 0 1 60 260 V156 A60 60 0 0 1 120 96 Z';
const AT = { jg: 150, duct: 330, adrenal: 540, liver: 190, lungs: 400, heart: 600 };
/* Legs of the loop, in the direction blood flows. */
const LEG = {
  jgToLiver: `M${AT.jg} 320 H120 A60 60 0 0 1 60 260 V156 A60 60 0 0 1 120 96 H${AT.liver}`,
  liverToLungs: `M${AT.liver + 20} 96 H${AT.lungs}`,
  lungsToAdrenal: `M${AT.lungs + 10} 96 H640 A60 60 0 0 1 700 156 V260 A60 60 0 0 1 640 320 H${AT.adrenal}`,
  adrenalToDuct: `M${AT.adrenal} 320 H${AT.duct + 10}`,
  heartToDuct: `M${AT.heart} 96 H640 A60 60 0 0 1 700 156 V260 A60 60 0 0 1 640 320 H${AT.duct + 10}`,
};
/* Where the narrow (phone) view centres for each step. */
const FOCUS: [number, number][] = [
  [160, 300],
  [130, 220],
  [230, 110],
  [430, 120],
  [560, 300],
  [330, 330],
  [330, 330],
  [620, 200],
];

const S = {
  renin: 'var(--ix-solid-pink)',
  chain: 'var(--ix-solid-mustard)',
  angII: 'var(--ix-solid-sodium)',
  aldo: 'var(--ix-solid-green)',
  anp: 'var(--ix-solid-water)',
};

/* ---------- Glyphs ---------- */

function Chain({ n, fill, fade = 0 }: { n: number; fill: string; fade?: number }) {
  const x0 = -((n - 1) * 8) / 2;
  return (
    <g>
      <path d={`M${x0} 0H${-x0}`} stroke={fill} strokeWidth={2} />
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={i}
          cx={x0 + i * 8}
          cy={0}
          r={3.8}
          fill={fill}
          stroke={C.outline}
          strokeWidth={0.8}
          className={i >= n - fade ? 'rs-snip' : undefined}
        />
      ))}
    </g>
  );
}
function Renin() {
  return (
    <path d="M0 0 L9 -6 A11 11 0 1 0 9 6 Z" fill={S.renin} stroke={C.outline} strokeWidth={1} />
  );
}
function Hex({ fill }: { fill: string }) {
  return (
    <path
      d="M-7 0 L-3.5 -6 L3.5 -6 L7 0 L3.5 6 L-3.5 6 Z"
      fill={fill}
      stroke={C.outline}
      strokeWidth={1}
    />
  );
}
function Diamond() {
  return <path d="M0 -7 L6 0 L0 7 L-6 0 Z" fill={S.anp} stroke={C.outline} strokeWidth={1} />;
}

/** Glyphs travelling along a leg of the circulation, evenly spaced, looping. */
function Travel({
  path,
  n,
  dur,
  children,
}: {
  path: string;
  n: number;
  dur: number;
  children: ReactNode;
}) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <g key={i}>
          <animateMotion
            path={path}
            dur={`${dur}s`}
            begin={`-${(i * dur) / n}s`}
            repeatCount="indefinite"
          />
          {children}
        </g>
      ))}
    </>
  );
}

const flow = (dx: number, dy: number, delay: number, dur = 2.2) =>
  ({
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
    '--delay': `${delay}s`,
    '--dur': `${dur}s`,
  }) as CSSProperties;

/** A labelled organ; lit when it is the one acting in this step. */
function Station({
  x,
  y,
  label,
  lit,
  children,
}: {
  x: number;
  y: number;
  label: string;
  lit: boolean;
  children: ReactNode;
}) {
  return (
    <g className={lit ? 'rs-lit' : 'rs-dim'}>
      {children}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={lit ? C.ink : C.muted}
      >
        {label}
      </text>
    </g>
  );
}

/* ---------- The scene ---------- */

function Scene({ id, p, reduced }: { id: string; p: number; reduced: boolean }) {
  const low = p <= 5;
  const needle = p === 7 ? 50 : p === 6 ? 0 : -55;
  const move = !reduced;
  return (
    <g>
      <defs>
        <filter id={`${id}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow
            dx="0"
            dy="0"
            stdDeviation="4"
            floodColor="var(--ix-accent)"
            floodOpacity="0.55"
          />
        </filter>
      </defs>

      {/* Circulation */}
      <path d={RING} fill="none" stroke={C.outline} strokeWidth={22} strokeLinejoin="round" />
      <path
        d={RING}
        fill="none"
        stroke="var(--ix-tint-pink)"
        strokeWidth={18}
        strokeLinejoin="round"
      />
      {move &&
        Array.from({ length: low ? 10 : 18 }, (_, i) => {
          const n = low ? 10 : 18;
          const dur = low ? 16 : 10;
          return (
            <circle key={`b${i}-${n}`} r={3} fill="var(--ix-solid-pink)" opacity={0.55}>
              <animateMotion
                path={RING}
                dur={`${dur}s`}
                begin={`-${(i * dur) / n}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}
      <text
        x={92}
        y={212}
        fontSize={10}
        fontWeight={600}
        fill={C.muted}
        transform="rotate(-90 92 212)"
        textAnchor="middle"
      >
        blood flow
      </text>

      {/* EABV gauge in the middle */}
      <g transform="translate(380 236)">
        <path
          d="M-70 0 A70 70 0 0 1 70 0"
          fill="none"
          stroke={C.edge}
          strokeWidth={12}
          strokeLinecap="round"
        />
        <path
          d="M-70 0 A70 70 0 0 1 -35 -60.6"
          fill="none"
          stroke="var(--ix-solid-sodium)"
          strokeWidth={12}
          strokeLinecap="round"
          opacity={0.7}
        />
        <path
          d="M35 -60.6 A70 70 0 0 1 70 0"
          fill="none"
          stroke="var(--ix-solid-water)"
          strokeWidth={12}
          strokeLinecap="round"
          opacity={0.7}
        />
        <g
          style={{
            transform: `rotate(${needle}deg)`,
            transition: 'transform 1.2s cubic-bezier(.3,1.4,.5,1)',
          }}
        >
          <path d="M0 0 L0 -58" stroke={C.ink} strokeWidth={3} strokeLinecap="round" />
        </g>
        <circle r={6} fill={C.ink} />
        <text y={26} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.ink}>
          Effective arterial blood volume
        </text>
        <text x={-92} y={4} textAnchor="middle" fontSize={10} fill={C.muted}>
          low
        </text>
        <text x={92} y={4} textAnchor="middle" fontSize={10} fill={C.muted}>
          high
        </text>
      </g>

      {/* Liver */}
      <Station x={AT.liver} y={20} label="Liver" lit={p === 2}>
        <path
          d="M140 50 C150 28 238 22 250 40 C258 54 232 74 196 74 C164 74 134 66 140 50 Z"
          fill="#c98a5a"
          opacity={0.85}
          stroke={C.outline}
          strokeWidth={1.6}
          filter={p === 2 ? `url(#${id}-glow)` : undefined}
        />
      </Station>

      {/* Lungs, with ACE on the vessel lining */}
      <Station x={AT.lungs} y={20} label="Lungs (ACE on vessel lining)" lit={p === 3}>
        <g filter={p === 3 ? `url(#${id}-glow)` : undefined}>
          <ellipse
            cx={AT.lungs - 18}
            cy={52}
            rx={16}
            ry={22}
            fill="var(--ix-tint-pink)"
            stroke={C.outline}
            strokeWidth={1.6}
          />
          <ellipse
            cx={AT.lungs + 18}
            cy={52}
            rx={16}
            ry={22}
            fill="var(--ix-tint-pink)"
            stroke={C.outline}
            strokeWidth={1.6}
          />
          <path d={`M${AT.lungs} 30 V74`} stroke={C.outline} strokeWidth={3} />
        </g>
        {[-30, -10, 10, 30].map((dx) => (
          <path
            key={dx}
            d={`M${AT.lungs + dx} 86 l0 -6 m-4 -3 l4 3 l4 -3`}
            stroke="var(--ix-solid-mustard)"
            strokeWidth={2}
            fill="none"
          />
        ))}
      </Station>

      {/* Heart */}
      <Station x={AT.heart} y={20} label="Heart" lit={p === 7}>
        <path
          d={`M${AT.heart} 74 C${AT.heart - 34} 54 ${AT.heart - 30} 26 ${AT.heart - 12} 30 C${AT.heart - 4} 32 ${AT.heart} 38 ${AT.heart} 44 C${AT.heart} 38 ${AT.heart + 4} 32 ${AT.heart + 12} 30 C${AT.heart + 30} 26 ${AT.heart + 34} 54 ${AT.heart} 74 Z`}
          fill="var(--ix-solid-pink)"
          opacity={0.75}
          stroke={C.outline}
          strokeWidth={1.6}
          className={p === 7 ? 'rs-stretch' : undefined}
          filter={p === 7 ? `url(#${id}-glow)` : undefined}
        />
      </Station>

      {/* Kidney: afferent arteriole and JG cells */}
      <Station x={AT.jg} y={420} label="Kidney: JG cells" lit={p <= 1}>
        <path
          d="M104 372 C100 342 130 336 150 344 C172 336 200 342 196 372 C192 404 160 410 150 396 C140 410 108 404 104 372 Z"
          fill="#b4646e"
          opacity={0.8}
          stroke={C.outline}
          strokeWidth={1.6}
        />
        <rect
          x={AT.jg - 7}
          y={330}
          width={14}
          height={22}
          fill="var(--ix-tint-pink)"
          stroke={C.outline}
          strokeWidth={1.4}
        />
        <g filter={p <= 1 ? `url(#${id}-glow)` : undefined}>
          {[336, 346].map((y) =>
            [-11, 11].map((dx) => (
              <circle
                key={`${y}${dx}`}
                cx={AT.jg + dx}
                cy={y}
                r={4.5}
                fill="#8f6bc0"
                stroke={C.outline}
                strokeWidth={0.8}
                className={p === 0 ? 'rs-pulse' : undefined}
              />
            )),
          )}
        </g>
      </Station>

      {/* Adrenal cortex */}
      <Station x={AT.adrenal} y={420} label="Adrenal cortex" lit={p === 4}>
        <path
          d={`M${AT.adrenal - 34} 392 L${AT.adrenal} 336 L${AT.adrenal + 34} 392 Z`}
          fill="var(--ix-solid-mustard)"
          opacity={0.75}
          stroke={C.outline}
          strokeWidth={1.6}
          strokeLinejoin="round"
          filter={p === 4 ? `url(#${id}-glow)` : undefined}
        />
        <path
          d={`M${AT.adrenal - 40} 400 Q${AT.adrenal} 384 ${AT.adrenal + 40} 400`}
          stroke="#b4646e"
          strokeWidth={8}
          fill="none"
          strokeLinecap="round"
          opacity={0.7}
        />
      </Station>

      {/* Collecting duct: one principal cell between blood (top) and urine (bottom) */}
      <Station x={AT.duct} y={420} label="Collecting duct cell" lit={p >= 5 && p <= 7}>
        <rect
          x={AT.duct - 40}
          y={336}
          width={80}
          height={42}
          rx={10}
          fill="var(--ix-node)"
          stroke={C.outline}
          strokeWidth={1.6}
          filter={p === 5 || p === 6 ? `url(#${id}-glow)` : undefined}
        />
        <rect
          x={AT.duct - 52}
          y={382}
          width={104}
          height={20}
          rx={10}
          fill="var(--ix-tint-mustard)"
          stroke={C.outline}
          strokeWidth={1.2}
        />
        <text x={AT.duct + 60} y={396} fontSize={10} fill={C.muted}>
          urine
        </text>
        {p >= 5 &&
          [-24, -8, 8, 24].map((dx) => (
            <rect
              key={dx}
              x={AT.duct + dx - 3}
              y={372}
              width={6}
              height={10}
              rx={2}
              fill={S.angII}
              className="rs-pop"
            />
          ))}
        {p >= 5 && (
          <text
            x={AT.duct - 60}
            y={376}
            textAnchor="end"
            fontSize={10}
            fontWeight={700}
            fill={C.ink}
          >
            ENaC
          </text>
        )}
      </Station>

      {/* ---------- Step animations ---------- */}

      {p === 0 && (
        <g>
          <Arrow d={`M${AT.jg} 270 V300`} id={id} accent />
          <text x={AT.jg + 14} y={286} fontSize={10} fontWeight={700} fill={C.ink}>
            less pressure
          </text>
        </g>
      )}

      {p === 1 && move && (
        <Travel path={LEG.jgToLiver} n={4} dur={4}>
          <Renin />
        </Travel>
      )}

      {p === 2 && (
        <g>
          {/* angiotensinogen leaves the liver; renin cuts it */}
          <g transform={`translate(${AT.liver + 14} 96)`}>
            <Chain n={14} fill={S.chain} fade={4} />
            <g transform="translate(18 -2)" className="rs-cut">
              <Renin />
            </g>
          </g>
          {move && (
            <Travel path={LEG.liverToLungs} n={3} dur={3.6}>
              <Chain n={10} fill={S.chain} />
            </Travel>
          )}
        </g>
      )}

      {p === 3 && (
        <g>
          <g transform={`translate(${AT.lungs} 96)`}>
            <Chain n={10} fill={S.chain} fade={2} />
          </g>
          {move && (
            <Travel path={LEG.lungsToAdrenal} n={4} dur={5}>
              <Chain n={8} fill={S.angII} />
            </Travel>
          )}
          <g className="rs-pop">
            <rect
              x={500}
              y={124}
              width={150}
              height={22}
              rx={11}
              fill="var(--ix-tint-sodium)"
              stroke={C.outline}
            />
            <text x={575} y={139} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.ink}>
              vessels constrict
            </text>
            <rect
              x={500}
              y={152}
              width={150}
              height={22}
              rx={11}
              fill="var(--ix-tint-water)"
              stroke={C.outline}
            />
            <text x={575} y={167} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.ink}>
              thirst and ADH
            </text>
          </g>
        </g>
      )}

      {p === 4 && (
        <g>
          <g transform={`translate(${AT.adrenal + 40} 320)`}>
            <Chain n={8} fill={S.angII} />
          </g>
          {move && (
            <Travel path={LEG.adrenalToDuct} n={4} dur={3.4}>
              <Hex fill={S.aldo} />
            </Travel>
          )}
        </g>
      )}

      {p === 5 && (
        <g>
          {[-20, 0, 20].map((dx, i) => (
            <g key={dx} className="ix-flow" style={flow(0, 22, i * 0.5, 1.8)}>
              <g transform={`translate(${AT.duct + dx} 318)`}>
                <Hex fill={S.aldo} />
              </g>
            </g>
          ))}
        </g>
      )}

      {p === 6 && (
        <g>
          {[-24, -8, 8, 24].map((dx, i) => (
            <g key={`na${dx}`} className="ix-flow" style={flow(0, -64, i * 0.45, 2.2)}>
              <Ion x={AT.duct + dx} y={392} fill="var(--ix-solid-sodium)" r={4.5} />
            </g>
          ))}
          {[-16, 16].map((dx, i) => (
            <g key={`k${dx}`} className="ix-flow" style={flow(0, 60, i * 0.9 + 0.4, 2.4)}>
              <Ion x={AT.duct + dx} y={330} fill="var(--ix-solid-potassium)" r={4} />
            </g>
          ))}
          {[-34, 34].map((dx, i) => (
            <g key={`w${dx}`} className="ix-flow" style={flow(0, -60, i * 0.7 + 0.8, 2.4)}>
              <Droplet x={AT.duct + dx} y={394} s={0.7} />
            </g>
          ))}
          <text x={AT.duct + 50} y={348} fontSize={10} fontWeight={700} fill={C.ink}>
            Na⁺ in, K⁺ out
          </text>
        </g>
      )}

      {p === 7 && (
        <g>
          {move && (
            <Travel path={LEG.heartToDuct} n={4} dur={4.4}>
              <Diamond />
            </Travel>
          )}
          {[-20, 0, 20].map((dx, i) => (
            <g key={`out${dx}`} className="ix-flow" style={flow(0, 52, i * 0.5, 2.2)}>
              <Ion x={AT.duct + dx} y={340} fill="var(--ix-solid-sodium)" r={4.5} />
            </g>
          ))}
          <text x={AT.duct + 50} y={348} fontSize={10} fontWeight={700} fill={C.ink}>
            sodium let go
          </text>
        </g>
      )}
    </g>
  );
}

function Legend() {
  const items: [ReactNode, string][] = [
    [<Renin key="r" />, 'renin'],
    [<Chain key="c" n={4} fill={S.chain} />, 'angiotensinogen, angiotensin I'],
    [<Chain key="a" n={4} fill={S.angII} />, 'angiotensin II'],
    [<Hex key="h" fill={S.aldo} />, 'aldosterone'],
    [<Diamond key="d" />, 'ANP, BNP'],
  ];
  return (
    <ul className="ix-legend rs-legend">
      {items.map(([g, t]) => (
        <li key={t}>
          <svg width="34" height="18" viewBox="-17 -9 34 18" aria-hidden="true">
            {g}
          </svg>
          {t}
        </li>
      ))}
    </ul>
  );
}

export function RaasCascade() {
  const s = useSteps(PHASES.length, 4200);
  const p = s.step;
  const reduced = useReducedMotion();
  const wide: Layout = { w: 760, h: 430, draw: (id) => <Scene id={id} p={p} reduced={reduced} /> };
  const [fx, fy] = FOCUS[p];
  const narrow: Layout = {
    w: 360,
    h: 300,
    draw: (id) => (
      <g
        style={{
          transform: `translate(${180 - fx}px, ${150 - fy}px)`,
          transition: 'transform 0.9s ease',
        }}
      >
        <Scene id={id} p={p} reduced={reduced} />
      </g>
    ),
  };
  return (
    <Frame
      title="A fall in effective arterial blood volume sets off a cascade that ends with the kidney keeping sodium"
      keyText="The loop is the circulation, and blood flows clockwise around it. Each step lights up the organ that acts and shows what it sends into the blood."
      note="Teaching model: positions are schematic. Step through, or press Play to run it."
      wide
    >
      <StepControls labels={PHASES} {...s} />
      <Responsive
        name="c1-1-raas"
        label={`The RAAS cascade, step ${p + 1}: ${PHASES[p]}`}
        wide={wide}
        narrow={narrow}
      />
      <div className="ix-readout ix-caption" aria-live="polite">
        <p>
          <strong>
            {p + 1}. {PHASES[p]}
          </strong>
        </p>
        <p className="ix-sub">{TEXT[p]}</p>
      </div>
      <Legend />
    </Frame>
  );
}
