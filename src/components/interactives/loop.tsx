'use client';
/*
 * Looping cause-and-effect animations.
 * useLoop runs through a list of phases on a timer and starts again, so a
 * reader sees each cause followed by its effect without clicking. Pause stops
 * it; clicking a phase dot jumps there and pauses. With reduced motion the
 * loop never runs and the last phase (the full picture) is shown.
 */
import { useEffect, useState } from 'react';

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const m = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!m) return;
    setReduced(m.matches);
    const on = () => setReduced(m.matches);
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

/** durations: how long each phase is held, in ms. `key` restarts the loop when it changes. */
export function useLoop(durations: number[], key: unknown = 0) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [cycle, setCycle] = useState(0);
  useEffect(() => {
    setPhase(0);
    setCycle((c) => c + 1);
  }, [key]);
  useEffect(() => {
    if (reduced || !playing) return;
    const t = setTimeout(() => {
      setPhase((p) => {
        if (p + 1 >= durations.length) {
          setCycle((c) => c + 1);
          return 0;
        }
        return p + 1;
      });
    }, durations[phase] ?? 2000);
    return () => clearTimeout(t);
  }, [phase, playing, reduced, durations]);
  const last = durations.length - 1;
  return {
    phase: reduced ? last : phase,
    cycle,
    playing: playing && !reduced,
    reduced,
    setPlaying,
    jump: (p: number) => {
      setPlaying(false);
      setPhase(p);
    },
  };
}

export function LoopBar({
  labels,
  phase,
  playing,
  reduced,
  setPlaying,
  jump,
}: {
  labels: string[];
  phase: number;
  playing: boolean;
  reduced: boolean;
  setPlaying: (p: boolean) => void;
  jump: (p: number) => void;
}) {
  return (
    <div className="ix-loopbar">
      {!reduced && (
        <button
          type="button"
          className="ix-choice ix-play"
          aria-pressed={!playing}
          onClick={() => setPlaying(!playing)}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
      )}
      <ol className="ix-phases" aria-label="Stages">
        {labels.map((l, i) => (
          <li key={l}>
            <button
              type="button"
              className={i === phase ? 'on' : i < phase ? 'done' : undefined}
              aria-current={i === phase ? 'step' : undefined}
              onClick={() => jump(i)}
            >
              <span className="ix-phase-dot" />
              {l}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
