import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const MAX_NAME = 100;
const MAX_EMAIL = 200;
const MAX_MESSAGE = 5000;

interface ChannelBody {
  name: string;
  email: string;
  message: string;
  honeypot?: string;
}

function validate(body: unknown): ChannelBody | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  if (
    typeof b.name !== 'string' ||
    typeof b.email !== 'string' ||
    typeof b.message !== 'string'
  )
    return null;
  if (
    b.name.length === 0 ||
    b.email.length === 0 ||
    b.message.length === 0 ||
    b.name.length > MAX_NAME ||
    b.email.length > MAX_EMAIL ||
    b.message.length > MAX_MESSAGE
  )
    return null;
  // Naive email shape check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email)) return null;
  return {
    name: b.name,
    email: b.email,
    message: b.message,
    honeypot: typeof b.honeypot === 'string' ? b.honeypot : undefined,
  };
}

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL;

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const data = validate(raw);
  if (!data) {
    return NextResponse.json({ error: 'Invalid fields.' }, { status: 400 });
  }

  // Honeypot: if filled, silently 200 (treat as success but drop)
  if (data.honeypot && data.honeypot.length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (!apiKey || !toEmail) {
    return NextResponse.json(
      {
        error:
          'Comms array offline — RESEND_API_KEY or CONTACT_TO_EMAIL not configured.',
      },
      { status: 503 },
    );
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: 'Batcomputer <onboarding@resend.dev>',
      to: toEmail,
      replyTo: data.email,
      subject: `[Batcomputer] Comms from ${data.name}`,
      text: `From: ${data.name} <${data.email}>\n\n${data.message}`,
    });
    if (error) {
      console.error('[channel] resend error:', error);
      return NextResponse.json(
        { error: 'Transmission failed.' },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[channel] resend threw:', err);
    return NextResponse.json(
      { error: 'Transmission failed.' },
      { status: 502 },
    );
  }
}
