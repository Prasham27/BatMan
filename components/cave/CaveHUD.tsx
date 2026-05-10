'use client';

import { WayneBranding } from './hud/WayneBranding';
import { WelcomeBanner } from './hud/WelcomeBanner';
import { BatcomputerNav } from './hud/BatcomputerNav';
import { DroneStatus } from './hud/DroneStatus';
import { RecentActivity } from './hud/RecentActivity';
import { GothamTime } from './hud/GothamTime';
import { SystemFeed } from './hud/SystemFeed';
import { LocationPanel } from './hud/LocationPanel';
import { Tagline } from './hud/Tagline';
import { DragHint } from './hud/DragHint';

export interface CaveHUDProps {
  signalActive?: boolean;
  onToggleSignal?: () => void;
  unlockToast?: boolean;
}

export function CaveHUD({
  signalActive = false,
  onToggleSignal,
  unlockToast = false,
}: CaveHUDProps) {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* Top-left: branding */}
      <div className="absolute left-6 top-6 pointer-events-auto">
        <WayneBranding />
      </div>

      {/* Top-center: welcome banner */}
      <div className="absolute left-1/2 top-6 -translate-x-1/2">
        <WelcomeBanner />
      </div>

      {/* Right column: stacked panels */}
      <div className="absolute right-6 top-6 flex w-64 flex-col gap-3">
        <DroneStatus />
        <RecentActivity />
        <GothamTime />
        <SystemFeed />
      </div>

      {/* Bottom-left: location + facility status */}
      <div className="absolute left-6 bottom-6 flex flex-col gap-2">
        <LocationPanel />
        <div className="font-mono text-[10px] tracking-widest text-text-muted">
          <div>FACILITY-7 // OPERATIONAL</div>
          <div className="text-signal">SYS // NOMINAL</div>
        </div>
      </div>

      {/* Bottom-right: signal toggle + brand */}
      <div className="absolute bottom-4 right-4 flex flex-col items-end gap-2">
        {onToggleSignal && (
          <button
            type="button"
            onClick={onToggleSignal}
            className={
              'pointer-events-auto border bg-ink/40 px-3 py-1 font-mono text-[10px] tracking-widest backdrop-blur-md transition-colors ' +
              (signalActive
                ? 'border-signal text-signal'
                : 'border-border text-text-muted hover:border-signal hover:text-signal')
            }
            aria-pressed={signalActive}
          >
            SIGNAL // {signalActive ? 'ENGAGED' : 'STANDBY'}
          </button>
        )}
        <div className="font-mono text-[10px] tracking-widest text-text-muted">
          BATCOMPUTER // v1.0
        </div>
      </div>

      {/* Bottom-center stack: nav + drag hint + tagline */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
        <BatcomputerNav />
        <DragHint />
        <Tagline />
      </div>

      {/* Prototype unlock toast — top center, below welcome banner */}
      {unlockToast && (
        <div className="pointer-events-none absolute left-1/2 top-44 z-30 -translate-x-1/2 border-2 border-signal bg-ink/95 px-5 py-3 backdrop-blur-md">
          <p className="font-mono text-[10px] tracking-widest text-signal">
            [ PROTOTYPE UNLOCKED ]
          </p>
          <p className="mt-1 font-display text-lg font-semibold text-text">
            WAYNE TECH BETA — Mk Ω
          </p>
          <p className="mt-1 font-mono text-[10px] tracking-widest text-text-muted">
            A new display has appeared deep in the cave.
          </p>
        </div>
      )}
    </div>
  );
}
