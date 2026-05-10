'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function SurveillanceDrone3D() {
  const groupRef = useRef<THREE.Group>(null);
  const baseY = 11;

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.elapsedTime * 0.3;
    groupRef.current.position.y = baseY + Math.sin(clock.elapsedTime * 0.8) * 0.12;
  });

  return (
    <group ref={groupRef} position={[10, baseY, 5]}>
      {/* Center body */}
      <mesh castShadow>
        <icosahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color="#1a1d22" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Red activity light (under) */}
      <mesh position={[0, -0.4, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial
          color="#E63946"
          emissive="#E63946"
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>

      {/* Faint blue glow on the body */}
      <pointLight
        position={[0, -0.2, 0]}
        intensity={0.6}
        distance={3}
        color="#7090b0"
      />

      {/* 4 arms with rotors */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const x = Math.cos(a) * 0.7;
        const z = Math.sin(a) * 0.7;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh rotation={[0, -a, 0]}>
              <boxGeometry args={[0.5, 0.05, 0.05]} />
              <meshStandardMaterial color="#1a1d22" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.18, 0.18, 0.02, 16]} />
              <meshStandardMaterial color="#3a3f48" roughness={0.6} metalness={0.5} />
            </mesh>
          </group>
        );
      })}

      {/* Suspension cable to ceiling */}
      <mesh position={[0, (15 - baseY) / 2 + 0.5, 0]}>
        <cylinderGeometry
          args={[0.015, 0.015, 15 - baseY, 6]}
        />
        <meshStandardMaterial color="#3a3f48" roughness={0.5} />
      </mesh>
    </group>
  );
}
