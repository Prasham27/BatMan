'use client';

import { useRef, type ReactNode } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export type ComponentId =
  | 'cowl'
  | 'chest'
  | 'shoulders'
  | 'gauntlets'
  | 'belt'
  | 'legs'
  | 'boots'
  | 'cape';

const COMPONENT_LABELS: Record<ComponentId, string> = {
  cowl: 'COWL',
  chest: 'CHEST PLATE',
  shoulders: 'PAULDRONS',
  gauntlets: 'GAUNTLETS',
  belt: 'UTILITY BELT',
  legs: 'LEGS / GREAVES',
  boots: 'COMBAT BOOTS',
  cape: 'TACTICAL CAPE',
};

export interface SuitModelProps {
  bodyColor: string;
  accentColor: string;
  hoveredComponent: ComponentId | null;
  selectedComponent: ComponentId | null;
  onHover: (id: ComponentId | null) => void;
  onSelect: (id: ComponentId) => void;
  /** 0–1, scales the per-component emissive boost ("Mk evolution") */
  evolution?: number;
}

interface SuitPartProps {
  id: ComponentId;
  hovered: boolean;
  selected: boolean;
  onHover: (id: ComponentId | null) => void;
  onSelect: (id: ComponentId) => void;
  labelPos: [number, number, number];
  children: ReactNode;
}

function SuitPart({
  id,
  hovered,
  selected,
  onHover,
  onSelect,
  labelPos,
  children,
}: SuitPartProps) {
  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(id);
    document.body.style.cursor = 'pointer';
  };
  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(null);
    document.body.style.cursor = '';
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(id);
  };

  return (
    <group
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {children}
      {(hovered || selected) && (
        <Html position={labelPos} center distanceFactor={6} occlude={false}>
          <div
            className={
              selected
                ? 'whitespace-nowrap border border-signal bg-ink/80 px-2 py-1 font-mono text-[10px] tracking-widest text-signal backdrop-blur-sm'
                : 'whitespace-nowrap font-mono text-[10px] tracking-widest text-signal'
            }
          >
            [E] {COMPONENT_LABELS[id]}
          </div>
        </Html>
      )}
    </group>
  );
}

export function SuitModel({
  bodyColor,
  accentColor,
  hoveredComponent,
  selectedComponent,
  onHover,
  onSelect,
  evolution = 0.5,
}: SuitModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = -1.2 + Math.sin(clock.elapsedTime * 1.0) * 0.03;
  });

  // Evolution slider scales accent glow + adds a baseline emissive across all
  // body parts so the suit "feels" more advanced at higher Mk levels.
  const baselineEmissive = evolution * 0.18;

  // ── Evolution-driven shape parameters (Mk ↑ = bigger silhouette) ──
  const e = evolution; // 0..1
  const capeScale = 1 + e * 0.55;        // cape billows wider + longer
  const capeDrop = e * 0.35;             // cape hangs lower at higher Mk
  const earH = 0.32 + e * 0.42;          // cowl ears grow taller
  const earR = 0.06 + e * 0.04;          // base of the cone widens a bit
  const earOffset = 0.16 + e * 0.05;     // ears spread slightly apart
  const shoulderR = 0.22 + e * 0.075;    // pauldrons get bulkier
  const shoulderX = 0.55 + e * 0.06;     // shoulder line widens
  const chestBoost = 1 + e * 0.12;       // chest plate beefs up a touch

  const bodyMat = (extra: number = 0): React.ReactElement => (
    <meshStandardMaterial
      color={bodyColor}
      roughness={0.62}
      metalness={0.28}
      emissive={accentColor}
      emissiveIntensity={baselineEmissive + extra}
    />
  );

  const isHovered = (id: ComponentId) => hoveredComponent === id;
  const isSelected = (id: ComponentId) => selectedComponent === id;
  const partEmissive = (id: ComponentId) =>
    isSelected(id) ? 0.45 : isHovered(id) ? 0.25 : 0;

  return (
    <group ref={groupRef} scale={[1.4, 1.4, 1.4]} position={[0, -1.2, 0]}>
      {/* ───── BOOTS ───── */}
      <SuitPart
        id="boots"
        hovered={isHovered('boots')}
        selected={isSelected('boots')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[0.8, 0.2, 0.1]}
      >
        <mesh position={[0.18, 0.12, 0.05]} castShadow>
          <boxGeometry args={[0.34, 0.26, 0.6]} />
          {bodyMat(partEmissive('boots'))}
        </mesh>
        <mesh position={[-0.18, 0.12, 0.05]} castShadow>
          <boxGeometry args={[0.34, 0.26, 0.6]} />
          {bodyMat(partEmissive('boots'))}
        </mesh>
        <mesh position={[0.18, 0.22, 0.18]} castShadow>
          <boxGeometry args={[0.36, 0.04, 0.24]} />
          <meshStandardMaterial color="#04050a" roughness={0.4} metalness={0.5} />
        </mesh>
        <mesh position={[-0.18, 0.22, 0.18]} castShadow>
          <boxGeometry args={[0.36, 0.04, 0.24]} />
          <meshStandardMaterial color="#04050a" roughness={0.4} metalness={0.5} />
        </mesh>
      </SuitPart>

      {/* ───── LEGS ───── */}
      <SuitPart
        id="legs"
        hovered={isHovered('legs')}
        selected={isSelected('legs')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[0.85, 1.0, 0]}
      >
        <mesh position={[0.18, 0.7, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.55, 6, 10]} />
          {bodyMat(partEmissive('legs'))}
        </mesh>
        <mesh position={[-0.18, 0.7, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.55, 6, 10]} />
          {bodyMat(partEmissive('legs'))}
        </mesh>
        <mesh position={[0.18, 1.42, 0]} castShadow>
          <capsuleGeometry args={[0.21, 0.6, 6, 10]} />
          {bodyMat(partEmissive('legs'))}
        </mesh>
        <mesh position={[-0.18, 1.42, 0]} castShadow>
          <capsuleGeometry args={[0.21, 0.6, 6, 10]} />
          {bodyMat(partEmissive('legs'))}
        </mesh>
        <mesh position={[0.18, 1.05, 0.16]} castShadow>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#04050a" roughness={0.4} metalness={0.55} />
        </mesh>
        <mesh position={[-0.18, 1.05, 0.16]} castShadow>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color="#04050a" roughness={0.4} metalness={0.55} />
        </mesh>
      </SuitPart>

      {/* ───── BELT ───── */}
      <SuitPart
        id="belt"
        hovered={isHovered('belt')}
        selected={isSelected('belt')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[0.9, 1.85, 0]}
      >
        <mesh position={[0, 1.85, 0]} castShadow>
          <cylinderGeometry args={[0.46, 0.46, 0.2, 24]} />
          <meshStandardMaterial
            color="#15161a"
            roughness={0.5}
            metalness={0.4}
            emissive={accentColor}
            emissiveIntensity={baselineEmissive + partEmissive('belt')}
          />
        </mesh>
        <mesh position={[0, 1.85, 0.42]}>
          <boxGeometry args={[0.22, 0.12, 0.06]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={1.6 + evolution * 0.8}
            toneMapped={false}
          />
        </mesh>
        {[-0.32, -0.14, 0.14, 0.32].map((x, i) => (
          <mesh key={i} position={[x, 1.83, 0.4]} castShadow>
            <boxGeometry args={[0.14, 0.16, 0.08]} />
            <meshStandardMaterial color="#0e0f12" roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0.45, 1.85, 0.05]} castShadow>
          <boxGeometry args={[0.08, 0.18, 0.18]} />
          <meshStandardMaterial color="#0e0f12" roughness={0.7} />
        </mesh>
        <mesh position={[-0.45, 1.85, 0.05]} castShadow>
          <boxGeometry args={[0.08, 0.18, 0.18]} />
          <meshStandardMaterial color="#0e0f12" roughness={0.7} />
        </mesh>
      </SuitPart>

      {/* ───── CHEST ───── */}
      <SuitPart
        id="chest"
        hovered={isHovered('chest')}
        selected={isSelected('chest')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[0.95, 2.5, 0.4]}
      >
        <mesh position={[0, 2.35, 0]} castShadow>
          <capsuleGeometry args={[0.46, 0.85, 6, 12]} />
          {bodyMat(partEmissive('chest'))}
        </mesh>
        <mesh position={[0, 2.5, 0.32]} castShadow>
          <boxGeometry args={[0.7 * chestBoost, 0.85, 0.12 * chestBoost]} />
          <meshStandardMaterial
            color="#04050a"
            roughness={0.4}
            metalness={0.5}
            emissive={accentColor}
            emissiveIntensity={baselineEmissive + partEmissive('chest')}
          />
        </mesh>
        <mesh position={[0, 2.55, 0.39]}>
          <boxGeometry args={[0.02, 0.5, 0.005]} />
          <meshBasicMaterial color="#1a1d22" />
        </mesh>
      </SuitPart>

      {/* ───── SHOULDERS ───── */}
      <SuitPart
        id="shoulders"
        hovered={isHovered('shoulders')}
        selected={isSelected('shoulders')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[0, 3.2, 0.3]}
      >
        <mesh position={[shoulderX, 2.78, 0]} castShadow>
          <sphereGeometry args={[shoulderR, 14, 14]} />
          <meshStandardMaterial
            color="#04050a"
            roughness={0.5}
            metalness={0.5}
            emissive={accentColor}
            emissiveIntensity={baselineEmissive + partEmissive('shoulders')}
          />
        </mesh>
        <mesh position={[-shoulderX, 2.78, 0]} castShadow>
          <sphereGeometry args={[shoulderR, 14, 14]} />
          <meshStandardMaterial
            color="#04050a"
            roughness={0.5}
            metalness={0.5}
            emissive={accentColor}
            emissiveIntensity={baselineEmissive + partEmissive('shoulders')}
          />
        </mesh>
      </SuitPart>

      {/* ───── GAUNTLETS ───── */}
      <SuitPart
        id="gauntlets"
        hovered={isHovered('gauntlets')}
        selected={isSelected('gauntlets')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[1.1, 1.75, 0]}
      >
        <mesh position={[0.6, 2.4, 0]} rotation={[0, 0, 0.05]} castShadow>
          <capsuleGeometry args={[0.16, 0.55, 6, 10]} />
          {bodyMat(partEmissive('gauntlets'))}
        </mesh>
        <mesh position={[-0.6, 2.4, 0]} rotation={[0, 0, -0.05]} castShadow>
          <capsuleGeometry args={[0.16, 0.55, 6, 10]} />
          {bodyMat(partEmissive('gauntlets'))}
        </mesh>
        <mesh position={[0.62, 1.85, 0]} rotation={[0, 0, 0.04]} castShadow>
          <cylinderGeometry args={[0.18, 0.16, 0.5, 12]} />
          <meshStandardMaterial
            color="#04050a"
            roughness={0.5}
            metalness={0.5}
            emissive={accentColor}
            emissiveIntensity={baselineEmissive + partEmissive('gauntlets')}
          />
        </mesh>
        <mesh position={[-0.62, 1.85, 0]} rotation={[0, 0, -0.04]} castShadow>
          <cylinderGeometry args={[0.18, 0.16, 0.5, 12]} />
          <meshStandardMaterial
            color="#04050a"
            roughness={0.5}
            metalness={0.5}
            emissive={accentColor}
            emissiveIntensity={baselineEmissive + partEmissive('gauntlets')}
          />
        </mesh>
        {[0.62, -0.62].map((x) =>
          [0.85, 1.7, 1.95].map((y, i) => (
            <mesh
              key={`${x}-${i}`}
              position={[x + (x > 0 ? 0.16 : -0.16), y, 0]}
              rotation={[0, 0, x > 0 ? 0.5 : -0.5]}
            >
              <boxGeometry args={[0.18, 0.04, 0.12]} />
              <meshStandardMaterial color="#04050a" roughness={0.6} />
            </mesh>
          )),
        )}
        <mesh position={[0.66, 1.55, 0]} castShadow>
          <sphereGeometry args={[0.13, 12, 12]} />
          {bodyMat(partEmissive('gauntlets'))}
        </mesh>
        <mesh position={[-0.66, 1.55, 0]} castShadow>
          <sphereGeometry args={[0.13, 12, 12]} />
          {bodyMat(partEmissive('gauntlets'))}
        </mesh>
      </SuitPart>

      {/* ───── COWL ───── */}
      <SuitPart
        id="cowl"
        hovered={isHovered('cowl')}
        selected={isSelected('cowl')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[0, 3.95, 0.3]}
      >
        <mesh position={[0, 3.0, 0]} castShadow>
          <cylinderGeometry args={[0.13, 0.16, 0.16, 12]} />
          {bodyMat(partEmissive('cowl'))}
        </mesh>
        <mesh position={[0, 3.22, 0]} castShadow>
          <sphereGeometry args={[0.26, 18, 18]} />
          {bodyMat(partEmissive('cowl'))}
        </mesh>
        <mesh position={[0, 3.1, 0.18]} castShadow>
          <boxGeometry args={[0.32, 0.18, 0.18]} />
          {bodyMat(partEmissive('cowl'))}
        </mesh>
        <mesh
          position={[-earOffset, 3.39 + earH / 2, -0.02]}
          rotation={[0, 0, 0.32]}
          castShadow
        >
          <coneGeometry args={[earR, earH, 5]} />
          {bodyMat(partEmissive('cowl'))}
        </mesh>
        <mesh
          position={[earOffset, 3.39 + earH / 2, -0.02]}
          rotation={[0, 0, -0.32]}
          castShadow
        >
          <coneGeometry args={[earR, earH, 5]} />
          {bodyMat(partEmissive('cowl'))}
        </mesh>
        <mesh position={[0, 3.28, 0.24]}>
          <boxGeometry args={[0.32, 0.04, 0.02]} />
          <meshBasicMaterial color="#04050a" />
        </mesh>
      </SuitPart>

      {/* ───── CAPE ───── */}
      <SuitPart
        id="cape"
        hovered={isHovered('cape')}
        selected={isSelected('cape')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[-1.2, 2.0, 0.4]}
      >
        <mesh position={[0, 1.6 - capeDrop * 0.4, 0.18]} rotation={[0.05, 0, 0]} castShadow>
          <cylinderGeometry
            args={[0.7 * capeScale, 1.4 * capeScale, 2.7 + capeDrop * 1.8, 22, 1, true, Math.PI * 0.55, Math.PI * 0.9]}
          />
          <meshStandardMaterial
            color="#04050a"
            roughness={0.78}
            metalness={0.05}
            side={THREE.DoubleSide}
            emissive={accentColor}
            emissiveIntensity={baselineEmissive + partEmissive('cape')}
          />
        </mesh>
        <mesh
          position={[-0.55 * capeScale, 1.9 - capeDrop * 0.3, 0.35]}
          rotation={[0, -0.4, 0.15]}
          castShadow
        >
          <planeGeometry args={[0.9 * capeScale, 2.1 + capeDrop * 1.4, 4, 6]} />
          <meshStandardMaterial
            color="#04050a"
            roughness={0.78}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh
          position={[0.55 * capeScale, 1.9 - capeDrop * 0.3, 0.35]}
          rotation={[0, 0.4, -0.15]}
          castShadow
        >
          <planeGeometry args={[0.9 * capeScale, 2.1 + capeDrop * 1.4, 4, 6]} />
          <meshStandardMaterial
            color="#04050a"
            roughness={0.78}
            side={THREE.DoubleSide}
          />
        </mesh>
      </SuitPart>
    </group>
  );
}
