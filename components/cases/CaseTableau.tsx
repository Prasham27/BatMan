'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html, Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { Project } from '@/content/types';

interface CaseTableauProps {
  projects: Project[];
}

interface PlacedProject {
  project: Project;
  position: [number, number, number];
}

function fibonacciSphere(n: number, radius: number): [number, number, number][] {
  const out: [number, number, number][] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(n - 1, 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    out.push([
      Math.cos(theta) * r * radius,
      y * radius * 0.6,
      Math.sin(theta) * r * radius,
    ]);
  }
  return out;
}

function buildEdges(placed: PlacedProject[]): { from: number; to: number }[] {
  const edges: { from: number; to: number }[] = [];
  for (let i = 0; i < placed.length; i++) {
    for (let j = i + 1; j < placed.length; j++) {
      const tagsA = placed[i].project.tags;
      const tagsB = placed[j].project.tags;
      const sharedTag = tagsA.some((t) => tagsB.includes(t));
      if (sharedTag) edges.push({ from: i, to: j });
    }
  }
  return edges;
}

interface CasePanelProps {
  placed: PlacedProject;
  hovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

function CasePanel({ placed, hovered, onHover, onClick }: CasePanelProps) {
  const { project, position } = placed;
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.position.y =
      position[1] + Math.sin(clock.elapsedTime * 0.6 + position[0]) * 0.1;
  });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(project.id);
    document.body.style.cursor = 'pointer';
  };
  const handlePointerOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    onHover(null);
    document.body.style.cursor = '';
  };
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick(project.id);
  };

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      {/* Glassy panel — front face */}
      <mesh>
        <planeGeometry args={[2, 1.2]} />
        <meshStandardMaterial
          color={hovered ? '#1a2230' : '#0a0d11'}
          transparent
          opacity={0.85}
          emissive="#FFB200"
          emissiveIntensity={hovered ? 0.4 : 0.12}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Border frame — wireframe */}
      <mesh>
        <planeGeometry args={[2.05, 1.25]} />
        <meshBasicMaterial
          color="#FFB200"
          wireframe
          transparent
          opacity={hovered ? 0.9 : 0.5}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Project info via Html */}
      <Html
        position={[0, 0, 0.01]}
        center
        distanceFactor={6}
        transform
        occlude={false}
      >
        <div className="pointer-events-none w-[160px] text-center font-mono">
          <p className="text-[8px] tracking-widest text-signal">
            CASE // {project.id.toUpperCase()}
          </p>
          <p className="mt-1 font-display text-xs font-semibold uppercase text-text">
            {project.name}
          </p>
          {project.metrics?.[0] && (
            <p className="mt-2 text-[8px] tracking-widest text-text-muted">
              {project.metrics[0].label}
              <br />
              <span className="text-signal">{project.metrics[0].value}</span>
            </p>
          )}
        </div>
      </Html>
    </group>
  );
}

function TableauScene({
  placed,
  edges,
  onSelect,
}: {
  placed: PlacedProject[];
  edges: { from: number; to: number }[];
  onSelect: (id: string) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#FFB200" />
      <pointLight position={[-5, 2, -5]} intensity={0.6} color="#7090b0" />

      {/* Tag-relationship edges */}
      {edges.map((e, i) => (
        <Line
          key={i}
          points={[placed[e.from].position, placed[e.to].position]}
          color="#FFB200"
          lineWidth={1}
          transparent
          opacity={0.35}
        />
      ))}

      {placed.map((p) => (
        <CasePanel
          key={p.project.id}
          placed={p}
          hovered={hoveredId === p.project.id}
          onHover={setHoveredId}
          onClick={onSelect}
        />
      ))}
    </>
  );
}

export function CaseTableau({ projects }: CaseTableauProps) {
  const router = useRouter();
  const placed: PlacedProject[] = useMemo(() => {
    const positions = fibonacciSphere(projects.length, 4);
    return projects.map((project, i) => ({ project, position: positions[i] }));
  }, [projects]);

  const edges = useMemo(() => buildEdges(placed), [placed]);

  const handleSelect = (id: string) => {
    router.push(`/cases/${id}`);
  };

  return (
    <div className="relative h-[600px] w-full overflow-hidden border border-border bg-surface/40 backdrop-blur-sm">
      <div className="pointer-events-none absolute left-4 top-4 z-10 font-mono text-[10px] tracking-widest text-text-muted">
        CASE TABLEAU // ALL ACTIVE CASES
      </div>
      <div className="pointer-events-none absolute right-4 top-4 z-10 font-mono text-[10px] tracking-widest text-text-muted">
        DRAG TO ROTATE · CLICK PANEL TO OPEN
      </div>
      <Canvas
        camera={{ position: [0, 1, 9], fov: 55 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#0a0d11']} />
        <fog attach="fog" args={['#0a0d11', 8, 25]} />
        <TableauScene placed={placed} edges={edges} onSelect={handleSelect} />
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.4}
          enableZoom
          enablePan={false}
          minDistance={5}
          maxDistance={16}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
