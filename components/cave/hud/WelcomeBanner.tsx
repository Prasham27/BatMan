'use client';

import { useEffect, useState } from 'react';
import { content } from '@/content/data';

const NAME_TYPE_MS = 700;

export function WelcomeBanner() {
  const fullName = content.identity.name.toUpperCase();
  const [chars, setChars] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setChars(fullName.length);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const ratio = Math.min(1, (t - start) / NAME_TYPE_MS);
      setChars(Math.floor(ratio * fullName.length));
      if (ratio < 1) raf = requestAnimationFrame(step);
      else setChars(fullName.length);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [fullName]);

  return (
    <div className="pointer-events-none relative flex flex-col items-center px-6">
      {/* Corner brackets framing the title */}
      <CornerTick className="absolute -left-1 top-2" />
      <CornerTick className="absolute -right-1 top-2 scale-x-[-1]" />

      <p className="font-mono text-[11px] tracking-[0.4em] text-text-muted">
        WELCOME BACK,
      </p>
      <h1 className="mt-1 font-display text-5xl font-semibold tracking-[0.25em] text-text md:text-6xl">
        {fullName.slice(0, chars)}
        {chars < fullName.length && (
          <span
            aria-hidden
            className="ml-1 inline-block h-[0.8em] w-[10px] align-middle"
            style={{ backgroundColor: 'var(--signal)' }}
          />
        )}
      </h1>
      <p className="mt-3 max-w-md text-center font-mono text-xs italic leading-relaxed text-text-muted">
        &ldquo;It&apos;s not who I am underneath, but what I do that defines me.&rdquo;
      </p>
    </div>
  );
}

function CornerTick({ className }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      className={`text-signal ${className ?? ''}`}
    >
      <path
        d="M2 2 L2 8 M2 2 L8 2"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
