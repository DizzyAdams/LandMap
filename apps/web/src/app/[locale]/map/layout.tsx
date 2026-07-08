import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Mapa Imobiliário | LandMap',
    description: 'Navegue por imóveis no mapa interativo. Explore localizações, filtre por cidade e visualize dados imobiliários.',
    openGraph: {
      title: 'Mapa Imobiliário | LandMap',
      description: 'Explore imóveis no mapa interativo do LandMap.',
      url: `/${locale}/map`,
      locale: locale,
    },
  };
}

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
