import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';
import { LANDMAP_OG_IMAGE } from '../lib/og-image';

// NOTE: We intentionally do NOT use `next/font` (nor the `geist` package it
// wraps). On this Windows + Node 24 environment, next/font's loader imports a
// generated module by an absolute `c:\\\\...` path, which Node's ESM loader
// rejects with ERR_UNSUPPORTED_ESM_URL_SCHEME — crashing every page render in
// both `next dev` and `next build`. Instead we load **only** DM Sans + Space
// Grotesk via Google Fonts <link> — the same two families as Lovable
// landmap-insight (JetBrains Mono was drift). Map them to `--font-sans` /
// `--font-display` in globals.css; `--font-mono` uses the system mono stack.
// Fully cross-platform (also works on the Linux Vercel build).

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/icon-192.svg',
  },
  openGraph: {
    title: 'LandMap — Inteligência de terrenos',
    description: 'LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² para decisões de terreno no Brasil.',
    type: 'website',
    images: [{ url: LANDMAP_OG_IMAGE, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LandMap — Inteligência de terrenos',
    description: 'LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² para decisões de terreno no Brasil.',
    images: [LANDMAP_OG_IMAGE],
  },
};

// Root layout is the single owner of the <html>/<body> document shell.
// The locale-aware shell (nav, footer, brand background, i18n providers)
// lives in app/[locale]/layout.tsx. Keeping <html>/<body> here — and only
// here — avoids the duplicated/malformed document that breaks hydration.
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- intentional: next/font (geist) crashes on Windows + Node 24 with ERR_UNSUPPORTED_ESM_URL_SCHEME; a <link> in the App Router root layout loads the font globally, not per-page. */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
