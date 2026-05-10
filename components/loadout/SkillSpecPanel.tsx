'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/cn';
import type { Skill, SkillCategory } from '@/content/types';

export interface SkillSpecPanelProps {
  category: SkillCategory | null;
  label: string;
  skills: Skill[];
  onClose: () => void;
}

export function SkillSpecPanel({
  category,
  label,
  skills,
  onClose,
}: SkillSpecPanelProps) {
  useEffect(() => {
    if (!category) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [category, onClose]);

  if (!category) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${label} loadout`}
      className="fixed inset-0 z-30 flex items-end justify-center p-4 md:items-center md:p-6"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm"
      />
      <div
        className={cn(
          'relative mx-auto w-full max-w-2xl border border-signal/50 bg-surface p-6 shadow-2xl',
        )}
        style={{
          animation:
            'loadoutSlideUp var(--dur-base) cubic-bezier(0.2,0,0,1) both',
        }}
      >
        <style jsx global>{`
          @keyframes loadoutSlideUp {
            from {
              opacity: 0;
              transform: translateY(16px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[10px] tracking-widest text-signal">
            LOADOUT // {label}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs tracking-widest text-text-muted transition-colors hover:text-signal"
          >
            [ ESC // CLOSE ]
          </button>
        </div>

        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-text md:text-3xl">
          {label.charAt(0) + label.slice(1).toLowerCase()}
        </h2>

        <p className="mt-2 font-mono text-[11px] tracking-widest text-text-muted">
          {skills.length.toString().padStart(2, '0')} ENTRIES //
        </p>

        <ul className="mt-5 divide-y divide-border border-t border-border">
          {skills.map((s) => (
            <li
              key={s.name}
              className="grid grid-cols-12 items-center gap-3 py-3"
            >
              <span className="col-span-6 font-display text-sm font-medium text-text md:text-base">
                {s.name}
              </span>
              <span
                aria-label={`Level ${s.level} of 5`}
                className="col-span-3 flex items-center gap-1"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    aria-hidden
                    className={cn(
                      'inline-block h-2.5 w-2.5',
                      n <= s.level
                        ? 'bg-signal'
                        : 'border border-signal/40 bg-transparent',
                    )}
                  />
                ))}
              </span>
              <span className="col-span-3 text-right font-mono text-[11px] tabular-nums tracking-widest text-text-muted">
                {s.yearsUsed} YR{s.yearsUsed === 1 ? '' : 'S'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SkillSpecPanel;
