'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/cn';

export type SpecItemId =
  | 'batmobile'
  | 'gadget-grapple'
  | 'gadget-drone'
  | 'gadget-comms'
  | 'bag'
  | 'suit-tactical'
  | 'suit-stealth'
  | 'suit-armored';

interface SpecData {
  label: string;
  title: string;
  description: string;
  rows: { k: string; v: string }[];
}

const SPECS: Record<SpecItemId, SpecData> = {
  batmobile: {
    label: 'TACTICAL TRANSPORT // T-04',
    title: 'Tumbler-class Stealth Vehicle',
    description:
      'Armored carbon-composite chassis, turbine-electric powerplant, run-flat tires, and a passive-radar profile. Built for low-altitude breach operations where conventional vehicles are detected.',
    rows: [
      { k: 'CHASSIS', v: 'C-COMPOSITE' },
      { k: 'POWERPLANT', v: 'TURBINE-ELEC' },
      { k: 'TOP SPEED', v: '348 KM/H' },
      { k: '0–100', v: '2.6 SEC' },
      { k: 'RANGE', v: '740 KM' },
      { k: 'PROFILE', v: 'PASSIVE' },
    ],
  },
  'gadget-grapple': {
    label: 'GADGET // GR-2',
    title: 'Compact Grappling Device',
    description:
      'High-tensile composite line with magnetic-locking head and recoil dampening. Active reach 60 m, auto-retract 8 m/s.',
    rows: [
      { k: 'REACH', v: '60 M' },
      { k: 'LINE TENSILE', v: '12 KN' },
      { k: 'RETRACT', v: '8 M/S' },
      { k: 'WEIGHT', v: '1.2 KG' },
    ],
  },
  'gadget-drone': {
    label: 'GADGET // OBSERVER-3',
    title: 'Recon Microdrone',
    description:
      'Quiet quad-rotor with thermal/visible-light imaging, encrypted uplink, and a 22-minute ceiling. Folds to palm size for field carry.',
    rows: [
      { k: 'FLIGHT', v: '22 MIN' },
      { k: 'CEILING', v: '120 M' },
      { k: 'CAMERAS', v: 'IR + RGB' },
      { k: 'UPLINK', v: 'AES-256' },
    ],
  },
  'gadget-comms': {
    label: 'GADGET // COMMS-7',
    title: 'Encrypted Communicator',
    description:
      'Subdermal-pickup mic, bone-conduction earpiece, frequency-hopping radio. Burst-transmit profile defeats most signal triangulation.',
    rows: [
      { k: 'CHANNELS', v: '128' },
      { k: 'PROFILE', v: 'HOPPING' },
      { k: 'BATTERY', v: '72 HR' },
    ],
  },
  bag: {
    label: 'TRAINING // T-BAG',
    title: 'Heavy Bag',
    description:
      'Click the bag in the cave to throw a punch. The counter persists for the session — close the tab and it resets.',
    rows: [],
  },
  'suit-tactical': {
    label: 'SUIT // MK VII',
    title: 'Tactical Suit Mk VII',
    description:
      'Standard-issue armored composite suit. Balanced loadout — protection sufficient for sustained combat without compromising speed or recovery. Default deployment.',
    rows: [
      { k: 'WEIGHT', v: '11.4 KG' },
      { k: 'ARMOR', v: 'CLASS III' },
      { k: 'MOBILITY', v: '94%' },
      { k: 'NV / IR', v: 'INTEGRATED' },
      { k: 'COMMS', v: 'ENCRYPTED' },
      { k: 'STATUS', v: 'READY' },
    ],
  },
  'suit-stealth': {
    label: 'SUIT // MK III',
    title: 'Stealth Suit Mk III',
    description:
      'Light-profile suit with active radar dampening, sound-absorbing weave, and a thermally-neutral outer shell. For infiltration where contact must not be made.',
    rows: [
      { k: 'WEIGHT', v: '7.8 KG' },
      { k: 'ARMOR', v: 'CLASS I' },
      { k: 'PROFILE', v: 'PASSIVE' },
      { k: 'NOISE', v: '< 18 dB' },
      { k: 'THERMAL', v: 'NEUTRAL' },
      { k: 'STATUS', v: 'READY' },
    ],
  },
  'suit-armored': {
    label: 'SUIT // MK IX',
    title: 'Armored Suit Mk IX',
    description:
      'Heavy-plate suit for high-threat encounters. Reinforced ceramic over the chest and shoulders, integrated impact dampers. Sacrifices mobility for survivability.',
    rows: [
      { k: 'WEIGHT', v: '22.6 KG' },
      { k: 'ARMOR', v: 'CLASS V' },
      { k: 'MOBILITY', v: '68%' },
      { k: 'IMPACT', v: 'ABSORBED' },
      { k: 'COOLING', v: 'ACTIVE' },
      { k: 'STATUS', v: 'STAGED' },
    ],
  },
};

export interface SpecPanelProps {
  item: SpecItemId | null;
  bagPunches?: number;
  onClose: () => void;
}

export function SpecPanel({ item, bagPunches, onClose }: SpecPanelProps) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [item, onClose]);

  if (!item) return null;
  const spec = SPECS[item];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={spec.title}
      className="fixed inset-0 z-30 flex items-end justify-center p-4 md:items-center md:p-6"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm"
      />
      <div className="relative mx-auto w-full max-w-2xl border border-signal/50 bg-surface p-6 shadow-2xl">
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[10px] tracking-widest text-signal">
            {spec.label}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs tracking-widest text-text-muted transition-colors hover:text-signal"
          >
            [ ESC // CLOSE ]
          </button>
        </div>

        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-text md:text-3xl">
          {spec.title}
        </h2>

        <p className="mt-3 font-mono text-xs leading-relaxed text-text-muted md:text-sm">
          {spec.description}
        </p>

        {item === 'bag' && (
          <div className="mt-5 border-t border-border pt-5">
            <p className="font-mono text-[10px] tracking-widest text-text-muted">
              SESSION COUNTER //
            </p>
            <p className="mt-1 font-display text-4xl font-semibold tabular-nums text-signal">
              {(bagPunches ?? 0).toString().padStart(3, '0')}
            </p>
            <p className="mt-2 font-mono text-[10px] tracking-widest text-text-muted">
              PUNCHES // SESSION
            </p>
          </div>
        )}

        {spec.rows.length > 0 && (
          <div
            className={cn(
              'mt-5 grid gap-x-4 gap-y-3 border-t border-border pt-5',
              'grid-cols-2 md:grid-cols-3',
            )}
          >
            {spec.rows.map((r) => (
              <div key={r.k}>
                <p className="font-mono text-[10px] tracking-widest text-text-muted">
                  {r.k} //
                </p>
                <p className="mt-0.5 font-mono text-xs tabular-nums text-text">
                  {r.v}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
