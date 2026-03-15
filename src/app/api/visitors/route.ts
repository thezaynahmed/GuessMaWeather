import { NextResponse } from 'next/server';

type Visitor = {
  name: string;
  location: string;
  time: number;
};

// In-memory store (resets on deploy/restart — acceptable for this use case)
let visitors: Visitor[] = [];

// Basic rate limiting: track last POST time per IP
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 10_000; // 10 seconds between posts per IP

/** Strip HTML tags and special characters to prevent XSS */
function sanitize(input: string): string {
  return input
    .replace(/[<>'"&\/\\]/g, '') // Strip HTML-dangerous characters
    .replace(/\s+/g, ' ')       // Collapse whitespace
    .trim();
}

export async function GET() {
  return NextResponse.json(visitors);
}

export async function POST(request: Request) {
  try {
    // Basic rate limiting by IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const now = Date.now();
    const lastPost = rateLimitMap.get(ip) || 0;

    if (now - lastPost < RATE_LIMIT_MS) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const name = sanitize(String(body.name || ''));
    const location = sanitize(String(body.location || ''));

    if (!name || !location) {
      return NextResponse.json(
        { error: 'Name and location are required' },
        { status: 400 }
      );
    }

    // Enforce sane length limits
    const newVisitor: Visitor = {
      name: name.substring(0, 30),
      location: location.substring(0, 100),
      time: now,
    };

    // Deduplicate: don't add if same name+location exists within last 60s
    const isDupe = visitors.some(
      (v) => v.name === newVisitor.name && v.location === newVisitor.location && now - v.time < 60_000
    );

    if (!isDupe) {
      visitors.unshift(newVisitor);
      // Keep only last 10
      if (visitors.length > 10) {
        visitors = visitors.slice(0, 10);
      }
    }

    rateLimitMap.set(ip, now);

    // Cleanup old rate limit entries every 100 requests
    if (rateLimitMap.size > 1000) {
      for (const [key, time] of rateLimitMap) {
        if (now - time > 60_000) rateLimitMap.delete(key);
      }
    }

    return NextResponse.json(visitors);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
