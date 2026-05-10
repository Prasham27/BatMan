'use client';

export function DragHint() {
  return (
    <div className="pointer-events-none flex items-center gap-3 border border-border/60 bg-ink/40 px-5 py-2 backdrop-blur-md">
      <svg
        width="14"
        height="20"
        viewBox="0 0 14 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-signal"
      >
        <rect x="1" y="1" width="12" height="18" rx="6" />
        <line x1="7" y1="5" x2="7" y2="9" />
      </svg>
      <p className="font-mono text-[11px] tracking-[0.3em] text-text">
        DRAG TO EXPLORE
      </p>
    </div>
  );
}
