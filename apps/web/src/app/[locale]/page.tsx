import type { Metadata } from 'next';
import { LANDMAP_OG_IMAGE } from '../../lib/og-image';
import OnboardingPage from './onboarding/page';

/**
 * Home pública (`/`) — no Lovable a raiz redireciona/renderiza o onboarding
 * ("Conheça o LandMap"). Mantemos o mesmo conteúdo e metadata autoritativos.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Conheça o LandMap',
    description: 'Como o LandMap ajuda você a decidir sobre terrenos com dados.',
    openGraph: {
      title: 'Conheça o LandMap',
      description: 'Como o LandMap ajuda você a decidir sobre terrenos com dados.',
      url: `/${locale || 'pt-BR'}`,
      type: 'website',
      locale: locale || 'pt-BR',
      images: [
        {
          url: LANDMAP_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: 'Conheça o LandMap',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Conheça o LandMap',
      description: 'Como o LandMap ajuda você a decidir sobre terrenos com dados.',
      images: [LANDMAP_OG_IMAGE],
    },
  };
}

export default function LocaleHomePage() {
  return <OnboardingPage />;
}
