import type { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';
import { searchProperties, type SearchQuery, type Property } from '../../../lib/api';
import { SearchKeyboardShortcuts } from '../../../components/SearchKeyboardShortcuts';
import { EmptyState } from '@landmap/ui';
import { Reveal } from '../../../components/Motion';
import { SpotlightCard } from '../../../components/SpotlightCard';
import { Filters } from './Filters';
import { formatBRL } from '../../../lib/format';

export const dynamic = 'force-dynamic';

const DEFAULT_PAGE_SIZE = 10;

type SortKey = '' | 'price_asc' | 'price_desc' | 'area' | 'date';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Buscar Imóveis | LandMap',
    description: 'Encontre imóveis para compra, aluguel ou lançamento no Brasil. Filtre por tipo, modalidade, localização e preço.',
    openGraph: {
      title: 'Buscar Imóveis | LandMap',
      description: 'Encontre imóveis para compra, aluguel ou lançamento no Brasil.',
      url: `/${locale}/search`,
      locale: locale,
    },
  };
}

function sortProperties(items: Property[], sort: SortKey): Property[] {
  if (!sort) return items;
  const sorted = [...items];
  switch (sort) {
    case 'price_asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'area':
      sorted.sort((a, b) => b.areaM2 - a.areaM2);
      break;
    case 'date':
      sorted.sort((a, b) => {
        const da = a.updatedAt || a.createdAt || '';
        const db = b.updatedAt || b.createdAt || '';
        return db.localeCompare(da);
      });
      break;
  }
  return sorted;
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    type?: string;
    modality?: string;
    city?: string;
    state?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
  }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;

  const query: SearchQuery = {
    q: sp.q,
    type: sp.type as Property['type'] | undefined,
    modality: sp.modality as Property['modality'] | undefined,
    city: sp.city,
    state: sp.state,
  };

  const sort = (sp.sort as SortKey) || '';
  const currentPage = Math.max(1, parseInt(sp.page || '1', 10) || 1);

  let items: Property[] = [];
  let total = 0;
  let error: string | null = null;

  try {
    const response = await searchProperties(query);
    items = response.items;
    total = response.total;
  } catch (err) {
    error = err instanceof Error ? err.message : 'Falha na busca';
  }

  const sorted = sortProperties(items, sort);
  const totalPages = Math.max(1, Math.ceil(sorted.length / DEFAULT_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = sorted.slice((safePage - 1) * DEFAULT_PAGE_SIZE, safePage * DEFAULT_PAGE_SIZE);

  function buildHref(overrides: Record<string, string | undefined>) {
    const p = new URLSearchParams();
    if (sp.q) p.set('q', sp.q);
    if (sp.type) p.set('type', sp.type);
    if (sp.modality) p.set('modality', sp.modality);
    if (sp.city) p.set('city', sp.city);
    if (sp.state) p.set('state', sp.state);
    if (sp.minPrice) p.set('minPrice', sp.minPrice);
    if (sp.maxPrice) p.set('maxPrice', sp.maxPrice);
    Object.entries(overrides).forEach(([k, v]) => {
      if (v !== undefined && v !== '') p.set(k, v);
      else p.delete(k);
    });
    const qs = p.toString();
    return `/${locale}/search${qs ? `?${qs}` : ''}`;
  }

  return (
    <main className="min-h-screen grid-bg text-neutral-50">
      <SearchKeyboardShortcuts />
      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gradient">Buscar imóveis</h1>
              <p className="mt-2 text-sm text-neutral-400">
                Filtros diretamente por tipologia, modalidade, local e faixa de preço.
              </p>
            </div>
            <Link href={`/${locale}`} className="text-xs text-neutral-400 transition hover:text-white">
              Voltar para Home
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-8">
          <Filters
            locale={locale}
            defaults={{
              q: sp.q,
              type: sp.type,
              modality: sp.modality,
              city: sp.city,
              state: sp.state,
              minPrice: sp.minPrice,
              maxPrice: sp.maxPrice,
            }}
          />
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200"
          >
            {error}
          </div>
        ) : (
          <>
            {/* Sort + count bar */}
            <div className="mb-4 flex items-center justify-between text-xs text-neutral-500">
              <span aria-live="polite">
                {sorted.length} resultado{sorted.length === 1 ? '' : 's'}
              </span>
              <div className="flex items-center gap-2">
                <span>Ordenar:</span>
                {[
                  { key: '', label: 'Relevância' },
                  { key: 'price_asc', label: 'Preço ↑' },
                  { key: 'price_desc', label: 'Preço ↓' },
                  { key: 'area', label: 'Área' },
                  { key: 'date', label: 'Data' },
                ].map((opt) => (
                  <a
                    key={opt.key}
                    href={buildHref({ sort: opt.key, page: '1' })}
                    className={`rounded-md px-2 py-1 transition ${
                      sort === opt.key
                        ? 'bg-neutral-800 text-white'
                        : 'hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </a>
                ))}
              </div>
            </div>

            {pageItems.length === 0 ? (
              <EmptyState
                title="Nenhum imóvel encontrado"
                description="Ajuste tipologia, modalidade ou cidade para ver mais opções."
              />
            ) : (
              <ul role="list" className="grid gap-3">
                {pageItems.map((item) => {
                  const pricePerM2 = item.areaM2 > 0 ? Math.round(item.price / item.areaM2) : 0;
                  return (
                    <li key={item.id}>
                      <SpotlightCard>
                        <Link
                          href={`/${locale}/property/${item.id}`}
                          className="block rounded-xl p-5 transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.01]"
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-sm text-neutral-300">{item.title}</p>
                              <p className="mt-1 text-xs text-neutral-500">
                                {item.city}, {item.state} · {item.areaM2} m²
                                {item.bedrooms ? ` · ${item.bedrooms} quarto(s)` : ''}
                              </p>
                            </div>
                            <span className="text-xs text-neutral-400">{item.modality}</span>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {formatBRL(item.price)}
                            </span>
                            <span className="flex items-center gap-2">
                              {pricePerM2 > 0 && (
                                <span className="text-xs text-neutral-500">
                                  {formatBRL(pricePerM2)}/m²
                                </span>
                              )}
                              <span className="text-xs text-neutral-400 capitalize">{item.type}</span>
                            </span>
                          </div>
                        </Link>
                      </SpotlightCard>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-400">
                {safePage > 1 && (
                  <a href={buildHref({ page: String(safePage - 1) })} className="rounded-md border border-neutral-800 px-3 py-1.5 transition hover:border-neutral-500 hover:text-white">
                    Anterior
                  </a>
                )}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center gap-1">
                      {idx > 0 && arr[idx - 1] !== p - 1 && (
                        <span className="px-1 text-neutral-500">...</span>
                      )}
                      {p === safePage ? (
                        <span className="rounded-md bg-neutral-800 px-3 py-1.5 text-white">{p}</span>
                      ) : (
                        <a
                          href={buildHref({ page: String(p) })}
                          className="rounded-md px-3 py-1.5 transition hover:text-white"
                        >
                          {p}
                        </a>
                      )}
                    </span>
                  ))}
                {safePage < totalPages && (
                  <a href={buildHref({ page: String(safePage + 1) })} className="rounded-md border border-neutral-800 px-3 py-1.5 transition hover:border-neutral-500 hover:text-white">
                    Próximo
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
