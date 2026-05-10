'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Stylized operator silhouette built from primitives — more detail than v1.
 * Reads as a cowled tactical operator (Batman-from-behind) in the wide shot.
 * To upgrade to a CC-licensed `.glb`, replace this file's primitives with
 * `useGLTF` from drei and a sourced model. See REMINDERS.md for legit options.
 */
export function OperatorSilhouette() {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle idle breath — tiny vertical drift
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = Math.sin(clock.elapsedTime * 1.05) * 0.018;
  });

  return (
    <group ref={groupRef} position={[0, 0, -3]}>
      {/* ───── BOOTS ───── */}
      <mesh position={[0.18, 0.12, 0.05]} castShadow>
        <boxGeometry args={[0.32, 0.24, 0.55]} />
        <BodyMat />
      </mesh>
      <mesh position={[-0.18, 0.12, 0.05]} castShadow>
        <boxGeometry args={[0.32, 0.24, 0.55]} />
        <BodyMat />
      </mesh>

      {/* ───── LEGS — upper + lower ───── */}
      <mesh position={[0.18, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.55, 6, 10]} />
        <BodyMat />
      </mesh>
      <mesh position={[-0.18, 0.7, 0]} castShadow>
        <capsuleGeometry args={[0.18, 0.55, 6, 10]} />
        <BodyMat />
      </mesh>
      <mesh position={[0.18, 1.4, 0]} castShadow>
        <capsuleGeometry args={[0.21, 0.6, 6, 10]} />
        <BodyMat />
      </mesh>
      <mesh position={[-0.18, 1.4, 0]} castShadow>
        <capsuleGeometry args={[0.21, 0.6, 6, 10]} />
        <BodyMat />
      </mesh>

      {/* ───── UTILITY BELT ───── */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <cylinderGeometry args={[0.46, 0.46, 0.2, 24]} />
        <meshStandardMaterial color="#1a1a1f" roughness={0.55} metalness={0.35} />
      </mesh>
      {/* Belt buckle (the one amber signal-color accent on the figure) */}
      <mesh position={[0, 1.85, 0.42]}>
        <boxGeometry args={[0.22, 0.12, 0.06]} />
        <meshStandardMaterial
          color="#FFB200"
          emissive="#FFB200"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      {/* Belt pouches around the sides */}
      {[-0.32, -0.14, 0.14, 0.32].map((x, i) => (
        <mesh key={i} position={[x, 1.83, 0.4]} castShadow>
          <boxGeometry args={[0.14, 0.16, 0.08]} />
          <meshStandardMaterial color="#15161a" roughness={0.7} />
        </mesh>
      ))}
      {/* Side pouches */}
      <mesh position={[0.45, 1.85, 0.05]} castShadow>
        <boxGeometry args={[0.08, 0.18, 0.18]} />
        <meshStandardMaterial color="#15161a" roughness={0.7} />
      </mesh>
      <mesh position={[-0.45, 1.85, 0.05]} castShadow>
        <boxGeometry args={[0.08, 0.18, 0.18]} />
        <meshStandardMaterial color="#15161a" roughness={0.7} />
      </mesh>

      {/* ───── TORSO + CHEST PLATE ───── */}
      <mesh position={[0, 2.35, 0]} castShadow>
        <capsuleGeometry args={[0.46, 0.85, 6, 12]} />
        <BodyMat />
      </mesh>
      {/* Subtle chest plate — slight forward bevel (no Bat-symbol) */}
      <mesh position={[0, 2.5, 0.32]} castShadow>
        <boxGeometry args={[0.7, 0.85, 0.12]} />
        <meshStandardMaterial color="#0a0b0e" roughness={0.45} metalness={0.4} />
      </mesh>

      {/* ───── SHOULDERS — pauldrons ───── */}
      <mesh position={[0.55, 2.78, 0]} castShadow>
        <sphereGeometry args={[0.22, 14, 14]} />
        <meshStandardMaterial color="#0a0b0e" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[-0.55, 2.78, 0]} castShadow>
        <sphereGeometry args={[0.22, 14, 14]} />
        <meshStandardMaterial color="#0a0b0e" roughness={0.5} metalness={0.4} />
      </mesh>

      {/* ───── ARMS — upper, forearm/gauntlet, fist ───── */}
      <mesh position={[0.6, 2.4, 0]} rotation={[0, 0, 0.05]} castShadow>
        <capsuleGeometry args={[0.16, 0.55, 6, 10]} />
        <BodyMat />
      </mesh>
      <mesh position={[-0.6, 2.4, 0]} rotation={[0, 0, -0.05]} castShadow>
        <capsuleGeometry args={[0.16, 0.55, 6, 10]} />
        <BodyMat />
      </mesh>
      {/* Forearm gauntlets — slightly wider with ridges */}
      <mesh position={[0.62, 1.85, 0]} rotation={[0, 0, 0.04]} castShadow>
        <cylinderGeometry args={[0.18, 0.16, 0.5, 12]} />
        <meshStandardMaterial color="#0a0b0e" roughness={0.5} metalness={0.45} />
      </mesh>
      <mesh position={[-0.62, 1.85, 0]} rotation={[0, 0, -0.04]} castShadow>
        <cylinderGeometry args={[0.18, 0.16, 0.5, 12]} />
        <meshStandardMaterial color="#0a0b0e" roughness={0.5} metalness={0.45} />
      </mesh>
      {/* Gauntlet fin ridges — three thin blades on each */}
      {[0.62, -0.62].map((x) =>
        [0.85, 1.7, 1.95].map((y, i) => (
          <mesh
            key={`${x}-${i}`}
            position={[x + (x > 0 ? 0.16 : -0.16), y, 0]}
            rotation={[0, 0, x > 0 ? 0.5 : -0.5]}
          >
            <boxGeometry args={[0.18, 0.04, 0.12]} />
            <meshStandardMaterial color="#0a0b0e" roughness={0.6} />
          </mesh>
        )),
      )}
      {/* Fists */}
      <mesh position={[0.66, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.13, 12, 12]} />
        <BodyMat />
      </mesh>
      <mesh position={[-0.66, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.13, 12, 12]} />
        <BodyMat />
      </mesh>

      {/* ───── NECK ───── */}
      <mesh position={[0, 3.0, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.16, 0.16, 12]} />
        <BodyMat />
      </mesh>

      {/* ───── HEAD + COWL ───── */}
      <mesh position={[0, 3.22, 0]} castShadow>
        <sphereGeometry args={[0.26, 18, 18]} />
        <BodyMat />
      </mesh>
      {/* Subtle jaw definition (forward extension under cowl) */}
      <mesh position={[0, 3.1, 0.18]} castShadow>
        <boxGeometry args={[0.32, 0.18, 0.18]} />
        <BodyMat />
      </mesh>
      {/* Cowl ears — taller, sharper than v1 */}
      <mesh position={[-0.16, 3.55, -0.02]} rotation={[0, 0, 0.32]} castShadow>
        <coneGeometry args={[0.06, 0.32, 5]} />
        <BodyMat />
      </mesh>
      <mesh position={[0.16, 3.55, -0.02]} rotation={[0, 0, -0.32]} castShadow>
        <coneGeometry args={[0.06, 0.32, 5]} />
        <BodyMat />
      </mesh>

      {/* ───── CAPE — multi-panel drape ───── */}
      {/* Center back panel (long, sweeping behind) */}
      <mesh position={[0, 1.6, 0.18]} rotation={[0.05, 0, 0]} castShadow>
        <cylinderGeometry
          args={[0.7, 1.4, 2.7, 22, 1, true, Math.PI * 0.55, Math.PI * 0.9]}
        />
        <meshStandardMaterial
          color="#06070a"
          roughness={0.78}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Left wing panel */}
      <mesh
        position={[-0.55, 1.9, 0.35]}
        rotation={[0, -0.4, 0.15]}
        castShadow
      >
        <planeGeometry args={[0.9, 2.1, 4, 6]} />
        <meshStandardMaterial
          color="#07080b"
          roughness={0.78}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Right wing panel */}
      <mesh
        position={[0.55, 1.9, 0.35]}
        rotation={[0, 0.4, -0.15]}
        castShadow
      >
        <planeGeometry args={[0.9, 2.1, 4, 6]} />
        <meshStandardMaterial
          color="#07080b"
          roughness={0.78}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Cape tail — narrower bottom panel suggesting it pools toward floor */}
      <mesh position={[0, 0.4, 0.45]} rotation={[0.4, 0, 0]} castShadow>
        <planeGeometry args={[1.6, 0.7]} />
        <meshStandardMaterial
          color="#06070a"
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ───── RIM LIGHTING — make the silhouette read against the cave ───── */}
      {/* Strong rim from above-back (cool moonlight on cape + shoulders) */}
      <pointLight
        position={[0, 5, 2.5]}
        intensity={2.4}
        distance={5}
        color="#7090b0"
      />
      {/* Side rims for shoulder/cape definition */}
      <pointLight
        position={[2.5, 3, 1.5]}
        intensity={1.2}
        distance={4}
        color="#5070a0"
      />
      <pointLight
        position={[-2.5, 3, 1.5]}
        intensity={1.2}
        distance={4}
        color="#5070a0"
      />
      {/* Warm key light from console direction (in front, lower) — picks out the chest */}
      <pointLight
        position={[0, 2, -1.5]}
        intensity={1.4}
        distance={3.5}
        color="#FFB200"
      />
    </group>
  );
}

function BodyMat() {
  return (
    <meshStandardMaterial color="#08090c" roughness={0.62} metalness={0.28} />
  );
}
