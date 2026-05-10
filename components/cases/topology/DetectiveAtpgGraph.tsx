'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// --- Deterministic seeded RNG (mulberry32) ---
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NODE_COUNT = 24;
const EDGE_TARGET = 36;
const VOLUME = 4;
const PULSE_INTERVAL_MS = 700;
const PULSE_DURATION_MS = 400;

interface PulseState {
  edgeIndex: number;
  start: number; // ms timestamp
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// Build deterministic graph: positions + edges
function buildGraph() {
  const rng = mulberry32(0xa7c91d);
  const positions: THREE.Vector3[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    positions.push(
      new THREE.Vector3(
        (rng() - 0.5) * VOLUME,
        (rng() - 0.5) * VOLUME,
        (rng() - 0.5) * VOLUME,
      ),
    );
  }

  // For each node, connect to its 1-2 nearest neighbors (deterministic).
  const edgeSet = new Set<string>();
  const edges: [number, number][] = [];
  const key = (a: number, b: number) => (a < b ? `${a}-${b}` : `${b}-${a}`);

  const addEdge = (a: number, b: number) => {
    if (a === b) return;
    const k = key(a, b);
    if (edgeSet.has(k)) return;
    edgeSet.add(k);
    edges.push([a, b]);
  };

  for (let i = 0; i < NODE_COUNT; i++) {
    const dists: { idx: number; d: number }[] = [];
    for (let j = 0; j < NODE_COUNT; j++) {
      if (i === j) continue;
      dists.push({ idx: j, d: positions[i].distanceToSquared(positions[j]) });
    }
    dists.sort((x, y) => x.d - y.d);
    // Each node: 1-2 nearest. Use deterministic toggle on parity for variety.
    const k = i % 3 === 0 ? 1 : 2;
    for (let n = 0; n < k; n++) {
      addEdge(i, dists[n].idx);
    }
  }

  // Top up to ~EDGE_TARGET deterministically with next-nearest links.
  let nodeCursor = 0;
  let neighborRank = 2;
  while (edges.length < EDGE_TARGET && neighborRank < NODE_COUNT - 1) {
    const i = nodeCursor % NODE_COUNT;
    const dists: { idx: number; d: number }[] = [];
    for (let j = 0; j < NODE_COUNT; j++) {
      if (i === j) continue;
      dists.push({ idx: j, d: positions[i].distanceToSquared(positions[j]) });
    }
    dists.sort((x, y) => x.d - y.d);
    addEdge(i, dists[neighborRank].idx);
    nodeCursor++;
    if (nodeCursor % NODE_COUNT === 0) neighborRank++;
  }

  return { positions, edges };
}

function buildStars() {
  const rng = mulberry32(0x51a3f0);
  const arr = new Float32Array(50 * 3);
  for (let i = 0; i < 50; i++) {
    // Spread stars on a wide shell behind the graph.
    const r = 18 + rng() * 10;
    const theta = rng() * Math.PI * 2;
    const phi = Math.acos(2 * rng() - 1);
    arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    arr[i * 3 + 2] = r * Math.cos(phi);
  }
  return arr;
}

interface SceneProps {
  reducedMotion: boolean;
}

function Scene({ reducedMotion }: SceneProps) {
  const { positions, edges } = useMemo(buildGraph, []);
  const stars = useMemo(buildStars, []);
  const pulseRng = useRef(mulberry32(0x2bc045));
  const lastPulseSpawn = useRef(0);
  const pulses = useRef<PulseState[]>([]);
  // drei <Line> forwards a Line2 instance whose .material is a LineMaterial.
  // We only touch .color and .opacity, so a structural type is sufficient
  // and avoids importing from three/examples paths.
  type LineLike = THREE.Object3D & {
    material: { color: THREE.Color; opacity: number };
  };
  const lineRefs = useRef<Array<LineLike | null>>([]);

  // Reset pulses when reduced motion toggles on.
  useEffect(() => {
    if (reducedMotion) {
      pulses.current = [];
      // Clear any active brightening on lines.
      lineRefs.current.forEach((ln) => {
        if (!ln) return;
        ln.material.color.set('#FFB200');
        ln.material.opacity = 0.35;
      });
    }
  }, [reducedMotion]);

  useFrame(() => {
    if (reducedMotion) return;
    const now = performance.now();

    // Spawn new pulse every PULSE_INTERVAL_MS.
    if (now - lastPulseSpawn.current >= PULSE_INTERVAL_MS) {
      lastPulseSpawn.current = now;
      const edgeIndex = Math.floor(pulseRng.current() * edges.length);
      pulses.current.push({ edgeIndex, start: now });
    }

    // Compute per-edge brightness from active pulses.
    const intensityByEdge = new Map<number, number>();
    pulses.current = pulses.current.filter((p) => {
      const t = (now - p.start) / PULSE_DURATION_MS;
      if (t >= 1) return false;
      // Triangle envelope: 0 -> 1 -> 0.
      const env = t < 0.5 ? t * 2 : (1 - t) * 2;
      const prev = intensityByEdge.get(p.edgeIndex) ?? 0;
      intensityByEdge.set(p.edgeIndex, Math.max(prev, env));
      return true;
    });

    // Apply to line materials.
    for (let i = 0; i < lineRefs.current.length; i++) {
      const ln = lineRefs.current[i];
      if (!ln) continue;
      const env = intensityByEdge.get(i) ?? 0;
      if (env > 0) {
        // amber -> white interpolation.
        const amber = new THREE.Color('#FFB200');
        const white = new THREE.Color('#FFFFFF');
        ln.material.color.copy(amber).lerp(white, env);
        ln.material.opacity = 0.35 + env * 0.55;
      } else {
        ln.material.color.set('#FFB200');
        ln.material.opacity = 0.35;
      }
    }
  });

  return (
    <>
      <fog attach="fog" args={['#0A0E12', 8, 22]} />
      <color attach="background" args={['#0A0E12']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 6, 6]} intensity={0.6} color="#FFB200" />

      {/* Nodes */}
      {positions.map((p, i) => (
        <mesh key={`n-${i}`} position={p}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial
            color="#1F2A35"
            emissive="#FFB200"
            emissiveIntensity={0.45}
            roughness={0.5}
            metalness={0.3}
          />
        </mesh>
      ))}

      {/* Edges */}
      {edges.map(([a, b], i) => (
        <Line
          key={`e-${i}`}
          ref={(el: unknown) => {
            lineRefs.current[i] = (el as LineLike | null) ?? null;
          }}
          points={[positions[a], positions[b]]}
          color="#FFB200"
          lineWidth={1}
          transparent
          opacity={0.35}
        />
      ))}

      {/* Ambient stars */}
      <Points positions={stars} stride={3}>
        <PointMaterial
          transparent
          color="#E8EDF2"
          size={0.05}
          sizeAttenuation
          depthWrite={false}
          opacity={0.6}
        />
      </Points>

      <OrbitControls
        enableZoom
        enablePan={false}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.5}
        minDistance={4}
        maxDistance={14}
      />
    </>
  );
}

export function DetectiveAtpgGraph() {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="relative w-full h-[480px] border border-border bg-surface/80 backdrop-blur-md overflow-hidden">
      {/* Corner brackets */}
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 w-4 h-4 border-t border-l border-signal"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 w-4 h-4 border-t border-r border-signal"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 w-4 h-4 border-b border-l border-signal"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 w-4 h-4 border-b border-r border-signal"
      />

      {/* Header label */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 font-mono text-[11px] tracking-[0.18em] text-signal">
        GNN TOPOLOGY // CIRCUIT GRAPH
      </div>

      <Canvas
        camera={{ position: [6, 4, 6], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
