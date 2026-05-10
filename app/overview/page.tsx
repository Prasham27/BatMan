import { CaseCard } from '@/components/cards/CaseCard';
import { OperatorHologram } from '@/components/overview/OperatorHologram';
import { content } from '@/content/data';

export const metadata = { title: 'Overview' };

export default function OverviewPage() {
  const featured = content.projects.filter((p) => p.featured);
  const recentLog = content.experience.slice(0, 3);

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-8 px-6 pb-16 pt-20 md:grid-cols-[1fr_260px] md:gap-12 md:px-10 md:pt-28">
        <div>
          <p className="font-mono text-[11px] tracking-widest text-text-muted">
            OPERATOR PROFILE //
          </p>
          <h1 className="mt-3 font-display text-5xl font-semibold tracking-tight text-text md:text-7xl">
            {content.identity.name}
          </h1>
          <p className="mt-4 font-mono text-sm tracking-wide text-signal">
            {content.identity.role}
          </p>
          <p className="mt-6 max-w-2xl leading-relaxed text-text-muted">
            {content.identity.bio}
          </p>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[11px] tracking-widest text-text-muted">
            <span>
              LOC //{' '}
              <span className="text-text">
                {content.identity.location.toUpperCase()}
              </span>
            </span>
            {content.identity.socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-base hover:text-signal"
              >
                {social.label.toUpperCase()} //
              </a>
            ))}
          </div>
        </div>

        <aside className="hidden md:block">
          <OperatorHologram />
        </aside>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-10">
        <header className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-text">
            Priority Cases
          </h2>
          <span className="font-mono text-[11px] tracking-widest text-text-muted">
            FEATURED // {featured.length.toString().padStart(2, '0')}
          </span>
        </header>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {featured.map((project, i) => (
            <CaseCard
              key={project.id}
              project={project}
              index={i}
              variant={i === 0 ? 'featured' : 'default'}
              className={i === 0 ? 'md:col-span-3' : undefined}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <header className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-text">
            Mission Log
          </h2>
          <span className="font-mono text-[11px] tracking-widest text-text-muted">
            RECENT //
          </span>
        </header>
        <ul className="border border-border bg-surface">
          {recentLog.map((entry) => (
            <li
              key={entry.id}
              className="flex flex-col gap-1 border-b border-border p-4 last:border-b-0 md:flex-row md:items-baseline md:gap-6 md:p-5"
            >
              <span className="whitespace-nowrap font-mono text-[11px] tracking-widest text-text-muted md:w-48">
                {entry.period.toUpperCase()}
              </span>
              <div className="flex-1">
                <h3 className="font-display text-lg text-text">{entry.title}</h3>
                <p className="mt-0.5 font-mono text-[11px] tracking-widest text-text-muted">
                  {entry.organization.toUpperCase()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
