'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/cn';
import { HudPanel } from './HudPanel';

const STATS = [
  { label: 'TOP SPEED', value: '348', unit: 'KM/H', pct: 100 },
  { label: 'ACCELERATION', value: '2.6', unit: 'SEC', pct: 96 },
  { label: 'ARMOR LEVEL', value: '100', unit: '%', pct: 100 },
  { label: 'FUEL LEVEL', value: '87', unit: '%', pct: 87 },
  { label: 'SYSTEMS ONLINE', value: '98', unit: '%', pct: 98 },
];

export interface BatmobileStatusProps {
  visible: boolean;
  onClose: () => void;
}

export function BatmobileStatus({ visible, onClose }: BatmobileStatusProps) {
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, onClose]);

  return (
    <div
      className={cn(
        'pointer-events-auto fixed left-6 top-1/2 z-30 w-72 -translate-y-1/2',
        'transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)]',
        visible ? 'translate-x-0' : '-translate-x-[110%]',
      )}
      aria-hidden={!visible}
    >
      <HudPanel label="BATMOBILE //" caption="VEHICLE STATUS">
        <div className="-mt-1 mb-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[10px] tracking-widest text-text-muted transition-colors hover:text-signal"
          >
            [ ESC // CLOSE ]
          </button>
        </div>

        <svg viewBox="0 0 200 70" className="mb-4 h-16 w-full text-text-muted">
          <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.65">
            <path d="M20 50 L40 35 L70 30 L130 28 L165 35 L180 50 L20 50 Z" />
            <path d="M70 30 L80 22 L130 22 L130 28" />
            <circle cx="55" cy="55" r="8" />
            <circle cx="155" cy="55" r="8" />
            <path d="M40 50 L50 55 M170 50 L160 55" />
          </g>
        </svg>

        <ul className="space-y-2">
          {STATS.map((s) => (
            <li key={s.label} className="font-mono text-[10px] tracking-widest">
              <div className="flex items-baseline justify-between text-text-muted">
                <span>{s.label}</span>
                <span>
                  <span className="text-text">{s.value}</span>
                  <span className="ml-1 text-text-muted">{s.unit}</span>
                </span>
              </div>
              <div className="mt-1 h-[2px] w-full bg-border/60">
                <div className="h-full bg-signal" style={{ width: `${s.pct}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </HudPanel>
    </div>
  );
}
