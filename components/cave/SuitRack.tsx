'use client';

import { useState } from 'react';
import { type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export type SuitId =
  | 'suit-tactical'
  | 'suit-stealth'
  | 'suit-armored'
  | 'suit-prototype';

interface SuitDisplayProps {
  position: [number, number, number];
  label: string;
  bodyColor: string;
  accentColor: string;
  secondaryAccent?: string;
  onClick: () => void;
  disabled?: boolean;
}

function SuitDisplay({
  position,
  label,
  bodyColor,
  accentColor,
  secondaryAccent,
  onClick,
  disabled,
}: SuitDisplayProps) {
  const [hovered, setHovered] = useState(false);

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

  return (
    <group
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Inside-case spotlight — gives the case its glow */}
      <pointLight
        position={[0, 1.5, 0.3]}
        intensity={1.4}
        distance={3}
        color={accentColor}
      />
      {/* Secondary accent uplight (only for prototype) */}
      {secondaryAccent && (
        <pointLight
          position={[0, 0.3, 0.3]}
          intensity={1.0}
          distance={2.5}
          color={secondaryAccent}
        />
      )}

      {/* Case backing */}
      <mesh position={[0, 1.5, -0.18]} receiveShadow>
        <boxGeometry args={[1.2, 2.9, 0.05]} />
        <meshStandardMaterial color="#0a0c10" roughness={0.55} metalness={0.55} />
      </mesh>

      {/* Wireframe outline frame */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[1.25, 2.95, 0.45]} />
        <meshBasicMaterial
          color={accentColor}
          wireframe
          transparent
          opacity={hovered && !disabled ? 0.9 : 0.55}
          toneMapped={false}
        />
      </mesh>

      {/* Suit silhouette inside */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow>
          <capsuleGeometry args={[0.2, 0.9, 4, 10]} />
          <meshStandardMaterial
            color={bodyColor}
            roughness={0.5}
            emissive={accentColor}
            emissiveIntensity={hovered && !disabled ? 0.35 : 0.15}
          />
        </mesh>
        <mesh position={[0, 1.55, 0]} castShadow>
          <capsuleGeometry args={[0.26, 0.65, 4, 10]} />
          <meshStandardMaterial
            color={bodyColor}
            roughness={0.5}
            emissive={accentColor}
            emissiveIntensity={hovered && !disabled ? 0.35 : 0.15}
          />
        </mesh>
        <mesh position={[0, 2.15, 0]} castShadow>
          <sphereGeometry args={[0.16, 14, 14]} />
          <meshStandardMaterial
            color={bodyColor}
            roughness={0.5}
            emissive={accentColor}
            emissiveIntensity={hovered && !disabled ? 0.35 : 0.15}
          />
        </mesh>
        {/* Cowl ears */}
        <mesh position={[-0.1, 2.32, 0]} rotation={[0, 0, 0.32]}>
          <coneGeometry args={[0.04, 0.16, 5]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        <mesh position={[0.1, 2.32, 0]} rotation={[0, 0, -0.32]}>
          <coneGeometry args={[0.04, 0.16, 5]} />
          <meshStandardMaterial color={bodyColor} />
        </mesh>
        {/* Bright accent stripe down the chest */}
        <mesh position={[0, 1.5, 0.15]}>
          <boxGeometry args={[0.05, 0.55, 0.01]} />
          <meshBasicMaterial color={accentColor} toneMapped={false} />
        </mesh>
        {/* Secondary stripe (prototype only) */}
        {secondaryAccent && (
          <mesh position={[0, 0.6, 0.15]}>
            <boxGeometry args={[0.05, 0.4, 0.01]} />
            <meshBasicMaterial color={secondaryAccent} toneMapped={false} />
          </mesh>
        )}
      </group>

      {/* Glass front (semi-transparent overlay) */}
      <mesh position={[0, 1.5, 0.24]}>
        <planeGeometry args={[1.2, 2.9]} />
        <meshStandardMaterial
          color={hovered && !disabled ? accentColor : '#1a2a3a'}
          roughness={0.1}
          metalness={0.5}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Bottom label plate with accent glow line */}
      <mesh position={[0, -0.1, 0.18]}>
        <boxGeometry args={[1.15, 0.18, 0.02]} />
        <meshBasicMaterial color="#0a0d11" toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.04, 0.19]}>
        <boxGeometry args={[1.0, 0.02, 0.005]} />
        <meshBasicMaterial color={accentColor} toneMapped={false} />
      </mesh>

      {hovered && !disabled && (
        <Html
          position={[0, 3.3, 0.5]}
          center
          distanceFactor={11}
          occlude={false}
        >
          <div className="pointer-events-none whitespace-nowrap font-mono text-xs tracking-widest text-signal">
            [E] {label}
          </div>
        </Html>
      )}
    </group>
  );
}

export interface SuitRackProps {
  onSelect: (id: SuitId) => void;
  disabled?: boolean;
  prototypeUnlocked?: boolean;
}

export function SuitRack({ onSelect, disabled, prototypeUnlocked }: SuitRackProps) {
  return (
    <>
      {/* Main rack — RIGHT side of cave, mirroring the Batmobile on the
          left for visual balance and clear separation. */}
      <group position={[12, 0, 4]} rotation={[0, -0.6, 0]}>
        <SuitDisplay
          position={[-1.8, 0, 0]}
          label="TACTICAL MK VII"
          bodyColor="#0a0d11"
          accentColor="#FFB200"
          onClick={() => onSelect('suit-tactical')}
          disabled={disabled}
        />
        <SuitDisplay
          position={[0, 0, 0]}
          label="STEALTH MK III"
          bodyColor="#0e1216"
          accentColor="#5CE9E6"
          onClick={() => onSelect('suit-stealth')}
          disabled={disabled}
        />
        <SuitDisplay
          position={[1.8, 0, 0]}
          label="ARMORED MK IX"
          bodyColor="#1a1d22"
          accentColor="#E63946"
          onClick={() => onSelect('suit-armored')}
          disabled={disabled}
        />
      </group>

      {/* Hidden prototype — appears in the back-right of the cave once
          the visitor has opened all three main suits in the same browser */}
      {prototypeUnlocked && (
        <group position={[3, 0, -10]}>
          <SuitDisplay
            position={[0, 0, 0]}
            label="PROTOTYPE Mk Ω"
            bodyColor="#0e1a1f"
            accentColor="#5CE9E6"
            secondaryAccent="#FFB200"
            onClick={() => onSelect('suit-prototype')}
            disabled={disabled}
          />
        </group>
      )}
    </>
  );
}
