'use client';

import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';

const SIGNAL = '#FFB200';
const INK = '#0A0E12';

// Maturity tenors (years) — 5 buckets along the X axis.
const MATURITIES = [1, 3, 5, 10, 30] as const;
// 12 monthly slices along the Z axis.
const MONTHS = 12;

// Domain extents in world space.
const X_SPAN = 4; // maturity axis length
const Z_SPAN = 4; // time axis length
const Y_SCALE = 0.35; // yield % -> world units

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

// Deterministic yield function. x = maturity index slot (0..1), z = time index slot (0..1),
// returns yield in percent. Returns a believable, gently undulating curve.
function yieldAt(maturityYears: number, monthIndex: number): number {
  const x = maturityYears;
  const z = monthIndex;
  return 4 + 0.5 * Math.log(1 + x) + 0.3 * Math.sin(z * 0.5) + 0.1 * Math.sin(x * z);
}

interface SurfaceData {
  positions: Float32Array;
  indices: Uint16Array;
  cols: number;
  rows: number;
  minY: number;
  maxY: number;
}

function buildSurface(): SurfaceData {
  const cols = MATURITIES.length; // X
  const rows = MONTHS; // Z
  const positions = new Float32Array(cols * rows * 3);

  let minY = Infinity;
  let maxY = -Infinity;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const maturity = MATURITIES[c];
      const yPct = yieldAt(maturity, r);
      if (yPct < minY) minY = yPct;
      if (yPct > maxY) maxY = yPct;
      // Map to world coordinates centred at origin.
      const x = (c / (cols - 1)) * X_SPAN - X_SPAN / 2;
      const z = (r / (rows - 1)) * Z_SPAN - Z_SPAN / 2;
      const y = (yPct - 4) * Y_SCALE; // centre near 4% baseline
      const i = (r * cols + c) * 3;
      positions[i + 0] = x;
      positions[i + 1] = y;
      positions[i + 2] = z;
    }
  }

  // Two triangles per quad cell.
  const cellCount = (cols - 1) * (rows - 1);
  const indices = new Uint16Array(cellCount * 6);
  let k = 0;
  for (let r = 0; r < rows - 1; r += 1) {
    for (let c = 0; c < cols - 1; c += 1) {
      const a = r * cols + c;
      const b = r * cols + (c + 1);
      const d = (r + 1) * cols + c;
      const e = (r + 1) * cols + (c + 1);
      indices[k++] = a;
      indices[k++] = d;
      indices[k++] = b;
      indices[k++] = b;
      indices[k++] = d;
      indices[k++] = e;
    }
  }

  return { positions, indices, cols, rows, minY, maxY };
}

interface SurfaceMeshesProps {
  data: SurfaceData;
}

function SurfaceMeshes({ data }: SurfaceMeshesProps) {
  const filledGeom = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(data.positions, 3));
    geom.setIndex(new THREE.BufferAttribute(data.indices, 1));
    geom.computeVertexNormals();
    return geom;
  }, [data]);

  // Wireframe lines: build along both grid directions.
  const wireSegments = useMemo(() => {
    const segs: Array<[[number, number, number], [number, number, number]]> = [];
    const { cols, rows, positions } = data;
    const get = (c: number, r: number): [number, number, number] => {
      const i = (r * cols + c) * 3;
      return [positions[i], positions[i + 1], positions[i + 2]];
    };
    // Lines along maturity (constant time row).
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols - 1; c += 1) {
        segs.push([get(c, r), get(c + 1, r)]);
      }
    }
    // Lines along time (constant maturity col).
    for (let c = 0; c < cols; c += 1) {
      for (let r = 0; r < rows - 1; r += 1) {
        segs.push([get(c, r), get(c, r + 1)]);
      }
    }
    return segs;
  }, [data]);

  useEffect(() => {
    return () => {
      filledGeom.dispose();
    };
  }, [filledGeom]);

  return (
    <group>
      {/* Translucent fill — gives the surface body. */}
      <mesh geometry={filledGeom}>
        <meshStandardMaterial
          color={SIGNAL}
          emissive={SIGNAL}
          emissiveIntensity={0.18}
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
          roughness={0.6}
          metalness={0.1}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe pass. */}
      {wireSegments.map((seg, i) => (
        <Line
          key={`w-${i}`}
          points={seg}
          color={SIGNAL}
          lineWidth={1}
          transparent
          opacity={0.4}
        />
      ))}
    </group>
  );
}

function Axes() {
  // Origin at the back-left-floor corner of the data box for clarity.
  const ox = -X_SPAN / 2;
  const oz = -Z_SPAN / 2;
  const oy = -1.2;
  const xEnd: [number, number, number] = [ox + X_SPAN, oy, oz];
  const yEnd: [number, number, number] = [ox, oy + 2.2, oz];
  const zEnd: [number, number, number] = [ox, oy, oz + Z_SPAN];
  const origin: [number, number, number] = [ox, oy, oz];

  const labelStyle =
    'whitespace-nowrap font-mono text-[9px] tracking-widest text-signal';

  return (
    <group>
      <Line points={[origin, xEnd]} color={SIGNAL} lineWidth={1} transparent opacity={0.6} />
      <Line points={[origin, yEnd]} color={SIGNAL} lineWidth={1} transparent opacity={0.6} />
      <Line points={[origin, zEnd]} color={SIGNAL} lineWidth={1} transparent opacity={0.6} />

      <Html position={xEnd} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div className={labelStyle}>MATURITY (Y)</div>
      </Html>
      <Html position={yEnd} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div className={labelStyle}>YIELD (%)</div>
      </Html>
      <Html position={zEnd} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        <div className={labelStyle}>TIME (M)</div>
      </Html>
    </group>
  );
}

interface SceneProps {
  reducedMotion: boolean;
}

function Scene({ reducedMotion }: SceneProps) {
  const data = useMemo(() => buildSurface(), []);

  return (
    <>
      <color attach="background" args={[INK]} />
      <fog attach="fog" args={[INK, 8, 20]} />

      <ambientLight intensity={0.5} />
      <pointLight position={[6, 8, 6]} intensity={0.8} color={SIGNAL} />
      <pointLight position={[-6, 4, -4]} intensity={0.3} color="#3178C6" />

      <SurfaceMeshes data={data} />
      <Axes />

      <OrbitControls
        enablePan={false}
        enableZoom
        enableRotate
        minDistance={4}
        maxDistance={12}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.4}
        rotateSpeed={0.6}
        zoomSpeed={0.5}
      />
    </>
  );
}

export function GiltFundsSurface() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="relative h-[480px] w-full overflow-hidden border border-border bg-surface/80 backdrop-blur-md">
      <div className="pointer-events-none absolute left-3 top-3 z-10 font-mono text-[10px] tracking-widest text-text-muted">
        <span className="text-signal">YIELD SURFACE</span>
        <span> // 12M </span>
        <span className="text-signal">x</span>
        <span> 5T</span>
      </div>

      <Canvas
        dpr={[1, 2]}
        camera={{ position: [5, 4, 5], fov: 50 }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}

export default GiltFundsSurface;
