'use client';

import dynamic from 'next/dynamic';

const OperatorHologramScene = dynamic(
  () =>
    import('./OperatorHologramScene').then((m) => m.OperatorHologramScene),
  { ssr: false },
);

export function OperatorHologram() {
  return <OperatorHologramScene />;
}

export default OperatorHologram;
