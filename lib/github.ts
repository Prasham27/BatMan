import fs from 'node:fs/promises';
import path from 'node:path';
import {
  emptyGitHubData,
  FALLBACK_COLOR,
  LANG_COLOR,
  type GHRepo,
  type GHUser,
  type GitHubData,
  type LanguageBytes,
} from './github-types';

// Re-export browser-safe types/helpers so existing imports keep working.
export {
  emptyGitHubData,
  FALLBACK_COLOR,
  LANG_COLOR,
  languageColor,
  type GHRepo,
  type GHUser,
  type GitHubData,
  type LanguageBytes,
} from './github-types';

// Server-only — never import from a Client Component.
const USER = 'Prasham27';
const FORK_STAR_THRESHOLD = 5;
const TOP_REPOS_LIMIT = 8;
const REVALIDATE_SECONDS = 3600;
const SNAPSHOT_PATH = path.join(process.cwd(), '.cache', 'github-snapshot.json');

interface GHRepoRaw {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  fork: boolean;
  stargazers_count: number;
  language: string | null;
  size: number;
  pushed_at: string;
  html_url: string;
  topics: string[] | null;
}

let lastGood: GitHubData | null = null;
let snapshotLoaded = false;

function authHeader(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const GH_HEADERS: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
  'User-Agent': 'batman-batcomputer-portfolio',
};

async function gh<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: { ...GH_HEADERS, ...authHeader() },
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new Error(`GitHub ${res.status} ${res.statusText} on ${url}`);
  }
  return (await res.json()) as T;
}

async function loadSnapshot(): Promise<GitHubData | null> {
  if (snapshotLoaded) return lastGood;
  snapshotLoaded = true;
  try {
    const raw = await fs.readFile(SNAPSHOT_PATH, 'utf8');
    const parsed = JSON.parse(raw) as GitHubData;
    lastGood = parsed;
    return parsed;
  } catch {
    return null;
  }
}

async function saveSnapshot(data: GitHubData): Promise<void> {
  try {
    await fs.mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
    await fs.writeFile(SNAPSHOT_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Vercel serverless filesystem is read-only outside /tmp. No-op silently.
  }
}

export async function fetchGitHubData(): Promise<GitHubData> {
  const [user, reposRaw] = await Promise.all([
    gh<GHUser>(`https://api.github.com/users/${USER}`),
    gh<GHRepoRaw[]>(
      `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`,
    ),
  ]);

  const filtered = reposRaw.filter(
    (r) => !r.fork || r.stargazers_count > FORK_STAR_THRESHOLD,
  );

  const repos: GHRepo[] = filtered.map((r) => ({
    id: r.id,
    name: r.name,
    description: r.description,
    stars: r.stargazers_count,
    language: r.language,
    size: r.size,
    pushedAt: r.pushed_at,
    url: r.html_url,
    topics: r.topics ?? [],
  }));

  return {
    user,
    repos,
    languageBreakdown: aggregateLanguages(repos),
    recentActivity: pickRecent(repos, TOP_REPOS_LIMIT),
    fetchedAt: new Date().toISOString(),
    stale: false,
  };
}

export async function fetchGitHubDataResilient(): Promise<GitHubData> {
  if (!snapshotLoaded) {
    await loadSnapshot();
  }
  try {
    const fresh = await fetchGitHubData();
    lastGood = fresh;
    saveSnapshot(fresh).catch(() => {});
    return fresh;
  } catch {
    if (lastGood) return { ...lastGood, stale: true };
    return emptyGitHubData();
  }
}

export function aggregateLanguages(repos: GHRepo[]): LanguageBytes[] {
  const totals = new Map<string, number>();
  for (const r of repos) {
    if (!r.language) continue;
    totals.set(r.language, (totals.get(r.language) ?? 0) + r.size);
  }
  const total = Array.from(totals.values()).reduce((s, v) => s + v, 0);
  if (total === 0) return [];
  return Array.from(totals.entries())
    .map(([language, bytes]) => ({
      language,
      bytes,
      pct: (bytes / total) * 100,
      color: LANG_COLOR[language] ?? FALLBACK_COLOR,
    }))
    .sort((a, b) => b.bytes - a.bytes);
}

export function pickRecent(repos: GHRepo[], n: number): GHRepo[] {
  return [...repos]
    .sort((a, b) => Date.parse(b.pushedAt) - Date.parse(a.pushedAt))
    .slice(0, n);
}
