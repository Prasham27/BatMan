import dynamic from 'next/dynamic';
import { content } from '@/content/data';

export const metadata = { title: 'Equipment Roster' };

const EquipmentRack = dynamic(
  () =>
    import('@/components/loadout/EquipmentRack').then((m) => m.EquipmentRack),
  { ssr: false },
);

export default function LoadoutPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:px-10 md:pt-28">
      <p className="font-mono text-[11px] tracking-widest text-text-muted">
        EQUIPMENT // ARSENAL
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text md:text-6xl">
        Loadout
      </h1>
      <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-text-muted">
        Each gadget below racks one capability domain — rotate, hover for the
        category callsign, then click to break out the full kit with proficiency
        and time-in-service.
      </p>

      <div className="mt-10">
        <EquipmentRack skills={content.skills} />
      </div>
    </main>
  );
}
