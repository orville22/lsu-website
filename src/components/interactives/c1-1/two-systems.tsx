/* C1.1 visual 3: the two control systems, and how low arterial filling overrides the water loop. */
import { Arrow, Frame, Label, Node, Responsive, edges, type NodeSpec } from '../kit';

type Col = { head: string[]; nodes: NodeSpec[] };

function draw(id: string, water: Col, sodium: Col, headY: number, labelX: number) {
  const down = (a: NodeSpec, b: NodeSpec) => (
    <Arrow id={id} d={`M${a.x} ${edges(a).bottom}V${edges(b).top}`} />
  );
  const ws = water.nodes;
  const ss = sodium.nodes;
  const from = ss[1];
  const to = ws[2];
  const midY1 = edges(from).bottom;
  const midY2 = edges(to).top;
  const gap = midY2 - midY1;
  return (
    <>
      {[water, sodium].map((col, c) =>
        col.head.map((h, i) => (
          <Label key={`${c}-${i}`} x={col.nodes[0].x} y={headY + i * 16} strong>
            {h}
          </Label>
        )),
      )}
      {[0, 1, 2].map((i) => (
        <g key={i}>
          {down(ws[i], ws[i + 1])}
          {down(ss[i], ss[i + 1])}
        </g>
      ))}
      {/* Override: volume sensors switch on ADH regardless of osmolality. */}
      <path
        d={`M${edges(from).left} ${from.y}H${labelX}V${midY1 + 3}`}
        fill="none"
        stroke="var(--ix-accent)"
        strokeWidth={2}
      />
      <Arrow id={id} accent d={`M${labelX} ${midY2 - gap * 0.1}V${to.y}H${edges(to).right}`} />
      <Label x={labelX} y={midY1 + gap * 0.5 - 10} strong>
        Non-osmotic ADH
      </Label>
      <Label x={labelX} y={midY1 + gap * 0.5 + 5}>
        release: volume wins
      </Label>
      {[...ws, ...ss].map((n, i) => (
        <Node key={i} {...n} />
      ))}
    </>
  );
}

export function TwoSystems() {
  const W = 280;
  const wideRows = [70, 166, 262, 358];
  const nW = 156;
  const narrowRows = [84, 194, 304, 414];
  return (
    <Frame title="Two control systems, with low arterial filling overriding the water system">
      <Responsive
        name="two-systems"
        label="Two control systems for sodium and water, with low arterial filling overriding the water system"
        wide={{
          w: 760,
          h: 396,
          draw: (id) =>
            draw(
              id,
              {
                head: ['Water balance sets sodium concentration'],
                nodes: [
                  { icon: 'drop', title: 'Plasma tonicity', body: 'rises when water is lost' },
                  {
                    icon: 'brain',
                    title: 'Osmoreceptors',
                    body: 'circumventricular organs of the brain',
                  },
                  {
                    icon: 'hormone',
                    title: 'ADH release and thirst',
                    body: 'posterior pituitary; drinking',
                    tone: 'accent',
                  },
                  {
                    icon: 'kidney',
                    title: 'Kidney keeps water',
                    body: 'V2 receptors insert aquaporin-2',
                  },
                ].map((n, i) => ({ ...n, x: 170, y: wideRows[i], w: W, hue: 'water' }) as NodeSpec),
              },
              {
                head: ['Sodium balance sets ECF volume'],
                nodes: [
                  {
                    icon: 'vessel',
                    title: 'Arterial filling',
                    body: 'effective arterial blood volume',
                  },
                  {
                    icon: 'gauge',
                    title: 'Volume sensors',
                    body: 'baroreceptors; renal afferent arteriole',
                  },
                  {
                    icon: 'hormone',
                    title: 'RAAS and sympathetic drive',
                    body: 'natriuretic peptides push the other way',
                  },
                  {
                    icon: 'kidney',
                    title: 'Kidney keeps sodium',
                    body: 'aldosterone acts on the collecting duct',
                  },
                ].map(
                  (n, i) => ({ ...n, x: 590, y: wideRows[i], w: W, hue: 'sodium' }) as NodeSpec,
                ),
              },
              24,
              380,
            ),
        }}
        narrow={{
          w: 360,
          h: 450,
          draw: (id) =>
            draw(
              id,
              {
                head: ['Water balance sets', 'sodium concentration'],
                nodes: [
                  { icon: 'drop', title: 'Plasma tonicity', body: ['rises when', 'water is lost'] },
                  {
                    icon: 'brain',
                    title: 'Osmoreceptors',
                    body: ['circumventricular', 'organs of the brain'],
                  },
                  {
                    icon: 'hormone',
                    title: 'ADH and thirst',
                    body: ['posterior pituitary;', 'drinking'],
                    tone: 'accent',
                  },
                  {
                    icon: 'kidney',
                    title: 'Kidney keeps water',
                    body: ['V2 receptors insert', 'aquaporin-2'],
                  },
                ].map(
                  (n, i) => ({ ...n, x: 86, y: narrowRows[i], w: nW, hue: 'water' }) as NodeSpec,
                ),
              },
              {
                head: ['Sodium balance sets', 'ECF volume'],
                nodes: [
                  {
                    icon: 'vessel',
                    title: 'Arterial filling',
                    body: ['effective arterial', 'blood volume'],
                  },
                  {
                    icon: 'gauge',
                    title: 'Volume sensors',
                    body: ['baroreceptors; renal', 'afferent arteriole'],
                  },
                  {
                    icon: 'hormone',
                    title: 'RAAS + sympathetic',
                    body: ['natriuretic peptides', 'push the other way'],
                  },
                  {
                    icon: 'kidney',
                    title: 'Kidney keeps sodium',
                    body: ['aldosterone acts on', 'the collecting duct'],
                  },
                ].map(
                  (n, i) => ({ ...n, x: 274, y: narrowRows[i], w: nW, hue: 'sodium' }) as NodeSpec,
                ),
              },
              18,
              180,
            ),
        }}
      />
    </Frame>
  );
}
