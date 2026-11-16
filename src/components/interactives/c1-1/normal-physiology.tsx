'use client';
/*
 * C1.1 interactive I2: both systems in a healthy person.
 * Qualitative teaching model. Levels run 0–4: very low, low, normal, high, very high.
 * The levels match the version reviewed in the lesson master copy (Claude Docs).
 */
import { useState } from 'react';
import { Frame } from '../kit';

const SCALE = ['very low', 'low', 'normal', 'high', 'very high'] as const;
const SHORT = ['v. low', 'low', 'normal', 'high', 'v. high'] as const;

const GROUPS = [
  { name: 'What the body senses', rows: ['Plasma osmolality', 'Arterial filling'] },
  { name: 'Water system', rows: ['ADH', 'Thirst'] },
  { name: 'Sodium system', rows: ['Renin and aldosterone', 'ANP and BNP'] },
  { name: 'What the kidney does', rows: ['Urine osmolality', 'Urine sodium'] },
];

export const SITUATIONS = [
  {
    key: 'base',
    label: 'Baseline',
    levels: [2, 2, 2, 2, 2, 2, 2, 2],
    lead: 'Both sensors are content, so both systems tick over at their usual level.',
    detail: 'Pick a situation to disturb the balance.',
  },
  {
    key: 'water',
    label: 'Drink 1 L of water',
    levels: [1, 2, 0, 0, 2, 2, 0, 1],
    lead: 'Osmolality falls, so ADH switches off and thirst fades.',
    detail: 'The kidney makes large volumes of dilute urine until the extra water is gone.',
  },
  {
    key: 'salt',
    label: 'Very salty meal',
    levels: [3, 3, 3, 3, 1, 3, 3, 3],
    lead: 'Osmolality rises first, so ADH and thirst switch on and water is kept.',
    detail:
      'The ECF expands, the RAAS switches down, natriuretic peptides rise and the sodium is excreted.',
  },
  {
    key: 'dry',
    label: 'No water for a day',
    levels: [3, 1, 4, 4, 3, 1, 4, 1],
    lead: 'Osmolality climbs and arterial filling dips, so ADH and thirst rise strongly.',
    detail: 'Urine becomes small in volume and highly concentrated; the RAAS helps hold sodium.',
  },
  {
    key: 'blood',
    label: 'Blood loss',
    levels: [2, 0, 3, 3, 4, 0, 3, 0],
    lead: 'Whole blood is lost, so osmolality barely moves but arterial filling falls sharply.',
    detail: 'The RAAS works hard, and ADH switches on with no osmotic signal at all: volume wins.',
  },
] as const;

type Key = (typeof SITUATIONS)[number]['key'];

export function NormalPhysiology() {
  const [key, setKey] = useState<Key>('base');
  const s = SITUATIONS.find((x) => x.key === key) ?? SITUATIONS[0];
  let row = -1;
  return (
    <Frame
      title="Choose a situation and watch the water and sodium systems respond"
      note="Qualitative teaching model: the bars show direction of change, not measured values."
    >
      <div className="ix-choices" role="group" aria-label="Situations">
        {SITUATIONS.map((x) => (
          <button
            key={x.key}
            type="button"
            className="ix-choice"
            aria-pressed={x.key === key}
            onClick={() => setKey(x.key)}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div className="ix-meters">
        <span />
        <div className="ix-meter-scale" aria-hidden="true">
          {SCALE.map((l, i) => (
            <span key={l}>
              <span className="long">{l}</span>
              <span className="short">{SHORT[i]}</span>
            </span>
          ))}
        </div>
        {GROUPS.map((g) => (
          <div key={g.name} style={{ display: 'contents' }}>
            <p className="ix-group">{g.name}</p>
            {g.rows.map((label) => {
              row += 1;
              const level = s.levels[row];
              return (
                <div key={label} style={{ display: 'contents' }}>
                  <span>{label}</span>
                  <div className="ix-meter">
                    {SCALE.map((l, c) => (
                      <span
                        key={l}
                        className={`${c === 2 ? 'mid' : ''}${c === level ? ' on' : ''}`}
                        aria-hidden="true"
                      />
                    ))}
                    <span className="ix-sr">
                      {label}: {SCALE[level]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="ix-readout" aria-live="polite">
        <p>
          <strong>{s.lead}</strong>
        </p>
        <p className="ix-sub">{s.detail}</p>
      </div>
    </Frame>
  );
}
