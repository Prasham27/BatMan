'use client';

import { useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export type GadgetType = 'grapple' | 'drone' | 'comms';
export type GadgetItemId = `gadget-${GadgetType}`;

interface GadgetProps {
  position: [number, number, number];
  type: GadgetType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

function Gadget({ position, type, label, onClick, disabled }: GadgetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = clock.elapsedTime * 0.5;
    groupRef.current.position.y =
      position[1] + Math.sin(clock.elapsedTime * 1.2 + position[0]) * 0.15;
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
    onClick();
  };

  const intensity = hovered && !disabled ? 1.2 : 0.6;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {type === 'grapple' && (
        <>
          <mesh>
            <cylinderGeometry args={[0.15, 0.15, 0.6, 12]} />
            <meshStandardMaterial
              color="#FFB200"
              emissive="#FFB200"
              emissiveIntensity={intensity}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <coneGeometry args={[0.1, 0.3, 12]} />
            <meshStandardMaterial
              color="#FFB200"
              emissive="#FFB200"
              emissiveIntensity={intensity}
              toneMapped={false}
            />
          </mesh>
        </>
      )}

      {type === 'drone' && (
        <>
          <mesh>
            <icosahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial
              color="#FFB200"
              emissive="#FFB200"
              emissiveIntensity={intensity}
              wireframe
              toneMapped={false}
            />
          </mesh>
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2;
            return (
              <mesh
                key={i}
                position={[Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4]}
              >
                <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
                <meshStandardMaterial
                  color="#FFB200"
                  emissive="#FFB200"
                  emissiveIntensity={intensity * 0.8}
                  toneMapped={false}
                />
              </mesh>
            );
          })}
        </>
      )}

      {type === 'comms' && (
        <>
          <mesh>
            <boxGeometry args={[0.4, 0.2, 0.1]} />
            <meshStandardMaterial
              color="#FFB200"
              emissive="#FFB200"
              emissiveIntensity={intensity}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
            <meshStandardMaterial
              color="#FFB200"
              emissive="#FFB200"
              emissiveIntensity={intensity}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial
              color="#FFB200"
              emissive="#FFB200"
              emissiveIntensity={intensity * 1.2}
              toneMapped={false}
            />
          </mesh>
        </>
      )}

      {hovered && !disabled && (
        <Html position={[0, 0.9, 0]} center distanceFactor={10} occlude={false}>
          <div className="pointer-events-none whitespace-nowrap font-mono text-xs tracking-widest text-signal">
            [E] {label}
          </div>
        </Html>
      )}
    </group>
  );
}

export interface GadgetRackProps {
  onSelect: (id: GadgetItemId) => void;
  disabled?: boolean;
}

export function GadgetRack({ onSelect, disabled }: GadgetRackProps) {
  return (
    <group position={[8, 4, -2]}>
      {/* Faint vertical light beam connecting the rack */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.05, 3, 0.05]} />
        <meshBasicMaterial color="#FFB200" transparent opacity={0.18} toneMapped={false} />
      </mesh>

      <Gadget
        position={[0, 1.5, 0]}
        type="grapple"
        label="GRAPPLE"
        onClick={() => onSelect('gadget-grapple')}
        disabled={disabled}
      />
      <Gadget
        position={[0, 0.5, 0]}
        type="drone"
        label="DRONE"
        onClick={() => onSelect('gadget-drone')}
        disabled={disabled}
      />
      <Gadget
        position={[0, -0.5, 0]}
        type="comms"
        label="COMMS"
        onClick={() => onSelect('gadget-comms')}
        disabled={disabled}
      />
    </group>
  );
}
