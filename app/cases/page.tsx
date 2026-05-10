import dynamic from 'next/dynamic';
import { content } from '@/content/data';

export const metadata = { title: 'Active Cases' };

const CaseTableau = dynamic(
  () =>
    import('@/components/cases/CaseTableau').then((m) => m.CaseTableau),
  { ssr: false },
);

export default function CasesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:px-10 md:pt-28">
      <p className="font-mono text-[11px] tracking-widest text-text-muted">
        CASES //
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text md:text-6xl">
        Active Cases
      </h1>
      <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-text-muted">
        Each panel is a project. Amber lines connect projects that share a tag —
        the VLSI cluster groups itself. Drag to rotate the tableau, click any
        panel to open the case file.
      </p>

      <div className="mt-10 hidden md:block">
        <CaseTableau projects={content.projects} />
      </div>

      <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {content.projects.map((p) => (
          <li
            key={p.id}
            className="border border-border bg-surface/60 p-4"
          >
            <a
              href={`/cases/${p.id}`}
              className="block group"
            >
              <p className="font-mono text-[10px] tracking-widest text-text-muted group-hover:text-signal">
                CASE // {p.id.toUpperCase()}
              </p>
              <h3 className="mt-1 font-display text-lg text-text group-hover:text-signal">
                {p.name}
              </h3>
              <p className="mt-2 font-mono text-[10px] leading-relaxed text-text-muted">
                {p.tagline}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
