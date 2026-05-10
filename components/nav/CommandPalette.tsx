'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { content } from '@/content/data';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/cn';

const RADIAL_LIMIT = 6;
const RING_RADIUS = 220;

interface Suggestion {
  id: string;
  label: string;
  hint: string;
  href: string;
}

function buildAllSuggestions(): Suggestion[] {
  const navItems: Suggestion[] = ROUTES.map((r) => ({
    id: `nav-${r.href}`,
    label: `nav ${r.label.toLowerCase()}`,
    hint: r.href,
    href: r.href,
  }));
  const projectItems: Suggestion[] = content.projects.map((p) => ({
    id: `open-${p.id}`,
    label: `open ${p.id}`,
    hint: p.name,
    href: `/cases/${p.id}`,
  }));
  return [
    ...navItems,
    ...projectItems,
    {
      id: 'contact',
      label: 'contact',
      hint: 'open encrypted channel',
      href: '/channel',
    },
  ];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const all = useMemo(buildAllSuggestions, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Desktop-only feature — radial layout doesn't fit small viewports.
      if (window.innerWidth < 768) return;

      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const inField =
        tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable === true;

      if (e.key === '/' && !inField && !open) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (open && e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all.slice(0, RADIAL_LIMIT);
    return all
      .map((s) => ({ s, score: fuzzyScore(`${s.label} ${s.hint.toLowerCase()}`, q) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, RADIAL_LIMIT)
      .map((x) => x.s);
  }, [all, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const execute = (s: Suggestion) => {
    close();
    router.push(s.href);
  };

  if (!open) return null;

  const N = suggestions.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={close}
      className="fixed inset-0 z-[90] hidden items-center justify-center bg-ink/80 p-4 backdrop-blur-sm md:flex"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative"
        style={{ width: 600, height: 600 }}
      >
        {/* Decorative arcs */}
        <svg
          aria-hidden
          className="absolute inset-0"
          width="600"
          height="600"
          viewBox="0 0 600 600"
        >
          <g fill="none" stroke="currentColor" className="text-border">
            <circle cx="300" cy="300" r={RING_RADIUS} strokeDasharray="4 6" opacity="0.5" />
            <circle cx="300" cy="300" r={RING_RADIUS - 60} opacity="0.3" />
            <circle cx="300" cy="300" r={RING_RADIUS + 50} opacity="0.15" />
          </g>
          <g
            fill="currentColor"
            className="text-signal"
          >
            <circle cx="300" cy={300 - RING_RADIUS - 50} r="2" />
            <circle cx="300" cy={300 + RING_RADIUS + 50} r="2" />
            <circle cx={300 - RING_RADIUS - 50} cy="300" r="2" />
            <circle cx={300 + RING_RADIUS + 50} cy="300" r="2" />
          </g>
        </svg>

        {/* Center input + footer */}
        <div className="absolute left-1/2 top-1/2 z-10 w-[300px] -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center border border-signal bg-surface">
            <span className="px-3 py-2 font-mono text-[11px] tracking-widest text-signal">
              CMD //
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && suggestions[0]) {
                  e.preventDefault();
                  execute(suggestions[0]);
                }
              }}
              placeholder="nav cases · open detective-atpg"
              className="flex-1 bg-transparent py-2 pr-3 font-mono text-sm text-text placeholder:text-text-muted focus:outline-none"
              aria-label="Command input"
            />
          </div>
          <div className="mt-3 text-center font-mono text-[10px] tracking-widest text-text-muted">
            ↵ EXECUTE · ESC CLOSE · {N}/{all.length}
          </div>
        </div>

        {/* Radial items */}
        {suggestions.map((s, i) => {
          const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(N, 1);
          const x = RING_RADIUS * Math.cos(angle);
          const y = RING_RADIUS * Math.sin(angle);
          const isTop = i === 0;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => execute(s)}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
              }}
              className={cn(
                'min-w-[150px] border bg-surface px-3 py-2 text-left',
                'font-mono text-xs transition-colors duration-fast ease-snap',
                isTop
                  ? 'border-signal text-signal'
                  : 'border-border text-text-muted hover:border-signal hover:text-text',
              )}
            >
              <div>{s.label}</div>
              <div className="mt-0.5 truncate text-[10px] tracking-widest text-text-muted">
                {s.hint}
              </div>
            </button>
          );
        })}

        {N === 0 && (
          <div className="absolute left-1/2 top-[calc(50%+140px)] -translate-x-1/2 font-mono text-xs tracking-widest text-text-muted">
            NO MATCHES
          </div>
        )}
      </div>
    </div>
  );
}

function fuzzyScore(haystack: string, needle: string): number {
  if (!needle) return 1;
  let h = 0;
  let n = 0;
  let score = 0;
  let consecutive = 0;
  while (h < haystack.length && n < needle.length) {
    if (haystack[h] === needle[n]) {
      score += 1 + consecutive;
      consecutive += 1;
      n += 1;
    } else {
      consecutive = 0;
    }
    h += 1;
  }
  return n === needle.length ? score : 0;
}
