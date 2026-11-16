'use client';
/*
 * C1.1 interactive I1: concentration, not amount.
 * A toy model: the lab reports sodium per litre, so the result follows
 * amount ÷ water. Calibrated so 14 units in 1.00 × normal water reads 140 mmol/L,
 * matching the lesson's three beakers (normal, extra water, heart failure).
 */
import { useId, useState } from 'react';
import { C, Frame, Ion } from '../kit';

const PRESETS = [
  { key: 'normal', label: 'Normal', units: 14, water: 1 },
  { key: 'water', label: 'Extra water', units: 14, water: 1.12 },
  { key: 'hf', label: 'Seen in heart failure', units: 15, water: 1.2 },
] as const;

export function result(units: number, water: number) {
  return Math.round((140 * (units / 14)) / water);
}

export function interpret(units: number, water: number) {
  const na = result(units, water);
  if (na >= 135 && na <= 145) return 'Within the usual reference interval (135–145 mmol/L).';
  if (na < 135) {
    if (units >= 14)
      return 'Low result, yet the body holds as much sodium as normal or more: the cause is too much water.';
    if (water <= 1) return 'Low result because sodium has been lost while water stayed the same.';
    return 'Low result from both directions: sodium lost and water gained.';
  }
  if (units <= 14) return 'High result without any extra sodium: water has been lost.';
  if (water >= 1) return 'High result from extra sodium on board.';
  return 'High result from both directions: sodium gained and water lost.';
}

// Deterministic, evenly spread dot positions (no randomness, so server and client agree).
const frac = (v: number) => v - Math.floor(v);

function Beaker({ units, water }: { units: number; water: number }) {
  const left = 44,
    right = 196,
    bottom = 228,
    perUnitWater = 118;
  const h = perUnitWater * water;
  const top = bottom - h;
  const dots = Array.from({ length: units }, (_, i) => ({
    x: left + 16 + frac(0.5 + i * 0.7548777) * (right - left - 32),
    y: top + 18 + frac(0.5 + i * 0.5698403) * (h - 30),
  }));
  // Gentle meniscus on the water surface.
  const surface = `M${left} ${top + 3}Q${(left + right) / 2} ${top - 4} ${right} ${top + 3}`;
  const glass = `M${left - 6} 34H${left}V${bottom - 12}Q${left} ${bottom} ${left + 12} ${bottom}H${right - 12}Q${right} ${bottom} ${right} ${bottom - 12}V34H${right + 6}`;
  return (
    <svg
      className="ix-svg ix-beaker"
      viewBox="0 0 240 256"
      role="img"
      aria-label={`Beaker with ${units} units of sodium in ${water.toFixed(2)} times the normal water`}
    >
      <ellipse cx={120} cy={bottom + 12} rx={92} ry={8} fill={C.drop} />
      <path
        d={`${surface}V${bottom - 12}Q${right} ${bottom} ${right - 12} ${bottom}H${left + 12}Q${left} ${bottom} ${left} ${bottom - 12}Z`}
        fill={C.water}
        fillOpacity={0.24}
      />
      <path d={surface} fill="none" stroke={C.water} strokeWidth={2} strokeLinecap="round" />
      {[0.4, 0.6, 0.8, 1, 1.2].map((v) => (
        <path
          key={v}
          d={`M${right} ${bottom - perUnitWater * v}h-${v === 1 ? 16 : 9}`}
          stroke={C.outline}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ))}
      <text
        x={right + 10}
        y={bottom - perUnitWater + 4}
        fontSize={11}
        fontWeight={600}
        fill={C.muted}
      >
        normal
      </text>
      {dots.map((d, i) => (
        <Ion key={i} x={d.x} y={d.y} fill={C.sodium} />
      ))}
      <path
        d={`M${left + 12} 52V${bottom - 26}`}
        stroke={C.highlight}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d={glass}
        fill="none"
        stroke={C.outline}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ConcentrationBeaker() {
  const [units, setUnits] = useState(14);
  const [water, setWater] = useState(1);
  const uid = useId();
  const na = result(units, water);
  const preset = PRESETS.find((p) => p.units === units && p.water === water)?.key;
  const flagged = na < 135 || na > 145;
  return (
    <Frame
      title="Add water and the sodium result falls, even with more sodium on board"
      keyText="Each orange dot is a unit of sodium; the blue fill is body water. Move the sliders or pick a preset."
      note="Toy model: the result is amount ÷ volume, set so that 14 units in normal water reads 140 mmol/L."
    >
      <div className="ix-choices" role="group" aria-label="Presets">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className="ix-choice"
            aria-pressed={preset === p.key}
            onClick={() => {
              setUnits(p.units);
              setWater(p.water);
            }}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="ix-row">
        <Beaker units={units} water={water} />
        <div className="ix-row-side">
          <div className="ix-controls ix-controls-stack">
            <label className="ix-control" htmlFor={`${uid}-na`}>
              <span className="ix-control-head">
                <span>Sodium amount</span>
                <output htmlFor={`${uid}-na`}>{units} units</output>
              </span>
              <input
                id={`${uid}-na`}
                type="range"
                min={10}
                max={20}
                step={1}
                value={units}
                onChange={(e) => setUnits(Number(e.target.value))}
              />
            </label>
            <label className="ix-control" htmlFor={`${uid}-w`}>
              <span className="ix-control-head">
                <span>Body water</span>
                <output htmlFor={`${uid}-w`}>{water.toFixed(2)} × normal</output>
              </span>
              <input
                id={`${uid}-w`}
                type="range"
                min={0.8}
                max={1.4}
                step={0.02}
                value={water}
                onChange={(e) => setWater(Number(Number(e.target.value).toFixed(2)))}
              />
            </label>
          </div>
          <div className={`ix-readout${flagged ? ' ix-readout-warn' : ''}`} aria-live="polite">
            <p>
              Lab result: <span className="ix-big">{na} mmol/L</span>
            </p>
            <p className="ix-sub">{interpret(units, water)}</p>
          </div>
        </div>
      </div>
    </Frame>
  );
}
