import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://landmapprod.vercel.app';
  return {
    title: 'Comparação de regiões — LandMap',
    description: 'LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² para decisões de terreno no Brasil.',
    openGraph: {
      title: 'Comparação de regiões — LandMap',
      description: 'LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² para decisões de terreno no Brasil.',
      url: `/${locale}/compare`,
      type: 'website',
      locale: locale,
      images: [{ url: `${siteUrl}/og-image.svg`, width: 1200, height: 630, alt: 'Comparação de regiões — LandMap' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Comparação de regiões — LandMap',
      description: 'LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² para decisões de terreno no Brasil.',
      images: [`${siteUrl}/og-image.svg`],
    },
  };
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
