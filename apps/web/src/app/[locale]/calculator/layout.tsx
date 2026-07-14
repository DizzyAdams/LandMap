import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Simulador de Financiamento | LandMap',
    description: 'Calcule a parcela mensal e o total de juros do seu financiamento imobiliário.',
    openGraph: {
      title: 'Simulador de Financiamento | LandMap',
      description: 'Simule seu financiamento imobiliário.',
      url: `/${locale}/calculator`,
      locale: locale,
      images: [{ url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://landmapprod.vercel.app'}/og-image.svg`, width: 1200, height: 630, alt: 'Simulador de Financiamento | LandMap' }],
    },
  };
}

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
