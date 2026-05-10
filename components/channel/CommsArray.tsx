'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type CommsState = 'idle' | 'locking' | 'transmitting';

export interface CommsArrayProps {
  state: CommsState;
}

function Dish({ state }: { state: CommsState }) {
  const groupRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return;

    if (state === 'idle') {
      groupRef.current.rotation.y += delta * 0.4;
      groupRef.current.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.15;
    } else if (state === 'locking') {
      // Lock onto a target — settle to a fixed orientation
      const targetY = Math.PI * 0.25;
      const targetX = -0.3;
      groupRef.current.rotation.y +=
        (targetY - groupRef.current.rotation.y) * delta * 4;
      groupRef.current.rotation.x +=
        (targetX - groupRef.current.rotation.x) * delta * 4;
    }

    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity =
        state === 'transmitting' ? 0.7 + Math.sin(clock.elapsedTime * 12) * 0.2 : 0;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Pedestal */}
      <mesh position={[0, -1.5, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.6, 1.2, 16]} />
        <meshStandardMaterial color="#1a1d22" roughness={0.5} metalness={0.6} />
      </mesh>
      <mesh position={[0, -0.85, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.4, 12]} />
        <meshStandardMaterial color="#0a0d11" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Dish + sub-reflector */}
      <group ref={groupRef} position={[0, -0.5, 0]}>
        {/* Main dish — open hemisphere */}
        <mesh castShadow>
          <sphereGeometry
            args={[1.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.4]}
          />
          <meshStandardMaterial
            color="#1f2630"
            roughness={0.4}
            metalness={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Inside emissive coating */}
        <mesh>
          <sphereGeometry
            args={[1.18, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2.4]}
          />
          <meshStandardMaterial
            color="#FFB200"
            emissive="#FFB200"
            emissiveIntensity={state === 'transmitting' ? 1.4 : 0.3}
            transparent
            opacity={0.5}
            side={THREE.BackSide}
            toneMapped={false}
          />
        </mesh>

        {/* Sub-reflector struts */}
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.55, 0.5, Math.sin(a) * 0.55]}
              rotation={[0, -a, 0]}
            >
              <cylinderGeometry args={[0.02, 0.02, 1, 6]} />
              <meshStandardMaterial color="#1a1d22" />
            </mesh>
          );
        })}
        {/* Sub-reflector */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#0a0d11" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Beam — visible when transmitting */}
        <mesh
          ref={beamRef}
          position={[0, 4, 0]}
          rotation={[0, 0, 0]}
        >
          <coneGeometry args={[0.3, 8, 24, 1, true]} />
          <meshBasicMaterial
            color="#FFB200"
            transparent
            opacity={0}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Status ring on the floor */}
      <mesh position={[0, -2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, 0.85, 48]} />
        <meshBasicMaterial
          color={
            state === 'transmitting'
              ? '#FFB200'
              : state === 'locking'
                ? '#7090b0'
                : '#3a3f48'
          }
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function CommsArray({ state }: CommsArrayProps) {
  const stateColor =
    state === 'transmitting'
      ? 'text-signal'
      : state === 'locking'
        ? 'text-text'
        : 'text-text-muted';

  return (
    <>
      {/* Desktop: full 3D dish */}
      <div className="relative hidden h-[480px] w-full overflow-hidden border border-border bg-surface/40 backdrop-blur-sm md:block">
        <div className="pointer-events-none absolute left-4 top-4 z-10 font-mono text-[10px] tracking-widest text-text-muted">
          COMMS ARRAY // <span className={stateColor}>{state.toUpperCase()}</span>
        </div>
        <Canvas
          camera={{ position: [3, 1.5, 4], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={['#0a0d11']} />
          <fog attach="fog" args={['#0a0d11', 6, 18]} />
          <ambientLight intensity={0.4} color="#1a2230" />
          <directionalLight position={[5, 5, 5]} intensity={0.9} color="#ffffff" />
          <pointLight position={[-3, 2, -2]} intensity={1.2} color="#7090b0" />
          <pointLight position={[3, 3, 1]} intensity={1.0} color="#FFB200" />
          <Dish state={state} />
        </Canvas>
      </div>

      {/* Mobile fallback: status card */}
      <div className="block border border-border bg-surface/60 p-5 md:hidden">
        <p className="font-mono text-[10px] tracking-widest text-text-muted">
          COMMS ARRAY //
        </p>
        <p className={`mt-2 font-display text-xl ${stateColor}`}>
          {state === 'idle' && 'STANDBY'}
          {state === 'locking' && 'LOCKING TARGET…'}
          {state === 'transmitting' && 'TRANSMITTING'}
        </p>
        <p className="mt-3 font-mono text-[10px] tracking-widest text-text-muted">
          [ 3D DISH AVAILABLE ON DESKTOP ]
        </p>
      </div>
    </>
  );
}
