'use client';

import Link from 'next/link';
import { RequireAuth } from '../../../components/RequireAuth';
import { useLocale } from 'next-intl';
import { Card, EmptyState } from '@landmap/ui';
import { Building2, MapPin, Star, X } from '../../../components/lovable/icons';
import { useFavorites } from '../../../lib/favorites';
import { REGIONS, fmtBRL } from '../../../lib/regions-data';

type FavoriteProperty = {
  id: string;
  address: string;
  totalPrice: number;
  pricePerSqm: number;
  regionName: string;
  confidence: number;
};

const PROPERTY_LOOKUP: Record<string, FavoriteProperty> = {
  p1: { id: 'p1', address: 'Av. Beira Mar, 2500 — Meireles', totalPrice: 1850000, pricePerSqm: 9200, regionName: 'Meireles', confidence: 5 },
  p2: { id: 'p2', address: 'Rua Silva Paulet, 1200 — Aldeota', totalPrice: 1320000, pricePerSqm: 8100, regionName: 'Aldeota', confidence: 4 },
  p3: { id: 'p3', address: 'Av. Washington Soares, 800 — Dionísio Torres', totalPrice: 980000, pricePerSqm: 7600, regionName: 'Dionísio Torres', confidence: 3 },
};

const fmtPerSqm = (v: number) => `${fmtBRL(v)} /m²`;

function ConfidenceStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Confiança ${value} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < value ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
          }`}
          fill={i < value ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

function FavoritesPageInner() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const { ids, hydrated, toggle } = useFavorites();

  const regions = REGIONS.filter((r) => ids.includes(r.id));
  const properties = ids.map((id) => PROPERTY_LOOKUP[id]).filter(Boolean) as FavoriteProperty[];

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl space-y-8">
        <header>
          <p className="text-sm font-medium text-[var(--primary)]">Meus favoritos</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Terrenos e regiões salvos</h1>
        </header>
        <EmptyState title="Carregando seus favoritos…" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">Meus favoritos</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Terrenos e regiões salvos
          </h1>
        </div>
        <Link
          href={lh('/regions')}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90"
        >
          Ver regiões
        </Link>
      </header>

      {/* Regiões favoritas */}
      <section>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          <h2 className="text-base font-semibold">Regiões favoritas</h2>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {regions.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                title="Nenhuma região favoritada ainda."
                description="Toque na estrela em Regiões para salvar bairros aqui."
              />
            </div>
          ) : (
            regions.map((region) => (
              <Card key={region.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--foreground)]">{region.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {fmtPerSqm(region.avgObservedPrice)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(region.id)}
                    aria-label="Remover região dos favoritos"
                    className="rounded-md p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--destructive)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <ConfidenceStars value={region.confidence} />
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {region.dataPoints} dados
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </section>

      {/* Terrenos favoritos */}
      <section>
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <h2 className="text-base font-semibold">Terrenos favoritos</h2>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {properties.length === 0 ? (
            <div className="col-span-full">
              <EmptyState title="Nenhum terreno favoritado ainda." />
            </div>
          ) : (
            properties.map((property) => (
              <Card key={property.id}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                      <p className="truncate font-semibold text-[var(--foreground)]">
                        {property.address}
                      </p>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-[var(--muted-foreground)]">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {property.regionName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggle(property.id)}
                    aria-label="Remover terreno dos favoritos"
                    className="rounded-md p-2 text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--destructive)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="font-semibold text-[var(--foreground)]">
                    {fmtBRL(property.totalPrice)}
                  </span>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {fmtPerSqm(property.pricePerSqm)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-0.5">
                  <ConfidenceStars value={property.confidence} />
                </div>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <RequireAuth>
      <FavoritesPageInner />
    </RequireAuth>
  );
}
