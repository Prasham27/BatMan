'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/cn';

const STORAGE_KEY = 'bc.audio';

interface WindowWithWebkit extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export function AmbientHum() {
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = () => {
    if (ctxRef.current) return;
    const w = window as WindowWithWebkit;
    const Ctx = window.AudioContext ?? w.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 60;
    const gain = ctx.createGain();
    gain.gain.value = 0.04;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    ctxRef.current = ctx;
    oscRef.current = osc;
  };

  const stop = () => {
    try {
      oscRef.current?.stop();
    } catch {
      // noop
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
    }
    ctxRef.current = null;
    oscRef.current = null;
  };

  const toggle = () => {
    if (on) {
      stop();
      setOn(false);
      window.localStorage.setItem(STORAGE_KEY, '0');
    } else {
      start();
      setOn(true);
      window.localStorage.setItem(STORAGE_KEY, '1');
    }
  };

  if (!mounted) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Mute ambient hum' : 'Play ambient hum'}
      title={on ? 'Mute ambient hum' : 'Play ambient hum'}
      className={cn(
        'fixed bottom-4 right-4 z-30 h-9 w-9 border bg-surface',
        'flex items-center justify-center font-mono text-xs',
        'transition-colors duration-base ease-snap',
        on
          ? 'border-signal text-signal'
          : 'border-border text-text-muted hover:text-text',
      )}
    >
      <span aria-hidden>{on ? '◆' : '◇'}</span>
    </button>
  );
}
