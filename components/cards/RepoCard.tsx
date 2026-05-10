import { cn } from '@/lib/cn';
import type { GHRepo } from '@/lib/github';

export interface RepoCardProps {
  repo: GHRepo;
  index: number;
  languageColor?: string;
  className?: string;
}

export function RepoCard({ repo, index, languageColor, className }: RepoCardProps) {
  const targetId = `TGT-${(index + 1).toString().padStart(3, '0')}`;
  const pushedDate = new Date(repo.pushedAt).toISOString().slice(0, 10);

  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noreferrer"
      aria-label={`Open ${repo.name} on GitHub`}
      className={cn(
        'group relative block overflow-hidden border border-border bg-surface p-5',
        'transition-colors duration-base ease-snap',
        'hover:bg-surface-2 focus-visible:bg-surface-2',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute left-0 top-0 h-full w-[2px] bg-signal',
          'origin-top scale-y-0 transition-transform duration-base ease-linear',
          'group-hover:scale-y-100 group-focus-visible:scale-y-100',
        )}
      />

      <div className="flex items-center justify-between font-mono text-[11px] tracking-widest text-text-muted">
        <span>TRACKED TARGET // {targetId}</span>
        {repo.stars > 0 && (
          <span className="text-signal">★ {repo.stars}</span>
        )}
      </div>

      <h3 className="mt-2 font-display text-xl font-semibold text-text">
        {repo.name}
      </h3>

      {repo.description && (
        <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-text-muted">
          {repo.description}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-text-muted">
          {repo.language ? (
            <>
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: languageColor ?? '#6B7785' }}
              />
              <span>{repo.language}</span>
            </>
          ) : (
            <span>UNKNOWN STACK</span>
          )}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
          PUSHED {pushedDate}
        </span>
      </div>
    </a>
  );
}
