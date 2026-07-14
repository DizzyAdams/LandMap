import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ScrollToTop } from '../../components/ScrollToTop';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { ToastProvider } from '@landmap/ui';
import { ShellSwitch } from '../../components/ShellSwitch';
import '@landmap/ui/styles.css';
import '../../app/globals.css';

export const dynamic = 'force-dynamic';

export const viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light',
};

export function generateStaticParams() {
  return ['pt-BR', 'en-US', 'es-ES'].map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://landmapprod.vercel.app';

  // Localized home title/description (1:1 with Lovable + our message files).
  const SEO: Record<string, { title: string; description: string }> = {
    'pt-BR': {
      title: 'LandMap — Inteligência de terrenos',
      description:
        'LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² para decisões de terreno no Brasil.',
    },
    'en-US': {
      title: 'LandMap — Land intelligence',
      description:
        'LandMap: appreciation map, region ranking and price-per-m² history for smarter land decisions in Brazil.',
    },
    'es-ES': {
      title: 'LandMap — Inteligencia de terrenos',
      description:
        'LandMap: mapa de valorización, ranking de regiones e historial de precio por m² para decisiones de terreno en Brasil.',
    },
  };
  const seo = SEO[locale || 'pt-BR'] || SEO['pt-BR'];

  return {
    title: seo.title,
    description: seo.description,
    metadataBase: new URL(siteUrl),
    manifest: '/manifest.json',
    icons: [
      { url: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: `/${locale}`,
      siteName: 'LandMap',
      type: 'website',
      locale: locale || 'pt-BR',
      images: [
        {
          url: `${siteUrl}/og-image.svg`,
          width: 1200,
          height: 630,
          alt: seo.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [`${siteUrl}/og-image.svg`],
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

  unstable_setRequestLocale(resolvedLocale);

  if (!resolvedLocale) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={resolvedLocale}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--card)] border border-[var(--border)] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[var(--foreground)]"
      >
        Pular para o conteúdo
      </a>
      <style
        dangerouslySetInnerHTML={{
          __html:
            ':focus-visible{outline:2px solid rgba(0,53,148,0.8);outline-offset:2px;border-radius:6px;}',
        }}
      />
      <div className="relative min-h-[100dvh] pb-[88px] text-[var(--foreground)] antialiased md:pb-0">
        {/* Clean static backdrop — cadastral grid on solid ink white */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[var(--background)]" />
          <div className="absolute inset-0 cadastre-grid opacity-[0.03]" />
        </div>
        <ShellSwitch>
          <ToastProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </ToastProvider>
        </ShellSwitch>
        <ScrollToTop />
            </div>
    </NextIntlClientProvider>
  );
}
