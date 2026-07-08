import type { Metadata } from 'next';
import { AdminSidebar } from '../../../components/AdminSidebar';

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
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar />
      <main className="flex-1 overflow-x-hidden px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
