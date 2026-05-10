'use client';

export function CaveLighting() {
  return (
    <>
      {/* Hemisphere — cool sky, dark stone ground */}
      <hemisphereLight args={['#3a5a8a', '#0a0e12', 0.35]} />

      {/* Cool rim light from above-back (cave-mouth moonlight) */}
      <directionalLight
        position={[8, 18, -12]}
        intensity={0.6}
        color="#7090b0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Amber pool around the console — primary brand light */}
      <pointLight
        position={[0, 4, -3]}
        intensity={2.6}
        distance={14}
        decay={1.8}
        color="#FFB200"
        castShadow
      />

      {/* Cool fill on the Batmobile platform */}
      <pointLight
        position={[-9, 4, 1]}
        intensity={1.6}
        distance={9}
        decay={1.6}
        color="#5070a0"
      />

      {/* Cool fill on the surveillance drone */}
      <pointLight
        position={[10, 9, 5]}
        intensity={1.2}
        distance={6}
        decay={1.6}
        color="#5070a0"
      />

      {/* Floor of light */}
      <ambientLight intensity={0.1} color="#1a2230" />
    </>
  );
}
