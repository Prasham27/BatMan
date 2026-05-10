'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Line, Html, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { languageColor, type GHRepo } from '@/lib/github-types';
import { RepoCard } from '@/components/cards/RepoCard';

const SIGNAL = '#FFB200';
const SPHERE_RADIUS = 6;
const MAX_EDGES = 80;

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

function useIsDesktop(): boolean | null {
  const [desktop, setDesktop] = useState<boolean | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(min-width: 768px)');
    setDesktop(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return desktop;
}

interface Node {
  repo: GHRepo;
  position: [number, number, number];
  radius: number;
  color: string;
}

// Deterministic Fibonacci sphere distribution.
function buildNodes(repos: GHRepo[]): Node[] {
  const n = repos.length;
  if (n === 0) return [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  return repos.map((repo, i) => {
    const y = 1 - (i / Math.max(1, n - 1)) * 2; // 1 .. -1
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    const radius = Math.min(0.8, 0.2 + Math.sqrt(repo.stars) * 0.08);
    return {
      repo,
      position: [x * SPHERE_RADIUS, y * SPHERE_RADIUS, z * SPHERE_RADIUS],
      radius,
      color: languageColor(repo.language),
    };
  });
}

// Mulberry32 deterministic PRNG seeded by total node count for stable edge sampling.
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Edge {
  a: [number, number, number];
  b: [number, number, number];
}

function buildEdges(nodes: Node[]): Edge[] {
  const all: Edge[] = [];
  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const la = nodes[i].repo.language;
      const lb = nodes[j].repo.language;
      if (la && lb && la === lb) {
        all.push({ a: nodes[i].position, b: nodes[j].position });
      }
    }
  }
  if (all.length <= MAX_EDGES) return all;
  // Deterministic sample.
  const rand = mulberry32(all.length * 9301 + nodes.length);
  // Fisher-Yates partial shuffle.
  const indices = Array.from({ length: all.length }, (_, k) => k);
  for (let i = 0; i < MAX_EDGES; i += 1) {
    const j = i + Math.floor(rand() * (indices.length - i));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, MAX_EDGES).map((idx) => all[idx]);
}

interface NodeMeshProps {
  node: Node;
  onHover: (node: Node | null) => void;
  onSelect: (node: Node) => void;
  isHovered: boolean;
}

function NodeMesh({ node, onHover, onSelect, isHovered }: NodeMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    const target = isHovered ? 1.3 : 1.0;
    const cur = meshRef.current.scale.x;
    const next = cur + (target - cur) * 0.18;
    meshRef.current.scale.setScalar(next);
  });

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(node);
    if (typeof document !== 'undefined') document.body.style.cursor = 'pointer';
  };
  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(null);
    if (typeof document !== 'undefined') document.body.style.cursor = '';
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(node);
  };

  return (
    <mesh
      ref={meshRef}
      position={node.position}
      onPointerOver={handleOver}
      onPointerOut={handleOut}
      onClick={handleClick}
    >
      <sphereGeometry args={[node.radius, 24, 16]} />
      <meshStandardMaterial
        color={node.color}
        emissive={node.color}
        emissiveIntensity={0.4}
        roughness={0.5}
        metalness={0.2}
      />
    </mesh>
  );
}

interface StarFieldProps {
  count?: number;
}

function StarField({ count = 300 }: StarFieldProps) {
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    const rand = mulberry32(count * 7919);
    for (let i = 0; i < count; i += 1) {
      // Spread on a large outer shell for parallax depth.
      const r = 30 + rand() * 25;
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      arr[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  return (
    <Points positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#6B7785"
        size={0.06}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  );
}

interface SceneProps {
  nodes: Node[];
  edges: Edge[];
  hovered: Node | null;
  setHovered: (n: Node | null) => void;
  onSelect: (n: Node) => void;
  reducedMotion: boolean;
}

function Scene({ nodes, edges, hovered, setHovered, onSelect, reducedMotion }: SceneProps) {
  useEffect(() => {
    return () => {
      if (typeof document !== 'undefined') document.body.style.cursor = '';
    };
  }, []);

  return (
    <>
      <color attach="background" args={['#0A0E12']} />
      <fog attach="fog" args={['#0A0E12', 12, 32]} />

      <ambientLight intensity={0.55} />
      <pointLight position={[10, 10, 10]} intensity={0.9} color={SIGNAL} />
      <pointLight position={[-12, -8, -6]} intensity={0.4} color="#3178C6" />

      <StarField />

      {edges.map((e, i) => (
        <Line
          key={`e-${i}`}
          points={[e.a, e.b]}
          color={SIGNAL}
          lineWidth={1}
          transparent
          opacity={0.18}
        />
      ))}

      {nodes.map((n) => (
        <NodeMesh
          key={n.repo.id}
          node={n}
          onHover={setHovered}
          onSelect={onSelect}
          isHovered={hovered?.repo.id === n.repo.id}
        />
      ))}

      {hovered && (
        <Html
          position={hovered.position}
          center
          distanceFactor={10}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            className="whitespace-nowrap border border-signal bg-ink/90 px-2 py-1 font-mono text-[10px] tracking-widest text-text"
            style={{ transform: 'translateY(-1.4em)' }}
          >
            <span className="text-signal">{hovered.repo.name}</span>
            <span className="text-text-muted"> // </span>
            <span>★ {hovered.repo.stars}</span>
            {hovered.repo.language && (
              <>
                <span className="text-text-muted"> // </span>
                <span style={{ color: hovered.color }}>{hovered.repo.language}</span>
              </>
            )}
          </div>
        </Html>
      )}

      <OrbitControls
        enablePan={false}
        enableZoom
        enableRotate
        minDistance={8}
        maxDistance={28}
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.4}
        rotateSpeed={0.6}
        zoomSpeed={0.5}
      />
    </>
  );
}

export interface RepoConstellationProps {
  repos: GHRepo[];
}

export function RepoConstellation({ repos }: RepoConstellationProps) {
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const [hovered, setHovered] = useState<Node | null>(null);

  const nodes = useMemo(() => buildNodes(repos), [repos]);
  const edges = useMemo(() => buildEdges(nodes), [nodes]);

  // Top languages for the legend (deterministic by node count).
  const topLanguages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of repos) {
      if (!r.language) continue;
      counts.set(r.language, (counts.get(r.language) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([language]) => ({ language, color: languageColor(language) }));
  }, [repos]);

  const onSelect = (n: Node) => {
    if (typeof window !== 'undefined') {
      window.open(n.repo.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Mobile fallback: render the existing card grid.
  if (isDesktop === false) {
    return (
      <div className="grid grid-cols-1 gap-4">
        {repos.slice(0, 6).map((repo, i) => (
          <RepoCard
            key={repo.id}
            repo={repo}
            index={i}
            languageColor={languageColor(repo.language)}
          />
        ))}
      </div>
    );
  }

  // While probing viewport, render a placeholder of identical height to avoid layout shift.
  const showCanvas = isDesktop === true;

  return (
    <div className="relative">
      {/* Corner brackets */}
      <span aria-hidden className="pointer-events-none absolute left-0 top-0 z-10 h-4 w-4 border-l border-t border-signal" />
      <span aria-hidden className="pointer-events-none absolute right-0 top-0 z-10 h-4 w-4 border-r border-t border-signal" />
      <span aria-hidden className="pointer-events-none absolute bottom-0 left-0 z-10 h-4 w-4 border-b border-l border-signal" />
      <span aria-hidden className="pointer-events-none absolute bottom-0 right-0 z-10 h-4 w-4 border-b border-r border-signal" />

      <div
        className="relative overflow-hidden border border-border bg-surface"
        style={{ height: 520 }}
      >
        {/* Top-left status strip */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 font-mono text-[10px] tracking-widest text-text-muted">
          <div>CONSTELLATION // {nodes.length.toString().padStart(2, '0')} NODES</div>
          <div className="mt-1">LINKS // {edges.length.toString().padStart(3, '0')}</div>
        </div>

        {/* Top-right hint */}
        <div className="pointer-events-none absolute right-3 top-3 z-10 text-right font-mono text-[10px] tracking-widest text-text-muted">
          DRAG // ROTATE
          <br />
          SCROLL // ZOOM
          <br />
          CLICK // OPEN
        </div>

        {/* Bottom-left language legend */}
        {topLanguages.length > 0 && (
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 border border-border bg-ink/70 p-2 backdrop-blur-sm">
            <div className="mb-1.5 font-mono text-[9px] tracking-widest text-text-muted">
              SIGNAL KEY //
            </div>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1">
              {topLanguages.map((l) => (
                <li
                  key={l.language}
                  className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-text"
                >
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: l.color }}
                  />
                  <span>{l.language}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showCanvas && nodes.length > 0 ? (
          <Canvas
            dpr={[1, 2]}
            camera={{ position: [0, 0, 18], fov: 50 }}
            gl={{ antialias: true, alpha: false }}
          >
            <Scene
              nodes={nodes}
              edges={edges}
              hovered={hovered}
              setHovered={setHovered}
              onSelect={onSelect}
              reducedMotion={reducedMotion}
            />
          </Canvas>
        ) : (
          <div className="flex h-full items-center justify-center font-mono text-xs tracking-widest text-text-muted">
            {nodes.length === 0 ? 'NO TARGETS TO PLOT.' : 'INITIALIZING CONSTELLATION...'}
          </div>
        )}
      </div>
    </div>
  );
}

export default RepoConstellation;
