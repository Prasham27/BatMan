import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { CornerBracket } from '@/components/HUD/CornerBracket';

export interface SchematicPanelProps {
  label: string;
  caption?: string;
  children: ReactNode;
  className?: string;
}

export function SchematicPanel({
  label,
  caption,
  children,
  className,
}: SchematicPanelProps) {
  return (
    <div className={cn('relative border border-border bg-surface p-5', className)}>
      <CornerBracket size={12} thickness={1} color="signal" className="absolute inset-0 pointer-events-none">
        <div className="h-full w-full" />
      </CornerBracket>
      <div className="mb-3 flex items-baseline justify-between">
        <span className="font-mono text-[10px] tracking-widest text-text-muted">
          {label}
        </span>
        {caption && (
          <span className="font-mono text-[10px] tracking-widest text-signal">
            {caption}
          </span>
        )}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
