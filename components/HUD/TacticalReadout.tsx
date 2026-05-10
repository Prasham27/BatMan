'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export type ReadoutPosition = 'tl' | 'tr' | 'bl' | 'br';
export type ReadoutStatus = 'NOMINAL' | 'STANDBY' | 'ALERT';

export interface TacticalReadoutProps {
  position?: ReadoutPosition;
  showClock?: boolean;
  showUptime?: boolean;
  status?: ReadoutStatus;
  className?: string;
}

const POSITION_CLASS: Record<ReadoutPosition, string> = {
  tl: 'top-4 left-4 text-left',
  tr: 'top-4 right-4 text-right',
  bl: 'bottom-4 left-4 text-left',
  br: 'bottom-4 right-4 text-right',
};

const STATUS_CLASS: Record<ReadoutStatus, string> = {
  NOMINAL: 'text-signal',
  STANDBY: 'text-text-muted',
  ALERT: 'text-alert',
};

export function TacticalReadout({
  position = 'tr',
  showClock = true,
  showUptime = true,
  status = 'NOMINAL',
  className,
}: TacticalReadoutProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [bootAt] = useState<number>(() => Date.now());

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const clock = now ? formatClock(now) : '--:--:--';
  const uptime = now ? formatUptime(now.getTime() - bootAt) : '00:00:00';

  return (
    <div
      aria-hidden
      className={cn(
        'fixed z-40 hidden md:block select-none overflow-hidden',
        'font-mono text-[11px] leading-[1.5] tracking-widest text-text-muted',
        POSITION_CLASS[position],
        className,
      )}
    >
      <span
        aria-hidden
        className="bc-scanline pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: 'var(--signal)', opacity: 0.45 }}
      />
      <div className="relative px-1">
        {showClock && (
          <div>
            <span>CLOCK //</span> <span className="text-text">{clock}</span>
          </div>
        )}
        {showUptime && (
          <div>
            <span>UPTIME //</span> <span className="text-text">{uptime}</span>
          </div>
        )}
        <div>
          <span>SYS //</span>{' '}
          <span className={cn('font-semibold', STATUS_CLASS[status])}>{status}</span>
        </div>
      </div>
    </div>
  );
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatClock(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatUptime(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}
