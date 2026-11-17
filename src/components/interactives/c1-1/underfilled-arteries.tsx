/*
 * C1.1 new visual (learner review #5): full tissues, underfilled arteries.
 * In heart failure the weak pump leaves the arteries underfilled, which the
 * baroreceptors sense; brain and kidney respond by keeping sodium and water.
 * The backed-up veins push much of that fluid out of the capillaries into the
 * tissues, outside the circulation, so the arteries stay underfilled.
 */
import { Arrow, C, Frame, Label, Node, Responsive, type Layout, type NodeSpec } from '../kit';

const N: Record<string, Omit<NodeSpec, 'x' | 'y' | 'w'>> = {
  heart: {
    title: 'Weak heart pump',
    body: ['less blood pushed', 'into the arteries'],
    hue: 'pink',
    icon: 'heart',
  },
  arteries: {
    title: 'Arteries underfilled',
    body: ['baroreceptors in the carotid', 'sinus and aortic arch sense it'],
    hue: 'water',
    icon: 'gauge',
  },
  respond: {
    title: 'Brain and kidney respond',
    body: ['ADH and thirst;', 'renin, then aldosterone'],
    hue: 'mustard',
    icon: 'brain',
  },
  kept: {
    title: 'Sodium and water kept',
    body: ['the body’s fluid', 'keeps growing'],
    hue: 'sodium',
    icon: 'kidney',
  },
  veins: {
    title: 'Veins back up',
    body: ['high capillary pressure', 'pushes fluid out'],
    hue: 'water',
    icon: 'vessel',
  },
  oedema: {
    title: 'Oedema',
    body: ['fluid in the tissues, outside', 'the circulation: not counted'],
    tone: 'question',
    icon: 'drop',
  },
};

const wide: Layout = {
  w: 700,
  h: 330,
  draw: (id) => (
    <g>
      <Node {...N.heart} x={100} y={165} w={170} />
      <Node {...N.arteries} x={330} y={70} w={226} />
      <Node {...N.veins} x={330} y={260} w={226} />
      <Node {...N.respond} x={570} y={70} w={210} />
      <Node {...N.kept} x={570} y={165} w={210} />
      <Node {...N.oedema} x={570} y={260} w={210} />
      <Arrow id={id} d="M185 148V70H213" />
      <Arrow id={id} d="M185 182V260H213" />
      <Arrow id={id} d="M443 70H461" accent />
      <Arrow id={id} d="M570 101V130" accent />
      <Arrow id={id} d="M465 165H452V236H447" accent />
      <Arrow id={id} d="M443 260H461" />
      <Arrow id={id} d="M676 260H690V24H330V36" dashed />
      <Label x={510} y={16}>
        the arteries stay underfilled, so the signals stay on
      </Label>
      <Label x={446} y={210} anchor="end">
        extra fluid
      </Label>
    </g>
  ),
};

const narrow: Layout = {
  w: 340,
  h: 640,
  draw: (id) => (
    <g>
      <Node {...N.heart} x={160} y={40} w={250} />
      <Node {...N.arteries} x={160} y={140} w={250} />
      <Node {...N.respond} x={160} y={240} w={250} />
      <Node {...N.kept} x={160} y={340} w={250} />
      <Node {...N.veins} x={160} y={440} w={250} />
      <Node {...N.oedema} x={160} y={540} w={250} />
      <Arrow id={id} d="M160 70V105" />
      <Arrow id={id} d="M160 170V205" accent />
      <Arrow id={id} d="M160 270V305" accent />
      <Arrow id={id} d="M160 370V405" accent />
      <Arrow id={id} d="M160 470V505" />
      <Arrow id={id} d="M285 540H306V140H290" dashed />
      <Label x={160} y={606}>
        The weak pump also backs up the veins.
      </Label>
    </g>
  ),
};

export function UnderfilledArteries() {
  return (
    <Frame
      title="Heart failure: full tissues, underfilled arteries"
      keyText="The sensors that switch on ADH and the RAAS sit in the arteries. Fluid that has leaked into the tissues is outside the circulation, where they can't count it, so the arteries stay underfilled (dashed arrow) and the signals stay on."
      note="Simplified: other sensors, including those in the heart and the kidney's own pressure sensor, are left out."
      wide
    >
      <Responsive
        name="c1-1-underfilled"
        label="In heart failure, fluid kept by the kidney leaks into the tissues, so the arteries stay underfilled"
        wide={wide}
        narrow={narrow}
      />
    </Frame>
  );
}
