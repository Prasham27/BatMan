'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type CommsState = 'idle' | 'locking' | 'transmitting';

export interface CommsArrayProps {
  state: CommsState;
}

function Dish({ state }: { state: CommsState }) {
  // pivotRef = the mount that aims at the sky; dish geometry hangs off it tilted
  // so the camera sees the concave (inside) face of the dish rather than its back.
  const pivotRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const feedRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }, delta) => {
    if (!pivotRef.current) return;

    if (state === 'idle') {
      // Slow azimuth sweep, gentle elevation bob
      pivotRef.current.rotation.y += delta * 0.25;
      pivotRef.current.rotation.x = -0.05 + Math.sin(clock.elapsedTime * 0.3) * 0.08;
    } else if (state === 'locking') {
      // Lock toward camera — concave face presents itself fully
      const targetY = -0.6;
      const targetX = -0.15;
      pivotRef.current.rotation.y +=
        (targetY - pivotRef.current.rotation.y) * delta * 4;
      pivotRef.current.rotation.x +=
        (targetX - pivotRef.current.rotation.x) * delta * 4;
    } else if (state === 'transmitting') {
      // Hold the lock
    }

    if (beamRef.current) {
      const mat = beamRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity =
        state === 'transmitting' ? 0.7 + Math.sin(clock.elapsedTime * 12) * 0.2 : 0;
    }
    if (feedRef.current) {
      feedRef.current.opacity =
        state === 'transmitting'
          ? 0.9
          : state === 'locking'
            ? 0.55 + Math.sin(clock.elapsedTime * 6) * 0.15
            : 0.35;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* ── BASE — hexagonal plinth with side antennas ── */}
      <mesh position={[0, -2.0, 0]} castShadow>
        <cylinderGeometry args={[0.95, 1.1, 0.25, 6]} />
        <meshStandardMaterial color="#15181d" roughness={0.55} metalness={0.6} />
      </mesh>
      <mesh position={[0, -1.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.78, 0.92, 6]} />
        <meshBasicMaterial color="#FFB200" toneMapped={false} side={THREE.DoubleSide} />
      </mesh>

      {/* Whip antennas at the base — visual interest, says "comms array" */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
        const x = Math.cos(a) * 0.78;
        const z = Math.sin(a) * 0.78;
        return (
          <group key={`whip-${i}`}>
            <mesh position={[x, -1.55, z]}>
              <cylinderGeometry args={[0.018, 0.022, 0.7, 6]} />
              <meshStandardMaterial color="#0e1116" roughness={0.6} metalness={0.5} />
            </mesh>
            <mesh position={[x, -1.18, z]}>
              <sphereGeometry args={[0.04, 8, 8]} />
              <meshStandardMaterial
                color="#FFB200"
                emissive="#FFB200"
                emissiveIntensity={state === 'transmitting' ? 2.2 : 1.0}
                toneMapped={false}
              />
            </mesh>
          </group>
        );
      })}

      {/* ── MAST — steel post to the pivot ── */}
      <mesh position={[0, -1.25, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.16, 1.2, 12]} />
        <meshStandardMaterial color="#1a1d22" roughness={0.45} metalness={0.75} />
      </mesh>
      {/* Yoke at top of mast */}
      <mesh position={[0, -0.6, 0]} castShadow>
        <boxGeometry args={[0.45, 0.16, 0.16]} />
        <meshStandardMaterial color="#0e1116" roughness={0.4} metalness={0.75} />
      </mesh>

      {/* ── PIVOT — the aiming group ── */}
      <group ref={pivotRef} position={[0, -0.5, 0]}>
        {/* Tilt the dish forward so its concave inside faces the camera */}
        <group rotation={[-Math.PI / 3.2, 0, 0]}>
          {/* Main dish — flatter parabola */}
          <mesh castShadow>
            <sphereGeometry
              args={[1.35, 32, 18, 0, Math.PI * 2, 0, Math.PI / 3]}
            />
            <meshStandardMaterial
              color="#2c333d"
              roughness={0.35}
              metalness={0.7}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Inside coating — lighter so it reads as a real dish surface */}
          <mesh>
            <sphereGeometry
              args={[1.33, 32, 18, 0, Math.PI * 2, 0, Math.PI / 3]}
            />
            <meshStandardMaterial
              color="#4a5566"
              roughness={0.55}
              metalness={0.5}
              emissive="#FFB200"
              emissiveIntensity={
                state === 'transmitting' ? 0.45 : state === 'locking' ? 0.18 : 0.07
              }
              side={THREE.BackSide}
            />
          </mesh>
          {/* Radial mesh ribs across the back of the dish */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return (
              <mesh
                key={`rib-${i}`}
                position={[Math.cos(a) * 0.68, 0.18, Math.sin(a) * 0.68]}
                rotation={[Math.PI / 2.4, a, 0]}
              >
                <boxGeometry args={[0.02, 1.3, 0.02]} />
                <meshStandardMaterial color="#191c22" roughness={0.5} metalness={0.7} />
              </mesh>
            );
          })}
          {/* Concentric panel ring (visible on the inside) */}
          <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.6, 0.62, 48]} />
            <meshBasicMaterial color="#FFB200" toneMapped={false} side={THREE.DoubleSide} />
          </mesh>

          {/* Tripod struts holding the feed horn at the focal point */}
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * Math.PI * 2;
            return (
              <mesh
                key={`strut-${i}`}
                position={[Math.cos(a) * 0.6, 0.55, Math.sin(a) * 0.6]}
                rotation={[
                  Math.atan2(0.6, 0.85),
                  -a,
                  0,
                ]}
              >
                <cylinderGeometry args={[0.015, 0.015, 1.15, 6]} />
                <meshStandardMaterial color="#1a1d22" roughness={0.5} metalness={0.8} />
              </mesh>
            );
          })}
          {/* Feed horn at focal point */}
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.05, 0.22, 16]} />
            <meshStandardMaterial color="#0e1116" roughness={0.4} metalness={0.7} />
          </mesh>
          {/* Feed horn glow tip */}
          <mesh position={[0, 1.24, 0]}>
            <sphereGeometry args={[0.07, 14, 14]} />
            <meshBasicMaterial
              ref={feedRef}
              color="#FFB200"
              transparent
              opacity={0.4}
              toneMapped={false}
            />
          </mesh>

          {/* Beam — narrow cone leaving the dish when transmitting */}
          <mesh ref={beamRef} position={[0, 4.5, 0]}>
            <coneGeometry args={[0.35, 8, 24, 1, true]} />
            <meshBasicMaterial
              color="#FFB200"
              transparent
              opacity={0}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      </group>

      {/* Status ring on the floor */}
      <mesh position={[0, -2.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.18, 1.25, 48]} />
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
          <fog attach="fog" args={['#0a0d11', 8, 22]} />
          <ambientLight intensity={0.55} color="#1a2230" />
          <directionalLight position={[4, 6, 5]} intensity={1.1} color="#dfe8f7" />
          <pointLight position={[-3, 2, -2]} intensity={1.5} color="#7090b0" />
          <pointLight position={[3, 3, 2]} intensity={1.4} color="#FFB200" />
          {/* Up-light to catch the inside of the dish */}
          <pointLight position={[0, -1.2, 2]} intensity={0.9} color="#FFB200" />
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
