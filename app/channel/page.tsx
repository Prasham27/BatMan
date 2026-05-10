'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import type { CommsState } from '@/components/channel/CommsArray';

const CommsArray = dynamic(
  () =>
    import('@/components/channel/CommsArray').then((m) => m.CommsArray),
  { ssr: false },
);

export default function ChannelPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [state, setState] = useState<CommsState>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state !== 'idle') return;
    setError(null);
    setState('locking');

    try {
      const res = await fetch('/api/channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, honeypot }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok) {
        setError(
          data.error ?? 'Transmission failed. Verify the array configuration.',
        );
        setState('transmitting');
        window.setTimeout(() => setState('idle'), 4000);
        return;
      }

      setState('transmitting');
      window.setTimeout(() => {
        setState('idle');
        setName('');
        setEmail('');
        setMessage('');
      }, 5000);
    } catch {
      setError('Network unreachable. Try again.');
      setState('idle');
    }
  };

  const isLocked = state !== 'idle';

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:px-10 md:pt-28">
      <p className="font-mono text-[11px] tracking-widest text-text-muted">
        COMMS //
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text md:text-6xl">
        Encrypted Channel
      </h1>
      <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-text-muted">
        Open a comms link. The transmission is staged via the array on the right
        — submit and watch the dish lock onto target.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr]">
        <form
          onSubmit={handleSubmit}
          className="relative space-y-5 border border-border bg-surface/50 p-6 backdrop-blur-sm"
        >
          <Field
            label="OPERATOR NAME"
            required
            value={name}
            onChange={setName}
            disabled={isLocked}
          />
          <Field
            label="UPLINK ADDRESS"
            type="email"
            required
            value={email}
            onChange={setEmail}
            disabled={isLocked}
          />
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-text-muted">
              MESSAGE //
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              disabled={isLocked}
              rows={6}
              maxLength={5000}
              className={cn(
                'mt-2 w-full border border-border bg-ink/60 px-3 py-2',
                'font-mono text-sm text-text placeholder:text-text-muted',
                'focus:border-signal focus:outline-none disabled:opacity-50',
              )}
              placeholder="Begin transmission…"
            />
          </div>

          {/* Honeypot — hidden from real users */}
          <input
            type="text"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
            aria-hidden
          />

          <button
            type="submit"
            disabled={isLocked}
            className={cn(
              'w-full border px-4 py-3 font-mono text-xs tracking-widest transition-colors',
              isLocked
                ? 'border-signal text-signal'
                : 'border-border text-text-muted hover:border-signal hover:text-signal',
              'disabled:opacity-80',
            )}
          >
            {state === 'idle' && '[ TRANSMIT ]'}
            {state === 'locking' && '[ LOCKING TARGET... ]'}
            {state === 'transmitting' && '[ TRANSMITTING... ]'}
          </button>

          {error && (
            <p className="font-mono text-[10px] tracking-widest text-alert">
              {error}
            </p>
          )}
        </form>

        <CommsArray state={state} />
      </div>
    </main>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: 'text' | 'email';
  disabled?: boolean;
}

function Field({
  label,
  value,
  onChange,
  required,
  type = 'text',
  disabled,
}: FieldProps) {
  return (
    <div>
      <label className="block font-mono text-[10px] tracking-widest text-text-muted">
        {label} //
      </label>
      <input
        type={type}
        value={value}
        required={required}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'mt-2 w-full border border-border bg-ink/60 px-3 py-2',
          'font-mono text-sm text-text placeholder:text-text-muted',
          'focus:border-signal focus:outline-none disabled:opacity-50',
        )}
      />
    </div>
  );
}
