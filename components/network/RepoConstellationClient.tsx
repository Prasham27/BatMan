'use client';

import dynamic from 'next/dynamic';
import type { GHRepo } from '@/lib/github';

// three.js cannot SSR — load only on the client. ssr:false is permitted here
// because this file is itself a Client Component.
const RepoConstellation = dynamic(
  () => import('./RepoConstellation').then((m) => m.RepoConstellation),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex w-full items-center justify-center border border-border bg-surface font-mono text-xs tracking-widest text-text-muted"
        style={{ height: 520 }}
      >
        BOOTING CONSTELLATION...
      </div>
    ),
  },
);

export interface RepoConstellationClientProps {
  repos: GHRepo[];
}

export function RepoConstellationClient({ repos }: RepoConstellationClientProps) {
  return <RepoConstellation repos={repos} />;
}

export default RepoConstellationClient;
