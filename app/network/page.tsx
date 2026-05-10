import { fetchGitHubDataResilient, languageColor } from '@/lib/github';
import { RepoConstellationClient } from '@/components/network/RepoConstellationClient';

export const revalidate = 3600;

export const metadata = {
  title: 'Surveillance Network',
  description: 'Tracked GitHub targets and signal composition for Prasham27.',
};

export default async function NetworkPage() {
  const data = await fetchGitHubDataResilient();

  const offline = data.stale;
  const langs = data.languageBreakdown.slice(0, 6);
  const topLangsTotal = langs.reduce((s, l) => s + l.pct, 0);
  const otherPct = Math.max(0, 100 - topLangsTotal);
  const sightings = data.recentActivity;

  const fetchedDisplay = (() => {
    try {
      return new Date(data.fetchedAt).toISOString().slice(0, 16).replace('T', ' ');
    } catch {
      return '----';
    }
  })();

  return (
    <main className="mx-auto max-w-6xl px-6 pb-24 pt-20 md:px-10 md:pt-28">
      <header className="mb-10">
        <p className="font-mono text-[11px] tracking-widest text-text-muted">
          NETWORK //
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-text md:text-6xl">
          Surveillance Network
        </h1>
        <p className="mt-4 max-w-2xl text-text-muted leading-relaxed">
          Tracked targets and signal intelligence aggregated from{' '}
          <a
            href="https://github.com/Prasham27"
            target="_blank"
            rel="noreferrer"
            className="text-signal transition-colors hover:underline"
          >
            github.com/Prasham27
          </a>
          . Data refreshes hourly.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3 font-mono text-[11px] tracking-widest">
          {offline ? (
            <span className="border border-alert px-3 py-1 text-alert">
              OFFLINE // SIGNAL UNAVAILABLE
            </span>
          ) : (
            <span className="border border-border px-3 py-1 text-text-muted">
              SYNC // {fetchedDisplay}Z
            </span>
          )}
          {!offline && data.user && (
            <>
              <span className="border border-border px-3 py-1 text-text-muted">
                REPOS // {data.repos.length.toString().padStart(2, '0')}
              </span>
              <span className="border border-border px-3 py-1 text-text-muted">
                FOLLOWERS // {data.user.followers}
              </span>
            </>
          )}
        </div>
      </header>

      <section className="mb-12">
        <header className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-text">
            Repo Constellation
          </h2>
          <span className="font-mono text-[11px] tracking-widest text-text-muted">
            TOPOLOGY //
          </span>
        </header>
        {data.repos.length === 0 ? (
          <div className="border border-border bg-surface p-6 font-mono text-sm text-text-muted">
            NO TARGETS TRACKED. SIGNAL UNAVAILABLE.
          </div>
        ) : (
          <RepoConstellationClient repos={data.repos} />
        )}
      </section>

      <section className="mb-12">
        <header className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-text">
            Signal Composition
          </h2>
          <span className="font-mono text-[11px] tracking-widest text-text-muted">
            LANGUAGES //
          </span>
        </header>
        {langs.length === 0 ? (
          <div className="border border-border bg-surface p-6 font-mono text-sm text-text-muted">
            NO LANGUAGE DATA AVAILABLE.
          </div>
        ) : (
          <div className="border border-border bg-surface p-5">
            <div
              className="flex h-3 w-full overflow-hidden"
              role="img"
              aria-label="Language byte breakdown"
            >
              {langs.map((l) => (
                <div
                  key={l.language}
                  title={`${l.language} ${l.pct.toFixed(1)}%`}
                  style={{ width: `${l.pct}%`, backgroundColor: l.color }}
                />
              ))}
              {otherPct > 0 && (
                <div
                  title={`Other ${otherPct.toFixed(1)}%`}
                  style={{ width: `${otherPct}%`, backgroundColor: '#6B7785' }}
                />
              )}
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-3">
              {langs.map((l) => (
                <li
                  key={l.language}
                  className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-text-muted"
                >
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: l.color }}
                  />
                  <span className="text-text">{l.language}</span>
                  <span>{l.pct.toFixed(1)}%</span>
                </li>
              ))}
              {otherPct > 0 && (
                <li className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-text-muted">
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: '#6B7785' }}
                  />
                  <span className="text-text">Other</span>
                  <span>{otherPct.toFixed(1)}%</span>
                </li>
              )}
            </ul>
          </div>
        )}
      </section>

      <section>
        <header className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-text">
            Recent Sightings
          </h2>
          <span className="font-mono text-[11px] tracking-widest text-text-muted">
            ACTIVITY //
          </span>
        </header>
        {sightings.length === 0 ? (
          <div className="border border-border bg-surface p-6 font-mono text-sm text-text-muted">
            NO ACTIVITY DETECTED.
          </div>
        ) : (
          <ul className="border border-border bg-surface">
            {sightings.map((repo) => (
              <li
                key={repo.id}
                className="flex flex-col gap-2 border-b border-border p-4 last:border-b-0 md:flex-row md:items-baseline md:gap-6 md:p-5"
              >
                <span className="whitespace-nowrap font-mono text-[11px] tracking-widest text-text-muted md:w-32">
                  {new Date(repo.pushedAt).toISOString().slice(0, 10)}
                </span>
                <div className="flex-1">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-display text-lg text-text transition-colors hover:text-signal"
                  >
                    {repo.name}
                  </a>
                  {repo.description && (
                    <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-text-muted">
                      {repo.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-text-muted">
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span
                        aria-hidden
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: languageColor(repo.language) }}
                      />
                      {repo.language}
                    </span>
                  )}
                  {repo.stars > 0 && (
                    <span className="text-signal">★ {repo.stars}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
