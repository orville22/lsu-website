/* C1.1 visual 8: reading the spot urine. Cut-offs from the European hyponatraemia guideline. */
import { Arrow, Frame, Label, Node, Responsive, edges, type NodeSpec } from '../kit';

type Spec = Omit<NodeSpec, 'x' | 'y' | 'w'>;
const Q: Spec[] = [
  {
    icon: 'flask',
    hue: 'mustard',
    title: 'Is plasma truly hypotonic?',
    body: 'measured osmolality low',
    tone: 'question',
  },
  {
    icon: 'tube',
    hue: 'mustard',
    title: 'Urine osmolality 100 or less?',
    body: 'mmol/kg',
    tone: 'question',
  },
  {
    icon: 'tube',
    hue: 'mustard',
    title: 'Urine sodium 30 or less?',
    body: 'mmol/L, no recent diuretic',
    tone: 'question',
  },
];
const O = (narrow: boolean): Spec[] => [
  {
    title: 'Not a true water excess',
    body: narrow
      ? ['think artefact or another', 'solute (C1.3, C1.4)']
      : 'think artefact or another solute (C1.3, C1.4)',
  },
  { title: 'ADH is off', body: 'water intake outruns the kidney' },
  {
    icon: 'question',
    title: 'Low arterial filling: our patient',
    body: 'ADH on and the kidney keeping sodium',
    tone: 'accent',
  },
  { title: 'ADH on, sodium being lost', body: 'diuretics, kidney disease, SIAD (C1.3)' },
];
// Branch labels: [to the side, onward]
const BRANCH: [string, string][] = [
  ['no', 'yes'],
  ['yes', 'no'],
  ['yes', 'no'],
];

export function SpotUrine() {
  return (
    <Frame
      title="Three questions read the spot urine; our patient lands on low arterial filling"
      keyText="Shaded boxes are questions; cut-offs from the European hyponatraemia guideline."
    >
      <Responsive
        name="spot-urine"
        label="Three questions read the spot urine; our patient lands on low effective arterial blood volume"
        wide={{
          w: 760,
          h: 384,
          draw: (id) => {
            const rows = [36, 140, 244, 348];
            const q: NodeSpec[] = Q.map((s, i) => ({ ...s, x: 190, y: rows[i], w: 300 }));
            const o = O(false);
            const side: NodeSpec[] = o
              .slice(0, 3)
              .map((s, i) => ({ ...s, x: 560, y: rows[i], w: 330 }));
            const last: NodeSpec = { ...o[3], x: 190, y: rows[3], w: 300 };
            const onward = [...q.slice(1), last];
            return (
              <>
                {q.map((n, i) => (
                  <g key={i}>
                    <Arrow id={id} d={`M${edges(n).right} ${n.y}H${edges(side[i]).left}`} />
                    <Arrow id={id} d={`M${n.x} ${edges(n).bottom}V${edges(onward[i]).top}`} />
                    <Label x={368} y={n.y - 8}>
                      {BRANCH[i][0]}
                    </Label>
                    <Label x={n.x + 10} y={edges(n).bottom + 34} anchor="start">
                      {BRANCH[i][1]}
                    </Label>
                  </g>
                ))}
                {[...q, ...side, last].map((n, i) => (
                  <Node key={i} {...n} />
                ))}
              </>
            );
          },
        }}
        narrow={{
          w: 360,
          h: 540,
          draw: (id) => {
            const o = O(true);
            const q: NodeSpec[] = Q.map((s, i) => ({ ...s, x: 180, y: 28 + i * 156, w: 320 }));
            const side: NodeSpec[] = o
              .slice(0, 3)
              .map((s, i) => ({ ...s, x: 215, y: q[i].y + 80, w: 270 }));
            const last: NodeSpec = { ...o[3], x: 180, y: q[2].y + 168, w: 320 };
            const onward = [...q.slice(1), last];
            return (
              <>
                {q.map((n, i) => (
                  <g key={i}>
                    <Arrow id={id} d={`M280 ${edges(n).bottom}V${edges(side[i]).top}`} />
                    <Arrow id={id} d={`M50 ${edges(n).bottom}V${edges(onward[i]).top}`} />
                    <Label x={288} y={edges(n).bottom + 18} anchor="start">
                      {BRANCH[i][0]}
                    </Label>
                    <Label x={42} y={edges(n).bottom + 18} anchor="end">
                      {BRANCH[i][1]}
                    </Label>
                  </g>
                ))}
                {[...q, ...side, last].map((n, i) => (
                  <Node key={i} {...n} />
                ))}
              </>
            );
          },
        }}
      />
    </Frame>
  );
}
