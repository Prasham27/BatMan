'use client';

import { useEffect, useState } from 'react';

const OPEN_MS = 1800;
const SETTLE_MS = 100;

export interface DoorIntroProps {
  /** When true the door is mounted and animates open. */
  active: boolean;
  /** Fired after the doors finish opening. */
  onComplete?: () => void;
}

export function DoorIntro({ active, onComplete }: DoorIntroProps) {
  const [mounted, setMounted] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!active) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setMounted(true);
    if (reduced) {
      setMounted(false);
      onComplete?.();
      return;
    }
    const t1 = window.setTimeout(() => setOpening(true), SETTLE_MS);
    const t2 = window.setTimeout(() => {
      setMounted(false);
      onComplete?.();
    }, SETTLE_MS + OPEN_MS + 50);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [active, onComplete]);

  if (!mounted) return null;

  const halfBase: React.CSSProperties = {
    width: '50%',
    height: '100%',
    transition: `transform ${OPEN_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    background:
      'repeating-linear-gradient(180deg, transparent 0px, transparent 5px, rgba(255,255,255,0.018) 5px, rgba(255,255,255,0.018) 6px), linear-gradient(135deg, #0e1216 0%, #1a1d22 60%, #0a0d11 100%)',
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div className="fixed inset-0 z-[95] flex">
      <div
        style={{
          ...halfBase,
          transform: opening ? 'translateX(-101%)' : 'translateX(0)',
          borderRight: '1px solid rgba(255, 178, 0, 0.18)',
        }}
      >
        <DoorPlate side="left" />
      </div>
      <div
        style={{
          ...halfBase,
          transform: opening ? 'translateX(101%)' : 'translateX(0)',
        }}
      >
        <DoorPlate side="right" />
      </div>
    </div>
  );
}

function DoorPlate({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  return (
    <>
      {/* Center labels — appear near the seam */}
      <div
        className="absolute top-1/2 -translate-y-1/2 px-8 font-mono text-[11px] tracking-[0.3em]"
        style={{ [isLeft ? 'right' : 'left']: '0' }}
      >
        <p className="text-signal">{isLeft ? 'AUTHORIZED' : 'CLEARANCE: 7'}</p>
        <p className="text-text-muted">{isLeft ? 'ACCESS' : 'WAYNE INDUSTRIES'}</p>
      </div>

      {/* Vertical accent line near the seam */}
      <div
        className="absolute top-0 h-full w-[2px] bg-signal/40"
        style={{ [isLeft ? 'right' : 'left']: '0' }}
      />

      {/* Subtle rivet pattern in a vertical column */}
      <div
        className="absolute top-1/2 flex -translate-y-1/2 flex-col gap-6 px-3"
        style={{ [isLeft ? 'right' : 'left']: '24px' }}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span
            key={i}
            className="h-2 w-2 rounded-full border border-text-muted/40"
          />
        ))}
      </div>

      {/* Corner brackets at top */}
      <div
        className="absolute top-8 font-mono text-[9px] tracking-widest text-text-muted/60"
        style={{ [isLeft ? 'right' : 'left']: '40px' }}
      >
        VAULT-7
      </div>
    </>
  );
}
