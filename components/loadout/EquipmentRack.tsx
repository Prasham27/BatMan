'use client';

import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Skill, SkillCategory } from '@/content/types';
import { SkillSpecPanel } from './SkillSpecPanel';

const CATEGORY_ORDER: SkillCategory[] = [
  'languages',
  'ml',
  'systems',
  'theory',
  'tools',
];

const CATEGORY_LABEL: Record<SkillCategory, string> = {
  languages: 'LANGUAGES',
  ml: 'MACHINE LEARNING',
  systems: 'SYSTEMS',
  theory: 'THEORY',
  tools: 'TOOLS',
};

const ROTATION_SPEED: Record<SkillCategory, number> = {
  languages: 0.35,
  ml: 0.55,
  systems: 0.25,
  theory: 0.4,
  tools: 0.6,
};

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isMobile;
}

interface GadgetMeshProps {
  category: SkillCategory;
  intensity: number;
}

function GadgetMesh({ category, intensity }: GadgetMeshProps) {
  const matProps = {
    color: '#FFB200',
    emissive: '#FFB200',
    emissiveIntensity: intensity,
    toneMapped: false,
  } as const;

  if (category === 'languages') {
    // Stack of 3 thin offset rectangles
    return (
      <>
        <mesh position={[-0.12, -0.18, 0]} rotation={[0, 0, 0.05]}>
          <boxGeometry args={[0.85, 0.04, 1.1]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, -0.04]}>
          <boxGeometry args={[0.85, 0.04, 1.1]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.12, 0.18, 0]} rotation={[0, 0, 0.06]}>
          <boxGeometry args={[0.85, 0.04, 1.1]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      </>
    );
  }

  if (category === 'ml') {
    // Wireframe icosahedron
    return (
      <mesh>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial {...matProps} wireframe />
      </mesh>
    );
  }

  if (category === 'systems') {
    // Wireframe cube with internal cross-bars
    return (
      <>
        <mesh>
          <boxGeometry args={[0.95, 0.95, 0.95]} />
          <meshStandardMaterial {...matProps} wireframe />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[1.34, 0.04, 0.04]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[1.34, 0.04, 0.04]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh rotation={[Math.PI / 4, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 1.34]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      </>
    );
  }

  if (category === 'theory') {
    // Open book — two angled planes meeting at spine
    return (
      <>
        <mesh position={[-0.35, 0, 0]} rotation={[0, 0.35, 0]}>
          <boxGeometry args={[0.7, 0.04, 0.95]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        <mesh position={[0.35, 0, 0]} rotation={[0, -0.35, 0]}>
          <boxGeometry args={[0.7, 0.04, 0.95]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
        {/* Spine */}
        <mesh position={[0, 0.06, 0]}>
          <boxGeometry args={[0.04, 0.06, 0.95]} />
          <meshStandardMaterial {...matProps} />
        </mesh>
      </>
    );
  }

  // tools — crossed wrenches
  return (
    <>
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[1.2, 0.12, 0.08]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
      <mesh rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[1.2, 0.12, 0.08]} />
        <meshStandardMaterial {...matProps} />
      </mesh>
    </>
  );
}

interface GadgetProps {
  category: SkillCategory;
  count: number;
  position: [number, number, number];
  reducedMotion: boolean;
  onSelect: (cat: SkillCategory) => void;
}

function Gadget({
  category,
  count,
  position,
  reducedMotion,
  onSelect,
}: GadgetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (reducedMotion) {
      groupRef.current.rotation.y = 0;
      groupRef.current.position.y = position[1];
      return;
    }
    groupRef.current.rotation.y =
      clock.elapsedTime * ROTATION_SPEED[category];
    groupRef.current.position.y =
      position[1] +
      Math.sin(clock.elapsedTime * 0.8 + position[0] * 1.2) * 0.08;
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = '';
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(category);
  };

  const intensity = hovered ? 1.4 : 0.7;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <GadgetMesh category={category} intensity={intensity} />

      {hovered && (
        <Html position={[0, 1.05, 0]} center distanceFactor={8} occlude={false}>
          <div className="pointer-events-none whitespace-nowrap border border-signal/60 bg-ink/85 px-2 py-1 font-mono text-[10px] tracking-widest text-signal">
            {CATEGORY_LABEL[category]} // {count.toString().padStart(2, '0')}
          </div>
        </Html>
      )}
    </group>
  );
}

interface RackSceneProps {
  groups: { category: SkillCategory; skills: Skill[] }[];
  reducedMotion: boolean;
  onSelect: (cat: SkillCategory) => void;
}

function RackScene({ groups, reducedMotion, onSelect }: RackSceneProps) {
  // 5-column horizontal layout, evenly spaced
  const spacing = 2.4;
  const startX = -((groups.length - 1) * spacing) / 2;

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 5]} intensity={0.6} />
      <pointLight position={[0, 2, 4]} intensity={0.8} color="#FFB200" />

      {groups.map((g, i) => (
        <Gadget
          key={g.category}
          category={g.category}
          count={g.skills.length}
          position={[startX + i * spacing, 0, 0]}
          reducedMotion={reducedMotion}
          onSelect={onSelect}
        />
      ))}
    </>
  );
}

interface MobileFallbackProps {
  groups: { category: SkillCategory; skills: Skill[] }[];
}

function MobileFallback({ groups }: MobileFallbackProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {groups.map((g) => (
        <div
          key={g.category}
          className="border border-border bg-surface p-4"
        >
          <p className="font-mono text-[10px] tracking-widest text-signal">
            {CATEGORY_LABEL[g.category]} // {g.skills.length
              .toString()
              .padStart(2, '0')}
          </p>
          <ul className="mt-3 space-y-2">
            {g.skills.map((s) => (
              <li
                key={s.name}
                className="flex items-center justify-between gap-3 font-mono text-xs text-text"
              >
                <span className="truncate">{s.name}</span>
                <span className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span
                      key={n}
                      aria-hidden
                      className={
                        n <= s.level
                          ? 'inline-block h-2 w-2 bg-signal'
                          : 'inline-block h-2 w-2 border border-signal/40'
                      }
                    />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export interface EquipmentRackProps {
  skills: Skill[];
}

export function EquipmentRack({ skills }: EquipmentRackProps) {
  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const [active, setActive] = useState<SkillCategory | null>(null);

  const groups = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      skills: skills.filter((s) => s.category === category),
    })).filter((g) => g.skills.length > 0);
  }, [skills]);

  const activeGroup = useMemo(
    () => (active ? groups.find((g) => g.category === active) ?? null : null),
    [active, groups],
  );

  if (isMobile) {
    return (
      <>
        <MobileFallback groups={groups} />
        <SkillSpecPanel
          category={activeGroup?.category ?? null}
          label={activeGroup ? CATEGORY_LABEL[activeGroup.category] : ''}
          skills={activeGroup?.skills ?? []}
          onClose={() => setActive(null)}
        />
      </>
    );
  }

  return (
    <>
      <div className="relative h-[420px] w-full border border-border bg-surface md:h-[520px]">
        <Canvas
          camera={{ position: [0, 1.6, 7], fov: 45 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <Suspense fallback={null}>
            <RackScene
              groups={groups}
              reducedMotion={reducedMotion}
              onSelect={setActive}
            />
          </Suspense>
        </Canvas>
        <div className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] tracking-widest text-text-muted">
          [ ARSENAL // INTERACTIVE ] // CLICK A GADGET
        </div>
      </div>
      <SkillSpecPanel
        category={activeGroup?.category ?? null}
        label={activeGroup ? CATEGORY_LABEL[activeGroup.category] : ''}
        skills={activeGroup?.skills ?? []}
        onClose={() => setActive(null)}
      />
    </>
  );
}

export default EquipmentRack;
