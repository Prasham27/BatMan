import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CaseTopology } from '@/components/cases/topology/CaseTopology';
import { content } from '@/content/data';

interface Params {
  params: { id: string };
}

export function generateStaticParams() {
  return content.projects.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: Params): Metadata {
  const project = content.projects.find((p) => p.id === params.id);
  if (!project) return { title: 'Case File' };
  return { title: project.name };
}

export default function CaseFilePage({ params }: Params) {
  const project = content.projects.find((p) => p.id === params.id);
  if (!project) notFound();

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:px-10 md:pt-28">
      <p className="font-mono text-[11px] tracking-widest text-signal">
        CASE FILE // {project.id.toUpperCase()}
      </p>
      <div className="mt-4 flex items-baseline justify-between gap-6">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-text md:text-6xl">
          {project.name}
        </h1>
        <span className="whitespace-nowrap border border-alert px-3 py-1 font-mono text-[10px] tracking-widest text-alert">
          CLASSIFIED // L3
        </span>
      </div>
      <p className="mt-4 max-w-3xl text-text-muted">{project.tagline}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="font-mono text-[10px] tracking-widest text-text-muted">
            TOPOLOGY //
          </h2>
          <div className="mt-3">
            <CaseTopology projectId={project.id} />
          </div>

          <h2 className="mt-10 font-mono text-[10px] tracking-widest text-text-muted">
            BRIEFING //
          </h2>
          <p className="mt-3 max-w-prose leading-relaxed text-text">
            {project.description}
          </p>
        </div>

        <aside className="space-y-6">
          <section>
            <h3 className="font-mono text-[10px] tracking-widest text-text-muted">
              STACK //
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <li
                  key={s}
                  className="border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-text-muted"
                >
                  {s}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="font-mono text-[10px] tracking-widest text-text-muted">
              PERIOD //
            </h3>
            <p className="mt-2 font-mono text-xs text-text">
              {project.startDate.slice(0, 7)} → {project.endDate?.slice(0, 7) ?? 'present'}
            </p>
          </section>

          {project.metrics && project.metrics.length > 0 && (
            <section>
              <h3 className="font-mono text-[10px] tracking-widest text-text-muted">
                METRICS //
              </h3>
              <ul className="mt-3 space-y-3">
                {project.metrics.map((m) => (
                  <li key={m.label} className="border-l-2 border-signal pl-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
                      {m.label}
                    </p>
                    <p className="font-display text-xl text-signal tabular-nums">
                      {m.value}
                    </p>
                    {m.context && (
                      <p className="mt-0.5 font-mono text-[10px] text-text-muted">
                        {m.context}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {project.links.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noreferrer"
              className="block border border-border px-4 py-3 font-mono text-xs tracking-widest text-text-muted transition-colors hover:border-signal hover:text-signal"
            >
              [ GITHUB // OPEN ]
            </a>
          )}

          <a
            href="/cases"
            className="block border border-border px-4 py-3 font-mono text-xs tracking-widest text-text-muted transition-colors hover:border-signal hover:text-signal"
          >
            ← BACK TO TABLEAU
          </a>
        </aside>
      </div>
    </main>
  );
}
