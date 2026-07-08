import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Favoritos | LandMap',
    description: 'Seus imóveis favoritos salvos no LandMap.',
    openGraph: {
      title: 'Favoritos | LandMap',
      description: 'Seus imóveis favoritos.',
      url: `/${locale}/favorites`,
      locale: locale,
    },
  };
}

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
