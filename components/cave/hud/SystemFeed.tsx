'use client';

import { HudPanel } from './HudPanel';

const FEED_LINES = [
  'Wayne Enterprises Network Online',
  'All Systems Operational',
  'Security Protocols Active',
];

export function SystemFeed() {
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
    </HudPanel>
  );
}
