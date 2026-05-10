'use client';

import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const START_POS = new THREE.Vector3(14, 7, 14);
const START_TARGET = new THREE.Vector3(0, 3, -3);
const END_POS = new THREE.Vector3(0, 3.4, 0);
const END_TARGET = new THREE.Vector3(0, 3.4, -5);
const TRANSITION_S = 1.6;

const easeInOut = (t: number): number =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export interface CaveCameraProps {
  booting: boolean;
}

export function CaveCamera({ booting }: CaveCameraProps) {
  const { camera } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const tRef = useRef(0);

  useEffect(() => {
    if (booting) {
      tRef.current = 0;
      if (controlsRef.current) controlsRef.current.enabled = false;
    } else {
      if (controlsRef.current) controlsRef.current.enabled = true;
    }
  }, [booting]);

  useFrame((_, delta) => {
    if (!booting) return;
    tRef.current = Math.min(1, tRef.current + delta / TRANSITION_S);
    const eased = easeInOut(tRef.current);
    camera.position.lerpVectors(START_POS, END_POS, eased);
    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(START_TARGET, END_TARGET, eased);
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      target={START_TARGET}
      enableDamping
      dampingFactor={0.08}
      enableZoom
      enablePan={false}
      minDistance={6}
      maxDistance={26}
      minPolarAngle={Math.PI * 0.15}
      maxPolarAngle={Math.PI * 0.48}
    />
  );
}
