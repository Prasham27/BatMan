'use client';

import { useEffect, useState } from 'react';
import { HudPanel } from './HudPanel';

const FEED_LINES = [
  'Wayne Enterprises Network Online',
  'All Systems Operational',
  'Security Protocols Active',
  'No New Alerts',
];

export function SystemFeed() {
  // Sparkline that drifts on load — looks like a real system metric
  const [points] = useState<number[]>(() =>
    Array.from({ length: 24 }, () => 0.4 + Math.random() * 0.5),
  );
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const id = window.setInterval(() => setPhase((p) => p + 1), 2000);
    return () => window.clearInterval(id);
  }, []);

  const path = points
    .map((y, i) => {
      const drift = Math.sin((i + phase) * 0.4) * 0.05;
      const yScaled = (1 - (y + drift)) * 32;
      const x = (i / (points.length - 1)) * 240;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${yScaled.toFixed(1)}`;
    })
    .join(' ');

  return (
    <HudPanel label="SYSTEM FEED //" className="w-64">
      <ul className="space-y-1.5">
        {FEED_LINES.map((line) => (
          <li
            key={line}
            className="flex items-baseline gap-2 font-mono text-xs text-text"
          >
            <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-[#39FF14]" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
      <svg viewBox="0 0 240 36" className="mt-4 h-9 w-full">
        <path d={path} fill="none" stroke="#FFB200" strokeWidth="1" opacity="0.85" />
        <path d={`${path} L 240 36 L 0 36 Z`} fill="#FFB200" opacity="0.08" />
      </svg>
    </HudPanel>
  );
}
