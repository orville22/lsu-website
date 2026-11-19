/**
 * Keys of the lesson illustrations and interactives that a lesson block can embed.
 * Kept free of React so validation and the Markdown importer can use it.
 * The components live in src/components/interactives (see index.tsx there).
 */
export const interactiveKeys = [
  'c1-1-concentration',
  'c1-1-compartments',
  'c1-1-two-systems',
  'c1-1-adh-switch',
  'c1-1-adh-switch-patient',
  'c1-1-jg-triggers',
  'c1-1-raas-cascade',
  'c1-1-normal-physiology',
  'c1-1-heart-failure',
  'c1-1-spot-urine',
  'c1-2-cell-tonicity',
  'c1-2-gap-builder',
  'c1-2-gap-time-course',
  'c1-1-nephron-adh',
  'c1-1-adh-water',
  'c1-1-water-follows-sodium',
  'c1-2-plasma-litre',
  'c1-1-cell-volume',
  'c1-1-underfilled-arteries',
  'c1-2-freezing-curve',
] as const;

export type InteractiveKey = (typeof interactiveKeys)[number];

export function isInteractiveKey(k: string): k is InteractiveKey {
  return (interactiveKeys as readonly string[]).includes(k);
}
