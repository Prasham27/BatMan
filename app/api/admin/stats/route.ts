import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, verifySessionCookie } from '@/lib/admin-auth';
import { summary } from '@/lib/analytics';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  const cookieStore = cookies();
  const value = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const auth = verifySessionCookie(value);
  if (!auth.valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json(summary());
}
