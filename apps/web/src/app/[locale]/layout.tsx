import { Inter } from 'next/font/google';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { Navbar } from '../../components/Navbar';
import { Footer } from '../../components/Footer';
import { ScrollToTop } from '../../components/ScrollToTop';
import { Cursor } from '../../components/Cursor';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import '@landmap/ui/styles.css';

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] });

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

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

  if (!resolvedLocale) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={resolvedLocale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages} locale={resolvedLocale}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-neutral-900"
          >
            Pular para o conteúdo
          </a>
          <style
            dangerouslySetInnerHTML={{
              __html:
                ':focus-visible{outline:2px solid rgba(52,211,153,0.7);outline-offset:2px;border-radius:6px;}',
            }}
          />
          <div className="relative min-h-screen text-neutral-50 antialiased">
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute inset-0 bg-[#050505]" />
              <div className="absolute inset-0 aurora" />
              <div className="absolute inset-0 grain opacity-[0.05] mix-blend-overlay" />
            </div>
            <Cursor />
            <Navbar />
            <div id="main-content" tabIndex={-1}>
              <ErrorBoundary>{children}</ErrorBoundary>
            </div>
            <Footer />
            <ScrollToTop />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
