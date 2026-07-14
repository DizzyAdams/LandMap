import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://landmapprod.vercel.app';
  return {
    title: 'Conheça o LandMap',
    description: 'Como o LandMap ajuda você a decidir sobre terrenos com dados.',
    openGraph: {
      title: 'Conheça o LandMap',
      description: 'Como o LandMap ajuda você a decidir sobre terrenos com dados.',
      url: `/${locale}/onboarding`,
      type: 'website',
      locale: locale,
      images: [{ url: `${siteUrl}/og-image.svg`, width: 1200, height: 630, alt: 'Conheça o LandMap' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Conheça o LandMap',
      description: 'Como o LandMap ajuda você a decidir sobre terrenos com dados.',
      images: [`${siteUrl}/og-image.svg`],
    },
  };
}

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
