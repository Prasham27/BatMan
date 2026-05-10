import crypto from 'node:crypto';

export const ADMIN_COOKIE_NAME = 'bc_admin';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function constantTimeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // timingSafeEqual requires equal lengths — pad to avoid early exit + always run a compare
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export interface Credentials {
  username: string;
  password: string;
}

export function verifyCredentials(provided: Credentials): boolean {
  const u = process.env.ADMIN_USERNAME;
  const p = process.env.ADMIN_PASSWORD;
  if (!u || !p) return false;
  const okUser = constantTimeEqual(provided.username, u);
  const okPass = constantTimeEqual(provided.password, p);
  return okUser && okPass;
}

export function createSessionCookie(username: string): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${username}|${expiresAt}`;
  const signature = sign(payload, secret);
  return `${payload}|${signature}`;
}

export interface SessionCheck {
  valid: boolean;
  username?: string;
}

export function verifySessionCookie(value: string | undefined | null): SessionCheck {
  if (!value) return { valid: false };
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return { valid: false };
  const parts = value.split('|');
  if (parts.length !== 3) return { valid: false };
  const [username, expiresAtStr, signature] = parts;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return { valid: false };
  }
  const expected = sign(`${username}|${expiresAtStr}`, secret);
  if (!constantTimeEqual(signature, expected)) {
    return { valid: false };
  }
  return { valid: true, username };
}

export function isAdminConfigured(): boolean {
  return !!(
    process.env.ADMIN_USERNAME &&
    process.env.ADMIN_PASSWORD &&
    process.env.ADMIN_SESSION_SECRET
  );
}
