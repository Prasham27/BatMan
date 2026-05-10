import { NextResponse } from 'next/server';
import { fetchGitHubDataResilient } from '@/lib/github';

export const revalidate = 3600;

export async function GET() {
  const data = await fetchGitHubDataResilient();
  return NextResponse.json(data, {
    headers: data.stale
      ? { 'Cache-Control': 'no-store' }
      : { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
  });
}
