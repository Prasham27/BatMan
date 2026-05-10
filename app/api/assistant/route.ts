import { GoogleGenerativeAI } from '@google/generative-ai';
import { content } from '@/content/data';
import { checkRate, looksInjected, systemPrompt } from '@/lib/alfred';

// Note: @google/generative-ai is fetch-based and runs in Edge runtime.
export const runtime = 'edge';

const MAX_USER_MSG = 500;
const MAX_HISTORY = 12;
// User has Gemini Pro student credits, so paid-tier models are open.
// gemini-2.5-flash is the cheapest-per-token modern model — well-suited
// to short grounded Q&A. Bump to gemini-2.5-pro if you want richer answers.
const MODEL = 'gemini-2.5-flash';

interface ClientMessage {
  role: 'user' | 'assistant';
  content: string;
}

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
}

export async function POST(req: Request): Promise<Response> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse(
      {
        error:
          'Alfred is offline — GEMINI_API_KEY is not configured on this deployment.',
      },
      { status: 503 },
    );
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown';
  if (!checkRate(ip)) {
    return jsonResponse(
      { error: 'Rate limit reached — 20 messages per hour. Try again later, sir.' },
      { status: 429 },
    );
  }

  let body: { messages: ClientMessage[] };
  try {
    body = (await req.json()) as { messages: ClientMessage[] };
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, { status: 400 });
  }

  const incoming = (body.messages ?? []).slice(-MAX_HISTORY);
  const sanitized: ClientMessage[] = [];
  for (const m of incoming) {
    if (m.role !== 'user' && m.role !== 'assistant') continue;
    if (typeof m.content !== 'string') continue;
    let c = m.content;
    if (m.role === 'user') {
      c = c.slice(0, MAX_USER_MSG);
      if (looksInjected(c)) {
        return jsonResponse({
          message:
            "I only discuss Prasham's portfolio, sir. Ask me about a project — DETECTive, the gilt-funds analysis, his ATPG work — and I'll oblige.",
        });
      }
    }
    sanitized.push({ role: m.role, content: c });
  }

  if (sanitized.length === 0 || sanitized[sanitized.length - 1].role !== 'user') {
    return jsonResponse({ error: 'No user message to respond to.' }, { status: 400 });
  }

  try {
    const client = new GoogleGenerativeAI(apiKey);
    const model = client.getGenerativeModel({
      model: MODEL,
      systemInstruction: systemPrompt(content),
    });

    const result = await model.generateContent({
      contents: sanitized.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: 600, temperature: 0.4 },
    });

    const text = result.response.text().trim();
    return jsonResponse({ message: text });
  } catch (err) {
    // Server-side log only — never echoed in the response.
    console.error('[alfred] gemini call failed:', err);
    return jsonResponse(
      { error: 'Alfred could not reach the source. Try again in a moment.' },
      { status: 502 },
    );
  }
}
