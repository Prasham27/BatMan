'use client';

import { useCallback, useState } from 'react';
import { useTypeSequence } from '@/lib/useTypeSequence';

const DURATION_MS = 3500;

// Original chaos-themed one-liners — written from scratch to stay clear of any
// trademarked movie dialogue. Swap in whatever you want later.
const ONE_LINERS = [
  'HAHAHA! DID I SCARE YOU?',
  'A LITTLE CHAOS NEVER HURT.',
  'YOU BLINKED. I WAS WAITING.',
  'ORDER IS OVERRATED.',
  'TAG — YOU’RE IT.',
  'THE PUNCHLINE LANDED.',
];

export function JokerGlitch() {
  const [active, setActive] = useState(false);
  const [line, setLine] = useState(ONE_LINERS[0]);

  const trigger = useCallback(() => {
    setLine(ONE_LINERS[Math.floor(Math.random() * ONE_LINERS.length)]);
    setActive(true);
    window.setTimeout(() => setActive(false), DURATION_MS);
  }, []);

  // Single-key trigger: pressing J anywhere outside an input fires the glitch.
  useTypeSequence('j', trigger);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] overflow-hidden bg-black/40">
      {/* Purple chromatic offset */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          backgroundColor: '#9b00b4',
          opacity: 0.18,
          animation: 'joker-shake-x 0.07s infinite linear',
        }}
      />
      {/* Green chromatic offset */}
      <div
        className="absolute inset-0 mix-blend-screen"
        style={{
          backgroundColor: '#39ff14',
          opacity: 0.14,
          animation: 'joker-shake-x-rev 0.07s infinite linear',
        }}
      />
      {/* Scan lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.45) 2px, rgba(0,0,0,0.45) 3px)',
          opacity: 0.55,
          animation: 'joker-shake-y 0.13s infinite linear',
        }}
      />

      {/* Spawning playing card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="joker-card relative"
          style={{
            width: '220px',
            height: '320px',
          }}
        >
          {/* Card frame */}
          <div
            className="absolute inset-0 flex flex-col justify-between border-[6px] p-4"
            style={{
              borderColor: '#9b00b4',
              backgroundColor: '#0a0d11',
              boxShadow:
                '0 0 60px #9b00b4, 0 0 120px #9b00b4, inset 0 0 30px #39ff14',
            }}
          >
            {/* Top corner — JOKER label */}
            <div className="flex flex-col items-start">
              <p
                className="font-mono text-xs font-bold tracking-widest"
                style={{ color: '#9b00b4' }}
              >
                JOKER
              </p>
              <p
                className="mt-1 font-display text-3xl font-bold"
                style={{ color: '#39ff14' }}
              >
                J
              </p>
            </div>
            {/* Center — large J */}
            <div className="flex flex-1 items-center justify-center">
              <p
                className="font-display font-bold leading-none"
                style={{
                  fontSize: '160px',
                  color: '#39ff14',
                  textShadow: '6px 6px 0 #9b00b4, -6px -6px 0 #00f0ff',
                  letterSpacing: '-0.05em',
                }}
              >
                J
              </p>
            </div>
            {/* Bottom corner — JOKER label, mirrored */}
            <div className="flex flex-col items-end" style={{ transform: 'rotate(180deg)' }}>
              <p
                className="font-mono text-xs font-bold tracking-widest"
                style={{ color: '#9b00b4' }}
              >
                JOKER
              </p>
              <p
                className="mt-1 font-display text-3xl font-bold"
                style={{ color: '#39ff14' }}
              >
                J
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* One-liner */}
      <div className="absolute bottom-[18%] left-0 right-0 text-center">
        <p
          className="font-display text-4xl font-bold"
          style={{
            color: '#39ff14',
            textShadow: '4px 0 #9b00b4, -4px 0 #00f0ff, 0 0 30px #9b00b4',
            letterSpacing: '0.15em',
            animation: 'joker-shake-x 0.09s infinite linear',
          }}
        >
          {line}
        </p>
      </div>

      <style>{`
        @keyframes joker-shake-x {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-3px, 1px); }
          50% { transform: translate(3px, -1px); }
          75% { transform: translate(-2px, -1px); }
        }
        @keyframes joker-shake-x-rev {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(3px, -1px); }
          50% { transform: translate(-3px, 1px); }
          75% { transform: translate(2px, 1px); }
        }
        @keyframes joker-shake-y {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(0, 2px); }
        }
        @keyframes joker-card-spawn {
          0% {
            transform: scale(0.04) rotate(-900deg);
            opacity: 0;
          }
          70% {
            transform: scale(1.15) rotate(15deg);
            opacity: 1;
          }
          85% {
            transform: scale(0.95) rotate(-5deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .joker-card {
          animation: joker-card-spawn 1.4s cubic-bezier(0.2, 0, 0, 1) forwards;
        }
      `}</style>
    </div>
  );
}
