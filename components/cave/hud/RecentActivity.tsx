'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HudPanel } from './HudPanel';

interface Item {
  name: string;
  pushedAt: string;
}

export function RecentActivity() {
  const [items, setItems] = useState<Item[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'offline'>('loading');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/github')
      .then((r) => r.json())
      .then((data: { recentActivity?: Item[]; stale?: boolean }) => {
        if (cancelled) return;
        const recent = (data.recentActivity ?? []).slice(0, 4);
        setItems(recent);
        setState(data.stale ? 'offline' : 'ready');
      })
      .catch(() => {
        if (!cancelled) setState('offline');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <HudPanel
      label="RECENT ACTIVITY //"
      caption={state === 'offline' ? 'STALE' : undefined}
      className="w-64"
    >
      {state === 'loading' && (
        <p className="font-mono text-xs text-text-muted">SYNCING...</p>
      )}
      {state !== 'loading' && items.length === 0 && (
        <p className="font-mono text-xs text-text-muted">NO RECENT SIGNAL</p>
      )}
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item) => (
            <li
              key={item.name}
              className="flex items-baseline gap-2 font-mono text-xs"
            >
              <span className="mt-1 inline-block h-1 w-1 shrink-0 rounded-full bg-signal" />
              <span className="text-text">
                Pushed to <span className="text-text-muted">{item.name}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/network"
        className="mt-4 inline-block border border-border px-3 py-1 font-mono text-[10px] tracking-widest text-text-muted transition-colors hover:border-signal hover:text-signal"
      >
        VIEW ALL
      </Link>
    </HudPanel>
  );
}
