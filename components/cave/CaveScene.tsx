'use client';

import { Canvas } from '@react-three/fiber';
import { Suspense, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaveEnvironment } from './CaveEnvironment';
import { CaveLighting } from './CaveLighting';
import { Batcomputer3D } from './Batcomputer3D';
import { Batmobile } from './Batmobile';
import { BatmobilePlatform } from './BatmobilePlatform';
import { GadgetRack, type GadgetItemId } from './GadgetRack';
import { TrainingBag } from './TrainingBag';
import { SurveillanceDrone3D } from './SurveillanceDrone3D';
import { OperatorSilhouette } from './OperatorSilhouette';
import { SuitRack, type SuitId } from './SuitRack';
import { SignalProjector } from './SignalProjector';
import { SpecPanel, type SpecItemId } from './SpecPanel';
import { CaveCamera } from './CaveCamera';
import { BootSequence } from '@/components/effects/BootSequence';
import { HOME_HREF } from '@/lib/routes';

export interface CaveSceneProps {
  onBatmobileClick?: () => void;
  onSuitClick?: (id: SuitId) => void;
  signalActive?: boolean;
  prototypeUnlocked?: boolean;
}

export function CaveScene({
  onBatmobileClick,
  onSuitClick,
  signalActive = false,
  prototypeUnlocked = false,
}: CaveSceneProps) {
  const router = useRouter();
  const [booting, setBooting] = useState(false);
  const [bootActive, setBootActive] = useState(false);
  const [activeItem, setActiveItem] = useState<SpecItemId | null>(null);
  const [bagPunches, setBagPunches] = useState<number>(0);

  const handleBatcomputerClick = useCallback(() => {
    if (booting) return;
    setBooting(true);
    window.setTimeout(() => setBootActive(true), 1100);
  }, [booting]);

  const handleBootComplete = useCallback(() => {
    router.push(HOME_HREF);
  }, [router]);

  const openBatmobile = useCallback(() => {
    onBatmobileClick?.();
  }, [onBatmobileClick]);
  const openSuit = useCallback(
    (id: SuitId) => {
      onSuitClick?.(id);
    },
    [onSuitClick],
  );
  const openGadget = useCallback((id: GadgetItemId) => setActiveItem(id), []);
  const openBag = useCallback((punches: number) => {
    setBagPunches(punches);
    setActiveItem('bag');
  }, []);
  const closeSpec = useCallback(() => setActiveItem(null), []);

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [14, 7, 14], fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={['#05080B']} />
        <fog attach="fog" args={['#0A0E12', 12, 50]} />
        <Suspense fallback={null}>
          <CaveLighting />
          <CaveEnvironment />
          <BatmobilePlatform />
          <Batcomputer3D
            onClick={handleBatcomputerClick}
            disabled={booting}
          />
          <Batmobile onClick={openBatmobile} disabled={booting} />
          <GadgetRack onSelect={openGadget} disabled={booting} />
          <TrainingBag onClick={openBag} disabled={booting} />
          <SuitRack
            onSelect={openSuit}
            disabled={booting}
            prototypeUnlocked={prototypeUnlocked}
          />
          <SurveillanceDrone3D />
          <OperatorSilhouette />
          <SignalProjector active={signalActive} />
          <CaveCamera booting={booting} />
        </Suspense>
      </Canvas>
      <BootSequence active={bootActive} onComplete={handleBootComplete} />
      <SpecPanel
        item={activeItem}
        bagPunches={bagPunches}
        onClose={closeSpec}
      />
    </>
  );
}
