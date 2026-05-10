'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { useWebGLSupport } from '@/lib/useWebGLSupport';
import { MobileFallback } from './MobileFallback';
import { CaveHUD } from './CaveHUD';
import { DoorIntro } from './DoorIntro';
import { BootSequence } from '@/components/effects/BootSequence';
import { BatmobileStatus } from './hud/BatmobileStatus';
import { SuitInspector } from './SuitInspector';
import type { SuitId } from './SuitRack';

const CaveScene = dynamic(
  () => import('./CaveScene').then((m) => m.CaveScene),
  { ssr: false, loading: () => <CaveLoading /> },
);

const WELCOMED_KEY = 'bc.cave.welcomed';
const VISITED_SUITS_KEY = 'bc.cave.visitedSuits';
const SIGNAL_KEY = 'bc.cave.signal';

const REQUIRED_SUITS: SuitId[] = ['suit-tactical', 'suit-stealth', 'suit-armored'];

function CaveLoading() {
  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center bg-ink">
      <p className="font-mono text-xs tracking-widest text-text-muted">
        CALIBRATING SCENE //
      </p>
    </div>
  );
}

type Phase = 'probing' | 'welcoming-boot' | 'welcoming-door' | 'live';

export function CaveLanding() {
  const supported = useWebGLSupport();
  const [phase, setPhase] = useState<Phase>('probing');
  const [batmobileOpen, setBatmobileOpen] = useState(false);
  const [activeSuit, setActiveSuit] = useState<SuitId | null>(null);
  const [visitedSuits, setVisitedSuits] = useState<Set<SuitId>>(new Set());
  const [unlockToast, setUnlockToast] = useState(false);
  const [signalActive, setSignalActive] = useState(false);

  const prototypeUnlocked = REQUIRED_SUITS.every((s) => visitedSuits.has(s));

  useEffect(() => {
    if (supported !== true) return;
    let welcomed = false;
    try {
      welcomed = window.localStorage.getItem(WELCOMED_KEY) === '1';
      const visited = window.localStorage.getItem(VISITED_SUITS_KEY);
      if (visited) {
        setVisitedSuits(new Set(JSON.parse(visited) as SuitId[]));
      }
      const sig = window.localStorage.getItem(SIGNAL_KEY);
      if (sig === '1') setSignalActive(true);
    } catch {
      welcomed = false;
    }
    setPhase(welcomed ? 'live' : 'welcoming-boot');
  }, [supported]);

  const handleBootComplete = useCallback(() => {
    setPhase('welcoming-door');
  }, []);

  const handleDoorComplete = useCallback(() => {
    try {
      window.localStorage.setItem(WELCOMED_KEY, '1');
    } catch {
      // noop
    }
    setPhase('live');
  }, []);

  const openBatmobile = useCallback(() => setBatmobileOpen((v) => !v), []);
  const closeBatmobile = useCallback(() => setBatmobileOpen(false), []);

  const openSuit = useCallback((id: SuitId) => {
    setActiveSuit(id);
    setVisitedSuits((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      try {
        window.localStorage.setItem(
          VISITED_SUITS_KEY,
          JSON.stringify([...next]),
        );
      } catch {
        // noop
      }
      // Trigger unlock toast if this completes the requirement set
      const willUnlock = REQUIRED_SUITS.every((s) => next.has(s));
      const wasUnlocked = REQUIRED_SUITS.every((s) => prev.has(s));
      if (willUnlock && !wasUnlocked) {
        setUnlockToast(true);
        window.setTimeout(() => setUnlockToast(false), 6000);
      }
      return next;
    });
  }, []);
  const closeSuit = useCallback(() => setActiveSuit(null), []);

  const toggleSignal = useCallback(() => {
    setSignalActive((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIGNAL_KEY, next ? '1' : '0');
      } catch {
        // noop
      }
      return next;
    });
  }, []);

  if (supported === null || phase === 'probing') return <CaveLoading />;
  if (!supported) return <MobileFallback />;

  return (
    <>
      <div className="fixed inset-0 z-0">
        <CaveScene
          onBatmobileClick={openBatmobile}
          onSuitClick={openSuit}
          signalActive={signalActive}
          prototypeUnlocked={prototypeUnlocked}
        />
      </div>
      {phase === 'live' && (
        <>
          <CaveHUD
            signalActive={signalActive}
            onToggleSignal={toggleSignal}
            unlockToast={unlockToast}
          />
          <BatmobileStatus visible={batmobileOpen} onClose={closeBatmobile} />
        </>
      )}
      <SuitInspector suit={activeSuit} onClose={closeSuit} />
      <DoorIntro
        active={phase === 'welcoming-door'}
        onComplete={handleDoorComplete}
      />
      <BootSequence
        active={phase === 'welcoming-boot'}
        onComplete={handleBootComplete}
      />
    </>
  );
}
