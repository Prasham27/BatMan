'use client';

export function WayneBranding() {
  return (
    <div className="pointer-events-none flex items-start gap-3">
      <svg width="32" height="32" viewBox="0 0 32 32" className="text-signal">
        {/* Generic shield — IP discipline, not the actual Bat-symbol */}
        <path
          d="M16 3 L27 7 L27 17 Q27 24 16 29 Q5 24 5 17 L5 7 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M11 14 L16 11 L21 14 L19 19 L13 19 Z"
          fill="currentColor"
          opacity="0.7"
        />
      </svg>
      <div>
        <p className="font-display text-sm font-semibold tracking-widest text-text">
          WAYNE ENTERPRISES
        </p>
        <p className="font-mono text-[10px] tracking-widest text-text-muted">
          v2.1.0
        </p>
      </div>
    </div>
  );
}
