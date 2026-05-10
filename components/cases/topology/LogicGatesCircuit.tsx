'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Line, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

export interface LogicGatesCircuitProps {
  variant: 'podem' | 'd-algorithm';
}

type Vec3 = [number, number, number];

type GateKind = 'AND' | 'OR' | 'NOT';

interface GateSpec {
  id: string;
  kind: GateKind;
  position: Vec3;
  /** Local offsets for input pins (relative to gate position). */
  inputs: Vec3[];
  /** Local offset for the output pin. */
  output: Vec3;
  marker?: { label: string; color: 'signal' | 'alert' };
}

interface InputPort {
  id: string;
  label: string;
  position: Vec3;
}

interface OutputPort {
  id: string;
  label: string;
  position: Vec3;
}

interface Wire {
  /** Polyline of points already routed with right-angle bends. */
  points: Vec3[];
}

const SIGNAL = '#FFB200';
const SIGNAL_DIM = '#B37D00';
const ALERT = '#E63946';
const TEXT_MUTED = '#6B7785';

/**
 * Build a polyline between two points using a single right-angle bend
 * (horizontal then vertical, in the XY plane on a fixed Z).
 */
function rightAngleWire(from: Vec3, to: Vec3): Vec3[] {
  const midX = (from[0] + to[0]) / 2;
  return [
    from,
    [midX, from[1], from[2]],
    [midX, to[1], to[2]],
    to,
  ];
}

/** Total length of a polyline. */
function polylineLength(points: Vec3[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    total += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  }
  return total;
}

/** Sample a point along a polyline at normalized t in [0,1]. */
function samplePolyline(points: Vec3[], t: number): Vec3 {
  if (points.length === 0) return [0, 0, 0];
  if (points.length === 1) return points[0];
  const total = polylineLength(points);
  if (total === 0) return points[0];
  const target = Math.max(0, Math.min(1, t)) * total;
  let traveled = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const seg = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    if (traveled + seg >= target) {
      const local = seg === 0 ? 0 : (target - traveled) / seg;
      return [
        a[0] + (b[0] - a[0]) * local,
        a[1] + (b[1] - a[1]) * local,
        a[2] + (b[2] - a[2]) * local,
      ];
    }
    traveled += seg;
  }
  return points[points.length - 1];
}

function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

/* ------------------------------ Gate meshes ------------------------------ */

function AndGate() {
  // Rounded box body suggesting an AND gate's flat back + curved front.
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.7, 0.7, 0.35]} />
        <meshStandardMaterial color="#1F2A35" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* Curved front cap */}
      <mesh position={[0.35, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <cylinderGeometry args={[0.35, 0.35, 0.35, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#1F2A35" roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  );
}

function OrGate() {
  // Slightly different silhouette: tapered body for OR.
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.55, 0.7, 0.35]} />
        <meshStandardMaterial color="#1F2A35" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0.35, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.38, 0.45, 24, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#1F2A35" roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  );
}

function NotGate() {
  // Triangle (flat cone) + small inverter circle.
  return (
    <group>
      <mesh rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.35, 0.7, 3]} />
        <meshStandardMaterial color="#1F2A35" roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh position={[0.5, 0, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#1F2A35" roughness={0.6} metalness={0.4} />
      </mesh>
    </group>
  );
}

function GateMesh({ kind }: { kind: GateKind }) {
  if (kind === 'AND') return <AndGate />;
  if (kind === 'OR') return <OrGate />;
  return <NotGate />;
}

/* ------------------------------ Pulse dot ------------------------------ */

interface PulseSpec {
  wireIndex: number;
  /** Phase offset in seconds so multiple pulses don't overlap. */
  offset: number;
  /** Speed multiplier — full traversal takes ~ duration seconds. */
  duration: number;
}

function Pulse({
  wires,
  pulse,
  enabled,
}: {
  wires: Wire[];
  pulse: PulseSpec;
  enabled: boolean;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (!enabled) {
      ref.current.visible = false;
      return;
    }
    const wire = wires[pulse.wireIndex];
    if (!wire) return;
    const t = ((clock.elapsedTime + pulse.offset) % pulse.duration) / pulse.duration;
    const p = samplePolyline(wire.points, t);
    ref.current.position.set(p[0], p[1], p[2]);
    ref.current.visible = true;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshBasicMaterial color={SIGNAL} toneMapped={false} />
    </mesh>
  );
}

/* ------------------------------ Scene ------------------------------ */

function CircuitScene({
  variant,
  reducedMotion,
}: {
  variant: 'podem' | 'd-algorithm';
  reducedMotion: boolean;
}) {
  // Layout: 3 columns. x = -3 (inputs), gates spread across x = -1.5, 0.5, 2.5.
  // Outputs at x = 4.
  const inputs: InputPort[] = useMemo(
    () => [
      { id: 'A', label: 'A', position: [-3, 1.6, 0] },
      { id: 'B', label: 'B', position: [-3, 0.4, 0] },
      { id: 'C', label: 'C', position: [-3, -0.8, 0] },
      { id: 'D', label: 'D', position: [-3, -2.0, 0] },
    ],
    [],
  );

  const outputs: OutputPort[] = useMemo(
    () => [
      { id: 'Y', label: 'Y', position: [4, 0.6, 0] },
      { id: "Y'", label: "Y'", position: [4, -1.2, 0] },
    ],
    [],
  );

  const gates: GateSpec[] = useMemo(() => {
    const podemMarkers: Record<string, GateSpec['marker']> = {
      g1: { label: 'OBJECTIVE', color: 'signal' },
      g4: { label: 'BACKTRACE', color: 'signal' },
    };
    const dAlgMarkers: Record<string, GateSpec['marker']> = {
      g2: { label: 'D-FRONTIER', color: 'signal' },
      g5: { label: 'J-FRONTIER', color: 'signal' },
      g6: { label: 's-a-1', color: 'alert' },
    };
    const markers = variant === 'podem' ? podemMarkers : dAlgMarkers;

    const list: GateSpec[] = [
      // Column 1 (x = -1.5)
      {
        id: 'g1',
        kind: 'AND',
        position: [-1.5, 1.0, 0],
        inputs: [
          [-0.45, 0.18, 0],
          [-0.45, -0.18, 0],
        ],
        output: [0.5, 0, 0],
      },
      {
        id: 'g2',
        kind: 'OR',
        position: [-1.5, -0.4, 0],
        inputs: [
          [-0.4, 0.18, 0],
          [-0.4, -0.18, 0],
        ],
        output: [0.55, 0, 0],
      },
      {
        id: 'g3',
        kind: 'NOT',
        position: [-1.5, -1.8, 0],
        inputs: [[-0.35, 0, 0]],
        output: [0.6, 0, 0],
      },
      // Column 2 (x = 0.5)
      {
        id: 'g4',
        kind: 'AND',
        position: [0.5, 1.4, 0],
        inputs: [
          [-0.45, 0.18, 0],
          [-0.45, -0.18, 0],
        ],
        output: [0.5, 0, 0],
      },
      {
        id: 'g5',
        kind: 'OR',
        position: [0.5, 0.0, 0],
        inputs: [
          [-0.4, 0.18, 0],
          [-0.4, -0.18, 0],
        ],
        output: [0.55, 0, 0],
      },
      {
        id: 'g6',
        kind: 'AND',
        position: [0.5, -1.5, 0],
        inputs: [
          [-0.45, 0.18, 0],
          [-0.45, -0.18, 0],
        ],
        output: [0.5, 0, 0],
      },
      // Column 3 (x = 2.5)
      {
        id: 'g7',
        kind: 'OR',
        position: [2.5, 0.6, 0],
        inputs: [
          [-0.4, 0.18, 0],
          [-0.4, -0.18, 0],
        ],
        output: [0.55, 0, 0],
      },
      {
        id: 'g8',
        kind: 'NOT',
        position: [2.5, -1.2, 0],
        inputs: [[-0.35, 0, 0]],
        output: [0.6, 0, 0],
      },
    ];

    return list.map((g) => ({ ...g, marker: markers[g.id] }));
  }, [variant]);

  const gateById = useMemo(() => {
    const map = new Map<string, GateSpec>();
    gates.forEach((g) => map.set(g.id, g));
    return map;
  }, [gates]);

  /** Helper: world position of gate input pin i. */
  const gateIn = (id: string, i: number): Vec3 => {
    const g = gateById.get(id)!;
    return add(g.position, g.inputs[i]);
  };
  /** Helper: world position of gate output pin. */
  const gateOut = (id: string): Vec3 => {
    const g = gateById.get(id)!;
    return add(g.position, g.output);
  };

  // Wire routing: inputs -> column 1 gates -> column 2 gates -> column 3 -> outputs.
  const wires: Wire[] = useMemo(() => {
    const list: { from: Vec3; to: Vec3 }[] = [
      // Inputs to column 1
      { from: inputs[0].position, to: gateIn('g1', 0) },
      { from: inputs[1].position, to: gateIn('g1', 1) },
      { from: inputs[1].position, to: gateIn('g2', 0) },
      { from: inputs[2].position, to: gateIn('g2', 1) },
      { from: inputs[3].position, to: gateIn('g3', 0) },
      // Column 1 -> Column 2
      { from: gateOut('g1'), to: gateIn('g4', 0) },
      { from: gateOut('g2'), to: gateIn('g4', 1) },
      { from: gateOut('g2'), to: gateIn('g5', 0) },
      { from: gateOut('g3'), to: gateIn('g5', 1) },
      { from: gateOut('g3'), to: gateIn('g6', 0) },
      { from: inputs[3].position, to: gateIn('g6', 1) },
      // Column 2 -> Column 3
      { from: gateOut('g4'), to: gateIn('g7', 0) },
      { from: gateOut('g5'), to: gateIn('g7', 1) },
      { from: gateOut('g6'), to: gateIn('g8', 0) },
      // Column 3 -> Outputs
      { from: gateOut('g7'), to: outputs[0].position },
      { from: gateOut('g8'), to: outputs[1].position },
    ];
    return list.map((w) => ({ points: rightAngleWire(w.from, w.to) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gates, inputs, outputs]);

  // Two staggered pulses along input-rooted wires.
  const pulses: PulseSpec[] = useMemo(
    () => [
      { wireIndex: 0, offset: 0, duration: 3.2 },
      { wireIndex: 3, offset: 1.6, duration: 3.6 },
    ],
    [],
  );

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 8, 6]} intensity={0.9} />
      <pointLight position={[-4, 2, 4]} intensity={0.4} color={SIGNAL} />

      {/* Gates */}
      {gates.map((g) => (
        <group key={g.id} position={g.position}>
          <GateMesh kind={g.kind} />
          {/* Fault dot for d-algorithm s-a-1 marker */}
          {g.marker && g.marker.color === 'alert' && (
            <mesh position={[0, 0.45, 0.2]}>
              <sphereGeometry args={[0.09, 16, 16]} />
              <meshBasicMaterial color={ALERT} toneMapped={false} />
            </mesh>
          )}
          {g.marker && (
            <Html
              position={[0, 0.85, 0]}
              center
              distanceFactor={8}
              zIndexRange={[10, 0]}
              style={{ pointerEvents: 'none' }}
            >
              <span
                className="font-mono text-[10px] tracking-widest uppercase"
                style={{
                  color: g.marker.color === 'alert' ? ALERT : SIGNAL,
                  textShadow: '0 0 6px rgba(0,0,0,0.85)',
                  whiteSpace: 'nowrap',
                }}
              >
                {g.marker.label}
              </span>
            </Html>
          )}
        </group>
      ))}

      {/* Input pin nubs + labels */}
      {inputs.map((p) => (
        <group key={p.id} position={p.position}>
          <mesh>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color={SIGNAL_DIM} toneMapped={false} />
          </mesh>
          <Html
            position={[-0.35, 0, 0]}
            center
            distanceFactor={8}
            style={{ pointerEvents: 'none' }}
          >
            <span
              className="font-mono text-[11px] tracking-widest"
              style={{ color: TEXT_MUTED, whiteSpace: 'nowrap' }}
            >
              {p.label}
            </span>
          </Html>
        </group>
      ))}

      {/* Output pin nubs + labels */}
      {outputs.map((p) => (
        <group key={p.id} position={p.position}>
          <mesh>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshBasicMaterial color={SIGNAL} toneMapped={false} />
          </mesh>
          <Html
            position={[0.4, 0, 0]}
            center
            distanceFactor={8}
            style={{ pointerEvents: 'none' }}
          >
            <span
              className="font-mono text-[11px] tracking-widest"
              style={{ color: SIGNAL, whiteSpace: 'nowrap' }}
            >
              {p.label}
            </span>
          </Html>
        </group>
      ))}

      {/* Wires */}
      {wires.map((w, i) => (
        <Line
          key={i}
          points={w.points as unknown as THREE.Vector3Tuple[]}
          color={SIGNAL_DIM}
          lineWidth={1.2}
          transparent
          opacity={0.85}
        />
      ))}

      {/* Pulses */}
      {pulses.map((p, i) => (
        <Pulse key={i} wires={wires} pulse={p} enabled={!reducedMotion} />
      ))}

      <OrbitControls
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.4}
        enableZoom
        enablePan={false}
        minDistance={4}
        maxDistance={14}
      />
    </>
  );
}

/* ------------------------------ Wrapper ------------------------------ */

export function LogicGatesCircuit({ variant }: LogicGatesCircuitProps) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mql.matches);
    update();
    if (mql.addEventListener) {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    }
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  const header =
    variant === 'podem' ? 'LOGIC CIRCUIT // PODEM TRACE' : 'LOGIC CIRCUIT // D-FRONTIER';

  return (
    <div className="relative w-full h-[480px] border border-border bg-surface/80 backdrop-blur-md overflow-hidden">
      <div className="pointer-events-none absolute top-3 left-4 z-10">
        <span className="font-mono text-[11px] tracking-widest text-signal">{header}</span>
      </div>
      <Canvas
        camera={{ position: [5, 4, 7], fov: 50 }}
        gl={{ antialias: true }}
        style={{ background: '#0A0E12' }}
      >
        <CircuitScene variant={variant} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}
