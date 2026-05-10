'use client';

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Generic Halloween-style bat silhouette — explicitly NOT the DC Bat-Symbol
// trademark. To swap for a different mark, replace this SVG with your own
// (keep the radial gradient amber backdrop for the spotlight glow).
const SIGNAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <radialGradient id="g" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFB200" stop-opacity="1"/>
      <stop offset="55%" stop-color="#FFB200" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#FFB200" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle cx="256" cy="256" r="240" fill="url(#g)"/>
  <g fill="#000000" transform="translate(256 256) scale(2.2)">
    <ellipse cx="0" cy="22" rx="14" ry="40"/>
    <circle cx="0" cy="-22" r="16"/>
    <polygon points="-12,-32 -8,-54 -2,-34"/>
    <polygon points="12,-32 8,-54 2,-34"/>
    <path d="M -10 0 C -50 -12 -100 0 -132 36 L -110 42 L -82 36 L -52 48 L -22 36 Z"/>
    <path d="M 10 0 C 50 -12 100 0 132 36 L 110 42 L 82 36 L 52 48 L 22 36 Z"/>
  </g>
</svg>`;

export interface SignalProjectorProps {
  active: boolean;
}

export function SignalProjector({ active }: SignalProjectorProps) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const planeRef = useRef<THREE.Mesh>(null);
  const coneRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = `data:image/svg+xml;base64,${window.btoa(SIGNAL_SVG)}`;
    const loader = new THREE.TextureLoader();
    let tex: THREE.Texture | null = null;
    loader.load(url, (loaded) => {
      loaded.colorSpace = THREE.SRGBColorSpace;
      tex = loaded;
      setTexture(loaded);
    });
    return () => {
      tex?.dispose();
    };
  }, []);

  useFrame(({ clock }) => {
    const flicker = 0.85 + Math.sin(clock.elapsedTime * 6) * 0.08;
    if (planeRef.current) {
      const mat = planeRef.current.material as THREE.MeshBasicMaterial;
      const target = active ? 0.95 * flicker : 0;
      mat.opacity += (target - mat.opacity) * 0.15;
    }
    if (coneRef.current) {
      const mat = coneRef.current.material as THREE.MeshBasicMaterial;
      const target = active ? 0.18 * flicker : 0;
      mat.opacity += (target - mat.opacity) * 0.15;
    }
  });

  if (!texture) return null;

  return (
    <group>
      {/* Volumetric light cone — additive blend so it glows */}
      <mesh ref={coneRef} position={[0, 7, -13]} rotation={[1.0, 0, 0]}>
        <coneGeometry args={[3.2, 14, 32, 1, true]} />
        <meshBasicMaterial
          color="#FFB200"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* Bat-silhouette projection on the back wall */}
      <mesh ref={planeRef} position={[0, 13, -21.95]}>
        <planeGeometry args={[10, 10]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
