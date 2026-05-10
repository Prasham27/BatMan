'use client';

import dynamic from 'next/dynamic';

const DetectiveAtpgGraph = dynamic(
  () =>
    import('./DetectiveAtpgGraph').then((m) => ({
      default: m.DetectiveAtpgGraph,
    })),
  { ssr: false, loading: () => <Loading /> },
);
const GiltFundsSurface = dynamic(
  () =>
    import('./GiltFundsSurface').then((m) => ({
      default: m.GiltFundsSurface,
    })),
  { ssr: false, loading: () => <Loading /> },
);
const PolarCodesConstellation = dynamic(
  () =>
    import('./PolarCodesConstellation').then((m) => ({
      default: m.PolarCodesConstellation,
    })),
  { ssr: false, loading: () => <Loading /> },
);
const LogicGatesCircuit = dynamic(
  () =>
    import('./LogicGatesCircuit').then((m) => ({
      default: m.LogicGatesCircuit,
    })),
  { ssr: false, loading: () => <Loading /> },
);

function Loading() {
  return (
    <div className="flex h-[480px] items-center justify-center border border-border bg-surface/40 font-mono text-xs tracking-widest text-text-muted">
      LOADING TOPOLOGY //
    </div>
  );
}

function NoTopology({ projectId }: { projectId: string }) {
  return (
    <div className="flex h-[480px] items-center justify-center border border-border bg-surface/40 font-mono text-xs tracking-widest text-text-muted">
      NO TOPOLOGY RENDER FOR &lsquo;{projectId.toUpperCase()}&rsquo; //
    </div>
  );
}

export interface CaseTopologyProps {
  projectId: string;
}

const TOPOLOGY_BLURBS: Record<string, string> = {
  'detective-atpg':
    'Graph + sequential model over circuit nodes — pulses traveling along edges represent the GNN message-passing.',
  'gilt-funds-eda':
    '3D yield-curve surface across maturity × time × yield, with axes labeled.',
  'polar-codes-matlab':
    '16-QAM constellation with decision boundaries and trellis arcs above and below the symbol plane.',
  'podem': 'Logic-gate circuit with PODEM objective + backtrace markers and signal pulses.',
  'd-algorithm':
    'Logic-gate circuit with D-frontier and J-frontier markers plus a stuck-at-1 fault indicator.',
};

export function CaseTopology({ projectId }: CaseTopologyProps) {
  return (
    <>
      {/* Desktop: full 3D widget */}
      <div className="hidden md:block">
        {(() => {
          switch (projectId) {
            case 'detective-atpg':
              return <DetectiveAtpgGraph />;
            case 'gilt-funds-eda':
              return <GiltFundsSurface />;
            case 'polar-codes-matlab':
              return <PolarCodesConstellation />;
            case 'podem':
              return <LogicGatesCircuit variant="podem" />;
            case 'd-algorithm':
              return <LogicGatesCircuit variant="d-algorithm" />;
            default:
              return <NoTopology projectId={projectId} />;
          }
        })()}
      </div>

      {/* Mobile fallback: descriptive card (3D widget hidden) */}
      <div className="block border border-border bg-surface/60 p-5 md:hidden">
        <p className="font-mono text-[10px] tracking-widest text-signal">
          TOPOLOGY //
        </p>
        <p className="mt-2 font-mono text-xs leading-relaxed text-text-muted">
          {TOPOLOGY_BLURBS[projectId] ?? 'No topology render available for this case.'}
        </p>
        <p className="mt-3 font-mono text-[10px] tracking-widest text-text-muted">
          [ 3D RENDER AVAILABLE ON DESKTOP ]
        </p>
      </div>
    </>
  );
}
