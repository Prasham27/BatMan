'use client';

import { useCallback, useEffect, useState } from 'react';
import { useKonami } from '@/lib/useKonami';

const STORAGE_KEY = 'bc.vault.unlocked';

// Replace these placeholder lines with something genuinely interesting later
// (a hidden link, an inside joke, a real stat, an unreleased project teaser).
// REMINDERS.md tracks this as a follow-up.
const VAULT_LINES = [
  '// CLEARANCE: ELEVATED',
  '// SUBJECT: PRASHAM',
  '// SECTOR: WAYNE-TECH BETA',
  '// MORE INTEL TO COME',
];

export function VaultUnlock() {
  const [open, setOpen] = useState(false);

  const onUnlock = useCallback(() => {
    setOpen(true);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // noop
    }
  }, []);

  useKonami(onUnlock);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vault access granted"
      onClick={() => setOpen(false)}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/90 p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg border border-signal bg-surface p-8"
      >
        <p className="font-mono text-[11px] tracking-widest text-signal">
          BROTHER EYE // VAULT ACCESS GRANTED
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-text">
          Hidden Channel
        </h2>
        <p className="mt-3 font-mono text-sm leading-relaxed text-text-muted">
          You found the Konami sequence. The vault has more in store as the build
          continues — for now, this is a checkpoint.
        </p>
        <ul className="mt-5 space-y-1 font-mono text-xs text-text-muted">
          {VAULT_LINES.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-6 border border-border px-4 py-2 font-mono text-xs tracking-widest text-text-muted transition-colors duration-base hover:border-signal hover:text-signal"
        >
          [ ESC // CLOSE ]
        </button>
      </div>
    </div>
  );
}
