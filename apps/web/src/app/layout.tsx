import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { getLocale } from 'next-intl/server';

export const dynamic = 'force-dynamic';

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
    <html lang={locale} className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}
