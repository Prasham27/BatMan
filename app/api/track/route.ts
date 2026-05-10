import { NextResponse } from 'next/server';
import { record } from '@/lib/analytics';

export const runtime = 'nodejs';

interface TrackBody {
  path?: string;
  sessionId?: string;
  visitorId?: string;
  referrer?: string;
}

export async function POST(req: Request): Promise<Response> {
  // sendBeacon sends as text/plain; req.json() parses it the same as JSON.
  let body: TrackBody;
  try {
    body = (await req.json()) as TrackBody;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const path = typeof body.path === 'string' ? body.path.slice(0, 200) : '/';
  const sessionId =
    typeof body.sessionId === 'string' ? body.sessionId.slice(0, 64) : undefined;
  const visitorId =
    typeof body.visitorId === 'string' ? body.visitorId.slice(0, 64) : undefined;
  const referrer =
    typeof body.referrer === 'string' ? body.referrer.slice(0, 200) : undefined;
  const ua = req.headers.get('user-agent')?.slice(0, 300) ?? '';
  const ipHeader =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip');
  const ip = ipHeader ?? undefined;

  record({
    timestamp: Date.now(),
    path,
    ua,
    ip,
    referrer,
    sessionId,
    visitorId,
  });

  return NextResponse.json({ ok: true });
}
