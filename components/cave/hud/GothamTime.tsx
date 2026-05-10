'use client';

import { useEffect, useState } from 'react';
import { HudPanel } from './HudPanel';

const MONTHS = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
];

export function GothamTime() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = now ? formatTime(now) : '--:--:--';
  const date = now ? formatDate(now) : '--- --, ----';
  const hourAngle = now
    ? ((now.getHours() % 12) + now.getMinutes() / 60) * 30
    : 0;
  const minAngle = now ? now.getMinutes() * 6 : 0;

  return (
    <HudPanel label="GOTHAM TIME //" className="w-64">
      <div className="flex items-center gap-4">
        <ClockFace hourAngle={hourAngle} minAngle={minAngle} />
        <div className="flex-1">
          <p className="font-display text-2xl font-semibold tabular-nums text-signal">
            {time}
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-widest text-text-muted">
            {date}
          </p>
        </div>
      </div>
    </HudPanel>
  );
}

function ClockFace({ hourAngle, minAngle }: { hourAngle: number; minAngle: number }) {
  return (
    <svg viewBox="0 0 60 60" className="h-14 w-14 text-text-muted">
      <circle
        cx="30"
        cy="30"
        r="27"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.7"
      />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
        const x1 = 30 + Math.cos(a) * 23;
        const y1 = 30 + Math.sin(a) * 23;
        const x2 = 30 + Math.cos(a) * 27;
        const y2 = 30 + Math.sin(a) * 27;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1"
          />
        );
      })}
      <line
        x1="30"
        y1="30"
        x2={30 + Math.cos((hourAngle - 90) * (Math.PI / 180)) * 13}
        y2={30 + Math.sin((hourAngle - 90) * (Math.PI / 180)) * 13}
        stroke="#FFB200"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="30"
        y1="30"
        x2={30 + Math.cos((minAngle - 90) * (Math.PI / 180)) * 19}
        y2={30 + Math.sin((minAngle - 90) * (Math.PI / 180)) * 19}
        stroke="#FFB200"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="30" cy="30" r="2" fill="#FFB200" />
    </svg>
  );
}

function formatTime(d: Date): string {
  const p = (n: number) => n.toString().padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function formatDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
