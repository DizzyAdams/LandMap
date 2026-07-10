import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ScrollToTop } from '../../components/ScrollToTop';
import { WhatsNewBanner } from '../../components/WhatsNewBanner';
import { ShortcutsHelp } from '../../components/ShortcutsHelp';
import { Cursor } from '../../components/Cursor';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ToastProvider, MobileBottomNav } from '@landmap/ui';
import { CommandPaletteHost } from '../../components/CommandPaletteHost';
import '@landmap/ui/styles.css';
import '../../app/globals.css';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return ['pt-BR', 'en-US', 'es-ES'].map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const title = (messages.landmap as any)?.title || 'LandMap';
  const description = (messages.landmap as any)?.tagline || 'Inteligência imobiliária aberta.';
  // Canonical production origin. Falling back to localhost (the old default)
  // silently shipped `og:url`/`og:image`/canonical pointing at localhost:3000
  // in production, breaking every social preview and canonical tag.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://landmap.com.br';

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    manifest: '/manifest.json',
    icons: [
      { url: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      siteName: 'LandMap',
      type: 'website',
      locale: locale || 'pt-BR',
      images: [
        {
          url: `${siteUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${siteUrl}/og-image.png`],
      creator: '@landmap',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale?: string }>;
}) {
  const { locale } = await params;
  const allowed = ['pt-BR', 'en-US', 'es-ES'];
  const resolvedLocale = allowed.includes((locale as string) || '') ? (locale as string) : 'pt-BR';

  // Make the locale available to next-intl's request scope (getLocale/getMessages)
  // and to the root layout that renders <html lang>. Required because the root
  // layout is not under [locale] and cannot derive the locale from the segment.
  unstable_setRequestLocale(resolvedLocale);

  if (!resolvedLocale) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={resolvedLocale}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-neutral-900"
      >
        Pular para o conteúdo
      </a>
      <WhatsNewBanner />
      <style
        dangerouslySetInnerHTML={{
          __html:
            ':focus-visible{outline:2px solid rgba(52,211,153,0.8);outline-offset:2px;border-radius:6px;}',
        }}
      />
      <div className="relative min-h-[100dvh] pb-[88px] text-neutral-50 antialiased md:pb-0">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[#050505]" />
          <div className="absolute inset-0 aurora" />
          <div className="absolute inset-0 grain opacity-[0.05] mix-blend-overlay" />
        </div>
        <Cursor />
        <Navbar />
        <div id="main-content" tabIndex={-1}>
          <ToastProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </ToastProvider>
        </div>
        <Footer />
        <MobileBottomNav />
        <ScrollToTop />
        <ShortcutsHelp />
        <CommandPaletteHost />
      </div>
    </NextIntlClientProvider>
  );
}
