'use client';

import { useState } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const WHEEL_POSITIONS: Array<[number, number, number]> = [
  [1.05, 0.55, 1.7],
  [-1.05, 0.55, 1.7],
  [1.05, 0.55, -1.7],
  [-1.05, 0.55, -1.7],
];

export interface BatmobileProps {
  onClick: () => void;
  disabled?: boolean;
}

export function Batmobile({ onClick, disabled }: BatmobileProps) {
  const [hovered, setHovered] = useState(false);

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (disabled) return;
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
    if (disabled) return;
    e.stopPropagation();
    onClick();
  };

  // Material presets
  const matBlack = (
    <meshStandardMaterial color="#08090c" roughness={0.35} metalness={0.85} />
  );
  const matBlackRough = (
    <meshStandardMaterial color="#0a0d11" roughness={0.7} metalness={0.4} />
  );
  const matGloss = (
    <meshStandardMaterial color="#0a0c10" roughness={0.2} metalness={0.95} />
  );
  const matRubber = (
    <meshStandardMaterial color="#08090b" roughness={0.95} metalness={0.05} />
  );
  const matRotor = (
    <meshStandardMaterial color="#1a1d22" roughness={0.4} metalness={0.85} />
  );

  return (
    <group
      position={[-9, 0, 1]}
      rotation={[0, 0.4, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* ───── LOWER CHASSIS ───── */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.5, 5.4]} />
        {matBlack}
      </mesh>

      {/* ───── MAIN UPPER BODY (slightly tapered) ───── */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <boxGeometry args={[2.2, 0.5, 4.8]} />
        {matGloss}
      </mesh>

      {/* ───── FRONT NOSE WEDGE ───── */}
      <mesh position={[0, 0.55, 2.7]} rotation={[-0.2, 0, 0]} castShadow>
        <boxGeometry args={[2.0, 0.5, 1.4]} />
        {matBlack}
      </mesh>
      {/* Nose tip */}
      <mesh position={[0, 0.45, 3.35]} rotation={[-0.35, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 0.35, 0.4]} />
        {matGloss}
      </mesh>

      {/* ───── FRONT ARMOR PLATES (stacked) ───── */}
      <mesh position={[0, 0.95, 2.5]} rotation={[-0.18, 0, 0]} castShadow>
        <boxGeometry args={[1.7, 0.18, 1.2]} />
        {matBlack}
      </mesh>
      <mesh position={[0, 1.1, 2.0]} rotation={[-0.1, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 0.14, 0.8]} />
        {matBlack}
      </mesh>

      {/* ───── ROOF / COCKPIT ───── */}
      {/* Cockpit canopy — tinted glass */}
      <mesh position={[0, 1.35, 0.2]} castShadow>
        <boxGeometry args={[1.5, 0.55, 2.0]} />
        <meshStandardMaterial
          color="#0a1a2a"
          roughness={0.15}
          metalness={0.4}
          transparent
          opacity={0.75}
        />
      </mesh>
      {/* Cockpit edge frame */}
      <mesh position={[0, 1.65, 0.2]} castShadow>
        <boxGeometry args={[1.55, 0.05, 2.05]} />
        {matBlack}
      </mesh>
      {/* Roof intake scoop */}
      <mesh position={[0, 1.5, -0.9]} rotation={[0.2, 0, 0]} castShadow>
        <boxGeometry args={[0.6, 0.2, 0.8]} />
        {matBlack}
      </mesh>
      {/* Roof sensor / antenna mast */}
      <mesh position={[0.45, 1.85, -0.5]}>
        <cylinderGeometry args={[0.025, 0.025, 0.5, 8]} />
        {matBlack}
      </mesh>
      <mesh position={[0.45, 2.12, -0.5]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial
          color="#FFB200"
          emissive="#FFB200"
          emissiveIntensity={hovered && !disabled ? 2.0 : 1.2}
          toneMapped={false}
        />
      </mesh>

      {/* ───── SIDE ARMOR PANELS (with bolts) ───── */}
      {[1.21, -1.21].map((x, idx) => (
        <group key={`side-${idx}`}>
          <mesh position={[x, 0.7, 0]} rotation={[0, 0, x > 0 ? -0.05 : 0.05]} castShadow>
            <boxGeometry args={[0.04, 0.6, 4.6]} />
            {matBlack}
          </mesh>
          {/* Bolts along the panel */}
          {[-1.6, -0.5, 0.6, 1.7].map((z, i) => (
            <mesh
              key={`bolt-${idx}-${i}`}
              position={[x + (x > 0 ? 0.025 : -0.025), 0.7, z]}
            >
              <sphereGeometry args={[0.05, 8, 8]} />
              {matGloss}
            </mesh>
          ))}
        </group>
      ))}

      {/* ───── SIDE INTAKES (in front of rear wheels) ───── */}
      {[1.05, -1.05].map((x, idx) => (
        <mesh key={`intake-${idx}`} position={[x, 0.85, -0.6]} castShadow>
          <boxGeometry args={[0.18, 0.25, 0.6]} />
          <meshStandardMaterial color="#020306" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}

      {/* ───── REAR SPOILER (large, sweeping) ───── */}
      <mesh position={[0, 1.25, -2.55]} castShadow>
        <boxGeometry args={[2.4, 0.08, 0.5]} />
        {matBlack}
      </mesh>
      {/* Spoiler end-caps (vertical fins) */}
      <mesh position={[1.18, 1.4, -2.55]}>
        <boxGeometry args={[0.05, 0.32, 0.5]} />
        {matBlack}
      </mesh>
      <mesh position={[-1.18, 1.4, -2.55]}>
        <boxGeometry args={[0.05, 0.32, 0.5]} />
        {matBlack}
      </mesh>

      {/* ───── REAR EXHAUST PIPES (4 tubes with amber-glow tips) ───── */}
      {[-0.45, -0.15, 0.15, 0.45].map((x, idx) => (
        <group key={`exhaust-${idx}`}>
          <mesh position={[x, 0.6, -2.75]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.25, 12]} />
            <meshStandardMaterial color="#15181c" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Glow tip */}
          <mesh position={[x, 0.6, -2.85]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
            <meshStandardMaterial
              color="#FFB200"
              emissive="#FFB200"
              emissiveIntensity={hovered && !disabled ? 3.0 : 2.0}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}

      {/* ───── TAIL LIGHTS (red emissive bars) ───── */}
      <mesh position={[0.7, 0.95, -2.75]}>
        <boxGeometry args={[0.4, 0.06, 0.04]} />
        <meshStandardMaterial
          color="#E63946"
          emissive="#E63946"
          emissiveIntensity={hovered && !disabled ? 3.5 : 2.0}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-0.7, 0.95, -2.75]}>
        <boxGeometry args={[0.4, 0.06, 0.04]} />
        <meshStandardMaterial
          color="#E63946"
          emissive="#E63946"
          emissiveIntensity={hovered && !disabled ? 3.5 : 2.0}
          toneMapped={false}
        />
      </mesh>

      {/* ───── HEADLIGHT SLITS (front, amber) ───── */}
      <mesh position={[0.65, 0.78, 3.3]}>
        <boxGeometry args={[0.45, 0.06, 0.05]} />
        <meshStandardMaterial
          color="#FFD56A"
          emissive="#FFD56A"
          emissiveIntensity={hovered && !disabled ? 4.0 : 2.5}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-0.65, 0.78, 3.3]}>
        <boxGeometry args={[0.45, 0.06, 0.05]} />
        <meshStandardMaterial
          color="#FFD56A"
          emissive="#FFD56A"
          emissiveIntensity={hovered && !disabled ? 4.0 : 2.5}
          toneMapped={false}
        />
      </mesh>

      {/* ───── WHEELS + WHEEL ARCHES + BRAKE ROTORS ───── */}
      {WHEEL_POSITIONS.map(([x, y, z], i) => (
        <group key={`wheel-${i}`}>
          {/* Wheel arch (curved black piece above wheel) */}
          <mesh position={[x, y + 0.15, z]} rotation={[0, 0, 0]}>
            <torusGeometry args={[0.55, 0.08, 6, 12, Math.PI]} />
            {matBlack}
          </mesh>
          {/* Tire */}
          <mesh position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.55, 0.55, 0.45, 24]} />
            {matRubber}
          </mesh>
          {/* Inner rim */}
          <mesh position={[x + (x > 0 ? -0.12 : 0.12), y, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.42, 0.42, 0.18, 16]} />
            {matRotor}
          </mesh>
          {/* Brake rotor (visible disc behind wheel) */}
          <mesh position={[x + (x > 0 ? -0.18 : 0.18), y, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.32, 0.32, 0.04, 24]} />
            <meshStandardMaterial color="#3a3f48" roughness={0.4} metalness={0.85} />
          </mesh>
          {/* Center hub cap */}
          <mesh position={[x + (x > 0 ? -0.05 : 0.05), y, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.36, 12]} />
            {matGloss}
          </mesh>
        </group>
      ))}

      {/* ───── UNDERGLOW STRIP — bright amber, much more prominent ───── */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[2.0, 0.04, 4.8]} />
        <meshBasicMaterial
          color="#FFB200"
          transparent
          opacity={hovered && !disabled ? 0.85 : 0.55}
          toneMapped={false}
        />
      </mesh>
      {/* Underglow side strips (long thin lines of amber) */}
      <mesh position={[0, 0.04, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4, 5.4]} />
        <meshBasicMaterial
          color="#FFB200"
          transparent
          opacity={hovered && !disabled ? 0.5 : 0.32}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ───── DEDICATED LIGHTS — make the Batmobile actually visible ───── */}
      {/* Strong amber underglow point light — the "techy" glow under the car */}
      <pointLight
        position={[0, 0.15, 0]}
        intensity={3.5}
        distance={5}
        decay={1.5}
        color="#FFB200"
      />
      {/* Cool fill light from above — pick out the chassis surfaces */}
      <pointLight
        position={[0, 4, 0]}
        intensity={2.2}
        distance={6}
        decay={1.6}
        color="#aaccff"
      />
      {/* Small front fill so headlights area reads */}
      <pointLight
        position={[0, 1, 3.5]}
        intensity={1.0}
        distance={3}
        decay={1.5}
        color="#FFD56A"
      />

      {/* Hover label */}
      {hovered && !disabled && (
        <Html position={[0, 2.6, 0]} center distanceFactor={11} occlude={false}>
          <div className="pointer-events-none whitespace-nowrap font-mono text-xs tracking-widest text-signal">
            [E] TACTICAL TRANSPORT
          </div>
        </Html>
      )}
    </group>
  );
}
