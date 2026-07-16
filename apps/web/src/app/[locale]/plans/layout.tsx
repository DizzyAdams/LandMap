import type { Metadata } from 'next';
import { LANDMAP_OG_IMAGE } from '../../../lib/og-image';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://landmapprod.vercel.app';
  return {
    title: 'Planos — LandMap',
    description: 'Escolha o plano LandMap ideal: Access, Plus, Pro ou Business.',
    openGraph: {
      title: 'Planos — LandMap',
      description: 'Escolha o plano LandMap ideal: Access, Plus, Pro ou Business.',
      url: `/${locale}/plans`,
      type: 'website',
      locale: locale,
      images: [{ url: LANDMAP_OG_IMAGE, width: 1200, height: 630, alt: 'Planos — LandMap' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Planos — LandMap',
      description: 'Escolha o plano LandMap ideal: Access, Plus, Pro ou Business.',
      images: [LANDMAP_OG_IMAGE],
    },
  };
}

export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
