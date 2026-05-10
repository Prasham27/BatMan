'use client';

import Link from 'next/link';
import { cn } from '@/lib/cn';

interface NavButton {
  href: string;
  title: string;
  subtitle: string;
  icon: 'profile' | 'projects' | 'experience' | 'skills' | 'contact';
}

const BUTTONS: NavButton[] = [
  { href: '/overview', title: 'PROFILE', subtitle: 'OVERVIEW', icon: 'profile' },
  { href: '/cases', title: 'PROJECTS', subtitle: 'CASE FILES', icon: 'projects' },
  { href: '/log', title: 'EXPERIENCE', subtitle: 'MISSION LOG', icon: 'experience' },
  { href: '/loadout', title: 'SKILLS', subtitle: 'ARSENAL', icon: 'skills' },
  { href: '/channel', title: 'CONTACT', subtitle: 'COMMS', icon: 'contact' },
];

export function BatcomputerNav() {
  return (
    <div className="pointer-events-auto w-full max-w-[640px]">
      <div className="border border-border/60 bg-ink/45 backdrop-blur-md">
        <div className="border-b border-border/40 px-5 py-3">
          <p className="font-mono text-[10px] tracking-widest text-signal">
            BATCOMPUTER CONSOLE //
          </p>
          <p className="mt-0.5 font-mono text-[10px] tracking-widest text-text-muted">
            ACCESS YOUR DATA
          </p>
        </div>
        <div className="grid grid-cols-5">
          {BUTTONS.map((btn) => (
            <Link
              key={btn.href}
              href={btn.href}
              className={cn(
                'group relative flex flex-col items-center gap-2 border-r border-border/30 px-3 py-5 last:border-r-0',
                'transition-colors duration-base ease-snap',
                'hover:bg-signal/5 focus-visible:bg-signal/5',
              )}
            >
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-signal transition-transform duration-base ease-linear group-hover:scale-x-100 group-focus-visible:scale-x-100"
              />
              <Icon name={btn.icon} className="text-text-muted transition-colors duration-base group-hover:text-signal" />
              <div className="text-center">
                <p className="font-mono text-[11px] font-semibold tracking-widest text-text transition-colors duration-base group-hover:text-signal">
                  {btn.title}
                </p>
                <p className="mt-0.5 font-mono text-[9px] tracking-widest text-text-muted">
                  {btn.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Icon({ name, className }: { name: NavButton['icon']; className?: string }) {
  const props = {
    width: 28,
    height: 28,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.4,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };
  switch (name) {
    case 'profile':
      return (
        <svg {...props}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20 Q5 14 12 14 Q19 14 19 20" />
        </svg>
      );
    case 'projects':
      return (
        <svg {...props}>
          <path d="M5 5 H14 L19 10 V19 H5 Z" />
          <path d="M14 5 V10 H19" />
          <path d="M8 13 H16 M8 16 H14" />
        </svg>
      );
    case 'experience':
      return (
        <svg {...props}>
          <path d="M12 3 L20 6 V13 Q20 18 12 21 Q4 18 4 13 V6 Z" />
          <path d="M9 11 L11 13 L15 9" />
        </svg>
      );
    case 'skills':
      return (
        <svg {...props}>
          <path d="M5 5 L19 19" />
          <path d="M19 5 L5 19" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );
    case 'contact':
      return (
        <svg {...props}>
          <path d="M5 7 Q5 5 7 5 H10 L12 9 L10 11 Q12 14 15 16 L17 14 L21 16 V19 Q21 21 19 21 Q11 21 5 15 Q5 11 5 7 Z" />
        </svg>
      );
  }
}
