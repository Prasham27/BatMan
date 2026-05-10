'use client';

import { useEffect } from 'react';

/**
 * Listens for the user typing a target string at the page level (outside
 * inputs/textareas). Calls onMatch when the most recent N keystrokes equal the
 * target (case-insensitive). Used by easter eggs.
 */
export function useTypeSequence(target: string, onMatch: () => void): void {
  useEffect(() => {
    const targetLower = target.toLowerCase();
    let buffer = '';

    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const tag = t?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || t?.isContentEditable) return;
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-targetLower.length);
      if (buffer === targetLower) {
        buffer = '';
        onMatch();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [target, onMatch]);
}
