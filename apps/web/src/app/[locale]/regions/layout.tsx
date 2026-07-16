import type { Metadata } from 'next';
import { LANDMAP_OG_IMAGE } from '../../../lib/og-image';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://landmapprod.vercel.app';
  return {
    title: 'Regiões — LandMap',
    description: 'LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² para decisões de terreno no Brasil.',
    openGraph: {
      title: 'Regiões — LandMap',
      description: 'LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² para decisões de terreno no Brasil.',
      url: `/${locale}/regions`,
      type: 'website',
      locale: locale,
      images: [{ url: LANDMAP_OG_IMAGE, width: 1200, height: 630, alt: 'Regiões — LandMap' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Regiões — LandMap',
      description: 'LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² para decisões de terreno no Brasil.',
      images: [LANDMAP_OG_IMAGE],
    },
  };
}

export default function RegionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
