import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Preços | LandMap',
    description: 'Conheça os planos e preços do LandMap. Escolha o ideal para seu negócio: Gratuito, Profissional ou Enterprise.',
    openGraph: {
      title: 'Preços | LandMap',
      description: 'Planos e preços do LandMap.',
      url: `/${locale}/pricing`,
      locale: locale,
    },
  };
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
