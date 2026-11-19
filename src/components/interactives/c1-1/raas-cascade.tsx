'use client';
/*
 * C1.1 visual 5 · the RAAS cascade (redrawn twice after Orville's review,
 * 19 Nov 2026). Two parts:
 *   - a small body map (left, or top on phones) with recognisable organs in
 *     their places, lighting up where each step happens;
 *   - a large stage showing the step itself, close up and animated.
 * Steps: low EABV sensed by the JG cells · renin released · renin cuts the
 * angiotensin I tail off angiotensinogen · ACE on the vessel lining clips two
 * more off, giving angiotensin II · angiotensin II makes the adrenal cortex
 * release aldosterone · aldosterone adds ENaC to the duct cell · sodium in,
 * potassium out, water follows · the counterweight: ANP/BNP from a stretched
 * heart make the kidney excrete sodium.
 * Teaching model: shapes are schematic and not to scale; bead counts stand
 * for the 10 and 8 amino acids of angiotensin I and II.
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
  'The liver releases angiotensinogen into the blood all the time. Renin cuts a short tail off it: angiotensin I, 10 amino acids long.',
  'Angiotensin-converting enzyme (ACE) on the lining of blood vessels clips two more amino acids off, giving angiotensin II. Angiotensin II also constricts blood vessels and stimulates thirst and ADH.',
  'Angiotensin II reaches the adrenal cortex, which releases aldosterone.',
  'Aldosterone enters the principal cells of the collecting duct and increases the activity of epithelial sodium channels (ENaC) on the urine side.',
  'More sodium is reabsorbed from the urine and potassium is excreted in exchange. With ADH and thirst, water follows the sodium, and filling recovers.',
  'When too much volume stretches the heart’s chambers, they release ANP and BNP, which push the kidney to excrete sodium instead.',
];
const WHERE = [
  'Kidney · afferent arteriole',
  'Kidney · JG cells',
  'Blood · angiotensinogen from the liver',
  'Vessel lining · much of it in the lungs',
  'Adrenal cortex',
  'Kidney · collecting duct',
  'Kidney · collecting duct',
  'Heart, then kidney',
];
type Organ = 'kidney' | 'liver' | 'lungs' | 'adrenal' | 'heart';
const LIT: Organ[][] = [
  ['kidney'],
  ['kidney'],
  ['liver'],
  ['lungs'],
  ['adrenal'],
  ['kidney'],
  ['kidney'],
  ['heart', 'kidney'],
];

const S = {
  renin: 'var(--ix-solid-pink)',
  angI: 'var(--ix-solid-mustard)',
  angII: 'var(--ix-solid-sodium)',
  aldo: 'var(--ix-solid-green)',
  anp: 'var(--ix-solid-water)',
  jg: '#8f6bc0',
  rbc: '#c94f4f',
  k: '#7a62b3',
};

const flow = (dx: number, dy: number, delay: number, dur = 2.4) =>
  ({
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
    '--delay': `${delay}s`,
    '--dur': `${dur}s`,
  }) as CSSProperties;

function Flow({
  dx,
  dy,
  delay,
  dur,
  children,
}: {
  dx: number;
  dy: number;
  delay: number;
  dur?: number;
  children: ReactNode;
}) {
  return (
    <g className="ix-flow" style={flow(dx, dy, delay, dur)}>
      {children}
    </g>
  );
}

/* ---------- Glyphs (stage size) ---------- */

function Beads({
  n,
  fill,
  r = 8,
  gap = 19,
  snip = 0,
}: {
  n: number;
  fill: string;
  r?: number;
  gap?: number;
  snip?: number;
}) {
  return (
    <g>
      <path d={`M0 0H${(n - 1) * gap}`} stroke={fill} strokeWidth={3} />
      {Array.from({ length: n }, (_, i) => (
        <circle
          key={i}
          cx={i * gap}
          cy={0}
          r={r}
          fill={fill}
          stroke={C.outline}
          strokeWidth={1.2}
          className={i >= n - snip ? 'rs-snip' : undefined}
        />
      ))}
    </g>
  );
}
function Renin({ s = 1 }: { s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      <path
        d="M0 0 L16 -11 A19 19 0 1 0 16 11 Z"
        fill={S.renin}
        stroke={C.outline}
        strokeWidth={1.4}
      />
      <circle cx={-6} cy={-6} r={2} fill={C.outline} />
    </g>
  );
}
function Hex({ s = 1 }: { s?: number }) {
  return (
    <path
      transform={`scale(${s})`}
      d="M-11 0 L-5.5 -9.5 L5.5 -9.5 L11 0 L5.5 9.5 L-5.5 9.5 Z"
      fill={S.aldo}
      stroke={C.outline}
      strokeWidth={1.4}
    />
  );
}
function Diamond({ s = 1 }: { s?: number }) {
  return (
    <path
      transform={`scale(${s})`}
      d="M0 -10 L8 0 L0 10 L-8 0 Z"
      fill={S.anp}
      stroke={C.outline}
      strokeWidth={1.4}
    />
  );
}
function Rbc({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse rx={13} ry={9} fill={S.rbc} opacity={0.85} />
      <ellipse rx={6} ry={3.5} fill="#a43e3e" opacity={0.6} />
    </g>
  );
}
type Anchor = 'start' | 'middle' | 'end';
function Tag({
  x,
  y,
  children,
  anchor = 'start',
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: Anchor;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={13} fontWeight={700} fill={C.ink}>
      {children}
    </text>
  );
}
function Sub({
  x,
  y,
  children,
  anchor = 'start',
}: {
  x: number;
  y: number;
  children: ReactNode;
  anchor?: Anchor;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={11} fill={C.muted}>
      {children}
    </text>
  );
}

/** A small EABV gauge for the stage corner. */
function Gauge({ x, y, level }: { x: number; y: number; level: 'low' | 'normal' | 'high' }) {
  const a = level === 'low' ? -55 : level === 'high' ? 50 : 0;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path
        d="M-34 0 A34 34 0 0 1 34 0"
        fill="none"
        stroke={C.edge}
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path
        d="M-34 0 A34 34 0 0 1 -17 -29.4"
        fill="none"
        stroke="var(--ix-solid-sodium)"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <path
        d="M17 -29.4 A34 34 0 0 1 34 0"
        fill="none"
        stroke="var(--ix-solid-water)"
        strokeWidth={7}
        strokeLinecap="round"
      />
      <g
        style={{
          transform: `rotate(${a}deg)`,
          transition: 'transform 1.2s cubic-bezier(.3,1.4,.5,1)',
        }}
      >
        <path d="M0 0 L0 -28" stroke={C.ink} strokeWidth={2.5} strokeLinecap="round" />
      </g>
      <circle r={4} fill={C.ink} />
      <text y={16} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.ink}>
        EABV
      </text>
    </g>
  );
}

/* ---------- Body map (about 232 × 440) ---------- */

const LUNG =
  'M96 70 C80 70 62 84 56 112 C50 140 50 170 58 186 C64 196 82 194 92 186 C100 180 104 168 104 152 L104 86 C104 76 102 70 96 70 Z';
const KIDNEY =
  'M86 262 C72 260 62 274 62 292 C62 312 74 326 88 324 C98 322 100 312 96 304 C93 298 93 290 96 284 C100 276 98 264 86 262 Z';
const ADRENAL = 'M70 262 C74 250 84 244 92 250 C96 254 96 260 92 264 C84 262 76 262 70 262 Z';

function BodyMap({ id, p }: { id: string; p: number }) {
  const lit = (o: Organ) => LIT[p].includes(o);
  const glow = (o: Organ) => (lit(o) ? `url(#${id}-glow)` : undefined);
  const op = (o: Organ) => ({ opacity: lit(o) ? 1 : 0.45, transition: 'opacity .5s' });
  return (
    <g>
      <path
        d="M104 14 C104 6 128 6 128 14 L130 34 C150 40 186 44 196 70 C204 92 200 150 196 200 C192 260 196 330 182 380 C176 400 150 410 116 410 C82 410 56 400 50 380 C36 330 40 260 36 200 C32 150 28 92 36 70 C46 44 82 40 102 34 Z"
        fill="var(--ix-node)"
        stroke={C.outline}
        strokeWidth={1.6}
      />
      {/* lungs and airway */}
      <g style={op('lungs')} filter={glow('lungs')}>
        <path
          d="M116 40 V78 M116 78 L102 92 M116 78 L130 92"
          stroke="#b88a8a"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />
        <path d={LUNG} fill="#e9a5a5" stroke={C.outline} strokeWidth={1.4} />
        <path
          d={LUNG}
          transform="translate(232 0) scale(-1 1)"
          fill="#e9a5a5"
          stroke={C.outline}
          strokeWidth={1.4}
        />
      </g>
      {/* heart, between the lungs, to the patient's left */}
      <g style={op('heart')} filter={glow('heart')}>
        <g className={lit('heart') ? 'rs-beat' : undefined}>
          <path
            d="M126 188 C108 176 100 156 108 142 C114 132 126 134 130 142 C134 132 148 130 154 140 C162 156 148 178 126 188 Z"
            fill="#c4454f"
            stroke={C.outline}
            strokeWidth={1.4}
          />
          <path
            d="M128 138 C128 126 134 120 142 118"
            stroke="#c4454f"
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </g>
      {/* liver, on the patient's right (viewer's left) */}
      <g style={op('liver')} filter={glow('liver')}>
        <path
          d="M44 214 C50 196 92 192 132 196 C160 198 180 200 176 210 C172 220 150 226 128 234 C100 244 64 248 50 238 C42 232 40 222 44 214 Z"
          fill="#9c5a3c"
          stroke={C.outline}
          strokeWidth={1.4}
        />
        <path
          d="M112 200 C114 214 112 228 106 240"
          stroke="#7d4630"
          strokeWidth={1.4}
          fill="none"
        />
      </g>
      {/* kidneys, with the adrenal glands on top */}
      {[0, 1].map((side) => (
        <g key={side} transform={side ? 'translate(232 0) scale(-1 1)' : undefined}>
          <g style={op('kidney')} filter={glow('kidney')}>
            <path d={KIDNEY} fill="#b4646e" stroke={C.outline} strokeWidth={1.4} />
            <path
              d="M96 300 C104 306 108 330 110 360"
              stroke="#d9c26a"
              strokeWidth={3}
              fill="none"
            />
          </g>
          <g style={op('adrenal')} filter={glow('adrenal')}>
            <path d={ADRENAL} fill="var(--ix-solid-mustard)" stroke={C.outline} strokeWidth={1.2} />
          </g>
        </g>
      ))}
      <text x={116} y={432} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.ink}>
        {WHERE[p]}
      </text>
    </g>
  );
}

/* ---------- Stage: one close-up per step (about 520 × 420) ---------- */

/** The afferent arteriole, cut lengthways, with JG cells in its wall. */
function Arteriole({ p, move }: { p: number; move: boolean }) {
  const rbcs = p === 0 ? [60, 210, 380] : [60, 160, 260, 360, 460];
  return (
    <g>
      <rect
        x={20}
        y={110}
        width={480}
        height={170}
        rx={20}
        fill="var(--ix-tint-pink)"
        stroke={C.outline}
        strokeWidth={2}
      />
      <rect x={20} y={110} width={480} height={26} fill="#e8c6c6" />
      <rect x={20} y={254} width={480} height={26} fill="#e8c6c6" />
      {[300, 344, 388].map((x) => (
        <g key={x} className={p === 0 ? 'rs-pulse' : undefined}>
          <rect
            x={x}
            y={102}
            width={40}
            height={40}
            rx={12}
            fill={S.jg}
            stroke={C.outline}
            strokeWidth={1.4}
          />
          {[8, 20, 32].map((d) => (
            <circle key={d} cx={x + d} cy={128 - (d % 16)} r={3} fill="#d9c8f0" />
          ))}
        </g>
      ))}
      <Tag x={344} y={90}>
        JG cells (renin granules)
      </Tag>
      <Sub x={60} y={302}>
        Afferent arteriole, cut lengthways: blood flows left to right
      </Sub>
      {rbcs.map((x, i) =>
        move ? (
          <Flow key={i} dx={60} dy={0} delay={i * 0.4} dur={p === 0 ? 4 : 2.4}>
            <Rbc x={x} y={196 + ((i * 23) % 40) - 20} />
          </Flow>
        ) : (
          <Rbc key={i} x={x} y={196} />
        ),
      )}
    </g>
  );
}

function StepEabv({ id, move }: { id: string; move: boolean }) {
  return (
    <g>
      <Arteriole p={0} move={move} />
      <Arrow d="M150 60 V96" id={id} accent />
      <Arrow d="M40 340 V292" id={id} accent />
      <Tag x={164} y={70}>
        Less pressure, less stretch
      </Tag>
      <Sub x={164} y={86}>
        the JG cells sense it
      </Sub>
      <Gauge x={460} y={372} level="low" />
    </g>
  );
}

function StepRenin({ move }: { move: boolean }) {
  return (
    <g>
      <Arteriole p={1} move={move} />
      {[312, 356, 400].map((x, i) => (
        <Flow key={x} dx={70} dy={70} delay={i * 0.6} dur={2.6}>
          <g transform={`translate(${x + 8} 150)`}>
            <Renin s={0.8} />
          </g>
        </Flow>
      ))}
      <Tag x={30} y={60}>
        Renin is released into the blood
      </Tag>
      <Sub x={30} y={78}>
        and carried away in the circulation
      </Sub>
    </g>
  );
}

function StepAngI() {
  return (
    <g>
      <rect
        x={10}
        y={60}
        width={500}
        height={300}
        rx={24}
        fill="var(--ix-tint-pink)"
        opacity={0.6}
      />
      <path
        d="M70 210 C60 170 90 140 130 146 C170 140 200 164 196 200 C202 240 170 268 128 262 C88 266 62 246 70 210 Z"
        fill="var(--ix-tint-mustard)"
        stroke={C.outline}
        strokeWidth={1.8}
      />
      <Tag x={130} y={300} anchor="middle">
        Angiotensinogen
      </Tag>
      <Sub x={130} y={316} anchor="middle">
        made by the liver
      </Sub>
      <g className="rs-free">
        <g transform="translate(210 204)">
          <Beads n={10} fill={S.angI} />
        </g>
      </g>
      <g className="rs-cut">
        <g transform="translate(205 160)">
          <Renin s={1.3} />
        </g>
      </g>
      <Tag x={230} y={130}>
        Renin cuts here
      </Tag>
      <Tag x={330} y={246} anchor="middle">
        Angiotensin I
      </Tag>
      <Sub x={330} y={262} anchor="middle">
        10 amino acids, released
      </Sub>
    </g>
  );
}

function StepAngII() {
  return (
    <g>
      <rect
        x={10}
        y={40}
        width={500}
        height={250}
        rx={24}
        fill="var(--ix-tint-pink)"
        opacity={0.6}
      />
      <rect
        x={10}
        y={290}
        width={500}
        height={60}
        rx={14}
        fill="#f1d9cf"
        stroke={C.outline}
        strokeWidth={1.6}
      />
      {[50, 150, 250, 350, 450].map((x) => (
        <ellipse key={x} cx={x} cy={322} rx={22} ry={10} fill="#d6a99a" />
      ))}
      {[120, 300].map((x) => (
        <g key={x} transform={`translate(${x} 290)`}>
          <path
            d="M0 0 V-26 M0 -26 L-12 -40 M0 -26 L12 -40"
            stroke="var(--ix-solid-mustard)"
            strokeWidth={6}
            strokeLinecap="round"
            fill="none"
          />
        </g>
      ))}
      <Sub x={20} y={372}>
        Lining of a blood vessel: ACE sits on its surface (much of it in the lungs)
      </Sub>
      <Tag x={160} y={212}>
        ACE clips two off
      </Tag>
      <g className="rs-fade">
        <g transform="translate(130 234)">
          <Beads n={10} fill={S.angI} snip={2} />
        </g>
      </g>
      <g className="rs-free2">
        <g transform="translate(130 160)">
          <Beads n={8} fill={S.angII} />
        </g>
      </g>
      <Tag x={130} y={136}>
        Angiotensin II (8 amino acids)
      </Tag>
      <g className="rs-pop">
        <rect
          x={340}
          y={56}
          width={160}
          height={28}
          rx={14}
          fill="var(--ix-tint-sodium)"
          stroke={C.outline}
        />
        <Tag x={420} y={75} anchor="middle">
          vessels constrict
        </Tag>
        <rect
          x={340}
          y={92}
          width={160}
          height={28}
          rx={14}
          fill="var(--ix-tint-water)"
          stroke={C.outline}
        />
        <Tag x={420} y={111} anchor="middle">
          thirst and ADH
        </Tag>
        <rect
          x={340}
          y={128}
          width={160}
          height={28}
          rx={14}
          fill="var(--ix-tint-green)"
          stroke={C.outline}
        />
        <Tag x={420} y={147} anchor="middle">
          aldosterone (next)
        </Tag>
      </g>
    </g>
  );
}

function StepAldo() {
  return (
    <g>
      <g transform="translate(60 0)">
        <path
          d="M60 120 C80 70 250 60 300 100 C340 130 336 300 296 330 C250 364 90 360 64 320 C40 280 44 160 60 120 Z"
          fill="var(--ix-tint-mustard)"
          stroke={C.outline}
          strokeWidth={2}
        />
        <circle cx={180} cy={220} r={34} fill="#e6d3a0" stroke={C.outline} strokeWidth={1.4} />
        <Tag x={180} y={384} anchor="middle">
          Adrenal cortex cell
        </Tag>
        <path
          d="M58 200 h-12 M58 230 h-12"
          stroke={C.outline}
          strokeWidth={4}
          strokeLinecap="round"
        />
      </g>
      {[0, 1].map((i) => (
        <Flow key={i} dx={22} dy={0} delay={i * 1.1} dur={2.2}>
          <g transform={`translate(4 ${200 + i * 30})`}>
            <Beads n={8} fill={S.angII} r={4.5} gap={10} />
          </g>
        </Flow>
      ))}
      <Sub x={6} y={180}>
        angiotensin II binds
      </Sub>
      {[0, 1, 2, 3].map((i) => (
        <Flow key={i} dx={110} dy={(i - 1.5) * 40} delay={i * 0.55} dur={2.6}>
          <g transform="translate(340 220)">
            <Hex s={1.3} />
          </g>
        </Flow>
      ))}
      <Tag x={512} y={140} anchor="end">
        Aldosterone
      </Tag>
      <Tag x={512} y={156} anchor="end">
        released
      </Tag>
    </g>
  );
}

/** A collecting-duct principal cell: blood on the left, urine on the right. */
function DuctCell({ p }: { p: number }) {
  const on = p >= 5;
  return (
    <g>
      <rect
        x={10}
        y={40}
        width={110}
        height={320}
        rx={16}
        fill="var(--ix-tint-pink)"
        opacity={0.7}
      />
      <Tag x={65} y={30} anchor="middle">
        Blood
      </Tag>
      <rect
        x={400}
        y={40}
        width={110}
        height={320}
        rx={16}
        fill="var(--ix-tint-mustard)"
        opacity={0.7}
      />
      <Tag x={455} y={30} anchor="middle">
        Urine
      </Tag>
      <rect
        x={130}
        y={60}
        width={260}
        height={280}
        rx={28}
        fill="var(--ix-node)"
        stroke={C.outline}
        strokeWidth={2}
      />
      <circle cx={250} cy={200} r={42} fill="#d9d4ec" stroke={C.outline} strokeWidth={1.4} />
      <Sub x={250} y={258} anchor="middle">
        nucleus
      </Sub>
      <Tag x={260} y={384} anchor="middle">
        Principal cell of the collecting duct
      </Tag>
      {on &&
        [110, 170, 230, 290].map((y) => (
          <g key={y} className="rs-pop">
            <rect
              x={384}
              y={y - 12}
              width={14}
              height={24}
              rx={4}
              fill={S.angII}
              stroke={C.outline}
            />
          </g>
        ))}
      {on && (
        <Tag x={392} y={84} anchor="middle">
          ENaC
        </Tag>
      )}
      {[140, 260].map((y) => (
        <circle
          key={y}
          cx={130}
          cy={y}
          r={12}
          fill="#c9b6e6"
          stroke={C.outline}
          strokeWidth={1.2}
        />
      ))}
      <Sub x={146} y={300}>
        Na⁺/K⁺ pump
      </Sub>
    </g>
  );
}

function StepEnac() {
  return (
    <g>
      <DuctCell p={5} />
      {[0, 1, 2].map((i) => (
        <Flow key={i} dx={130} dy={(1 - i) * 30} delay={i * 0.7} dur={2.4}>
          <g transform={`translate(70 ${170 + i * 30})`}>
            <Hex />
          </g>
        </Flow>
      ))}
      <Sub x={20} y={140}>
        aldosterone enters
      </Sub>
    </g>
  );
}

function StepSodium() {
  return (
    <g>
      <DuctCell p={6} />
      {[110, 170, 230, 290].map((y, i) => (
        <Flow key={`na${y}`} dx={-370} dy={0} delay={i * 0.5} dur={3}>
          <Ion x={460} y={y} fill="var(--ix-solid-sodium)" r={7} />
        </Flow>
      ))}
      {[150, 250].map((y, i) => (
        <Flow key={`k${y}`} dx={370} dy={0} delay={i * 0.9 + 0.4} dur={3}>
          <Ion x={70} y={y} fill={S.k} r={6} />
        </Flow>
      ))}
      {[200, 320].map((y, i) => (
        <Flow key={`w${y}`} dx={-370} dy={0} delay={i * 1.1 + 0.8} dur={3.4}>
          <Droplet x={460} y={y} s={1} />
        </Flow>
      ))}
      <g transform="translate(150 404)">
        <Ion x={0} y={-4} fill="var(--ix-solid-sodium)" r={6} />
        <Sub x={12} y={0}>
          Na⁺ kept
        </Sub>
        <Ion x={90} y={-4} fill={S.k} r={6} />
        <Sub x={102} y={0}>
          K⁺ out
        </Sub>
        <Droplet x={176} y={-4} s={0.8} />
        <Sub x={188} y={0}>
          water follows
        </Sub>
      </g>
    </g>
  );
}

function StepCounter() {
  return (
    <g>
      <g className="rs-stretch">
        <path
          d="M130 300 C70 262 50 196 74 160 C92 134 124 138 134 160 C144 134 182 128 198 154 C222 196 190 262 130 300 Z"
          fill="#c4454f"
          stroke={C.outline}
          strokeWidth={2}
        />
      </g>
      <Tag x={130} y={330} anchor="middle">
        Stretched heart
      </Tag>
      {[0, 1, 2, 3].map((i) => (
        <Flow key={i} dx={180} dy={(i - 1.5) * 18} delay={i * 0.5} dur={2.6}>
          <g transform="translate(200 210)">
            <Diamond s={1.3} />
          </g>
        </Flow>
      ))}
      <Tag x={290} y={150} anchor="middle">
        ANP and BNP
      </Tag>
      <path
        d="M420 140 C396 138 380 166 380 200 C380 240 398 270 424 268 C442 266 446 248 438 234 C432 224 432 210 438 200 C448 186 446 142 420 140 Z"
        fill="#b4646e"
        stroke={C.outline}
        strokeWidth={2}
      />
      {[0, 1, 2].map((i) => (
        <Flow key={i} dx={0} dy={90} delay={i * 0.6} dur={2.4}>
          <Ion x={430 + (i - 1) * 12} y={276} fill="var(--ix-solid-sodium)" r={6} />
        </Flow>
      ))}
      <Tag x={414} y={120} anchor="middle">
        Kidney excretes sodium
      </Tag>
    </g>
  );
}

function Stage({ id, p, move }: { id: string; p: number; move: boolean }) {
  const level = p === 6 ? 'normal' : p === 7 ? 'high' : 'low';
  return (
    <g key={p} className="rs-stage">
      {p === 0 && <StepEabv id={id} move={move} />}
      {p === 1 && <StepRenin move={move} />}
      {p === 2 && <StepAngI />}
      {p === 3 && <StepAngII />}
      {p === 4 && <StepAldo />}
      {p === 5 && <StepEnac />}
      {p === 6 && <StepSodium />}
      {p === 7 && <StepCounter />}
      {p > 0 && <Gauge x={470} y={404} level={level} />}
    </g>
  );
}

function Legend() {
  const items: [ReactNode, string][] = [
    [<Renin key="r" s={0.55} />, 'renin'],
    [
      <g key="c" transform="translate(-12 0)">
        <Beads n={3} fill={S.angI} r={5} gap={12} />
      </g>,
      'angiotensin I',
    ],
    [
      <g key="a" transform="translate(-12 0)">
        <Beads n={3} fill={S.angII} r={5} gap={12} />
      </g>,
      'angiotensin II',
    ],
    [<Hex key="h" s={0.75} />, 'aldosterone'],
    [<Diamond key="d" s={0.8} />, 'ANP, BNP'],
  ];
  return (
    <ul className="ix-legend rs-legend">
      {items.map(([g, t]) => (
        <li key={t}>
          <svg width="40" height="22" viewBox="-20 -11 40 22" aria-hidden="true">
            {g}
          </svg>
          {t}
        </li>
      ))}
    </ul>
  );
}

function Glow({ id }: { id: string }) {
  return (
    <defs>
      <filter id={`${id}-glow`} x="-60%" y="-60%" width="220%" height="220%">
        <feDropShadow
          dx="0"
          dy="0"
          stdDeviation="5"
          floodColor="var(--ix-accent)"
          floodOpacity="0.75"
        />
      </filter>
    </defs>
  );
}

export function RaasCascade() {
  const s = useSteps(PHASES.length, 4200);
  const p = s.step;
  const move = !useReducedMotion();
  const wide: Layout = {
    w: 780,
    h: 444,
    draw: (id) => (
      <g>
        <Glow id={id} />
        <BodyMap id={id} p={p} />
        <line
          x1={246}
          y1={20}
          x2={246}
          y2={420}
          stroke={C.edge}
          strokeWidth={1.4}
          strokeDasharray="4 5"
        />
        <g transform="translate(258 8)">
          <Stage id={id} p={p} move={move} />
        </g>
      </g>
    ),
  };
  const narrow: Layout = {
    w: 360,
    h: 484,
    draw: (id) => (
      <g>
        <Glow id={id} />
        <g transform="translate(131 0) scale(0.42)">
          <BodyMap id={id} p={p} />
        </g>
        <g transform="translate(2 190) scale(0.685)">
          <Stage id={id} p={p} move={move} />
        </g>
      </g>
    ),
  };
  return (
    <Frame
      title="A fall in effective arterial blood volume sets off a cascade that ends with the kidney keeping sodium"
      keyText="Left: where each step happens. Right: the step itself, close up."
      note="Teaching model: shapes are schematic and not to scale. Step through, or press Play to run it."
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
