import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Alertas de Imóveis | LandMap',
    description: 'Crie e gerencie alertas personalizados de imóveis no LandMap.',
    openGraph: {
      title: 'Alertas de Imóveis | LandMap',
      description: 'Gerencie seus alertas de imóveis.',
      url: `/${locale}/alerts`,
      locale: locale,
    },
  };
}

export default function AlertsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
