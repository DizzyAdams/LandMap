import type { Metadata } from 'next';
import { AdminSidebar } from '../../../components/AdminSidebar';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://landmapprod.vercel.app';
  return {
    title: 'Administração — LandMap',
    description: 'LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² para decisões de terreno no Brasil.',
    openGraph: {
      title: 'Administração — LandMap',
      description: 'LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² para decisões de terreno no Brasil.',
      url: `/${locale}/admin`,
      type: 'website',
      locale: locale,
      images: [{ url: `${siteUrl}/og-image.svg`, width: 1200, height: 630, alt: 'Administração — LandMap' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Administração — LandMap',
      description: 'LandMap: mapa de valorização, ranking de regiões e histórico de preço por m² para decisões de terreno no Brasil.',
      images: [`${siteUrl}/og-image.svg`],
    },
  };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
