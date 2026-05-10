'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface HudPanelProps {
  label: string;
  caption?: string;
  children: ReactNode;
  className?: string;
  bare?: boolean;
}

export function HudPanel({
  label,
  caption,
  children,
  className,
  bare = false,
}: HudPanelProps) {
  return (
    <div
      className={cn(
        'pointer-events-auto relative border border-border/60 bg-ink/40 p-4 backdrop-blur-md',
        'before:pointer-events-none before:absolute before:inset-0 before:border before:border-signal/0 before:transition-colors',
        className,
      )}
    >
      {!bare && (
        <header className="mb-3 flex items-baseline justify-between gap-3">
          <p className="font-mono text-[10px] tracking-widest text-signal">
            {label}
          </p>
          {caption && (
            <p className="font-mono text-[10px] tracking-widest text-text-muted">
              {caption}
            </p>
          )}
        </header>
      )}
      {children}
    </div>
  );
}
