/* C1.1 visual 7: why heart failure lowers sodium. Values are the case patient's. */
import { Arrow, Frame, Node, Responsive, edges, type NodeSpec } from '../kit';

type Spec = Omit<NodeSpec, 'x' | 'y' | 'w'>;

function draw(
  id: string,
  top: [Spec, Spec],
  left: Spec[],
  right: Spec[],
  g: {
    c: number;
    cl: number;
    cr: number;
    wTop: number;
    wCol: number;
    rows: number[];
    merge: number;
  },
) {
  const t: NodeSpec[] = top.map((s, i) => ({ ...s, x: g.c, y: g.rows[i], w: g.wTop }));
  const L: NodeSpec[] = left.map((s, i) => ({ ...s, x: g.cl, y: g.rows[i + 2], w: g.wCol }));
  const R: NodeSpec[] = right.map((s, i) => ({ ...s, x: g.cr, y: g.rows[i + 2], w: g.wCol }));
  return (
    <>
      <Arrow id={id} d={`M${g.c} ${edges(t[0]).bottom}V${edges(t[1]).top}`} />
      <Arrow id={id} d={`M${g.c} ${edges(t[1]).bottom}V${g.merge}H${g.cl}V${edges(L[0]).top}`} />
      <Arrow id={id} d={`M${g.c} ${g.merge}H${g.cr}V${edges(R[0]).top}`} />
      {[0, 1].map((i) => (
        <g key={i}>
          <Arrow id={id} d={`M${g.cl} ${edges(L[i]).bottom}V${edges(L[i + 1]).top}`} />
          <Arrow id={id} d={`M${g.cr} ${edges(R[i]).bottom}V${edges(R[i + 1]).top}`} />
        </g>
      ))}
      {[...t, ...L, ...R].map((n, i) => (
        <Node key={i} {...n} />
      ))}
    </>
  );
}

export function HeartFailure() {
  return (
    <Frame title="Low arterial filling causes both oedema and a low sodium">
      <Responsive
        name="heart-failure"
        label="In heart failure the kidney keeps sodium and even more water, so oedema and a low sodium arrive together"
        wide={{
          w: 760,
          h: 440,
          draw: (id) =>
            draw(
              id,
              [
                {
                  icon: 'heart',
                  hue: 'pink',
                  title: 'Weak heart pump',
                  body: 'low cardiac output',
                },
                {
                  icon: 'vessel',
                  hue: 'pink',
                  title: 'Arteries underfilled',
                  body: 'even though total ECF is expanded',
                },
              ],
              [
                {
                  icon: 'hormone',
                  hue: 'sodium',
                  title: 'RAAS and sympathetic drive',
                  body: 'the sodium loop switches on',
                },
                {
                  icon: 'kidney',
                  hue: 'sodium',
                  title: 'Kidney keeps sodium',
                  body: 'urine sodium 12 mmol/L',
                },
                {
                  icon: 'salt',
                  hue: 'sodium',
                  title: 'Oedema and weight gain',
                  body: 'more sodium in the body',
                },
              ],
              [
                {
                  icon: 'brain',
                  hue: 'water',
                  title: 'Non-osmotic ADH and thirst',
                  body: 'volume overrides the water loop',
                },
                {
                  icon: 'drop',
                  hue: 'water',
                  title: 'Kidney keeps even more water',
                  body: 'urine osmolality 410 mmol/kg',
                },
                {
                  icon: 'tube',
                  title: 'Sodium 125 mmol/L',
                  body: 'the water excess outruns the sodium',
                  tone: 'accent',
                },
              ],
              {
                c: 380,
                cl: 190,
                cr: 570,
                wTop: 300,
                wCol: 300,
                rows: [40, 128, 228, 316, 404],
                merge: 178,
              },
            ),
        }}
        narrow={{
          w: 360,
          h: 420,
          draw: (id) =>
            draw(
              id,
              [
                {
                  icon: 'heart',
                  hue: 'pink',
                  title: 'Weak heart pump',
                  body: 'low cardiac output',
                },
                {
                  icon: 'vessel',
                  hue: 'pink',
                  title: 'Arteries underfilled',
                  body: 'even though total ECF is expanded',
                },
              ],
              [
                {
                  icon: 'hormone',
                  hue: 'sodium',
                  title: 'RAAS + sympathetic',
                  body: ['the sodium loop', 'switches on'],
                },
                {
                  icon: 'kidney',
                  hue: 'sodium',
                  title: 'Kidney keeps sodium',
                  body: ['urine sodium', '12 mmol/L'],
                },
                {
                  icon: 'salt',
                  hue: 'sodium',
                  title: 'Oedema, weight gain',
                  body: ['more sodium', 'in the body'],
                },
              ],
              [
                {
                  icon: 'brain',
                  hue: 'water',
                  title: 'Non-osmotic ADH',
                  body: ['plus thirst; volume', 'overrides the water loop'],
                },
                {
                  icon: 'drop',
                  hue: 'water',
                  title: 'Keeps even more water',
                  body: ['urine osmolality', '410 mmol/kg'],
                },
                {
                  icon: 'tube',
                  title: 'Sodium 125 mmol/L',
                  body: ['water excess', 'outruns the sodium'],
                  tone: 'accent',
                },
              ],
              {
                c: 180,
                cl: 92,
                cr: 268,
                wTop: 290,
                wCol: 170,
                rows: [28, 102, 196, 288, 380],
                merge: 148,
              },
            ),
        }}
      />
    </Frame>
  );
}
