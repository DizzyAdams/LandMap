import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://landmapprod.vercel.app';
  return {
    title: 'Entrar — LandMap',
    description: 'Acesse a plataforma LandMap ou solicite acesso.',
    openGraph: {
      title: 'Entrar — LandMap',
      description: 'Acesse a plataforma LandMap ou solicite acesso.',
      url: `/${locale}/auth`,
      type: 'website',
      locale: locale,
      images: [{ url: `${siteUrl}/og-image.svg`, width: 1200, height: 630, alt: 'Entrar — LandMap' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Entrar — LandMap',
      description: 'Acesse a plataforma LandMap ou solicite acesso.',
      images: [`${siteUrl}/og-image.svg`],
    },
  };
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
