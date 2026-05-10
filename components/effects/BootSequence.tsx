'use client';

import { useEffect, useState } from 'react';

const LINES = [
  'INITIALIZING BATCOMPUTER...',
  'AUTHENTICATING USER...',
  'ACCESS GRANTED // CLEARANCE: PRASHAM',
  'LOADING CASE DATABASE...',
];
const TYPE_MS = 2600;
const HOLD_MS = 700;
const FADE_MS = 350;
const TOTAL_CHARS = LINES.reduce((sum, line) => sum + line.length, 0);

type Phase = 'idle' | 'typing' | 'fading' | 'done';

export interface BootSequenceProps {
  /** When true, the sequence plays. Toggle false→true to replay. */
  active: boolean;
  /** Fired after the fade-out completes (or immediately if reduced motion). */
  onComplete?: () => void;
}

export function BootSequence({ active, onComplete }: BootSequenceProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      setChars(0);
      return;
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setPhase('done');
      const t = window.setTimeout(() => onComplete?.(), 100);
      return () => window.clearTimeout(t);
    }

    setPhase('typing');
    setChars(0);
    const start = performance.now();
    let raf = 0;
    let tHold = 0;
    let tFade = 0;

    const tick = (t: number) => {
      const ratio = Math.min(1, (t - start) / TYPE_MS);
      setChars(Math.floor(ratio * TOTAL_CHARS));
      if (ratio < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        tHold = window.setTimeout(() => {
          setPhase('fading');
          tFade = window.setTimeout(() => {
            setPhase('done');
            onComplete?.();
          }, FADE_MS);
        }, HOLD_MS);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(tHold);
      window.clearTimeout(tFade);
    };
  }, [active, onComplete]);

  if (!active || phase === 'idle' || phase === 'done') return null;

  let consumed = 0;
  const visible = LINES.map((line) => {
    const remaining = chars - consumed;
    consumed += line.length;
    if (remaining <= 0) return '';
    return line.slice(0, Math.min(line.length, remaining));
  });

  const activeIdx = (() => {
    for (let i = 0; i < visible.length; i++) {
      if (visible[i].length < LINES[i].length) return i;
    }
    return visible.length - 1;
  })();

  const fading = phase === 'fading';

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Batcomputer boot sequence"
      className={[
        'fixed inset-0 z-[100] flex items-center justify-center bg-ink',
        'transition-opacity duration-200 ease-linear',
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100',
      ].join(' ')}
    >
      <div className="w-full max-w-[520px] px-6 font-mono text-sm leading-relaxed text-text md:text-base">
        {visible.map((line, i) => (
          <div key={i}>
            <span className="text-text-muted">&gt;&nbsp;</span>
            <span className={i === LINES.length - 1 ? 'text-signal' : 'text-text'}>
              {line || ' '}
            </span>
            {i === activeIdx && phase === 'typing' && (
              <span
                aria-hidden
                className="ml-0.5 inline-block h-[1em] w-[8px] align-middle"
                style={{ backgroundColor: 'var(--signal)' }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
