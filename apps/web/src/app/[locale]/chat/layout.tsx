import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Chat RAG | LandMap',
    description: 'Converse com o assistente imobiliário do LandMap. Pergunte sobre imóveis, preços e regiões no Brasil.',
    openGraph: {
      title: 'Chat RAG | LandMap',
      description: 'Assistente imobiliário inteligente do LandMap.',
      url: `/${locale}/chat`,
      locale: locale,
      images: [{ url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://landmapprod.vercel.app'}/og-image.svg`, width: 1200, height: 630, alt: 'Chat RAG | LandMap' }],
    },
  };
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
