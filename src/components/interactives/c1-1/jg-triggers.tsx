/* C1.1 visual: what switches on renin release at the juxtaglomerular cells. */
import { Arrow, Frame, Node, Responsive, edges, type NodeSpec } from '../kit';

const INPUTS: Omit<NodeSpec, 'x' | 'y' | 'w'>[] = [
  { icon: 'gauge', hue: 'mustard', title: 'Lower blood pressure', body: 'reaching the kidney' },
  {
    icon: 'salt',
    hue: 'mustard',
    title: 'Less sodium chloride',
    body: 'sensed by the macula densa',
  },
  {
    icon: 'bolt',
    hue: 'mustard',
    title: 'Sympathetic nerves',
    body: 'activated when filling falls',
  },
];
const JG: Omit<NodeSpec, 'x' | 'y' | 'w'> = {
  icon: 'kidney',
  title: 'Juxtaglomerular cells',
  body: 'wall of the afferent arteriole',
  tone: 'accent',
};
const RENIN: Omit<NodeSpec, 'x' | 'y' | 'w'> = {
  icon: 'hormone',
  hue: 'sodium',
  title: 'Renin released',
  body: 'the cascade starts',
};

export function JgTriggers() {
  return (
    <Frame
      title="Three signals tell the juxtaglomerular cells to release renin"
      keyText="Any of them can start the cascade; in low arterial filling they tend to arrive together."
    >
      <Responsive
        name="jg-triggers"
        label="Three signals tell the juxtaglomerular cells to release renin"
        wide={{
          w: 760,
          h: 240,
          draw: (id) => {
            const rows = [40, 120, 200];
            const ins: NodeSpec[] = INPUTS.map((n, i) => ({ ...n, x: 150, y: rows[i], w: 252 }));
            const jg: NodeSpec = { ...JG, x: 450, y: 120, w: 230 };
            const out: NodeSpec = { ...RENIN, x: 660, y: 120, w: 152 };
            const r = edges(ins[0]).right;
            const l = edges(jg).left;
            return (
              <>
                <Arrow id={id} d={`M${r} ${rows[0]}H300V${rows[1] - 14}H${l}`} />
                <Arrow id={id} d={`M${r} ${rows[1]}H${l}`} />
                <Arrow id={id} d={`M${r} ${rows[2]}H300V${rows[1] + 14}H${l}`} />
                <Arrow id={id} d={`M${edges(jg).right} 120H${edges(out).left}`} />
                {[...ins, jg, out].map((n, i) => (
                  <Node key={i} {...n} />
                ))}
              </>
            );
          },
        }}
        narrow={{
          w: 360,
          h: 372,
          draw: (id) => {
            const rows = [30, 94, 158];
            const ins: NodeSpec[] = INPUTS.map((n, i) => ({ ...n, x: 160, y: rows[i], w: 280 }));
            const jg: NodeSpec = { ...JG, x: 160, y: 250, w: 280 };
            const out: NodeSpec = { ...RENIN, x: 160, y: 340, w: 200 };
            const r = edges(ins[0]).right;
            return (
              <>
                {rows.map((y) => (
                  <path
                    key={y}
                    d={`M${r} ${y}H340`}
                    fill="none"
                    stroke="var(--ix-arrow)"
                    strokeWidth={1.4}
                  />
                ))}
                <Arrow id={id} d={`M340 ${rows[0]}V250H${edges(jg).right}`} />
                <Arrow id={id} d={`M160 ${edges(jg).bottom}V${edges(out).top}`} />
                {[...ins, jg, out].map((n, i) => (
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
