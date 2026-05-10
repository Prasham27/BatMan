'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const STORAGE_KEY = 'bc.bag.punches';

export interface TrainingBagProps {
  onClick: (punches: number) => void;
  disabled?: boolean;
}

export function TrainingBag({ onClick, disabled }: TrainingBagProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const punching = useRef(false);
  const punchTime = useRef(0);
  const [punches, setPunches] = useState(0);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY);
      setPunches(saved ? parseInt(saved, 10) : 0);
    } catch {
      // noop
    }
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (!punching.current) return;
    punchTime.current += delta;
    const t = punchTime.current;
    // Damped oscillation — punch hits hard, swings down
    const swing = Math.sin(t * 7) * Math.exp(-t * 1.5) * 0.35;
    groupRef.current.rotation.x = swing;
    if (t > 2.4) {
      punching.current = false;
      punchTime.current = 0;
      groupRef.current.rotation.x = 0;
    }
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
    punching.current = true;
    punchTime.current = 0;
    const next = punches + 1;
    setPunches(next);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, next.toString());
    } catch {
      // noop
    }
    onClick(next);
  };

  return (
    <group position={[7, 0, 4]}>
      {/* Chain — thin cylinder hanging from ceiling */}
      <mesh position={[0, 8, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 6, 6]} />
        <meshStandardMaterial color="#3a3f48" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Bag pivot at top — child mesh hangs below */}
      <group
        ref={groupRef}
        position={[0, 5, 0]}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <mesh position={[0, -1.1, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 2.2, 16]} />
          <meshStandardMaterial
            color={hovered && !disabled ? '#3a3f48' : '#26292f'}
            roughness={0.85}
          />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.1, 16]} />
          <meshStandardMaterial color="#1a1d22" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Subtle leather seams */}
        <mesh position={[0, -1.1, 0.5]}>
          <boxGeometry args={[0.4, 2.0, 0.02]} />
          <meshStandardMaterial color="#0a0d11" />
        </mesh>
      </group>

      {hovered && !disabled && (
        <Html position={[0, 6.2, 0]} center distanceFactor={10} occlude={false}>
          <div className="pointer-events-none whitespace-nowrap font-mono text-xs tracking-widest text-signal">
            [E] HEAVY BAG · {punches}
          </div>
        </Html>
      )}
    </group>
  );
}
