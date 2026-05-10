'use client';

import { useEffect, useRef, useState } from 'react';

const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#';
const DEFAULT_DURATION = 500;

export type DecryptTrigger = 'mount' | 'inview';

export interface DecryptTextProps {
  text: string;
  durationMs?: number;
  trigger?: DecryptTrigger;
  className?: string;
}

export function DecryptText({
  text,
  durationMs = DEFAULT_DURATION,
  trigger = 'mount',
  className,
}: DecryptTextProps) {
  // Render the real text on server + first client paint to avoid hydration mismatch.
  // The animate() function will overwrite this on its first frame.
  const [display, setDisplay] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setDisplay(text);
      return;
    }

    const animate = () => {
      const t0 = performance.now();
      let raf = 0;
      const step = (t: number) => {
        const ratio = Math.min(1, (t - t0) / durationMs);
        const out = text
          .split('')
          .map((ch, i) => {
            if (ch === ' ') return ' ';
            const lockAt = (i + 1) / text.length;
            if (ratio >= lockAt) return ch;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          })
          .join('');
        setDisplay(out);
        if (ratio < 1) {
          raf = requestAnimationFrame(step);
        } else {
          setDisplay(text);
        }
      };
      raf = requestAnimationFrame(step);
      return () => cancelAnimationFrame(raf);
    };

    const start = () => {
      if (ranRef.current) return;
      ranRef.current = true;
      animate();
    };

    if (trigger === 'mount') {
      start();
      return;
    }

    const node = ref.current;
    if (!node || !('IntersectionObserver' in window)) {
      start();
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            start();
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [text, durationMs, trigger]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
