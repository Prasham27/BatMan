'use client';

import { useRef, type ReactNode } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export type PartId =
  | 'chassis'
  | 'cockpit'
  | 'engine'
  | 'wheels'
  | 'exhaust'
  | 'spoiler'
  | 'headlights'
  | 'underglow';

export const PART_LABELS: Record<PartId, string> = {
  chassis: 'CHASSIS',
  cockpit: 'COCKPIT',
  engine: 'POWERPLANT',
  wheels: 'WHEELS & TIRES',
  exhaust: 'EXHAUST',
  spoiler: 'ACTIVE AERO',
  headlights: 'HEADLIGHTS',
  underglow: 'UNDERGLOW',
};

export interface BatmobileModelProps {
  hoveredPart: PartId | null;
  selectedPart: PartId | null;
  onHover: (id: PartId | null) => void;
  onSelect: (id: PartId) => void;
  /** 0–1, scales baseline accent emissive across all parts */
  evolution?: number;
}

const ACCENT_COLOR = '#FFB200';

interface VehiclePartProps {
  id: PartId;
  hovered: boolean;
  selected: boolean;
  onHover: (id: PartId | null) => void;
  onSelect: (id: PartId) => void;
  labelPos: [number, number, number];
  children: ReactNode;
}

function VehiclePart({
  id,
  hovered,
  selected,
  onHover,
  onSelect,
  labelPos,
  children,
}: VehiclePartProps) {
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
            [E] {PART_LABELS[id]}
          </div>
        </Html>
      )}
    </group>
  );
}

// Wheel anchor positions (scaled relative to inspector size — root group scales 1.6x).
const WHEEL_POSITIONS: Array<[number, number, number]> = [
  [1.05, 0.55, 1.7],
  [-1.05, 0.55, 1.7],
  [1.05, 0.55, -1.7],
  [-1.05, 0.55, -1.7],
];

export function BatmobileModel({
  hoveredPart,
  selectedPart,
  onHover,
  onSelect,
  evolution = 0.5,
}: BatmobileModelProps) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      -1 + Math.sin(clock.elapsedTime * 0.9) * 0.02;
  });

  const baselineEmissive = evolution * 0.18;
  const isHovered = (id: PartId) => hoveredPart === id;
  const isSelected = (id: PartId) => selectedPart === id;
  const partEmissive = (id: PartId) =>
    isSelected(id) ? 0.45 : isHovered(id) ? 0.25 : 0;

  // Reusable material factories (so we get per-part emissive boosts).
  const matBlack = (extra: number = 0): React.ReactElement => (
    <meshStandardMaterial
      color="#08090c"
      roughness={0.35}
      metalness={0.85}
      emissive={ACCENT_COLOR}
      emissiveIntensity={baselineEmissive + extra}
    />
  );
  const matGloss = (extra: number = 0): React.ReactElement => (
    <meshStandardMaterial
      color="#0a0c10"
      roughness={0.2}
      metalness={0.95}
      emissive={ACCENT_COLOR}
      emissiveIntensity={baselineEmissive + extra}
    />
  );
  const matRubber = (): React.ReactElement => (
    <meshStandardMaterial color="#08090b" roughness={0.95} metalness={0.05} />
  );
  const matRotor = (): React.ReactElement => (
    <meshStandardMaterial color="#1a1d22" roughness={0.4} metalness={0.85} />
  );

  return (
    <group ref={groupRef} scale={[1.6, 1.6, 1.6]} position={[0, -1, 0]}>
      {/* ───── CHASSIS ───── */}
      <VehiclePart
        id="chassis"
        hovered={isHovered('chassis')}
        selected={isSelected('chassis')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[1.6, 1.1, 0]}
      >
        {/* Lower chassis tub */}
        <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.5, 5.4]} />
          {matBlack(partEmissive('chassis'))}
        </mesh>
        {/* Upper body (tapered glossy plate) */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[2.2, 0.5, 4.8]} />
          {matGloss(partEmissive('chassis'))}
        </mesh>
        {/* Front nose wedge */}
        <mesh position={[0, 0.55, 2.7]} rotation={[-0.2, 0, 0]} castShadow>
          <boxGeometry args={[2.0, 0.5, 1.4]} />
          {matBlack(partEmissive('chassis'))}
        </mesh>
        {/* Nose tip */}
        <mesh position={[0, 0.45, 3.35]} rotation={[-0.35, 0, 0]} castShadow>
          <boxGeometry args={[1.6, 0.35, 0.4]} />
          {matGloss(partEmissive('chassis'))}
        </mesh>
        {/* Front armor plates (stacked) */}
        <mesh position={[0, 0.95, 2.5]} rotation={[-0.18, 0, 0]} castShadow>
          <boxGeometry args={[1.7, 0.18, 1.2]} />
          {matBlack(partEmissive('chassis'))}
        </mesh>
        <mesh position={[0, 1.1, 2.0]} rotation={[-0.1, 0, 0]} castShadow>
          <boxGeometry args={[1.6, 0.14, 0.8]} />
          {matBlack(partEmissive('chassis'))}
        </mesh>
        {/* Side armor panels + bolts */}
        {[1.21, -1.21].map((x, idx) => (
          <group key={`side-${idx}`}>
            <mesh
              position={[x, 0.7, 0]}
              rotation={[0, 0, x > 0 ? -0.05 : 0.05]}
              castShadow
            >
              <boxGeometry args={[0.04, 0.6, 4.6]} />
              {matBlack(partEmissive('chassis'))}
            </mesh>
            {[-1.6, -0.5, 0.6, 1.7].map((z, i) => (
              <mesh
                key={`bolt-${idx}-${i}`}
                position={[x + (x > 0 ? 0.025 : -0.025), 0.7, z]}
              >
                <sphereGeometry args={[0.05, 8, 8]} />
                {matGloss(partEmissive('chassis'))}
              </mesh>
            ))}
          </group>
        ))}
        {/* Rear armor plates */}
        <mesh position={[0, 0.95, -2.2]} rotation={[0.15, 0, 0]} castShadow>
          <boxGeometry args={[1.9, 0.16, 0.7]} />
          {matBlack(partEmissive('chassis'))}
        </mesh>
        <mesh position={[0, 1.05, -1.7]} rotation={[0.08, 0, 0]} castShadow>
          <boxGeometry args={[1.8, 0.12, 0.5]} />
          {matBlack(partEmissive('chassis'))}
        </mesh>
      </VehiclePart>

      {/* ───── COCKPIT ───── */}
      <VehiclePart
        id="cockpit"
        hovered={isHovered('cockpit')}
        selected={isSelected('cockpit')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[0, 2.4, 0.2]}
      >
        {/* Tinted glass canopy */}
        <mesh position={[0, 1.35, 0.2]} castShadow>
          <boxGeometry args={[1.5, 0.55, 2.0]} />
          <meshStandardMaterial
            color="#0a1a2a"
            roughness={0.15}
            metalness={0.4}
            transparent
            opacity={0.75}
            emissive={ACCENT_COLOR}
            emissiveIntensity={baselineEmissive + partEmissive('cockpit')}
          />
        </mesh>
        {/* Cockpit edge frame (roof rail) */}
        <mesh position={[0, 1.65, 0.2]} castShadow>
          <boxGeometry args={[1.55, 0.05, 2.05]} />
          {matBlack(partEmissive('cockpit'))}
        </mesh>
        {/* Roof intake scoop */}
        <mesh position={[0, 1.5, -0.9]} rotation={[0.2, 0, 0]} castShadow>
          <boxGeometry args={[0.6, 0.2, 0.8]} />
          {matBlack(partEmissive('cockpit'))}
        </mesh>
        {/* Cowl strip behind canopy */}
        <mesh position={[0, 1.55, -0.4]} castShadow>
          <boxGeometry args={[1.3, 0.08, 0.4]} />
          {matGloss(partEmissive('cockpit'))}
        </mesh>
        {/* Antenna mast */}
        <mesh position={[0.45, 1.85, -0.5]}>
          <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
          {matBlack(partEmissive('cockpit'))}
        </mesh>
        {/* Antenna glowing tip */}
        <mesh position={[0.45, 2.12, -0.5]}>
          <sphereGeometry args={[0.05, 10, 10]} />
          <meshStandardMaterial
            color={ACCENT_COLOR}
            emissive={ACCENT_COLOR}
            emissiveIntensity={1.5 + partEmissive('cockpit') * 2}
            toneMapped={false}
          />
        </mesh>
      </VehiclePart>

      {/* ───── ENGINE / POWERPLANT ───── */}
      <VehiclePart
        id="engine"
        hovered={isHovered('engine')}
        selected={isSelected('engine')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[1.4, 1.3, -1.4]}
      >
        {/* Side intakes (front of rear wheels) */}
        {[1.05, -1.05].map((x, idx) => (
          <mesh
            key={`intake-${idx}`}
            position={[x, 0.85, -0.6]}
            castShadow
          >
            <boxGeometry args={[0.22, 0.28, 0.7]} />
            <meshStandardMaterial
              color="#020306"
              roughness={0.4}
              metalness={0.5}
              emissive={ACCENT_COLOR}
              emissiveIntensity={baselineEmissive + partEmissive('engine')}
            />
          </mesh>
        ))}
        {/* Rear engine cover plate */}
        <mesh position={[0, 1.18, -2.0]} castShadow>
          <boxGeometry args={[1.6, 0.12, 0.9]} />
          {matGloss(partEmissive('engine'))}
        </mesh>
        {/* Engine cover heat slats */}
        {[-0.4, -0.2, 0, 0.2, 0.4].map((x, i) => (
          <mesh key={`slat-${i}`} position={[x, 1.25, -2.0]}>
            <boxGeometry args={[0.06, 0.02, 0.7]} />
            <meshStandardMaterial
              color="#020306"
              roughness={0.6}
              metalness={0.3}
            />
          </mesh>
        ))}
        {/* Turbine intake circles */}
        {[0.55, -0.55].map((x, idx) => (
          <group key={`turbine-${idx}`}>
            <mesh
              position={[x, 1.05, -2.55]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.22, 0.22, 0.18, 20]} />
              {matBlack(partEmissive('engine'))}
            </mesh>
            {/* Inner turbine hub */}
            <mesh
              position={[x, 1.05, -2.5]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.08, 0.08, 0.1, 12]} />
              {matRotor()}
            </mesh>
          </group>
        ))}
      </VehiclePart>

      {/* ───── WHEELS & TIRES ───── */}
      <VehiclePart
        id="wheels"
        hovered={isHovered('wheels')}
        selected={isSelected('wheels')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[1.4, 0.2, 1.7]}
      >
        {WHEEL_POSITIONS.map(([x, y, z], i) => (
          <group key={`wheel-${i}`}>
            {/* Wheel arch (curved top) */}
            <mesh position={[x, y + 0.15, z]} rotation={[0, 0, 0]}>
              <torusGeometry args={[0.55, 0.08, 6, 14, Math.PI]} />
              {matBlack(partEmissive('wheels'))}
            </mesh>
            {/* Tire */}
            <mesh
              position={[x, y, z]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.55, 0.55, 0.45, 24]} />
              {matRubber()}
            </mesh>
            {/* Inner rim */}
            <mesh
              position={[x + (x > 0 ? -0.12 : 0.12), y, z]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.42, 0.42, 0.18, 18]} />
              {matRotor()}
            </mesh>
            {/* Brake rotor disc */}
            <mesh
              position={[x + (x > 0 ? -0.18 : 0.18), y, z]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.32, 0.32, 0.04, 24]} />
              <meshStandardMaterial
                color="#3a3f48"
                roughness={0.4}
                metalness={0.85}
                emissive={ACCENT_COLOR}
                emissiveIntensity={baselineEmissive + partEmissive('wheels')}
              />
            </mesh>
            {/* Center hubcap */}
            <mesh
              position={[x + (x > 0 ? -0.05 : 0.05), y, z]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.12, 0.12, 0.36, 14]} />
              {matGloss(partEmissive('wheels'))}
            </mesh>
          </group>
        ))}
      </VehiclePart>

      {/* ───── EXHAUST ───── */}
      <VehiclePart
        id="exhaust"
        hovered={isHovered('exhaust')}
        selected={isSelected('exhaust')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[0, 0.95, -3.2]}
      >
        {[-0.45, -0.15, 0.15, 0.45].map((x, idx) => (
          <group key={`exhaust-${idx}`}>
            {/* Pipe body */}
            <mesh
              position={[x, 0.6, -2.78]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.08, 0.08, 0.32, 14]} />
              <meshStandardMaterial
                color="#15181c"
                roughness={0.4}
                metalness={0.7}
                emissive={ACCENT_COLOR}
                emissiveIntensity={baselineEmissive + partEmissive('exhaust')}
              />
            </mesh>
            {/* Glow tip */}
            <mesh
              position={[x, 0.6, -2.92]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.065, 0.065, 0.05, 14]} />
              <meshStandardMaterial
                color={ACCENT_COLOR}
                emissive={ACCENT_COLOR}
                emissiveIntensity={2.2 + partEmissive('exhaust') * 2}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
      </VehiclePart>

      {/* ───── SPOILER / ACTIVE AERO ───── */}
      <VehiclePart
        id="spoiler"
        hovered={isHovered('spoiler')}
        selected={isSelected('spoiler')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[0, 1.7, -2.6]}
      >
        {/* Main wing */}
        <mesh position={[0, 1.3, -2.55]} castShadow>
          <boxGeometry args={[2.4, 0.08, 0.5]} />
          {matBlack(partEmissive('spoiler'))}
        </mesh>
        {/* Wing supports */}
        {[0.55, -0.55].map((x, idx) => (
          <mesh
            key={`support-${idx}`}
            position={[x, 1.22, -2.55]}
            castShadow
          >
            <boxGeometry args={[0.06, 0.18, 0.18]} />
            {matBlack(partEmissive('spoiler'))}
          </mesh>
        ))}
        {/* End-cap fins */}
        <mesh position={[1.18, 1.42, -2.55]} castShadow>
          <boxGeometry args={[0.06, 0.34, 0.5]} />
          {matBlack(partEmissive('spoiler'))}
        </mesh>
        <mesh position={[-1.18, 1.42, -2.55]} castShadow>
          <boxGeometry args={[0.06, 0.34, 0.5]} />
          {matBlack(partEmissive('spoiler'))}
        </mesh>
      </VehiclePart>

      {/* ───── HEADLIGHTS ───── */}
      <VehiclePart
        id="headlights"
        hovered={isHovered('headlights')}
        selected={isSelected('headlights')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[0, 1.1, 3.5]}
      >
        {/* Amber slit emitters */}
        <mesh position={[0.65, 0.78, 3.3]}>
          <boxGeometry args={[0.45, 0.06, 0.05]} />
          <meshStandardMaterial
            color="#FFD56A"
            emissive="#FFD56A"
            emissiveIntensity={3.2 + partEmissive('headlights') * 2}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[-0.65, 0.78, 3.3]}>
          <boxGeometry args={[0.45, 0.06, 0.05]} />
          <meshStandardMaterial
            color="#FFD56A"
            emissive="#FFD56A"
            emissiveIntensity={3.2 + partEmissive('headlights') * 2}
            toneMapped={false}
          />
        </mesh>
        {/* Light spread cones (additive amber, transparent) */}
        <mesh
          position={[0.65, 0.78, 3.65]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <coneGeometry args={[0.22, 0.7, 14, 1, true]} />
          <meshBasicMaterial
            color="#FFD56A"
            transparent
            opacity={isSelected('headlights') ? 0.5 : isHovered('headlights') ? 0.38 : 0.22}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh
          position={[-0.65, 0.78, 3.65]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <coneGeometry args={[0.22, 0.7, 14, 1, true]} />
          <meshBasicMaterial
            color="#FFD56A"
            transparent
            opacity={isSelected('headlights') ? 0.5 : isHovered('headlights') ? 0.38 : 0.22}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </VehiclePart>

      {/* ───── UNDERGLOW ───── */}
      <VehiclePart
        id="underglow"
        hovered={isHovered('underglow')}
        selected={isSelected('underglow')}
        onHover={onHover}
        onSelect={onSelect}
        labelPos={[-1.6, 0.15, 0]}
      >
        {/* Amber plane under entire chassis */}
        <mesh position={[0, 0.06, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[2.3, 5.2]} />
          <meshBasicMaterial
            color={ACCENT_COLOR}
            transparent
            opacity={
              isSelected('underglow')
                ? 0.85
                : isHovered('underglow')
                  ? 0.7
                  : 0.5
            }
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
        {/* Side sill strips (long thin amber lines) */}
        <mesh position={[1.22, 0.32, 0]}>
          <boxGeometry args={[0.04, 0.06, 4.6]} />
          <meshBasicMaterial
            color={ACCENT_COLOR}
            transparent
            opacity={
              isSelected('underglow')
                ? 0.95
                : isHovered('underglow')
                  ? 0.8
                  : 0.6
            }
            toneMapped={false}
          />
        </mesh>
        <mesh position={[-1.22, 0.32, 0]}>
          <boxGeometry args={[0.04, 0.06, 4.6]} />
          <meshBasicMaterial
            color={ACCENT_COLOR}
            transparent
            opacity={
              isSelected('underglow')
                ? 0.95
                : isHovered('underglow')
                  ? 0.8
                  : 0.6
            }
            toneMapped={false}
          />
        </mesh>
      </VehiclePart>
    </group>
  );
}
