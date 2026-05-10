export type ProjectCategory =
  | 'ml'
  | 'vlsi'
  | 'finance'
  | 'systems'
  | 'open-source';

export type ProjectStatus = 'shipped' | 'active' | 'archived';

export type SkillCategory = 'languages' | 'ml' | 'systems' | 'theory' | 'tools';

export type ExperienceType =
  | 'education'
  | 'project'
  | 'course'
  | 'open-source'
  | 'role';

export interface Metric {
  label: string;
  value: string;
  context?: string;
}

export interface ProjectLinks {
  github?: string;
  paper?: string;
  writeup?: string;
  demo?: string;
}

export interface Project {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  category: ProjectCategory;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  stack: string[];
  tags: string[];
  metrics?: Metric[];
  links: ProjectLinks;
  featured: boolean;
  cover?: string;
}

export interface Skill {
  name: string;
  category: SkillCategory;
  level: 1 | 2 | 3 | 4 | 5;
  yearsUsed: number;
  related?: string[];
}

export interface ExperienceLink {
  label: string;
  href: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  organization: string;
  period: string;
  type: ExperienceType;
  highlights: string[];
  links?: ExperienceLink[];
}

export interface Social {
  label: string;
  href: string;
}

export interface Identity {
  name: string;
  role: string;
  bio: string;
  location: string;
  pronouns?: string;
  socials: Social[];
}

export interface PortfolioContent {
  identity: Identity;
  projects: Project[];
  skills: Skill[];
  experience: ExperienceItem[];
}
