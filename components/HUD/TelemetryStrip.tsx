'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

interface Chip {
  label: string;
  value: string;
  tone?: 'signal' | 'muted' | 'alert';
}

export function TelemetryStrip() {
  const pathname = usePathname();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Hidden on the cave landing for full immersion.
  if (pathname === '/') return null;

  const time = now ? formatTime(now) : '--:--:--';

  // Edit these defaults whenever you want the strip to say something cooler.
  const chips: Chip[] = [
    { label: 'OP', value: 'PRASHAM', tone: 'signal' },
    { label: 'NET', value: 'SECURE' },
    { label: 'LOC', value: 'GANDHINAGAR' },
    { label: 'TIME', value: time },
    { label: 'SYS', value: 'NOMINAL', tone: 'signal' },
  ];

  return (
    <div
      aria-hidden
      className={cn(
        'fixed top-0 right-0 z-20 hidden md:flex items-center gap-3',
        'bg-ink/80 backdrop-blur-sm border-b border-l border-border',
        'px-4 py-2 font-mono text-[10px] tracking-widest',
      )}
    >
      {chips.map((c) => (
        <span key={c.label} className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-text-muted">{c.label} //</span>
          <span
            className={cn(
              c.tone === 'signal'
                ? 'text-signal'
                : c.tone === 'alert'
                  ? 'text-alert'
                  : 'text-text',
            )}
          >
            {c.value}
          </span>
        </span>
      ))}
    </div>
  );
}

function formatTime(d: Date): string {
  const p = (n: number) => n.toString().padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
