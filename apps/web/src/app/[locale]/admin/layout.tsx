import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Admin | LandMap',
    description: 'Painel administrativo do LandMap. Gerencie imóveis, usuários e configurações.',
    openGraph: {
      title: 'Admin | LandMap',
      description: 'Painel administrativo.',
      url: `/${locale}/admin`,
      locale: locale,
    },
  };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
