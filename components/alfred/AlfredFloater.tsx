'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

interface Msg {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTIONS = [
  "What's DETECTive?",
  'Tell me about your finance work.',
  'What are you learning right now?',
];

// Proactive tips Alfred occasionally surfaces while collapsed.
// Replace any of these with personal/contextual lines as you wish.
const PROACTIVE_TIPS = [
  'Surveillance flagged 3 anomalies, sir.',
  'You have 6 active investigations on file.',
  'A new commit was detected on detective-atpg.',
  'The training bag remains untouched today.',
  'Comms channel is operational.',
  'Master Wayne, may I direct your attention to /loadout?',
  "Don't forget to check the network — 4 new sightings.",
];

const TIP_FIRST_DELAY_MS = 12_000;
const TIP_REPEAT_INTERVAL_MS = 60_000;
const TIP_VISIBLE_MS = 6_000;

export function AlfredFloater() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [tip, setTip] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs, busy]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  // Proactive tip rotation — only while collapsed and not on the cave landing
  useEffect(() => {
    if (open) {
      setTip(null);
      return;
    }
    if (pathname === '/') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    let hideTimeout = 0;
    const showRandom = () => {
      const random = PROACTIVE_TIPS[Math.floor(Math.random() * PROACTIVE_TIPS.length)];
      setTip(random);
      hideTimeout = window.setTimeout(() => setTip(null), TIP_VISIBLE_MS);
    };

    const initial = window.setTimeout(showRandom, TIP_FIRST_DELAY_MS);
    const interval = window.setInterval(showRandom, TIP_REPEAT_INTERVAL_MS);
    return () => {
      window.clearTimeout(initial);
      window.clearTimeout(hideTimeout);
      window.clearInterval(interval);
    };
  }, [open, pathname]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setErr(null);
    setBusy(true);
    const next: Msg[] = [...msgs, { role: 'user', content: trimmed }];
    setMsgs(next);
    setInput('');
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (data.error && !data.message) {
        setErr(data.error);
      }
      if (data.message) {
        setMsgs((m) => [...m, { role: 'assistant', content: data.message! }]);
      }
    } catch {
      setErr('Connection failed. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (pathname === '/') return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open Alfred — portfolio assistant"
        title="Alfred — portfolio assistant"
        className={cn(
          'fixed bottom-4 left-4 z-30 flex h-9 items-center gap-2 border bg-surface px-3',
          'font-mono text-[11px] tracking-widest text-text-muted',
          'transition-colors duration-base ease-snap',
          'border-border hover:border-signal hover:text-signal',
          open && 'opacity-0 pointer-events-none',
        )}
      >
        <span aria-hidden>◌</span>
        <span>ALFRED</span>
        {tip && !open && (
          <span
            aria-hidden
            className="ml-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-signal"
          />
        )}
      </button>

      {/* Proactive tip bubble */}
      {tip && !open && (
        <button
          type="button"
          onClick={() => {
            setTip(null);
            setOpen(true);
          }}
          aria-label="Open Alfred about this tip"
          className={cn(
            'fixed bottom-16 left-4 z-30 max-w-xs border border-signal/60 bg-surface/95 px-3 py-2 backdrop-blur-md',
            'pointer-events-auto text-left transition-opacity hover:border-signal',
          )}
        >
          <p className="font-mono text-[10px] tracking-widest text-signal">
            ALFRED //
          </p>
          <p className="mt-1 font-mono text-xs leading-relaxed text-text">
            {tip}
          </p>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Alfred — portfolio assistant"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[110] flex items-end justify-stretch bg-ink/60 md:items-center md:justify-end md:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex h-[75vh] w-full flex-col border border-border bg-surface md:h-[540px] md:w-[380px]"
          >
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="font-mono text-[10px] tracking-widest text-signal">
                  ALFRED // ONLINE
                </p>
                <p className="font-display text-base text-text">Portfolio Assistant</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="font-mono text-xs tracking-widest text-text-muted transition-colors hover:text-signal"
              >
                [ ESC ]
              </button>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto p-4 text-sm"
            >
              {msgs.length === 0 ? (
                <div>
                  <p className="font-mono text-xs leading-relaxed text-text-muted">
                    Inquiries about Prasham&apos;s projects, skills, or experience are
                    accepted, sir. Pick a starting point — or type your own:
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {SUGGESTIONS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => send(q)}
                        className="border border-border px-3 py-2 text-left text-xs text-text-muted transition-colors duration-fast hover:border-signal hover:text-signal"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                msgs.map((m, i) => (
                  <div key={i}>
                    <p className="mb-1 font-mono text-[10px] tracking-widest text-text-muted">
                      {m.role === 'user' ? 'YOU //' : 'ALFRED //'}
                    </p>
                    <p
                      className={cn(
                        'whitespace-pre-wrap leading-relaxed',
                        m.role === 'user' ? 'text-text' : 'text-text-muted',
                      )}
                    >
                      {m.content}
                    </p>
                  </div>
                ))
              )}
              {busy && (
                <div className="font-mono text-xs text-signal">
                  ALFRED // PROCESSING…
                </div>
              )}
              {err && <div className="font-mono text-xs text-alert">{err}</div>}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex gap-2 border-t border-border p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={busy}
                placeholder="Type a message…"
                className="flex-1 border border-border bg-transparent px-3 py-2 font-mono text-xs text-text placeholder:text-text-muted focus:border-signal focus:outline-none"
                aria-label="Message Alfred"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="border border-border px-4 py-2 font-mono text-xs tracking-widest text-text-muted transition-colors duration-fast hover:border-signal hover:text-signal disabled:opacity-50"
              >
                SEND
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
