/* C1.1 visual 5: the RAAS cascade, with natriuretic peptides as the counterweight. */
import { Arrow, Frame, Label, Node, Responsive, edges, type NodeSpec } from '../kit';

const STEPS: Omit<NodeSpec, 'x' | 'y' | 'w'>[] = [
  { icon: 'vessel', hue: 'sodium', title: 'Low filling', body: 'underfilled arteries' },
  { icon: 'kidney', hue: 'sodium', title: 'Renin', body: 'juxtaglomerular cells' },
  { icon: 'hormone', hue: 'sodium', title: 'Angiotensin I', body: 'from angiotensinogen' },
  { icon: 'hormone', hue: 'sodium', title: 'Angiotensin II', body: 'made by ACE' },
  { icon: 'gland', hue: 'sodium', title: 'Aldosterone', body: 'adrenal cortex' },
  { icon: 'kidney', hue: 'sodium', title: 'More ENaC activity', body: 'principal cells' },
  { icon: 'salt', title: 'Sodium kept', body: 'potassium excreted', tone: 'accent' },
];
const COUNTER: Omit<NodeSpec, 'x' | 'y' | 'w'> = {
  icon: 'heart',
  hue: 'pink',
  title: 'ANP and BNP',
  body: 'push sodium out',
  tone: 'dashed',
};

export function RaasCascade() {
  return (
    <Frame title="Low arterial filling sets off a cascade that ends with the kidney keeping sodium">
      <Responsive
        name="raas"
        label="Low arterial filling triggers a cascade that ends with the kidney keeping sodium"
        wide={{
          w: 760,
          h: 240,
          draw: (id) => {
            const W = 164,
              xs = [106, 290, 474, 658],
              ra = 44,
              rb = 176;
            const pos: [number, number][] = [
              [xs[0], ra],
              [xs[1], ra],
              [xs[2], ra],
              [xs[3], ra],
              [xs[3], rb],
              [xs[2], rb],
              [xs[1], rb],
            ];
            const n: NodeSpec[] = STEPS.map((s, i) => ({ ...s, x: pos[i][0], y: pos[i][1], w: W }));
            const c: NodeSpec = { ...COUNTER, x: xs[0], y: rb, w: W };
            return (
              <>
                {[0, 1, 2].map((i) => (
                  <Arrow
                    key={i}
                    id={id}
                    d={`M${edges(n[i]).right} ${ra}H${edges(n[i + 1]).left}`}
                  />
                ))}
                <Arrow id={id} d={`M${xs[3]} ${edges(n[3]).bottom}V${edges(n[4]).top}`} />
                {[4, 5].map((i) => (
                  <Arrow
                    key={i}
                    id={id}
                    d={`M${edges(n[i]).left} ${rb}H${edges(n[i + 1]).right}`}
                  />
                ))}
                {[...n, c].map((s, i) => (
                  <Node key={i} {...s} />
                ))}
                <Label x={xs[0]} y={rb + 46}>
                  the counterweight
                </Label>
              </>
            );
          },
        }}
        narrow={{
          w: 360,
          h: 580,
          draw: (id) => {
            const n: NodeSpec[] = STEPS.map((s, i) => ({ ...s, x: 180, y: 30 + i * 72, w: 240 }));
            const c: NodeSpec = { ...COUNTER, x: 180, y: 548, w: 240 };
            return (
              <>
                {n.slice(0, -1).map((s, i) => (
                  <Arrow key={i} id={id} d={`M180 ${edges(s).bottom}V${edges(n[i + 1]).top}`} />
                ))}
                {[...n, c].map((s, i) => (
                  <Node key={i} {...s} />
                ))}
                <Label x={180} y={518}>
                  The counterweight
                </Label>
              </>
            );
          },
        }}
      />
    </Frame>
  );
}
