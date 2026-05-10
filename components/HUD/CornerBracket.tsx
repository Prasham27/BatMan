import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BracketColor = 'border' | 'signal' | 'muted';
export type BracketSize = 12 | 16 | 24;
export type BracketThickness = 1 | 2;

export interface CornerBracketProps {
  children: ReactNode;
  size?: BracketSize;
  thickness?: BracketThickness;
  color?: BracketColor;
  className?: string;
}

const COLOR_VAR: Record<BracketColor, string> = {
  border: 'var(--border)',
  signal: 'var(--signal)',
  muted: 'var(--text-muted)',
};

export function CornerBracket({
  children,
  size = 16,
  thickness = 1,
  color = 'border',
  className,
}: CornerBracketProps) {
  const styleVars = {
    '--bk-size': `${size}px`,
    '--bk-thickness': `${thickness}px`,
    '--bk-color': COLOR_VAR[color],
  } as CSSProperties;

  return (
    <div className={cn('relative', className)} style={styleVars}>
      <span aria-hidden className="absolute left-0 top-0" style={cornerStyle('tl')} />
      <span aria-hidden className="absolute right-0 top-0" style={cornerStyle('tr')} />
      <span aria-hidden className="absolute bottom-0 left-0" style={cornerStyle('bl')} />
      <span aria-hidden className="absolute bottom-0 right-0" style={cornerStyle('br')} />
      {children}
    </div>
  );
}

function cornerStyle(corner: 'tl' | 'tr' | 'bl' | 'br'): CSSProperties {
  const base: CSSProperties = {
    width: 'var(--bk-size)',
    height: 'var(--bk-size)',
    pointerEvents: 'none',
  };
  const t = 'var(--bk-thickness) solid var(--bk-color)';
  switch (corner) {
    case 'tl':
      return { ...base, borderTop: t, borderLeft: t };
    case 'tr':
      return { ...base, borderTop: t, borderRight: t };
    case 'bl':
      return { ...base, borderBottom: t, borderLeft: t };
    case 'br':
      return { ...base, borderBottom: t, borderRight: t };
  }
}
