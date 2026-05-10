'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const SESSION_KEY = 'bc.session.id';
const VISITOR_KEY = 'bc.visitor.id';

function makeId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function getSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh = makeId('s');
    window.sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return 'anonymous';
  }
}

/** Persists across tab closes — identifies the same browser over time. */
function getVisitorId(): string {
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const fresh = makeId('v');
    window.localStorage.setItem(VISITOR_KEY, fresh);
    return fresh;
  } catch {
    return 'anonymous';
  }
}

/**
 * Fires a beacon to /api/track on every route change. Skips /admin so the
 * operator's own dashboard checks don't pollute the stats.
 */
export function TrackBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    const body = JSON.stringify({
      path: pathname,
      sessionId: getSessionId(),
      visitorId: getVisitorId(),
      referrer: typeof document !== 'undefined' ? document.referrer : '',
    });

    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/track', blob);
    } else {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  }, [pathname]);

  return null;
}
