'use client';

import Link from 'next/link';
import { HOME_HREF } from '@/lib/routes';

export function MobileFallback() {
  return (
    <main className="fixed inset-0 z-0 flex items-center justify-center bg-ink p-6">
      <div className="max-w-md text-center">
        <p className="font-mono text-[10px] tracking-widest text-text-muted">
          OPS DEN //
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text md:text-5xl">
          Batcomputer Standby
        </h1>
        <p className="mt-4 font-mono text-xs leading-relaxed text-text-muted">
          The full cave experience needs a desktop GPU and WebGL. Tap below to enter the Batcomputer directly.
        </p>
        <Link
          href={HOME_HREF}
          className="mt-8 inline-block border border-signal px-6 py-3 font-mono text-xs tracking-widest text-signal transition-colors duration-base hover:bg-signal hover:text-ink"
        >
          [ BOOT BATCOMPUTER ]
        </Link>
      </div>
    </main>
  );
}
