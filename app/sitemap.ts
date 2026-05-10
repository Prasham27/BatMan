import type { MetadataRoute } from 'next';
import { content } from '@/content/data';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ['/', '/overview', '/cases', '/loadout', '/log', '/network', '/channel'];
  const projectRoutes = content.projects.map((p) => `/cases/${p.id}`);
  const now = new Date();
  return [...staticRoutes, ...projectRoutes].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
  }));
}
