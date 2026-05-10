'use client';

import { useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

export interface Batcomputer3DProps {
  onClick: () => void;
  disabled: boolean;
}

export function Batcomputer3D({ onClick, disabled }: Batcomputer3DProps) {
  const [hovered, setHovered] = useState(false);
  const screenMatRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (!screenMatRef.current) return;
    const flicker = 0.9 + Math.sin(clock.elapsedTime * 8) * 0.05;
    const baseIntensity = hovered && !disabled ? 2.4 : 1.6;
    screenMatRef.current.emissiveIntensity = baseIntensity * flicker;
  });

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
      position={[0, 0, -5]}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Desk */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 1.4, 2]} />
        <meshStandardMaterial color="#1f2630" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* Pole / monitor stand */}
      <mesh position={[0, 2.3, -0.4]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 1.4, 12]} />
        <meshStandardMaterial color="#0e1216" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Monitor body */}
      <mesh position={[0, 3.4, -0.3]} rotation={[-0.05, 0, 0]} castShadow>
        <boxGeometry args={[3.6, 2.2, 0.18]} />
        <meshStandardMaterial color="#0a0d12" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Glowing screen face */}
      <mesh position={[0, 3.4, -0.205]} rotation={[-0.05, 0, 0]}>
        <planeGeometry args={[3.3, 1.95]} />
        <meshStandardMaterial
          ref={screenMatRef}
          color="#FFB200"
          emissive="#FFB200"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>

      {/* Hover ring */}
      {hovered && !disabled && (
        <mesh position={[0, 3.4, -0.2]} rotation={[-0.05, 0, 0]}>
          <ringGeometry args={[2.2, 2.4, 64]} />
          <meshBasicMaterial color="#FFB200" transparent opacity={0.35} />
        </mesh>
      )}
    </group>
  );
}
