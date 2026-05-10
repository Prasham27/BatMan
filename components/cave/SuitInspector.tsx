'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { SuitModel, type ComponentId } from './SuitModel';
import type { SuitId } from './SuitRack';

const SUIT_LABELS: Record<SuitId, string> = {
  'suit-tactical': 'TACTICAL MK VII',
  'suit-stealth': 'STEALTH MK III',
  'suit-armored': 'ARMORED MK IX',
  'suit-prototype': 'PROTOTYPE Mk Ω',
};

const SUIT_TITLES: Record<SuitId, string> = {
  'suit-tactical': 'Tactical Suit Mk VII',
  'suit-stealth': 'Stealth Suit Mk III',
  'suit-armored': 'Armored Suit Mk IX',
  'suit-prototype': 'Prototype Suit Mk Ω',
};

const SUIT_COLORS: Record<SuitId, { body: string; accent: string }> = {
  'suit-tactical': { body: '#08090c', accent: '#FFB200' },
  'suit-stealth': { body: '#0c1014', accent: '#5CE9E6' },
  'suit-armored': { body: '#15171c', accent: '#E63946' },
  'suit-prototype': { body: '#0e1a1f', accent: '#5CE9E6' },
};

const SUIT_BASE_MK: Record<SuitId, number> = {
  'suit-tactical': 7,
  'suit-stealth': 3,
  'suit-armored': 9,
  'suit-prototype': 99,
};

interface ComponentSpec {
  title: string;
  description: string;
  rows: { k: string; v: string }[];
}

const BASELINE_SPECS: Record<ComponentId, ComponentSpec> = {
  cowl: {
    title: 'Cowl',
    description:
      'Reinforced shell with integrated optics and EMP-shielded electronics. Houses NV/IR overlay, encrypted comms, and biometric monitoring.',
    rows: [
      { k: 'MATERIAL', v: 'CARBON-WEAVE' },
      { k: 'MASS', v: '1.2 KG' },
      { k: 'OPTICS', v: 'NV / IR' },
      { k: 'COMMS', v: 'AES-256' },
    ],
  },
  chest: {
    title: 'Chest Plate',
    description:
      'Composite armor over kevlar substrate. Class III ballistic protection with internal impact dampening and biometric monitor.',
    rows: [
      { k: 'MATERIAL', v: 'COMPOSITE / KEVLAR' },
      { k: 'MASS', v: '4.6 KG' },
      { k: 'CLASS', v: 'III' },
      { k: 'DAMPING', v: 'YES' },
    ],
  },
  shoulders: {
    title: 'Pauldrons',
    description:
      'Articulated aramid pauldrons. Full range of motion, edge-deflection geometry, integrated tac-light mounts.',
    rows: [
      { k: 'MATERIAL', v: 'ARAMID' },
      { k: 'MASS', v: '1.1 KG' },
      { k: 'ARTICULATED', v: 'YES' },
    ],
  },
  gauntlets: {
    title: 'Gauntlets',
    description:
      'Aramid + steel forearm bracers with three angled striking blades and integrated taser nodes. Reinforced knuckles.',
    rows: [
      { k: 'MATERIAL', v: 'ARAMID + STEEL' },
      { k: 'MASS', v: '1.8 KG' },
      { k: 'BLADES', v: '3 PER ARM' },
      { k: 'TASER', v: '50 kV' },
    ],
  },
  belt: {
    title: 'Utility Belt',
    description:
      'Titanium-frame belt with ten modular pouches. Center buckle houses comms array, GPS, and heartbeat monitor.',
    rows: [
      { k: 'MATERIAL', v: 'TITANIUM' },
      { k: 'MASS', v: '0.9 KG' },
      { k: 'POUCHES', v: '10 MODULAR' },
      { k: 'BUCKLE', v: 'COMMS HUB' },
    ],
  },
  legs: {
    title: 'Legs / Greaves',
    description:
      'Carbon-weave greaves with reinforced knee guards. Integrated shock absorbers reduce drop-impact by 60%.',
    rows: [
      { k: 'MATERIAL', v: 'CARBON-WEAVE' },
      { k: 'MASS', v: '1.6 KG' },
      { k: 'KNEE GUARDS', v: 'YES' },
      { k: 'SHOCK ABSORB', v: '60% Δ' },
    ],
  },
  boots: {
    title: 'Combat Boots',
    description:
      'Polymer + steel boots with mag-grip soles. Vertical-surface adhesion under controlled load. Hidden ankle blade.',
    rows: [
      { k: 'MATERIAL', v: 'POLYMER + STEEL' },
      { k: 'MASS', v: '2.1 KG' },
      { k: 'GRIP', v: 'MAG-LOCK' },
      { k: 'ANKLE BLADE', v: 'YES' },
    ],
  },
  cape: {
    title: 'Tactical Cape',
    description:
      'Memory-weave cape that stiffens under voltage to form a glide membrane. EMP-passive. Folds to half-size when relaxed.',
    rows: [
      { k: 'MATERIAL', v: 'MEMORY-WEAVE' },
      { k: 'MASS', v: '0.8 KG' },
      { k: 'GLIDE RATIO', v: '4 : 1' },
      { k: 'EMP', v: 'PASSIVE' },
    ],
  },
};

const SUIT_OVERRIDES: Partial<
  Record<SuitId, Partial<Record<ComponentId, Partial<ComponentSpec>>>>
> = {
  'suit-stealth': {
    cowl: {
      rows: [
        { k: 'MATERIAL', v: 'SOUND-WEAVE' },
        { k: 'MASS', v: '0.9 KG' },
        { k: 'OPTICS', v: 'NV / IR' },
        { k: 'PROFILE', v: 'PASSIVE' },
      ],
    },
    chest: {
      rows: [
        { k: 'MATERIAL', v: 'LIGHT POLYMER' },
        { k: 'MASS', v: '2.8 KG' },
        { k: 'CLASS', v: 'I' },
        { k: 'NOISE', v: '<18 dB' },
      ],
    },
    boots: {
      rows: [
        { k: 'MATERIAL', v: 'SILENT-SOLE' },
        { k: 'MASS', v: '1.4 KG' },
        { k: 'GRIP', v: 'RUBBER' },
        { k: 'NOISE', v: '<10 dB' },
      ],
    },
  },
  'suit-armored': {
    chest: {
      rows: [
        { k: 'MATERIAL', v: 'CERAMIC / TUNGSTEN' },
        { k: 'MASS', v: '8.4 KG' },
        { k: 'CLASS', v: 'V' },
        { k: 'IMPACT', v: 'ABSORBED' },
      ],
    },
    shoulders: {
      rows: [
        { k: 'MATERIAL', v: 'CERAMIC PLATE' },
        { k: 'MASS', v: '2.4 KG' },
        { k: 'ARTICULATED', v: 'LIMITED' },
      ],
    },
    boots: {
      rows: [
        { k: 'MATERIAL', v: 'STEEL-CORE' },
        { k: 'MASS', v: '3.5 KG' },
        { k: 'GRIP', v: 'MAG-LOCK' },
        { k: 'BLAST', v: 'CLASS IV' },
      ],
    },
  },
  'suit-prototype': {
    cowl: {
      title: 'Adaptive Cowl',
      description:
        'Self-tinting visor with multi-spectral overlay (NV / IR / UV / EM). Adaptive sound-cancellation. Wayne Tech Beta.',
      rows: [
        { k: 'MATERIAL', v: 'GRAPHENE-WEAVE' },
        { k: 'MASS', v: '0.7 KG' },
        { k: 'OPTICS', v: 'NV / IR / UV / EM' },
        { k: 'COMMS', v: 'QUANTUM-LINK' },
      ],
    },
    chest: {
      title: 'Adaptive Chest Plate',
      description:
        'Liquid-armor that hardens on impact, returns soft for mobility. Class V protection at 60% the mass of standard armor.',
      rows: [
        { k: 'MATERIAL', v: 'LIQUID-ARMOR' },
        { k: 'MASS', v: '2.7 KG' },
        { k: 'CLASS', v: 'V (ADAPTIVE)' },
        { k: 'DAMPING', v: 'PIEZO' },
      ],
    },
    cape: {
      title: 'Memory Cape',
      description:
        'Bistable cape that morphs between glide-wing and full-cloak modes. Active camouflage tile pattern.',
      rows: [
        { k: 'MATERIAL', v: 'BISTABLE WEAVE' },
        { k: 'MASS', v: '0.5 KG' },
        { k: 'MODES', v: 'GLIDE / CLOAK' },
        { k: 'CAMO', v: 'ACTIVE' },
      ],
    },
  },
};

function getSpec(suit: SuitId, component: ComponentId): ComponentSpec {
  const baseline = BASELINE_SPECS[component];
  const override = SUIT_OVERRIDES[suit]?.[component];
  if (!override) return baseline;
  return { ...baseline, ...override };
}

export interface SuitInspectorProps {
  suit: SuitId | null;
  onClose: () => void;
}

export function SuitInspector({ suit, onClose }: SuitInspectorProps) {
  const [hoveredComponent, setHoveredComponent] = useState<ComponentId | null>(
    null,
  );
  const [selectedComponent, setSelectedComponent] = useState<ComponentId | null>(
    null,
  );
  const [evolution, setEvolution] = useState(0.5);

  useEffect(() => {
    if (!suit) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedComponent) setSelectedComponent(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [suit, onClose, selectedComponent]);

  useEffect(() => {
    setHoveredComponent(null);
    setSelectedComponent(null);
    setEvolution(0.5);
  }, [suit]);

  if (!suit) return null;

  const colors = SUIT_COLORS[suit];
  const baseMk = SUIT_BASE_MK[suit];
  const evoYear = 2020 + Math.floor(evolution * 10);
  // For the prototype suit, Mk reads as Ω; otherwise base Mk + evolution stages
  const evoMk =
    suit === 'suit-prototype'
      ? `Ω + ${Math.floor(evolution * 4)}`
      : (baseMk + Math.floor(evolution * 4)).toString();

  return (
    <div className="fixed inset-0 z-[110] bg-ink/95 backdrop-blur-sm">
      {/* Top header */}
      <div className="pointer-events-auto absolute left-6 top-6 z-10">
        <p className="font-mono text-[10px] tracking-widest text-signal">
          SUIT INSPECTOR //
        </p>
        <h2
          className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl"
          style={{ color: colors.accent }}
        >
          {SUIT_TITLES[suit]}
        </h2>
        <p className="mt-1 font-mono text-[10px] tracking-widest text-text-muted">
          {SUIT_LABELS[suit]}
        </p>
      </div>

      {/* Top-right close */}
      <button
        type="button"
        onClick={onClose}
        className="pointer-events-auto absolute right-6 top-6 z-10 border border-border px-4 py-2 font-mono text-xs tracking-widest text-text-muted transition-colors hover:border-signal hover:text-signal"
      >
        [ ESC // EXIT ]
      </button>

      {/* Bottom hint */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-center">
        <p className="font-mono text-[10px] tracking-widest text-text-muted">
          DRAG TO ROTATE · SCROLL TO ZOOM · CLICK COMPONENTS FOR INTEL
        </p>
      </div>

      {/* Evolution slider */}
      <div className="pointer-events-auto absolute bottom-16 left-1/2 z-10 w-[420px] -translate-x-1/2 border border-border bg-ink/60 p-3 backdrop-blur-md">
        <div className="mb-2 flex items-baseline justify-between font-mono text-[10px] tracking-widest text-text-muted">
          <span>EVOLUTION TIMELINE //</span>
          <span style={{ color: colors.accent }}>
            YR {evoYear} · MK {evoMk}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(evolution * 100)}
          onChange={(e) => setEvolution(Number(e.target.value) / 100)}
          className="w-full"
          style={{ accentColor: colors.accent }}
          aria-label="Suit evolution timeline"
        />
      </div>

      {/* Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 1.8, 4.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#05080B']} />
        <fog attach="fog" args={['#08090c', 8, 22]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} color="#1a2230" />
          <directionalLight
            position={[5, 6, 5]}
            intensity={1.0}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight
            position={[-3, 3, 2]}
            intensity={1.8}
            distance={8}
            color={colors.accent}
          />
          <pointLight
            position={[3, 2, -2]}
            intensity={1.4}
            distance={8}
            color="#7090b0"
          />
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -1.2, 0]}
            receiveShadow
          >
            <circleGeometry args={[3, 64]} />
            <meshStandardMaterial
              color="#0a0d11"
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.19, 0]}>
            <ringGeometry args={[2.85, 3.0, 64]} />
            <meshBasicMaterial
              color={colors.accent}
              transparent
              opacity={0.7}
              toneMapped={false}
              side={2}
            />
          </mesh>

          <SuitModel
            bodyColor={colors.body}
            accentColor={colors.accent}
            hoveredComponent={hoveredComponent}
            selectedComponent={selectedComponent}
            onHover={setHoveredComponent}
            onSelect={setSelectedComponent}
            evolution={evolution}
          />

          <OrbitControls
            enableZoom
            enablePan={false}
            minDistance={3}
            maxDistance={9}
            target={[0, 1.7, 0]}
            autoRotate={!hoveredComponent && !selectedComponent}
            autoRotateSpeed={0.7}
          />
        </Suspense>
      </Canvas>

      {selectedComponent && (
        <ComponentSpecCard
          spec={getSpec(suit, selectedComponent)}
          accent={colors.accent}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </div>
  );
}

interface SpecCardProps {
  spec: ComponentSpec;
  accent: string;
  onClose: () => void;
}

function ComponentSpecCard({ spec, accent, onClose }: SpecCardProps) {
  return (
    <aside
      className={cn(
        'pointer-events-auto absolute right-6 top-1/2 z-20 w-80 -translate-y-1/2',
        'border bg-surface/95 p-5 backdrop-blur-md',
      )}
      style={{ borderColor: accent }}
    >
      <div className="flex items-baseline justify-between">
        <p
          className="font-mono text-[10px] tracking-widest"
          style={{ color: accent }}
        >
          COMPONENT //
        </p>
        <button
          type="button"
          onClick={onClose}
          className="font-mono text-[10px] tracking-widest text-text-muted hover:text-signal"
        >
          [ X ]
        </button>
      </div>
      <h3 className="mt-2 font-display text-xl font-semibold text-text">
        {spec.title}
      </h3>
      <p className="mt-3 font-mono text-xs leading-relaxed text-text-muted">
        {spec.description}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
        {spec.rows.map((r) => (
          <div key={r.k}>
            <p className="font-mono text-[10px] tracking-widest text-text-muted">
              {r.k} //
            </p>
            <p className="mt-0.5 font-mono text-xs text-text">{r.v}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
