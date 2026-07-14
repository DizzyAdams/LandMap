'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import {
  Building2,
  MapPin,
  Star,
} from '../../../components/lovable/icons';

type FavoriteRegion = {
  id: string;
  name: string;
  avgObservedPrice: number;
  confidence: number;
  dataPoints: number;
};

type FavoriteProperty = {
  id: string;
  address: string;
  totalPrice: number;
  pricePerSqm: number;
  regionName: string;
  confidence: number;
};

const FAVORITE_REGIONS: FavoriteRegion[] = [
  { id: 'r1', name: 'Meireles', avgObservedPrice: 9500, confidence: 5, dataPoints: 1840 },
  { id: 'r2', name: 'Aldeota', avgObservedPrice: 8200, confidence: 5, dataPoints: 1520 },
  { id: 'r3', name: 'Dionísio Torres', avgObservedPrice: 7800, confidence: 4, dataPoints: 1310 },
  { id: 'r4', name: 'Cocó', avgObservedPrice: 7500, confidence: 4, dataPoints: 1120 },
];

const FAVORITE_PROPERTIES: FavoriteProperty[] = [
  {
    id: 'p1',
    address: 'Av. Beira Mar, 2500 — Meireles',
    totalPrice: 1850000,
    pricePerSqm: 9200,
    regionName: 'Meireles',
    confidence: 5,
  },
  {
    id: 'p2',
    address: 'Rua Silva Paulet, 1200 — Aldeota',
    totalPrice: 1320000,
    pricePerSqm: 8100,
    regionName: 'Aldeota',
    confidence: 4,
  },
  {
    id: 'p3',
    address: 'Av. Washington Soares, 800 — Dionísio Torres',
    totalPrice: 980000,
    pricePerSqm: 7600,
    regionName: 'Dionísio Torres',
    confidence: 3,
  },
];

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });

const fmtPerSqm = (v: number) => `${fmtBRL(v)} /m²`;

function ConfidenceStars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Confiança ${value} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < value
              ? 'text-[var(--primary)]'
              : 'text-[var(--muted-foreground)]'
          }`}
          fill={i < value ? 'currentColor' : 'none'}
        />
      ))}
    </div>
  );
}

export default function FavoritesPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  const [regions, setRegions] = useState<FavoriteRegion[]>(FAVORITE_REGIONS);
  const [properties, setProperties] = useState<FavoriteProperty[]>(FAVORITE_PROPERTIES);

  const removeRegion = (id: string) =>
    setRegions((prev) => prev.filter((r) => r.id !== id));
  const removeProperty = (id: string) =>
    setProperties((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
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
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <h2 className="text-base font-semibold">Regiões favoritas</h2>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {regions.length === 0 ? (
            <p className="col-span-full text-sm text-[var(--muted-foreground)]">
              Nenhuma região favoritada ainda.
            </p>
          ) : (
            regions.map((region) => (
              <div
                key={region.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--foreground)]">{region.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      {fmtPerSqm(region.avgObservedPrice)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRegion(region.id)}
                    aria-label="Remover região dos favoritos"
                    className="rounded-md p-2 text-warning transition-colors hover:bg-[var(--muted)] hover:text-warning"
                  >
                    <Star className="h-4 w-4" fill="currentColor" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <ConfidenceStars value={region.confidence} />
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {region.dataPoints} dados
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>


      {/* Terrenos favoritos */}
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          <h2 className="text-base font-semibold">Terrenos favoritos</h2>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {properties.length === 0 ? (
            <p className="col-span-full text-sm text-[var(--muted-foreground)]">
              Nenhum terreno favoritado ainda.
            </p>
          ) : (
            properties.map((property) => (
              <div
                key={property.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"
              >
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
                    onClick={() => removeProperty(property.id)}
                    aria-label="Remover terreno dos favoritos"
                    className="rounded-md p-2 text-warning transition-colors hover:bg-[var(--muted)] hover:text-warning"
                  >
                    <Star className="h-4 w-4" fill="currentColor" />
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
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

