'use client';

import { HudPanel } from './HudPanel';

const ROWS = [
  { label: 'STATUS', value: 'ACTIVE', tone: 'signal' as const },
  { label: 'BATTERY', value: '86%' },
  { label: 'RANGE', value: '2.4 KM' },
  { label: 'CAMERAS', value: '6 ONLINE' },
];

export function DroneStatus() {
  return (
    <HudPanel label="SURVEILLANCE DRONE //" className="w-64">
      <div className="flex items-start gap-3">
        <ul className="flex-1 space-y-1.5 font-mono text-[10px] tracking-widest">
          {ROWS.map((r) => (
            <li key={r.label} className="flex items-baseline justify-between">
              <span className="text-text-muted">{r.label}</span>
              <span className={r.tone === 'signal' ? 'text-signal' : 'text-text'}>
                {r.value}
              </span>
            </li>
          ))}
        </ul>
        <svg viewBox="0 0 60 60" className="h-14 w-14 text-text-muted">
          <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7">
            <circle cx="30" cy="30" r="6" />
            <line x1="30" y1="30" x2="12" y2="12" />
            <line x1="30" y1="30" x2="48" y2="12" />
            <line x1="30" y1="30" x2="12" y2="48" />
            <line x1="30" y1="30" x2="48" y2="48" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="48" cy="12" r="4" />
            <circle cx="12" cy="48" r="4" />
            <circle cx="48" cy="48" r="4" />
          </g>
          <circle cx="30" cy="30" r="2" fill="#E63946" />
        </svg>
      </div>
    </HudPanel>
  );
}
