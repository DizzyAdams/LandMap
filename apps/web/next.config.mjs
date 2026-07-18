import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  reactStrictMode: true,
  transpilePackages: ['@landmap/sales'],
  experimental: {
    // typedRoutes kept off to avoid build friction across the large route tree
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 768, 1024, 1280, 1536],
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
  async headers() {
    // CSP: app is self-contained (static + /api). Only external dependency is
    // Google Fonts. Live integrations (IBGE/ViaCEP/etc.) live in the Hono API
    // package and are proxied through /api/*, so no third-party host is needed.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.vercel.app",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    return [
      {
        // Static assets (hashed by Next) — long browser/CDN cache.
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff2|woff|ttf|css|js|json|map)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Everything else — no stale cache; dynamic per-locale content.
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Content-Security-Policy', value: csp },
          { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=60, stale-while-revalidate=300' },
        ],
      },
    ];
  },
};

export default createNextIntlPlugin('./src/i18n.ts')(nextConfig);
