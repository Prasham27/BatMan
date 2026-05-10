'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/lib/routes';
import { cn } from '@/lib/cn';

export function PrimaryNav() {
  const pathname = usePathname();

  // Hidden on the cave landing for full immersion.
  if (pathname === '/') return null;

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'fixed left-3 top-3 z-30 max-w-[calc(100%-1.5rem)]',
        'md:left-4 md:top-4',
      )}
    >
      <ul className="flex flex-wrap items-center gap-x-1 gap-y-1 font-mono text-[10px] uppercase tracking-widest md:text-[11px]">
        {ROUTES.map((r) => {
          const active =
            r.href === '/' ? pathname === '/' : pathname.startsWith(r.href);
          return (
            <li key={r.href}>
              <Link
                href={r.href}
                className={cn(
                  'inline-block px-2 py-1 transition-colors duration-base ease-snap',
                  active
                    ? 'text-signal'
                    : 'text-text-muted hover:text-text focus-visible:text-text',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {r.codename}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
