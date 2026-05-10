import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { Project } from '@/content/types';
import { DecryptText } from '@/components/effects/DecryptText';

export type CaseCardVariant = 'default' | 'featured';

export interface CaseCardProps {
  project: Project;
  index: number;
  variant?: CaseCardVariant;
  classified?: boolean;
  className?: string;
}

export function CaseCard({
  project,
  index,
  variant = 'default',
  classified = false,
  className,
}: CaseCardProps) {
  const caseId = `BC-${(index + 1).toString().padStart(3, '0')}`;
  const stack = project.stack.slice(0, variant === 'featured' ? 6 : 4);
  const overflow = Math.max(0, project.stack.length - stack.length);
  const headlineMetric = project.metrics?.[0];

  return (
    <Link
      href={`/cases/${project.id}`}
      aria-label={`Open case file ${project.name}`}
      className={cn(
        'group relative block overflow-hidden border border-border bg-surface p-5',
        'transition-colors duration-base ease-snap',
        'hover:bg-surface-2 focus-visible:bg-surface-2',
        variant === 'featured' && 'p-6',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute left-0 top-0 h-full w-[2px] bg-signal',
          'origin-top scale-y-0',
          'transition-transform duration-base ease-linear',
          'group-hover:scale-y-100 group-focus-visible:scale-y-100',
        )}
      />

      <div className="flex items-center justify-between font-mono text-[11px] tracking-widest text-text-muted">
        <span>CASE FILE // {caseId}</span>
        {classified && <span className="text-alert">CLASSIFIED</span>}
      </div>

      <h3
        className={cn(
          'mt-2 font-display font-semibold text-text',
          variant === 'featured' ? 'text-3xl md:text-4xl' : 'text-xl',
        )}
      >
        <DecryptText text={project.name} trigger="inview" />
      </h3>

      <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-text-muted">
        {project.tagline}
      </p>

      <ul className="mt-4 flex flex-wrap gap-1.5">
        {stack.map((tech) => (
          <li
            key={tech}
            className="border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-text-muted"
          >
            {tech}
          </li>
        ))}
        {overflow > 0 && (
          <li className="px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-text-muted">
            +{overflow}
          </li>
        )}
      </ul>

      {headlineMetric && (
        <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-border pt-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-muted">
            {headlineMetric.label}
          </span>
          <span className="font-display text-lg tabular-nums text-signal">
            {headlineMetric.value}
          </span>
        </div>
      )}
    </Link>
  );
}
