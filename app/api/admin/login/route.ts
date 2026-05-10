import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createSessionCookie,
  isAdminConfigured,
  verifyCredentials,
} from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(req: Request): Promise<Response> {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          'Admin offline — set ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_SESSION_SECRET in env.',
      },
      { status: 503 },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = (await req.json()) as { username?: string; password?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!body.username || !body.password) {
    return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
  }

  if (!verifyCredentials({ username: body.username, password: body.password })) {
    // Constant 250ms latency to dampen brute-force timing
    await new Promise((r) => setTimeout(r, 250));
    return NextResponse.json({ error: 'Access denied.' }, { status: 401 });
  }

  const cookie = createSessionCookie(body.username);
  if (!cookie) {
    return NextResponse.json(
      { error: 'Session secret not configured' },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, cookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
  return res;
}
