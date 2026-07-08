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
    },
  };
}

export default function CalculatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
