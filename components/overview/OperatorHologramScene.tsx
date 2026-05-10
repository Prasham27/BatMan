'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { SchematicPanel } from '@/components/widgets/SchematicPanel';

const SIGNAL = '#FFB200';
const SIGNAL_DIM = '#B37D00';

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

/**
 * Wireframe humanoid operator silhouette — abstract tactical figure built
 * from primitives. Smaller and more schematic than the cave OperatorSilhouette.
 */
function WireframeOperator() {
  return (
    <group position={[0, -2, 0]}>
      {/* Head */}
      <mesh position={[0, 4.4, 0]}>
        <sphereGeometry args={[0.45, 10, 8]} />
        <meshBasicMaterial
          color={SIGNAL}
          wireframe
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 3.85, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.3, 8]} />
        <meshBasicMaterial color={SIGNAL_DIM} wireframe transparent opacity={0.7} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 2.85, 0]}>
        <boxGeometry args={[1.4, 1.6, 0.7]} />
        <meshBasicMaterial color={SIGNAL} wireframe transparent opacity={0.8} toneMapped={false} />
      </mesh>
      {/* Belt */}
      <mesh position={[0, 1.95, 0]}>
        <boxGeometry args={[1.45, 0.18, 0.75]} />
        <meshBasicMaterial color={SIGNAL} wireframe transparent opacity={0.95} toneMapped={false} />
      </mesh>
      {/* Pelvis */}
      <mesh position={[0, 1.55, 0]}>
        <boxGeometry args={[1.2, 0.5, 0.65]} />
        <meshBasicMaterial color={SIGNAL_DIM} wireframe transparent opacity={0.7} />
      </mesh>
      {/* Shoulders */}
      <mesh position={[0.85, 3.45, 0]}>
        <sphereGeometry args={[0.28, 8, 6]} />
        <meshBasicMaterial color={SIGNAL_DIM} wireframe transparent opacity={0.7} />
      </mesh>
      <mesh position={[-0.85, 3.45, 0]}>
        <sphereGeometry args={[0.28, 8, 6]} />
        <meshBasicMaterial color={SIGNAL_DIM} wireframe transparent opacity={0.7} />
      </mesh>
      {/* Upper arms */}
      <mesh position={[0.95, 2.85, 0]}>
        <cylinderGeometry args={[0.18, 0.16, 1.1, 8]} />
        <meshBasicMaterial color={SIGNAL_DIM} wireframe transparent opacity={0.7} />
      </mesh>
      <mesh position={[-0.95, 2.85, 0]}>
        <cylinderGeometry args={[0.18, 0.16, 1.1, 8]} />
        <meshBasicMaterial color={SIGNAL_DIM} wireframe transparent opacity={0.7} />
      </mesh>
      {/* Forearms */}
      <mesh position={[0.95, 1.85, 0]}>
        <cylinderGeometry args={[0.16, 0.14, 0.95, 8]} />
        <meshBasicMaterial color={SIGNAL_DIM} wireframe transparent opacity={0.7} />
      </mesh>
      <mesh position={[-0.95, 1.85, 0]}>
        <cylinderGeometry args={[0.16, 0.14, 0.95, 8]} />
        <meshBasicMaterial color={SIGNAL_DIM} wireframe transparent opacity={0.7} />
      </mesh>
      {/* Upper legs */}
      <mesh position={[0.35, 0.85, 0]}>
        <cylinderGeometry args={[0.24, 0.2, 1.3, 8]} />
        <meshBasicMaterial color={SIGNAL_DIM} wireframe transparent opacity={0.7} />
      </mesh>
      <mesh position={[-0.35, 0.85, 0]}>
        <cylinderGeometry args={[0.24, 0.2, 1.3, 8]} />
        <meshBasicMaterial color={SIGNAL_DIM} wireframe transparent opacity={0.7} />
      </mesh>
      {/* Lower legs */}
      <mesh position={[0.35, -0.35, 0]}>
        <cylinderGeometry args={[0.2, 0.16, 1.2, 8]} />
        <meshBasicMaterial color={SIGNAL_DIM} wireframe transparent opacity={0.7} />
      </mesh>
      <mesh position={[-0.35, -0.35, 0]}>
        <cylinderGeometry args={[0.2, 0.16, 1.2, 8]} />
        <meshBasicMaterial color={SIGNAL_DIM} wireframe transparent opacity={0.7} />
      </mesh>
    </group>
  );
}

interface ShardProps {
  label: string;
  radius: number;
  speed: number;
  phase: number;
  height: number;
  reduced: boolean;
}

function DataShard({ label, radius, speed, phase, height, reduced }: ShardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime * speed + phase;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(t) * radius;
      groupRef.current.position.z = Math.sin(t) * radius;
      groupRef.current.position.y = height + Math.sin(t * 1.5) * 0.15;
    }
    if (meshRef.current) {
      meshRef.current.rotation.x = t * 0.6;
      meshRef.current.rotation.y = t * 0.9;
    }
  });

  // Initialize static position when reduced motion
  useEffect(() => {
    if (!reduced || !groupRef.current) return;
    groupRef.current.position.x = Math.cos(phase) * radius;
    groupRef.current.position.z = Math.sin(phase) * radius;
    groupRef.current.position.y = height;
  }, [reduced, phase, radius, height]);

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.22, 0]} />
        <meshBasicMaterial color={SIGNAL} wireframe toneMapped={false} />
      </mesh>
      <Html
        center
        distanceFactor={8}
        style={{
          pointerEvents: 'none',
          fontFamily: "'JetBrains Mono', ui-monospace, monospace",
          fontSize: '10px',
          letterSpacing: '0.18em',
          color: SIGNAL,
          whiteSpace: 'nowrap',
          transform: 'translate(0, 22px)',
          textShadow: '0 0 6px rgba(255, 178, 0, 0.45)',
        }}
      >
        {label}
      </Html>
    </group>
  );
}

function CameraDolly({ reduced }: { reduced: boolean }) {
  const { camera } = useThree();
  const radius = 7;
  const targetY = 2.2;

  useEffect(() => {
    camera.position.set(radius, targetY + 0.4, radius * 0.6);
    camera.lookAt(0, targetY, 0);
  }, [camera]);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime * 0.15;
    camera.position.x = Math.cos(t) * radius;
    camera.position.z = Math.sin(t) * radius;
    camera.position.y = targetY + 0.4 + Math.sin(t * 0.5) * 0.2;
    camera.lookAt(0, targetY, 0);
  });

  return null;
}

function Scene({ reduced }: { reduced: boolean }) {
  return (
    <>
      <CameraDolly reduced={reduced} />
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 6, 3]} intensity={0.6} color={SIGNAL} />

      <WireframeOperator />

      {/* Tron grid floor */}
      <gridHelper
        args={[12, 12, SIGNAL, SIGNAL_DIM]}
        position={[0, -2, 0]}
      />

      {/* Orbiting data shards */}
      <DataShard
        label="OP // PRASHAM"
        radius={2.6}
        speed={0.5}
        phase={0}
        height={3.2}
        reduced={reduced}
      />
      <DataShard
        label="STATUS // ACTIVE"
        radius={2.8}
        speed={0.4}
        phase={(Math.PI * 2) / 3}
        height={2.4}
        reduced={reduced}
      />
      <DataShard
        label="CLEARANCE // L7"
        radius={2.6}
        speed={0.45}
        phase={(Math.PI * 4) / 3}
        height={1.6}
        reduced={reduced}
      />
    </>
  );
}

export function OperatorHologramScene() {
  const reduced = useReducedMotion();

  return (
    <SchematicPanel label="OPERATOR HOLOGRAM" caption="LIVE">
      <div
        className="relative"
        style={{ width: '100%', aspectRatio: '1 / 1', maxWidth: 360 }}
      >
        <Canvas
          dpr={[1, 1.75]}
          camera={{ position: [7, 2.6, 4.2], fov: 38 }}
          gl={{ antialias: true, alpha: true }}
          style={{ width: '100%', height: '100%' }}
          frameloop={reduced ? 'demand' : 'always'}
        >
          <Scene reduced={reduced} />
        </Canvas>
      </div>
    </SchematicPanel>
  );
}
