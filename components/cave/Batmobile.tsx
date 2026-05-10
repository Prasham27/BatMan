'use client';

import { useState } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const WHEEL_POSITIONS: Array<[number, number, number]> = [
  [1.0, 0.5, 1.6],
  [-1.0, 0.5, 1.6],
  [1.0, 0.5, -1.6],
  [-1.0, 0.5, -1.6],
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

  return (
    <group
      position={[-9, 0, 1]}
      rotation={[0, 0.4, 0]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Main chassis — long flat box */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[2.2, 0.6, 5]} />
        <meshStandardMaterial color="#0a0d11" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Front wedge */}
      <mesh position={[0, 0.5, 2.4]} rotation={[-0.18, 0, 0]} castShadow>
        <boxGeometry args={[2.0, 0.4, 1.6]} />
        <meshStandardMaterial color="#0a0d11" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Cockpit canopy */}
      <mesh position={[0, 1.1, 0]} castShadow>
        <boxGeometry args={[1.4, 0.5, 2.2]} />
        <meshStandardMaterial
          color="#1a2a3a"
          roughness={0.3}
          metalness={0.5}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Rear spoiler */}
      <mesh position={[0, 1.0, -2.4]} castShadow>
        <boxGeometry args={[2.4, 0.1, 0.6]} />
        <meshStandardMaterial color="#0a0d11" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Wheels */}
      {WHEEL_POSITIONS.map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.4, 16]} />
          <meshStandardMaterial color="#0a0d11" roughness={0.9} />
        </mesh>
      ))}

      {/* Underglow strip — brighter on hover */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[2.0, 0.02, 4.5]} />
        <meshBasicMaterial
          color="#FFB200"
          transparent
          opacity={hovered && !disabled ? 0.65 : 0.3}
          toneMapped={false}
        />
      </mesh>

      {/* Headlight slits */}
      <mesh position={[0.7, 0.7, 3.1]}>
        <boxGeometry args={[0.4, 0.05, 0.05]} />
        <meshBasicMaterial color="#7090b0" toneMapped={false} />
      </mesh>
      <mesh position={[-0.7, 0.7, 3.1]}>
        <boxGeometry args={[0.4, 0.05, 0.05]} />
        <meshBasicMaterial color="#7090b0" toneMapped={false} />
      </mesh>

      {/* Hover label */}
      {hovered && !disabled && (
        <Html position={[0, 2.3, 0]} center distanceFactor={11} occlude={false}>
          <div className="pointer-events-none whitespace-nowrap font-mono text-xs tracking-widest text-signal">
            [E] TACTICAL TRANSPORT
          </div>
        </Html>
      )}
    </group>
  );
}
