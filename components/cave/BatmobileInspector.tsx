'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { BatmobileModel, type PartId } from './BatmobileModel';

interface PartSpec {
  title: string;
  description: string;
  rows: { k: string; v: string }[];
}

const PART_SPECS: Record<PartId, PartSpec> = {
  chassis: {
    title: 'Composite Chassis',
    description:
      'Carbon-composite monocoque with bolted-on ceramic armor plates. Class V ballistic protection across the lower body. Designed to absorb sustained kinetic impact without compromising structural integrity.',
    rows: [
      { k: 'MATERIAL', v: 'C-COMPOSITE' },
      { k: 'ARMOR', v: 'CLASS V' },
      { k: 'MASS', v: '1840 KG' },
      { k: 'PLATES', v: '12 BOLT-ON' },
    ],
  },
  cockpit: {
    title: 'Tinted Cockpit',
    description:
      'Reinforced polymer canopy with self-tinting visor and integrated HUD. Internal life-support sustains the operator under EMP, gas, or chemical attack for up to 72 minutes.',
    rows: [
      { k: 'CANOPY', v: 'LAMINATED' },
      { k: 'HUD', v: 'FULL-SPECTRUM' },
      { k: 'LIFE SUPPORT', v: '72 MIN' },
      { k: 'EJECTION', v: 'YES' },
    ],
  },
  engine: {
    title: 'Turbine-Electric Powerplant',
    description:
      'Hybrid jet-turbine with electric drive to all four wheels. Silent-running mode under 40 km/h. 0-100 in 2.6 seconds, 348 km/h top speed.',
    rows: [
      { k: 'TYPE', v: 'TURBINE-ELEC' },
      { k: 'OUTPUT', v: '1100 KW' },
      { k: 'TOP SPEED', v: '348 KM/H' },
      { k: '0–100', v: '2.6 SEC' },
    ],
  },
  wheels: {
    title: 'Wheels & Tires',
    description:
      'Reinforced run-flat tires over magnesium-alloy rims. Each wheel has independent steering for crab-mode lateral movement. Ceramic brake rotors fade-resistant at sustained load.',
    rows: [
      { k: 'TIRES', v: 'RUN-FLAT' },
      { k: 'RIMS', v: 'Mg-ALLOY' },
      { k: 'BRAKES', v: 'CERAMIC' },
      { k: 'STEER', v: '4-WHEEL' },
    ],
  },
  exhaust: {
    title: 'Quad Exhaust',
    description:
      'Four-pipe rear exhaust with throttle-modulated baffles. Sound profile shifts from silent (under 40 km/h) to full turbine roar at high throttle. Heat-shielded for IR signature reduction.',
    rows: [
      { k: 'PIPES', v: '4 × TITANIUM' },
      { k: 'BAFFLES', v: 'MODULATED' },
      { k: 'IR SHIELD', v: 'ACTIVE' },
      { k: 'SOUND', v: '0-128 dB' },
    ],
  },
  spoiler: {
    title: 'Active Aero Spoiler',
    description:
      'Servo-actuated rear wing with airbrake deployment. At 200+ km/h it tilts to add 380 kg of downforce; at low speed it lays flat for visibility.',
    rows: [
      { k: 'DOWNFORCE', v: '380 KG @ 200' },
      { k: 'AIRBRAKE', v: 'YES' },
      { k: 'DEPLOY', v: 'SERVO' },
    ],
  },
  headlights: {
    title: 'Headlight Array',
    description:
      'Tri-spectrum forward array — visible amber for road, IR for covert, and a narrow-beam UV used for evidence luminescence at crime scenes. Adaptive cornering.',
    rows: [
      { k: 'OUTPUT', v: '8000 LUMENS' },
      { k: 'SPECTRA', v: 'VIS / IR / UV' },
      { k: 'RANGE', v: '420 M' },
      { k: 'ADAPTIVE', v: 'YES' },
    ],
  },
  underglow: {
    title: 'Sensor Underglow',
    description:
      'Amber underglow doubles as a ground-scanning sensor array. Reads pavement composition, detects buried hazards, and projects a low-power downward LIDAR for low-light maneuvering.',
    rows: [
      { k: 'COLOR', v: 'SIGNAL AMBER' },
      { k: 'FUNCTION', v: 'GROUND SCAN' },
      { k: 'LIDAR', v: 'DOWNWARD' },
      { k: 'POWER', v: '40 W' },
    ],
  },
};

export interface BatmobileInspectorProps {
  active: boolean;
  onClose: () => void;
}

export function BatmobileInspector({ active, onClose }: BatmobileInspectorProps) {
  const [hoveredPart, setHoveredPart] = useState<PartId | null>(null);
  const [selectedPart, setSelectedPart] = useState<PartId | null>(null);
  const [evolution, setEvolution] = useState(0.5);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedPart) setSelectedPart(null);
        else onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onClose, selectedPart]);

  useEffect(() => {
    if (active) {
      setHoveredPart(null);
      setSelectedPart(null);
      setEvolution(0.5);
    }
  }, [active]);

  if (!active) return null;

  const evoYear = 2020 + Math.floor(evolution * 10);
  const evoMk = `V + ${Math.floor(evolution * 5)}`;

  return (
    <div className="fixed inset-0 z-[110] bg-ink/95 backdrop-blur-sm">
      {/* Top header */}
      <div className="pointer-events-auto absolute left-6 top-6 z-10">
        <p className="font-mono text-[10px] tracking-widest text-signal">
          BATMOBILE INSPECTOR //
        </p>
        <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-signal md:text-4xl">
          Tactical Transport T-04
        </h2>
        <p className="mt-1 font-mono text-[10px] tracking-widest text-text-muted">
          OPERATIONAL // CHASSIS C-COMPOSITE
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
          <span className="text-signal">
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
          style={{ accentColor: '#FFB200' }}
          aria-label="Batmobile evolution timeline"
        />
      </div>

      {/* Canvas */}
      <Canvas
        shadows
        camera={{ position: [4, 2.5, 6], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#05080B']} />
        <fog attach="fog" args={['#08090c', 8, 22]} />
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} color="#1a2230" />
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.0}
            color="#ffffff"
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <pointLight
            position={[-3, 3, 2]}
            intensity={1.8}
            distance={10}
            color="#FFB200"
          />
          <pointLight
            position={[3, 2, -2]}
            intensity={1.4}
            distance={10}
            color="#7090b0"
          />
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.5, 0]}
            receiveShadow
          >
            <circleGeometry args={[4, 64]} />
            <meshStandardMaterial
              color="#0a0d11"
              roughness={0.4}
              metalness={0.6}
            />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]}>
            <ringGeometry args={[3.85, 4.0, 64]} />
            <meshBasicMaterial
              color="#FFB200"
              transparent
              opacity={0.7}
              toneMapped={false}
              side={2}
            />
          </mesh>

          <BatmobileModel
            hoveredPart={hoveredPart}
            selectedPart={selectedPart}
            onHover={setHoveredPart}
            onSelect={setSelectedPart}
            evolution={evolution}
          />

          <OrbitControls
            enableZoom
            enablePan={false}
            minDistance={4}
            maxDistance={12}
            target={[0, 0, 0]}
            autoRotate={!hoveredPart && !selectedPart}
            autoRotateSpeed={0.7}
          />
        </Suspense>
      </Canvas>

      {selectedPart && (
        <ComponentSpecCard
          spec={PART_SPECS[selectedPart]}
          onClose={() => setSelectedPart(null)}
        />
      )}
    </div>
  );
}

interface SpecCardProps {
  spec: PartSpec;
  onClose: () => void;
}

function ComponentSpecCard({ spec, onClose }: SpecCardProps) {
  return (
    <aside
      className={cn(
        'pointer-events-auto absolute right-6 top-1/2 z-20 w-80 -translate-y-1/2',
        'border border-signal bg-surface/95 p-5 backdrop-blur-md',
      )}
    >
      <div className="flex items-baseline justify-between">
        <p className="font-mono text-[10px] tracking-widest text-signal">
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
