'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import type { ExperienceItem } from '@/content/types';
import { cn } from '@/lib/cn';

export interface MissionTapeProps {
  entries: ExperienceItem[];
  className?: string;
}

// ---------- Curve geometry shared between scene + camera ----------
function buildCurve(): THREE.CatmullRomCurve3 {
  // A long ribbon receding into depth with a gentle S-curve.
  // X bends left/right, Y bobs slightly, Z marches into the distance.
  const pts: THREE.Vector3[] = [
    new THREE.Vector3(0, 0, 8),
    new THREE.Vector3(1.2, 0.2, 0),
    new THREE.Vector3(-1.2, -0.1, -8),
    new THREE.Vector3(1.6, 0.3, -16),
    new THREE.Vector3(-1.4, -0.2, -24),
    new THREE.Vector3(0.8, 0.1, -32),
    new THREE.Vector3(-0.4, 0, -40),
  ];
  const c = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
  return c;
}

// ---------- The dark tube + amber edge glow ----------
function Ribbon({ curve }: { curve: THREE.CatmullRomCurve3 }) {
  // Build a parallel curve offset upward for the glowing top edge.
  const edgeCurve = useMemo(() => {
    const samples = 200;
    const offsetPts: THREE.Vector3[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const p = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      // Side normal perpendicular to tangent and up
      const side = new THREE.Vector3().crossVectors(tangent, up).normalize();
      const realUp = new THREE.Vector3().crossVectors(side, tangent).normalize();
      offsetPts.push(p.clone().add(realUp.multiplyScalar(0.18)));
    }
    return new THREE.CatmullRomCurve3(offsetPts, false, 'catmullrom', 0.5);
  }, [curve]);

  return (
    <group>
      {/* Main matte dark ribbon */}
      <mesh>
        <tubeGeometry args={[curve, 240, 0.18, 12, false]} />
        <meshStandardMaterial
          color="#141A21"
          roughness={0.85}
          metalness={0.25}
        />
      </mesh>

      {/* Thin amber emissive line along the top edge */}
      <mesh>
        <tubeGeometry args={[edgeCurve, 240, 0.012, 6, false]} />
        <meshBasicMaterial color="#FFB200" toneMapped={false} />
      </mesh>
    </group>
  );
}

// ---------- A single marker: pylon + Html label ----------
function Marker({
  curve,
  t,
  entry,
  cameraT,
  index,
  total,
}: {
  curve: THREE.CatmullRomCurve3;
  t: number;
  entry: ExperienceItem;
  cameraT: React.MutableRefObject<number>;
  index: number;
  total: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const stakeMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const htmlRef = useRef<HTMLDivElement>(null);

  const { position, quaternion } = useMemo(() => {
    const p = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize();
    const realUp = new THREE.Vector3().crossVectors(side, tangent).normalize();
    // Orient marker upright relative to ribbon top
    const m = new THREE.Matrix4().makeBasis(side, realUp, tangent);
    const q = new THREE.Quaternion().setFromRotationMatrix(m);
    return { position: p, quaternion: q };
  }, [curve, t]);

  useFrame(() => {
    // Distance in t-space; closer markers glow brighter & label is more opaque
    const d = Math.abs(cameraT.current - t);
    const proximity = Math.max(0, 1 - d * 6);
    if (stakeMatRef.current) {
      stakeMatRef.current.color.setRGB(
        1 * (0.55 + 0.45 * proximity),
        (178 / 255) * (0.55 + 0.45 * proximity),
        0,
      );
    }
    if (htmlRef.current) {
      htmlRef.current.style.opacity = `${0.15 + 0.85 * proximity}`;
    }
  });

  return (
    <group ref={groupRef} position={position} quaternion={quaternion}>
      {/* Vertical pylon */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.9, 10]} />
        <meshBasicMaterial ref={stakeMatRef} color="#FFB200" toneMapped={false} />
      </mesh>
      {/* Glowing cap */}
      <mesh position={[0, 0.95, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#FFB200" toneMapped={false} />
      </mesh>

      <Html
        position={[0, 1.35, 0]}
        center
        distanceFactor={5}
        zIndexRange={[10, 0]}
        style={{ pointerEvents: 'none' }}
      >
        <div
          ref={htmlRef}
          className="w-[220px] border border-border bg-surface/90 px-3 py-2 backdrop-blur-sm"
          style={{ transition: 'opacity 200ms linear' }}
        >
          <div className="flex items-center justify-between font-mono text-[9px] tracking-widest text-text-muted">
            <span>LOG // {(index + 1).toString().padStart(2, '0')}/{total.toString().padStart(2, '0')}</span>
            <span className="text-signal">{entry.period}</span>
          </div>
          <div className="mt-1 font-display text-sm font-semibold leading-tight text-text">
            {entry.title}
          </div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {entry.organization}
          </div>
        </div>
      </Html>
    </group>
  );
}

// ---------- Camera that rides the curve based on scroll progress ----------
function ScrollCamera({
  curve,
  cameraT,
}: {
  curve: THREE.CatmullRomCurve3;
  cameraT: React.MutableRefObject<number>;
}) {
  const { camera } = useThree();
  const smoothed = useRef(0);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    // Ease cameraT toward the latest scroll-driven target (linear-ish lerp).
    smoothed.current += (cameraT.current - smoothed.current) * 0.08;
    const t = THREE.MathUtils.clamp(smoothed.current, 0, 0.985);

    const pos = curve.getPointAt(t);
    // Hover above the ribbon with a small backward offset
    camera.position.set(pos.x, pos.y + 0.9, pos.z + 1.6);

    // Look slightly ahead along the curve
    const ahead = curve.getPointAt(Math.min(t + 0.04, 1));
    lookTarget.set(ahead.x, ahead.y + 0.2, ahead.z);
    camera.lookAt(lookTarget);
  });

  return null;
}

// ---------- 3D scene assembly ----------
function Scene({
  entries,
  cameraT,
}: {
  entries: ExperienceItem[];
  cameraT: React.MutableRefObject<number>;
}) {
  const curve = useMemo(() => buildCurve(), []);

  // Distribute markers evenly along arc length, biased away from the very edges.
  const markerTs = useMemo(() => {
    const n = entries.length;
    if (n === 0) return [];
    if (n === 1) return [0.5];
    return entries.map((_, i) => 0.05 + (i / (n - 1)) * 0.9);
  }, [entries]);

  return (
    <>
      <color attach="background" args={['#0A0E12']} />
      <fog attach="fog" args={['#0A0E12', 6, 38]} />

      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 6, 4]} intensity={0.6} color="#FFB200" />
      <directionalLight position={[-3, 2, -2]} intensity={0.25} color="#6B7785" />

      <Ribbon curve={curve} />

      {markerTs.map((t, i) => (
        <Marker
          key={entries[i].id}
          curve={curve}
          t={t}
          entry={entries[i]}
          cameraT={cameraT}
          index={i}
          total={entries.length}
        />
      ))}

      <ScrollCamera curve={curve} cameraT={cameraT} />
    </>
  );
}

// ---------- 2D mobile fallback ----------
function MobileTimeline({ entries }: { entries: ExperienceItem[] }) {
  return (
    <ol className="relative space-y-4 border-l border-border pl-5">
      {entries.map((entry, i) => (
        <li key={entry.id} className="relative">
          <span
            aria-hidden
            className="absolute -left-[27px] top-2 inline-block h-2 w-2 rounded-full bg-signal"
          />
          <div className="border border-border bg-surface p-4">
            <div className="flex items-center justify-between font-mono text-[10px] tracking-widest text-text-muted">
              <span>LOG // {(i + 1).toString().padStart(2, '0')}/{entries.length.toString().padStart(2, '0')}</span>
              <span className="text-signal">{entry.period}</span>
            </div>
            <h3 className="mt-2 font-display text-lg font-semibold text-text">
              {entry.title}
            </h3>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-text-muted">
              {entry.organization}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

// ---------- Reduced-motion fallback (desktop, no scroll-tied animation) ----------
function ReducedMotionStack({ entries }: { entries: ExperienceItem[] }) {
  return (
    <ol className="grid gap-3">
      {entries.map((entry, i) => (
        <li
          key={entry.id}
          className="border border-border bg-surface p-4"
        >
          <div className="flex items-center justify-between font-mono text-[10px] tracking-widest text-text-muted">
            <span>LOG // {(i + 1).toString().padStart(2, '0')}/{entries.length.toString().padStart(2, '0')}</span>
            <span className="text-signal">{entry.period}</span>
          </div>
          <h3 className="mt-2 font-display text-xl font-semibold text-text">
            {entry.title}
          </h3>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-text-muted">
            {entry.organization}
          </p>
        </li>
      ))}
    </ol>
  );
}

// ---------- Top-level widget ----------
export default function MissionTape({ entries, className }: MissionTapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraT = useRef(0);
  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [progressLabel, setProgressLabel] = useState('00');

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Wheel-based scroll progress — attached to the canvas container so the
  // outer page stops scrolling while the pointer is over the tape, AND the
  // tape only advances when scrolling happens inside the box. preventDefault
  // requires passive: false, so we attach the listener manually.
  useEffect(() => {
    if (isMobile || reducedMotion) return;
    const el = containerRef.current;
    if (!el) return;

    let internal = 0;

    const onWheel = (e: WheelEvent) => {
      // We're inside the box (the listener is bound to it) — capture the wheel
      // so the page doesn't scroll past us.
      e.preventDefault();
      e.stopPropagation();
      internal += e.deltaY * 0.0008;
      internal = Math.max(0, Math.min(1, internal));
      cameraT.current = internal;
      setProgressLabel(Math.round(internal * 99).toString().padStart(2, '0'));
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [isMobile, reducedMotion]);

  if (isMobile) {
    return (
      <div className={cn('mt-6', className)}>
        <MobileTimeline entries={entries} />
      </div>
    );
  }

  if (reducedMotion) {
    return (
      <div className={cn('mt-6', className)}>
        <ReducedMotionStack entries={entries} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative mt-6 h-[80vh] w-full overflow-hidden border border-border bg-ink',
        className,
      )}
    >
      {/* HUD overlay */}
      <div className="pointer-events-none absolute left-3 top-3 z-10 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
        <span>TAPE</span>
        <span className="text-signal">{progressLabel}/99</span>
        <span>// SCROLL TO ADVANCE</span>
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 z-10 font-mono text-[10px] uppercase tracking-widest text-text-muted">
        MISSION_TAPE.v1
      </div>

      <Canvas
        camera={{ position: [0, 1, 10], fov: 55, near: 0.1, far: 80 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene entries={entries} cameraT={cameraT} />
      </Canvas>
    </div>
  );
}
