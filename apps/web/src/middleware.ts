import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { i18n } from './i18n';

const intlMiddleware = createMiddleware({
  locales: i18n.locales,
  defaultLocale: i18n.defaultLocale,
  localeDetection: true,
  localePrefix: 'always',
});

// --- Lightweight rate limit (sliding window, in-memory per instance) ---
// Vercel serverless reuses the module scope per instance/region; this is enough
// to blunt brute-force / abuse without an external store. Tune as needed.
const WINDOW_MS = 60_000;
const LIMIT = 120; // requests per IP per minute (covers normal + crawler bursts)
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > LIMIT;
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect API routes: rate-limit + short cache for GET.
  if (pathname.startsWith('/api/')) {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (rateLimited(ip)) {
      return new NextResponse(
        JSON.stringify({ ok: false, error: 'Too many requests.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } },
      );
    }

    const res = NextResponse.next();
    if (req.method === 'GET') {
      // Public read APIs are cached at the edge for 60s; stale served 5min.
      res.headers.set('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
    } else {
      res.headers.set('Cache-Control', 'no-store');
    }
    return res;
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!_next|_vercel|.*\\..*).*)'],
};
