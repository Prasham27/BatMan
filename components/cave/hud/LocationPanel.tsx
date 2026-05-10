'use client';

import { HudPanel } from './HudPanel';

export function LocationPanel() {
  return (
    <HudPanel label="LOCATION //" className="w-72">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <p className="font-display text-lg font-semibold text-text">BATCAVE</p>
          <p className="mt-2 font-mono text-[10px] tracking-widest text-text-muted">
            COORDINATES
          </p>
          <p className="mt-0.5 font-mono text-xs text-text">
            34.0201° N, 118.4814° W
          </p>
        </div>
        {/* Wireframe terrain map */}
        <svg viewBox="0 0 80 80" className="h-20 w-20 text-text-muted">
          <g fill="none" stroke="currentColor" strokeWidth="1" opacity="0.7">
            <path d="M10 60 Q20 50 30 55 Q40 60 50 50 Q60 40 70 50" />
            <path d="M10 50 Q20 40 30 45 Q40 50 50 40 Q60 30 70 40" />
            <path d="M10 40 Q20 30 30 35 Q40 40 50 30 Q60 20 70 30" />
          </g>
          {/* Center marker */}
          <circle cx="40" cy="40" r="3" fill="#FFB200" />
          <circle cx="40" cy="40" r="6" fill="none" stroke="#FFB200" strokeWidth="0.5" opacity="0.6" />
        </svg>
      </div>
    </HudPanel>
  );
}
