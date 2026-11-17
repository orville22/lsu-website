'use client';
/*
 * Step controls shared by the step-through illustrations: numbered step
 * buttons, Back / Next, and a Play button that advances on a timer.
 * Autoplay never starts by itself, and stops at the last step.
 */
import { useEffect, useState } from 'react';

export function useSteps(count: number, ms = 3600) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    if (step >= count - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, count - 1)), ms);
    return () => clearTimeout(t);
  }, [playing, step, count, ms]);
  return { step, setStep, playing, setPlaying };
}

export function StepControls({
  labels,
  step,
  setStep,
  playing,
  setPlaying,
}: {
  labels: string[];
  step: number;
  setStep: (n: number) => void;
  playing: boolean;
  setPlaying: (p: boolean) => void;
}) {
  const last = labels.length - 1;
  return (
    <div className="ix-steps">
      <div className="ix-choices" role="group" aria-label="Steps">
        {labels.map((l, i) => (
          <button
            key={l}
            type="button"
            className="ix-choice ix-step"
            aria-pressed={step === i}
            onClick={() => {
              setPlaying(false);
              setStep(i);
            }}
          >
            <span className="ix-step-n">{i + 1}</span>
            {l}
          </button>
        ))}
      </div>
      <div className="ix-step-nav">
        <button
          type="button"
          className="ix-choice"
          disabled={step === 0}
          onClick={() => {
            setPlaying(false);
            setStep(Math.max(0, step - 1));
          }}
        >
          Back
        </button>
        <button
          type="button"
          className="ix-choice ix-play"
          aria-pressed={playing}
          onClick={() => {
            if (playing) return setPlaying(false);
            if (step >= last) setStep(0);
            setPlaying(true);
          }}
        >
          {playing ? 'Pause' : step >= last ? 'Replay' : 'Play'}
        </button>
        <button
          type="button"
          className="ix-choice"
          disabled={step === last}
          onClick={() => {
            setPlaying(false);
            setStep(Math.min(last, step + 1));
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
