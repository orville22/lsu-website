'use client';
/*
 * C1.2 interactive I2: effective and ineffective osmoles.
 * Add 60 mmol/kg of one solute to the fluid around a cell. Each choice plays on
 * a loop: the solute arrives, then either water leaves and the cell shrinks
 * (sodium, glucose without insulin) or the solute spreads into the cell and
 * nothing moves (urea, ethanol, glucose with insulin). Cell water follows the
 * simple osmometer relation (volume ∝ 1 / tonicity); the drawn area matches it.
 */
import { useState, type CSSProperties } from 'react';
import { Arrow, C, CellBlob, Droplet, Frame, Ion, Responsive, type Layout } from '../kit';
import { LoopBar, useLoop } from '../loop';

export const BASE = 290;
export const ADDED = 60;

const SOLUTES = [
  {
    key: 'none',
    label: 'Nothing added',
    effective: false,
    colour: '',
    text: 'Inside and outside both sit at 290 mmol/kg, so water has no reason to move. Pick a solute to add.',
  },
  {
    key: 'na',
    label: 'Sodium salt',
    effective: true,
    colour: C.sodium,
    text: 'Sodium is pumped back out of cells, so it stays outside. Water follows it out and the cell shrinks.',
  },
  {
    key: 'glu',
    label: 'Glucose, no insulin',
    effective: true,
    colour: 'var(--ix-solid-green)',
    text: 'Without insulin, glucose builds up outside many cells, so it pulls water out just as sodium does. This is what happens in uncontrolled diabetes.',
  },
  {
    key: 'gluIns',
    label: 'Glucose, with insulin',
    effective: false,
    colour: 'var(--ix-solid-green)',
    text: 'With insulin working, glucose moves into cells and is used, so it doesn’t stay outside to pull water out. Some organs, such as the brain and liver, take up glucose without insulin.',
  },
  {
    key: 'urea',
    label: 'Urea',
    effective: false,
    colour: 'var(--ix-solid-mustard)',
    text: 'Urea crosses the membrane and spreads to both sides. Osmolality rises, but tonicity and cell size don’t.',
  },
  {
    key: 'eth',
    label: 'Ethanol',
    effective: false,
    colour: 'var(--ix-solid-pink)',
    text: 'Ethanol crosses just as freely. It raises the measured osmolality, and the osmolal gap, but moves no water.',
  },
] as const;

export type SoluteKey = (typeof SOLUTES)[number]['key'];

export function cellState(key: SoluteKey) {
  const s = SOLUTES.find((x) => x.key === key)!;
  const osm = key === 'none' ? BASE : BASE + ADDED;
  const tonicity = s.effective ? osm : BASE;
  const waterChange = Math.round((BASE / tonicity - 1) * 100);
  return { osm, tonicity, waterChange, effective: s.effective };
}

const PHASES = ['Before', 'Solute added', 'Response'];
const DURATIONS = [1200, 1800, 5200];

const OUT = [
  [44, 66],
  [90, 58],
  [214, 58],
  [256, 72],
  [40, 124],
  [262, 128],
  [38, 190],
  [260, 192],
  [56, 222],
  [120, 228],
  [190, 226],
  [248, 220],
  [70, 96],
  [232, 100],
];
const IN = [
  [134, 122],
  [168, 116],
  [150, 152],
  [126, 162],
  [174, 166],
  [154, 98],
];
/** Where added particles land; the last three move into the cell for solutes that cross. */
const ADD = [
  [60, 80],
  [240, 88],
  [44, 152],
  [256, 158],
  [72, 206],
  [230, 206],
  [150, 52],
  [150, 234],
  [266, 104],
];
const INTO = [
  [142, 136],
  [166, 144],
  [148, 176],
];
const ANGLES = [0, Math.PI / 4, (3 * Math.PI) / 4, Math.PI, (5 * Math.PI) / 4, (7 * Math.PI) / 4];

const flow = (dx: number, dy: number, delay: number) =>
  ({
    '--dx': `${dx}px`,
    '--dy': `${dy}px`,
    '--delay': `${delay}s`,
    '--dur': '1.8s',
  }) as CSSProperties;

function Beaker({ id, solute, p }: { id: string; solute: (typeof SOLUTES)[number]; p: number }) {
  const st = cellState(solute.key);
  const cx = 150,
    cy = 144,
    r0 = 62;
  const scale = st.effective && p >= 2 ? Math.sqrt(BASE / st.tonicity) : 1;
  const none = solute.key === 'none';
  const crosses = !none && !st.effective;
  return (
    <g>
      <ellipse cx={150} cy={252} rx={128} ry={8} fill={C.drop} />
      <path
        d="M20 40H280V226Q280 240 266 240H34Q20 240 20 226Z"
        fill={C.water}
        fillOpacity={0.16}
      />
      <path d="M20 40H280" stroke={C.water} strokeWidth={2} strokeLinecap="round" />
      {OUT.map(([x, y]) => (
        <circle key={`o${x}-${y}`} cx={x} cy={y} r={3.5} fill={C.muted} opacity={0.65} />
      ))}
      {st.effective && (
        <circle
          cx={cx}
          cy={cy}
          r={r0}
          fill="none"
          stroke={C.muted}
          strokeWidth={1.3}
          strokeDasharray="4 4"
        />
      )}
      <CellBlob cx={cx} cy={cy} r={r0} seed={2} scale={scale} slow>
        {IN.map(([x, y]) => (
          <circle key={`i${x}-${y}`} cx={x} cy={y} r={3.5} fill={C.muted} opacity={0.65} />
        ))}
      </CellBlob>
      {!none &&
        ADD.map(([x, y], i) => {
          const moves = crosses && i >= ADD.length - 3 && p >= 2;
          const [tx, ty] = moves ? INTO[i - (ADD.length - 3)] : [x, y];
          return (
            <g
              key={`a${x}-${y}`}
              className={moves ? 'ix-anim-slow' : 'ix-anim'}
              style={{
                transformBox: 'view-box',
                opacity: p >= 1 ? 1 : 0,
                transform: p >= 1 ? `translate(${tx - x}px, ${ty - y}px)` : `translate(0, -70px)`,
              }}
            >
              <Ion x={x} y={y} r={6.5} fill={solute.colour} />
            </g>
          );
        })}
      {st.effective &&
        p >= 2 &&
        ANGLES.map((a, i) => {
          const r = r0 * scale + 6;
          return (
            <g key={a}>
              <Arrow
                id={id}
                d={`M${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}L${cx + (r + 24) * Math.cos(a)} ${cy + (r + 24) * Math.sin(a)}`}
                accent
              />
              <g className="ix-flow" style={flow(24 * Math.cos(a), 24 * Math.sin(a), i * 0.3)}>
                <Droplet x={cx + r * Math.cos(a)} y={cy + r * Math.sin(a)} s={0.65} />
              </g>
            </g>
          );
        })}
      <path
        d="M14 22H20V226Q20 240 34 240H266Q280 240 280 226V22H286"
        fill="none"
        stroke={C.outline}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M30 56V220" stroke={C.highlight} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
}

const signed = (n: number) => (n < 0 ? `−${-n}%` : n > 0 ? `+${n}%` : 'no change');

export function CellTonicity() {
  const [key, setKey] = useState<SoluteKey>('na');
  const loop = useLoop(DURATIONS, key);
  const p = loop.phase;
  const solute = SOLUTES.find((s) => s.key === key)!;
  const st = cellState(key);
  const shown = {
    osm: p >= 1 ? st.osm : BASE,
    tonicity: p >= 2 ? st.tonicity : BASE,
    water: p >= 2 ? st.waterChange : 0,
  };
  const layout = (w: number): Layout => ({
    w,
    h: 262,
    draw: (id) => <Beaker id={id} solute={solute} p={p} />,
  });
  return (
    <Frame
      title="Only particles that stay outside the cell pull water out of it"
      keyText="Add 60 mmol/kg of one solute to the fluid around a cell. Grey dots are the particles already there; the coloured balls are what you added."
      note="Teaching model: the cell is treated as a simple osmometer, and its drawn area is in proportion to its water."
    >
      <div className="ix-choices" role="group" aria-label="Solute to add">
        {SOLUTES.map((s) => (
          <button
            key={s.key}
            type="button"
            className="ix-choice"
            aria-pressed={key === s.key}
            onClick={() => setKey(s.key)}
          >
            {s.colour && (
              <span className="ix-swatch" style={{ background: s.colour }} aria-hidden="true" />
            )}
            {s.label}
          </button>
        ))}
      </div>
      {key !== 'none' && <LoopBar labels={PHASES} {...loop} />}
      <div className="ix-row">
        <Responsive
          name="c1-2-cell"
          label={`A cell in fluid after adding ${solute.label.toLowerCase()}`}
          wide={layout(300)}
          narrow={layout(300)}
        />
        <div className="ix-row-side">
          <div className="ix-readout" aria-live="polite">
            <p>
              <strong>
                {st.effective && p >= 2
                  ? 'Water leaves the cell and it shrinks'
                  : 'No net water movement'}
              </strong>
            </p>
            <dl className="ix-stats">
              <div>
                <dt>Measured osmolality</dt>
                <dd>{shown.osm} mmol/kg</dd>
              </div>
              <div>
                <dt>Tonicity (effective osmolality)</dt>
                <dd className={shown.tonicity > BASE ? 'ix-hot' : undefined}>
                  {shown.tonicity} mmol/kg
                </dd>
              </div>
              <div>
                <dt>Cell water</dt>
                <dd className={shown.water ? 'ix-hot' : undefined}>{signed(shown.water)}</dd>
              </div>
            </dl>
            <p className="ix-sub">{solute.text}</p>
          </div>
        </div>
      </div>
    </Frame>
  );
}
