import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge, Card, Button } from '@landmap/ui';
import { Reveal, Stagger } from '../../../../components/Motion';
import { SpotlightCard } from '../../../../components/SpotlightCard';
import { getProperty, type Property } from '../../../../lib/api';
import { localeHref } from '../../../../lib/locale';
import { SocialProof } from '../../../../components/SocialProof';
import { UrgencyTimer } from '../../../../components/UrgencyTimer';
import { PriceAnchoring } from '../../../../components/PriceAnchoring';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string; id?: string }> }): Promise<Metadata> {
  const resolved = await params;
  const id = resolved.id;
  let property;
  try {
    property = await getProperty(id || '');
  } catch {
    return { title: 'Imóvel não encontrado' };
  }

  if (!property) {
    return { title: 'Imóvel não encontrado' };
  }

  return {
    title: `${property.title} | LandMap`,
    description: `${property.title} em ${property.city}/${property.state} — ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.price)}. ${property.areaM2} m².`,
    openGraph: {
      title: `${property.title} | LandMap`,
      description: `${property.title} em ${property.city}/${property.state}.`,
      url: localeHref(`/property/${property.id}`, resolved.locale),
      type: 'website',
    },
  };
}

const modalityVariant = {
  venda: 'info' as const,
  aluguel: 'warning' as const,
  lancamento: 'success' as const,
};

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

export default async function PropertyPage({ params }: { params: Promise<{ locale?: string; id?: string }> }) {
  const resolved = await params;
  const id = resolved.id;
  let property;
  try {
    property = await getProperty(id || '');
  } catch {
    property = undefined;
  }

  if (!property) {
    notFound();
  }

  const priceText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(property.price);
  const mapQuery = encodeURIComponent(`${property.title} ${property.city} ${property.state}`);
  const originalPrice = Math.round(property.price * 1.2); // mock original price 20% higher

  return (
    <main className="min-h-screen grid-bg text-neutral-50">
      <section className="mx-auto max-w-6xl px-6 py-16">
        {/* Dark patterns row */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <SocialProof propertyId={property.id} />
          <UrgencyTimer expiresInMinutes={1440} />
          <PriceAnchoring originalPrice={originalPrice} currentPrice={property.price} />
        </div>

        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-neutral-500">Imóvel</p>
              <h1 className="text-2xl font-semibold tracking-tight">{property.title}</h1>
              <p className="mt-2 text-sm text-neutral-400">
                {property.city}, {property.state} · {property.areaM2} m²
                {property.bedrooms ? ` · ${property.bedrooms} quarto(s)` : ''}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={modalityVariant[property.modality] || 'default'}>
                {property.modality}
              </Badge>
              <Badge variant="default" className="capitalize">
                {property.type}
              </Badge>
            </div>
          </div>
        </Reveal>

        <Stagger className="mt-8 grid gap-3 sm:grid-cols-3">
          <Card variant="default" className="sm:col-span-2">
            <p className="text-xs text-neutral-500">Valor</p>
            <p className="mt-1 text-2xl font-medium">{priceText}</p>
            <p className="mt-4 text-xs text-neutral-500">Disponibilidade</p>
            <p className="mt-1 text-sm text-neutral-300">{property.available ? 'Disponível' : 'Indisponível'}</p>
          </Card>
          <Card variant="default">
            <p className="text-xs text-neutral-500">Localização</p>
            <a
              className="mt-2 block text-sm text-neutral-300 underline decoration-neutral-700 underline-offset-4 transition hover:text-white"
              href={`https://www.google.com/maps/search/?api=1&q=${mapQuery}`}
              target="_blank"
              rel="noreferrer"
            >
              Abrir no mapa
            </a>
            <Link
              className="mt-4 block text-xs text-neutral-400 underline decoration-neutral-700 underline-offset-4 transition hover:text-white"
              href={`/${resolved.locale}/map?q=${encodeURIComponent(property.city)}`}
            >
              Ver mapa da cidade
            </Link>
          </Card>
        </Stagger>

        <div className="mt-6 flex gap-3">
          <Link href={`/${resolved.locale}/search`}>
            <Button variant="ghost">Voltar para busca</Button>
          </Link>
          <Link href={`/${resolved.locale}`}>
            <Button variant="outline">Home</Button>
          </Link>
        </div>

        {/* Imóveis Similares */}
        <SimilarProperties
          city={property.city}
          price={property.price}
          currentId={property.id}
          locale={resolved.locale || 'pt-BR'}
        />
      </section>
    </main>
  );
}

/* ─── Similar Properties ─── */

const SIMILAR_PRICE_RANGE = 0.3; // ±30%

async function SimilarProperties({
  city,
  price,
  currentId,
  locale,
}: {
  city: string;
  price: number;
  currentId: string;
  locale: string;
}) {
  let similar: Property[] = [];
  try {
    const { searchProperties } = await import('../../../../lib/api');
    const res = await searchProperties({ city });
    similar = res.items
      .filter((p) => p.id !== currentId && Math.abs(p.price - price) / price <= SIMILAR_PRICE_RANGE)
      .slice(0, 3);
  } catch {
    // silently fail
  }

  if (similar.length === 0) return null;

  return (
    <section className="mt-12">
      <Reveal>
        <h2 className="text-lg font-semibold tracking-tight text-gradient">
          Imóveis Similares
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          Outras opções em {city} com preço próximo.
        </p>
      </Reveal>
      <ul role="list" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {similar.map((item) => (
          <li key={item.id}>
            <SpotlightCard>
              <Link
                href={`/${locale}/property/${item.id}`}
                className="block rounded-xl p-5 transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.01]"
              >
                <p className="text-sm text-neutral-300">{item.title}</p>
                <p className="mt-1 text-xs text-neutral-500">
                  {item.city}, {item.state} · {item.areaM2} m²
                  {item.bedrooms ? ` · ${item.bedrooms} quarto(s)` : ''}
                </p>
                <p className="mt-3 text-sm font-medium text-neutral-100">
                  {formatBRL(item.price)}
                </p>
              </Link>
            </SpotlightCard>
          </li>
        ))}
      </ul>
    </section>
  );
}
