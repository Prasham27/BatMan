'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

interface PathHit {
  path: string;
  timestamp: number;
  sessionId?: string;
}

interface VisitorRecord {
  visitorId: string;
  firstSeenAt: number;
  lastSeenAt: number;
  visitCount: number;
  totalHits: number;
  sessionIds: string[];
  paths: PathHit[];
  ua?: string;
}

interface AnalyticsSummary {
  totalHits: number;
  uniqueSessions: number;
  uniqueVisitors: number;
  topPages: { path: string; hits: number }[];
  recentEvents: {
    timestamp: number;
    path: string;
    ua: string;
    ip?: string;
    referrer?: string;
    sessionId?: string;
    visitorId?: string;
  }[];
  visitors: VisitorRecord[];
  snapshotAt: string;
  firstHitAt: string | null;
  serverUptimeMs: number;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setError(null);
    const res = await fetch('/api/admin/stats', { cache: 'no-store' });
    if (res.status === 401) {
      setAuthed(false);
      return;
    }
    if (!res.ok) {
      setError(`Stats unreachable (${res.status})`);
      setAuthed(false);
      return;
    }
    const data = (await res.json()) as AnalyticsSummary;
    setStats(data);
    setAuthed(true);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleLogout = useCallback(async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthed(false);
    setStats(null);
  }, []);

  if (authed === null) {
    return (
      <main className="min-h-screen bg-ink p-6 text-text">
        <p className="font-mono text-xs tracking-widest text-text-muted">
          AUTHENTICATING //
        </p>
      </main>
    );
  }

  if (!authed) {
    return <LoginScreen onAuthed={loadStats} error={error} />;
  }

  return <Dashboard stats={stats} onLogout={handleLogout} onRefresh={loadStats} />;
}

interface LoginScreenProps {
  onAuthed: () => void;
  error: string | null;
}

function LoginScreen({ onAuthed, error: initialError }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Authentication failed.');
        return;
      }
      onAuthed();
    } catch {
      setError('Connection failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink p-6">
      <div className="w-full max-w-md border border-border bg-surface/60 p-8 backdrop-blur-sm">
        <p className="font-mono text-[10px] tracking-widest text-signal">
          BATCOMPUTER // ADMIN TERMINAL
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-text">
          Authenticate
        </h1>
        <p className="mt-2 font-mono text-[10px] tracking-widest text-text-muted">
          CLEARANCE LEVEL // OPERATOR
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-text-muted">
              USERNAME //
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              autoFocus
              className="mt-1 w-full border border-border bg-ink/60 px-3 py-2 font-mono text-sm text-text focus:border-signal focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-text-muted">
              PASSWORD //
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="mt-1 w-full border border-border bg-ink/60 px-3 py-2 font-mono text-sm text-text focus:border-signal focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className={cn(
              'w-full border px-4 py-3 font-mono text-xs tracking-widest transition-colors',
              busy
                ? 'border-signal text-signal'
                : 'border-border text-text-muted hover:border-signal hover:text-signal',
            )}
          >
            {busy ? '[ AUTHENTICATING... ]' : '[ AUTHENTICATE ]'}
          </button>
          {error && (
            <p className="font-mono text-[10px] tracking-widest text-alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

interface DashboardProps {
  stats: AnalyticsSummary | null;
  onLogout: () => void;
  onRefresh: () => void;
}

function Dashboard({ stats, onLogout, onRefresh }: DashboardProps) {
  const [expandedVisitor, setExpandedVisitor] = useState<string | null>(null);

  if (!stats) {
    return (
      <main className="min-h-screen bg-ink p-6 text-text">
        <p className="font-mono text-xs tracking-widest text-text-muted">
          LOADING //
        </p>
      </main>
    );
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(stats, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batcomputer-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-ink p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-baseline justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-widest text-signal">
              BATCOMPUTER // ADMIN TERMINAL
            </p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-text md:text-4xl">
              Surveillance Dashboard
            </h1>
            <p className="mt-1 font-mono text-[10px] tracking-widest text-text-muted">
              SNAPSHOT // {stats.snapshotAt}
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row">
            <button
              type="button"
              onClick={onRefresh}
              className="border border-border px-3 py-1.5 font-mono text-[10px] tracking-widest text-text-muted transition-colors hover:border-signal hover:text-signal"
            >
              [ REFRESH ]
            </button>
            <button
              type="button"
              onClick={exportJson}
              className="border border-border px-3 py-1.5 font-mono text-[10px] tracking-widest text-text-muted transition-colors hover:border-signal hover:text-signal"
            >
              [ EXPORT JSON ]
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="border border-alert px-3 py-1.5 font-mono text-[10px] tracking-widest text-alert transition-colors hover:bg-alert hover:text-ink"
            >
              [ LOGOUT ]
            </button>
          </div>
        </header>

        <section className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          <Stat label="TOTAL HITS" value={stats.totalHits.toLocaleString()} />
          <Stat
            label="UNIQUE SESSIONS"
            value={stats.uniqueSessions.toLocaleString()}
          />
          <Stat
            label="UNIQUE VISITORS"
            value={stats.uniqueVisitors.toLocaleString()}
          />
          <Stat
            label="SERVER UPTIME"
            value={formatUptime(stats.serverUptimeMs)}
          />
          <Stat
            label="FIRST HIT"
            value={
              stats.firstHitAt
                ? new Date(stats.firstHitAt).toLocaleString()
                : '—'
            }
          />
        </section>

        <section className="mt-10">
          <h2 className="font-mono text-[10px] tracking-widest text-signal">
            TOP PAGES //
          </h2>
          {stats.topPages.length === 0 ? (
            <p className="mt-2 font-mono text-xs text-text-muted">
              NO TRAFFIC RECORDED
            </p>
          ) : (
            <ul className="mt-3 border border-border bg-surface/40">
              {stats.topPages.map((p) => {
                const max = stats.topPages[0]?.hits ?? 1;
                const pct = (p.hits / max) * 100;
                return (
                  <li
                    key={p.path}
                    className="relative flex items-baseline justify-between border-b border-border px-4 py-2 last:border-b-0 font-mono text-xs"
                  >
                    <div
                      aria-hidden
                      className="absolute inset-y-0 left-0 bg-signal/10"
                      style={{ width: `${pct}%` }}
                    />
                    <span className="relative text-text">{p.path}</span>
                    <span className="relative tabular-nums text-signal">
                      {p.hits}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-10">
          <h2 className="font-mono text-[10px] tracking-widest text-signal">
            VISITORS // ({stats.visitors.length})
          </h2>
          {stats.visitors.length === 0 ? (
            <p className="mt-2 font-mono text-xs text-text-muted">
              NO VISITORS RECORDED
            </p>
          ) : (
            <ul className="mt-3 border border-border bg-surface/40">
              {/* Header row */}
              <li className="grid grid-cols-[160px_1fr_80px_80px_120px] gap-3 border-b border-border bg-ink/40 px-4 py-2 font-mono text-[10px] tracking-widest text-text-muted">
                <span>VISITOR ID</span>
                <span>BROWSER</span>
                <span className="text-right">VISITS</span>
                <span className="text-right">HITS</span>
                <span className="text-right">LAST SEEN</span>
              </li>
              {stats.visitors.map((v) => {
                const isExpanded = expandedVisitor === v.visitorId;
                const isReturning = v.visitCount > 1;
                return (
                  <li key={v.visitorId} className="border-b border-border last:border-b-0">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedVisitor(isExpanded ? null : v.visitorId)
                      }
                      className={cn(
                        'grid w-full grid-cols-[160px_1fr_80px_80px_120px] gap-3 px-4 py-2 text-left font-mono text-xs transition-colors',
                        isExpanded
                          ? 'bg-signal/10 text-signal'
                          : 'text-text-muted hover:bg-surface-2 hover:text-signal',
                      )}
                    >
                      <span className="truncate">
                        {isReturning && (
                          <span aria-hidden className="mr-1 text-signal">
                            ◆
                          </span>
                        )}
                        <span className="text-text">
                          {shortenId(v.visitorId)}
                        </span>
                      </span>
                      <span className="truncate">{shortenUa(v.ua ?? '')}</span>
                      <span
                        className={cn(
                          'text-right tabular-nums',
                          isReturning ? 'text-signal' : 'text-text',
                        )}
                      >
                        {v.visitCount}
                      </span>
                      <span className="text-right tabular-nums text-text">
                        {v.totalHits}
                      </span>
                      <span className="text-right">
                        {timeAgo(v.lastSeenAt)}
                      </span>
                    </button>
                    {isExpanded && (
                      <VisitorDetail visitor={v} />
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-2 font-mono text-[10px] tracking-widest text-text-muted">
            ◆ = returning visitor (visitCount {'>'} 1) · click any row to see their journey
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-mono text-[10px] tracking-widest text-signal">
            RECENT EVENTS //
          </h2>
          {stats.recentEvents.length === 0 ? (
            <p className="mt-2 font-mono text-xs text-text-muted">
              NO EVENTS LOGGED YET
            </p>
          ) : (
            <ul className="mt-3 max-h-[480px] overflow-y-auto border border-border bg-surface/40">
              {stats.recentEvents.map((e, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[140px_1fr_1fr] gap-3 border-b border-border px-4 py-2 last:border-b-0 font-mono text-[10px]"
                >
                  <span className="whitespace-nowrap text-text-muted">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="truncate text-text">{e.path}</span>
                  <span className="truncate text-text-muted">
                    {shortenUa(e.ua)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="mt-8 font-mono text-[10px] tracking-widest text-text-muted">
          Note: tracking is in-memory. Counter resets when the Vercel server cold-starts (~15 min idle on Hobby tier).
          For durable analytics, swap `lib/analytics.ts` for Vercel KV / Upstash Redis.
        </p>
      </div>
    </main>
  );
}

function VisitorDetail({ visitor }: { visitor: VisitorRecord }) {
  return (
    <div className="border-t border-signal/30 bg-ink/40 px-4 py-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <DetailField
          label="VISITOR ID"
          value={visitor.visitorId}
          mono
        />
        <DetailField
          label="FIRST SEEN"
          value={new Date(visitor.firstSeenAt).toLocaleString()}
        />
        <DetailField
          label="LAST SEEN"
          value={new Date(visitor.lastSeenAt).toLocaleString()}
        />
        <DetailField
          label="SESSIONS"
          value={visitor.sessionIds.length.toString()}
        />
      </div>

      <div className="mt-4">
        <p className="mb-2 font-mono text-[10px] tracking-widest text-signal">
          JOURNEY // ({visitor.paths.length} hits)
        </p>
        <ul className="max-h-[320px] overflow-y-auto border border-border bg-ink/30">
          {visitor.paths.map((p, i) => (
            <li
              key={i}
              className="grid grid-cols-[140px_1fr_120px] gap-3 border-b border-border px-3 py-1.5 last:border-b-0 font-mono text-[10px]"
            >
              <span className="text-text-muted">
                {new Date(p.timestamp).toLocaleString()}
              </span>
              <span className="truncate text-text">{p.path}</span>
              <span className="truncate text-text-muted">
                {p.sessionId ? shortenId(p.sessionId) : '—'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-widest text-text-muted">
        {label} //
      </p>
      <p
        className={cn(
          'mt-1 truncate text-xs text-text',
          mono ? 'font-mono' : 'font-mono',
        )}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-surface/40 p-4">
      <p className="font-mono text-[10px] tracking-widest text-text-muted">
        {label} //
      </p>
      <p className="mt-2 font-display text-2xl font-semibold tabular-nums text-signal">
        {value}
      </p>
    </div>
  );
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function shortenId(id: string): string {
  if (id.length <= 18) return id;
  return `${id.slice(0, 14)}…`;
}

function shortenUa(ua: string): string {
  if (!ua) return '—';
  const browser = /Chrome|Safari|Firefox|Edg|Opera/.exec(ua)?.[0] ?? 'Browser';
  const os = /Windows|Mac OS X|Android|iPhone|Linux/.exec(ua)?.[0] ?? '';
  return `${browser}${os ? ` · ${os}` : ''}`;
}
