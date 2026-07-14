import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Badge, Card, Button } from '@landmap/ui';
import { Reveal, Stagger } from '../../../../components/Motion';
import { SpotlightCard } from '../../../../components/SpotlightCard';
import { MapPinned } from '../../../../components/lovable/icons';
import { getProperty, type Property } from '../../../../lib/api';
import { localeHref } from '../../../../lib/locale';
import { formatBRL } from '../../../../lib/format';

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
    description: `${property.title} em ${property.city}/${property.state} — ${formatBRL(property.price)}. ${property.areaM2} m².`,
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

  const priceText = formatBRL(property.price);
  const mapQuery = encodeURIComponent(`${property.title} ${property.city} ${property.state}`);

  return (
    <main className="min-h-screen text-[var(--foreground)]">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="mb-2"><p className="text-sm font-medium text-[var(--primary)]">Imóvel</p></div>
              <h1 className="text-2xl font-semibold tracking-tight">{property.title}</h1>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--muted-foreground)]">
                <MapPinned className="h-4 w-4" />
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

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 mt-8 p-4">
          <Stagger className="grid gap-3 sm:grid-cols-3">
            <Card variant="default" className="sm:col-span-2">
              <p className="text-xs text-[var(--muted-foreground)]">Valor</p>
              <p className="mt-1 text-2xl font-medium">{priceText}</p>
              <p className="mt-4 text-xs text-[var(--muted-foreground)]">Disponibilidade</p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">{property.available ? 'Disponível' : 'Indisponível'}</p>
            </Card>
            <Card variant="default">
              <p className="text-xs text-[var(--muted-foreground)]">Localização</p>
              <a
                className="mt-2 block text-sm text-[var(--muted-foreground)] underline decoration-[var(--border)] underline-offset-4 transition hover:text-[var(--foreground)]"
                href={`https://www.google.com/maps/search/?api=1&q=${mapQuery}`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir no mapa
              </a>
              <Link
                className="mt-4 block text-xs text-[var(--muted-foreground)] underline decoration-[var(--border)] underline-offset-4 transition hover:text-[var(--foreground)]"
                href={`/${resolved.locale}/map?q=${encodeURIComponent(property.city)}`}
              >
                Ver mapa da cidade
              </Link>
            </Card>
          </Stagger>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href={`/${resolved.locale}/search`}>
            <Button variant="ghost" className="">Voltar para busca</Button>
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
        <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
          Imóveis Similares
        </h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
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
                <p className="text-sm text-[var(--muted-foreground)]">{item.title}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {item.city}, {item.state} · {item.areaM2} m²
                  {item.bedrooms ? ` · ${item.bedrooms} quarto(s)` : ''}
                </p>
                <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
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
