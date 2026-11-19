/*
 * Registry of lesson illustrations and interactives.
 * A lesson embeds one with an `interactive` block (Markdown: @interactive(key "Caption")).
 * Add a component here and its key in src/lib/interactive-keys.ts.
 */
import type { ComponentType } from 'react';
import type { InteractiveKey } from '@/lib/interactive-keys';
import { InlineText } from '../rich-text';
import { ConcentrationBeaker } from './c1-1/concentration-beaker';
import { Compartments } from './c1-1/compartments';
import { TwoSystems } from './c1-1/two-systems';
import { AdhSwitch } from './c1-1/adh-switch';
import { JgTriggers } from './c1-1/jg-triggers';
import { RaasCascade } from './c1-1/raas-cascade';
import { NormalPhysiology } from './c1-1/normal-physiology';
import { HeartFailure } from './c1-1/heart-failure';
import { SpotUrine } from './c1-1/spot-urine';
import { CellTonicity } from './c1-2/cell-tonicity';
import { GapBuilder } from './c1-2/gap-builder';
import { GapTimeCourse } from './c1-2/gap-time-course';
import { AdhWater } from './c1-1/adh-water';
import { NephronAdh } from './c1-1/nephron-adh';
import { WaterFollowsSodium } from './c1-1/water-follows-sodium';
import { PlasmaLitre } from './c1-2/plasma-litre';
import { CellVolume } from './c1-1/cell-volume';
import { UnderfilledArteries } from './c1-1/underfilled-arteries';
import { FreezingCurve } from './c1-2/freezing-curve';

export const interactives: Record<InteractiveKey, ComponentType> = {
  'c1-1-concentration': ConcentrationBeaker,
  'c1-1-compartments': Compartments,
  'c1-1-two-systems': TwoSystems,
  'c1-1-adh-switch': () => <AdhSwitch />,
  'c1-1-adh-switch-patient': () => <AdhSwitch variant="patient" />,
  'c1-1-jg-triggers': JgTriggers,
  'c1-1-raas-cascade': RaasCascade,
  'c1-1-normal-physiology': NormalPhysiology,
  'c1-1-heart-failure': HeartFailure,
  'c1-1-spot-urine': SpotUrine,
  'c1-2-cell-tonicity': CellTonicity,
  'c1-2-gap-builder': GapBuilder,
  'c1-2-gap-time-course': GapTimeCourse,
  'c1-1-nephron-adh': NephronAdh,
  'c1-1-adh-water': AdhWater,
  'c1-1-water-follows-sodium': WaterFollowsSodium,
  'c1-2-plasma-litre': PlasmaLitre,
  'c1-1-cell-volume': CellVolume,
  'c1-1-underfilled-arteries': UnderfilledArteries,
  'c1-2-freezing-curve': FreezingCurve,
};

export function Interactive({ name, caption }: { name: InteractiveKey; caption?: string }) {
  const Component = interactives[name];
  return (
    <figure className="ix-figure">
      <Component />
      {caption && (
        <figcaption>
          <InlineText text={caption} />
        </figcaption>
      )}
    </figure>
  );
}
