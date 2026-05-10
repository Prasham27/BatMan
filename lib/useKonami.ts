'use client';

import { useEffect } from 'react';

const SEQUENCE: string[] = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export function useKonami(onUnlock: () => void): void {
  useEffect(() => {
    let position = 0;
    const onKey = (e: KeyboardEvent) => {
      const expected = SEQUENCE[position];
      const got = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (got === expected.toLowerCase()) {
        position += 1;
        if (position === SEQUENCE.length) {
          position = 0;
          onUnlock();
        }
      } else {
        position = 0;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onUnlock]);
}
