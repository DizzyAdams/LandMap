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
  // Lovable home title shell = product brand (slides still onboarding UI)
  const title = 'LandMap — Inteligência de terrenos';
  const description =
    'LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² para decisões de terreno no Brasil.';
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/${locale || 'pt-BR'}`,
      type: 'website',
      locale: locale || 'pt-BR',
      images: [
        {
          url: LANDMAP_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [LANDMAP_OG_IMAGE],
    },
  };
}

export default function LocaleHomePage() {
  return <OnboardingPage />;
}
