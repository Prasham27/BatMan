'use client';

import * as THREE from 'three';

export function BatmobilePlatform() {
  return (
    <group position={[-9, 0, 1]}>
      {/* Disc base, slight raise off the floor */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[3.5, 3.5, 0.1, 64]} />
        <meshStandardMaterial color="#0e1216" roughness={0.55} metalness={0.6} />
      </mesh>

      {/* Outer rim glow */}
      <mesh position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.4, 3.5, 64]} />
        <meshBasicMaterial
          color="#FFB200"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* Inner decorative ring */}
      <mesh position={[0, 0.115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.4, 2.45, 64]} />
        <meshBasicMaterial
          color="#FFB200"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>

      {/* 4 small marker dots at cardinal points */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        const r = 3.2;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.13, Math.sin(a) * r]}>
            <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
            <meshBasicMaterial color="#FFB200" toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
}
