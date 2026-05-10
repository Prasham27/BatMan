'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const SIGNAL = '#FFB200';
const INK = '#0A0E12';

// 4x4 grid centered on origin, spacing 1, in XZ plane.
const CONSTELLATION_POINTS: Array<[number, number, number]> = (() => {
  const pts: Array<[number, number, number]> = [];
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const x = i - 1.5;
      const z = j - 1.5;
      pts.push([x, 0, z]);
    }
  }
  return pts;
})();

const AXIS_HALF = 2.6;
const GRID_HALF = 2;

function ConstellationNode({
  position,
  pulse,
}: {
  position: [number, number, number];
  pulse: number; // 0..1
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    if (meshRef.current) {
      const s = 1 + pulse * 0.5;
      meshRef.current.scale.setScalar(s);
    }
    if (matRef.current) {
      matRef.current.emissiveIntensity = 1.2 + pulse * 2.4;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.15, 24, 24]} />
      <meshStandardMaterial
        ref={matRef}
        color={SIGNAL}
        emissive={SIGNAL}
        emissiveIntensity={1.2}
        toneMapped={false}
      />
    </mesh>
  );
}

function DecisionGrid() {
  // 4x4 decision regions => 5 lines per axis at -2,-1,0,1,2.
  const segments = useMemo(() => {
    const lines: Array<[THREE.Vector3, THREE.Vector3]> = [];
    for (let k = -GRID_HALF; k <= GRID_HALF; k++) {
      lines.push([
        new THREE.Vector3(k, 0, -GRID_HALF),
        new THREE.Vector3(k, 0, GRID_HALF),
      ]);
      lines.push([
        new THREE.Vector3(-GRID_HALF, 0, k),
        new THREE.Vector3(GRID_HALF, 0, k),
      ]);
    }
    return lines;
  }, []);

  return (
    <group>
      {segments.map((seg, idx) => {
        const geom = new THREE.BufferGeometry().setFromPoints(seg);
        return (
          // eslint-disable-next-line react/no-unknown-property
          <line key={idx}>
            <primitive object={geom} attach="geometry" />
            <lineDashedMaterial
              color={SIGNAL}
              dashSize={0.12}
              gapSize={0.08}
              transparent
              opacity={0.2}
              linewidth={1}
            />
          </line>
        );
      })}
      <DashedComputer />
    </group>
  );
}

// Helper component to call computeLineDistances() on dashed lines after mount.
function DashedComputer() {
  const ref = useRef<THREE.Group>(null);
  useEffect(() => {
    const parent = ref.current?.parent;
    if (!parent) return;
    parent.traverse((obj) => {
      if ((obj as THREE.Line).isLine) {
        (obj as THREE.Line).computeLineDistances?.();
      }
    });
  }, []);
  return <group ref={ref} />;
}

function IQAxes() {
  const iGeom = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-AXIS_HALF, 0, 0),
        new THREE.Vector3(AXIS_HALF, 0, 0),
      ]),
    []
  );
  const qGeom = useMemo(
    () =>
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, -AXIS_HALF),
        new THREE.Vector3(0, 0, AXIS_HALF),
      ]),
    []
  );

  return (
    <group>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <line>
        <primitive object={iGeom} attach="geometry" />
        <lineBasicMaterial color={SIGNAL} transparent opacity={0.7} />
      </line>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <line>
        <primitive object={qGeom} attach="geometry" />
        <lineBasicMaterial color={SIGNAL} transparent opacity={0.7} />
      </line>
      <Html position={[AXIS_HALF + 0.15, 0, 0]} center>
        <span
          style={{
            color: SIGNAL,
            fontFamily:
              "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: '0.08em',
            userSelect: 'none',
          }}
        >
          I
        </span>
      </Html>
      <Html position={[0, 0, AXIS_HALF + 0.15]} center>
        <span
          style={{
            color: SIGNAL,
            fontFamily:
              "'JetBrains Mono', ui-monospace, monospace",
            fontSize: 11,
            letterSpacing: '0.08em',
            userSelect: 'none',
          }}
        >
          Q
        </span>
      </Html>
    </group>
  );
}

function TrellisArcs() {
  // Four curved arcs out of plane (above/below) connecting some points,
  // suggesting SCL decoder tree expansion.
  const arcs = useMemo(() => {
    const pairs: Array<{
      a: [number, number, number];
      b: [number, number, number];
      lift: number;
    }> = [
      { a: [-1.5, 0, -1.5], b: [1.5, 0, 1.5], lift: 1.4 },
      { a: [-1.5, 0, 1.5], b: [1.5, 0, -1.5], lift: -1.2 },
      { a: [-0.5, 0, -1.5], b: [0.5, 0, 1.5], lift: 0.9 },
      { a: [-1.5, 0, 0.5], b: [1.5, 0, -0.5], lift: -0.8 },
    ];
    return pairs.map(({ a, b, lift }) => {
      const start = new THREE.Vector3(...a);
      const end = new THREE.Vector3(...b);
      const mid = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5);
      mid.y += lift;
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      return new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
    });
  }, []);

  return (
    <group>
      {arcs.map((geom, i) => (
        // eslint-disable-next-line react/no-unknown-property
        <line key={i}>
          <primitive object={geom} attach="geometry" />
          <lineBasicMaterial
            color={SIGNAL}
            transparent
            opacity={0.45}
          />
        </line>
      ))}
    </group>
  );
}

function PulseController({
  reduced,
  setPulses,
}: {
  reduced: boolean;
  setPulses: React.Dispatch<React.SetStateAction<number[]>>;
}) {
  const lastFireRef = useRef(0);
  const activeRef = useRef<{ index: number; start: number } | null>(null);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;

    // Fire a new pulse every ~1.5s.
    if (t - lastFireRef.current > 1.5) {
      lastFireRef.current = t;
      const index = Math.floor(Math.random() * 16);
      activeRef.current = { index, start: t };
    }

    const next = new Array(16).fill(0);
    if (activeRef.current) {
      const elapsed = t - activeRef.current.start;
      const dur = 0.6;
      if (elapsed < dur) {
        // Linear up then linear down over the pulse window.
        const half = dur / 2;
        const v =
          elapsed < half
            ? elapsed / half
            : 1 - (elapsed - half) / half;
        next[activeRef.current.index] = Math.max(0, Math.min(1, v));
      } else {
        activeRef.current = null;
      }
    }
    setPulses(next);
  });

  return null;
}

function Scene({ reduced }: { reduced: boolean }) {
  const [pulses, setPulses] = useState<number[]>(() =>
    new Array(16).fill(0)
  );

  return (
    <>
      <color attach="background" args={[INK]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.6} color={SIGNAL} />

      <IQAxes />
      <DecisionGrid />
      <TrellisArcs />

      {CONSTELLATION_POINTS.map((p, i) => (
        <ConstellationNode key={i} position={p} pulse={pulses[i] ?? 0} />
      ))}

      <PulseController reduced={reduced} setPulses={setPulses} />

      <OrbitControls
        autoRotate={!reduced}
        autoRotateSpeed={0.5}
        enableZoom
        enablePan={false}
        minDistance={4}
        maxDistance={12}
      />
    </>
  );
}

export function PolarCodesConstellation() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <div className="relative w-full h-[480px] border border-border bg-surface/80 backdrop-blur-md">
      <div className="pointer-events-none absolute top-3 left-3 z-10 font-mono text-[11px] tracking-[0.12em] text-signal">
        CONSTELLATION // 16-QAM SCL
      </div>
      <Canvas
        camera={{ position: [4, 3, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <Scene reduced={reduced} />
      </Canvas>
    </div>
  );
}
