import type { Metadata } from 'next';
import { LANDMAP_OG_IMAGE } from '../../../lib/og-image';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://landmapprod.vercel.app';
  return {
    title: 'Painel — LandMap',
    description: 'Visão geral do mercado: preço médio m², regiões e score LandMap em um só painel.',
    openGraph: {
      title: 'Painel — LandMap',
      description: 'Visão geral do mercado: preço médio m², regiões e score LandMap em um só painel.',
      url: `/${locale}/dashboard`,
      type: 'website',
      locale: locale,
      images: [{ url: LANDMAP_OG_IMAGE, width: 1200, height: 630, alt: 'Painel — LandMap' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Painel — LandMap',
      description: 'Visão geral do mercado: preço médio m², regiões e score LandMap em um só painel.',
      images: [LANDMAP_OG_IMAGE],
    },
  };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
