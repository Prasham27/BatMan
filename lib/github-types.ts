// Browser-safe types and helpers — no fs/Node imports.
// Server-only logic (fetch, snapshot cache) lives in lib/github.ts.

export interface GHUser {
  login: string;
  name: string | null;
  bio: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  html_url: string;
}

export interface GHRepo {
  id: number;
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
  size: number;
  pushedAt: string;
  url: string;
  topics: string[];
}

export interface LanguageBytes {
  language: string;
  bytes: number;
  pct: number;
  color: string;
}

export interface GitHubData {
  user: GHUser | null;
  repos: GHRepo[];
  languageBreakdown: LanguageBytes[];
  recentActivity: GHRepo[];
  fetchedAt: string;
  stale: boolean;
}

export const LANG_COLOR: Record<string, string> = {
  Python: '#FFD43B',
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  'C++': '#F34B7D',
  C: '#A8B9CC',
  MATLAB: '#E16737',
  HTML: '#E34F26',
  CSS: '#1572B6',
  Shell: '#89E051',
  Cuda: '#3A4E3A',
  CUDA: '#3A4E3A',
  'Jupyter Notebook': '#DA5B0B',
  Verilog: '#B2B7F8',
  TeX: '#3D6117',
  Rust: '#DEA584',
  Go: '#00ADD8',
};
export const FALLBACK_COLOR = '#6B7785';

export function languageColor(language: string | null | undefined): string {
  if (!language) return FALLBACK_COLOR;
  return LANG_COLOR[language] ?? FALLBACK_COLOR;
}

export function emptyGitHubData(): GitHubData {
  return {
    user: null,
    repos: [],
    languageBreakdown: [],
    recentActivity: [],
    fetchedAt: new Date().toISOString(),
    stale: true,
  };
}
