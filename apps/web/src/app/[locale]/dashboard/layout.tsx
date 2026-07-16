import type { Metadata } from 'next';
import { LANDMAP_OG_IMAGE } from '../../../lib/og-image';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://landmapprod.vercel.app';
  return {
    title: 'Mapa — LandMap',
    description: 'Inteligência territorial premium: heatmap de valorização, score LandMap por região e análise em tempo real.',
    openGraph: {
      title: 'Mapa — LandMap',
      description: 'Inteligência territorial premium: heatmap de valorização, score LandMap por região e análise em tempo real.',
      url: `/${locale}/dashboard`,
      type: 'website',
      locale: locale,
      images: [{ url: LANDMAP_OG_IMAGE, width: 1200, height: 630, alt: 'Mapa — LandMap' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Mapa — LandMap',
      description: 'Inteligência territorial premium: heatmap de valorização, score LandMap por região e análise em tempo real.',
      images: [LANDMAP_OG_IMAGE],
    },
  };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
