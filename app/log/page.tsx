import dynamic from 'next/dynamic';
import { content } from '@/content/data';

const MissionTape = dynamic(() => import('@/components/log/MissionTape'), {
  ssr: false,
});

export const metadata = { title: 'Mission Log' };

export default function LogPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:px-10 md:pt-28">
      <p className="font-mono text-[11px] tracking-widest text-text-muted">
        MISSION_LOG // CAREER TIMELINE
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text md:text-6xl">
        Mission Log
      </h1>
      <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-text-muted">
        Recovered transmissions and field assignments. Scroll the tape to
        advance the camera along the timeline; markers surface dossier metadata
        as the lens approaches.
      </p>

      <MissionTape entries={content.experience} />
    </main>
  );
}
