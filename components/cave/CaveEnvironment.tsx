'use client';

import { useMemo } from 'react';
import { MeshReflectorMaterial } from '@react-three/drei';

interface Stalactite {
  pos: [number, number, number];
  height: number;
  radius: number;
}

export function CaveEnvironment() {
  const stalactites: Stalactite[] = useMemo(() => {
    const items: Stalactite[] = [];
    const rng = mulberry32(42);
    for (let i = 0; i < 14; i++) {
      const x = (rng() - 0.5) * 22;
      const z = (rng() - 0.5) * 18 - 4;
      const height = 1.5 + rng() * 3;
      const radius = 0.3 + rng() * 0.5;
      items.push({ pos: [x, 14 - height / 2, z], height, radius });
    }
    return items;
  }, []);

  return (
    <group>
      {/* Wet reflective floor — drei's MeshReflectorMaterial */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={512}
          mixBlur={1}
          mixStrength={0.5}
          roughness={0.95}
          depthScale={1.0}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#15181c"
          metalness={0.45}
          mirror={0.5}
        />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 10, -22]} receiveShadow>
        <planeGeometry args={[60, 30]} />
        <meshStandardMaterial color="#15181c" roughness={1} />
      </mesh>

      {/* Side walls */}
      <mesh position={[-22, 10, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[60, 30]} />
        <meshStandardMaterial color="#15181c" roughness={1} />
      </mesh>
      <mesh position={[22, 10, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[60, 30]} />
        <meshStandardMaterial color="#15181c" roughness={1} />
      </mesh>

      {/* Stalactites hanging from above */}
      {stalactites.map((s, i) => (
        <mesh key={i} position={s.pos} castShadow>
          <coneGeometry args={[s.radius, s.height, 8]} />
          <meshStandardMaterial color="#1a1d22" roughness={0.9} />
        </mesh>
      ))}

      {/* Two gothic columns flanking the back of the cave */}
      {[-9, 9].map((x) => (
        <group key={x} position={[x, 0, -14]}>
          <mesh position={[0, 5, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.8, 10, 12]} />
            <meshStandardMaterial color="#15181c" roughness={1} />
          </mesh>
          <mesh position={[0, 10.4, 0]} castShadow>
            <boxGeometry args={[2, 0.8, 2]} />
            <meshStandardMaterial color="#15181c" roughness={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
