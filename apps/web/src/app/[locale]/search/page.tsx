'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { RequireAuth } from '../../../components/RequireAuth';
import { Reveal } from '../../../components/Motion';
import { SpotlightCard } from '../../../components/SpotlightCard';
import { Search, SlidersHorizontal, X } from '../../../components/lovable/icons';
import {
  searchProperties,
  type Property,
  type SearchQuery,
} from '../../../lib/api';

type SortKey = 'priceAsc' | 'priceDesc' | 'area' | 'date';

function fmtBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);
}

function PropertyCard({ item, locale }: { item: Property; locale: string }) {
  const ppm2 = item.areaM2 ? Math.round(item.price / item.areaM2) : 0;
  return (
    <SpotlightCard>
      <Link
        href={`/${locale}/regions`}
        className="block rounded-xl p-4 transition duration-300 group-hover:-translate-y-1 group-hover:scale-[1.01]"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--foreground)]">{item.title}</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {item.city}, {item.state}
              {item.neighborhood ? ` · ${item.neighborhood}` : ''}
            </p>
          </div>
          <span className="shrink-0 rounded-md border border-[var(--border)] bg-[var(--muted)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">
            {item.type}
          </span>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="font-display text-lg font-bold tabular-nums text-[var(--foreground)]">
              {fmtBRL(item.price)}
            </p>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              {item.areaM2} m² · {fmtBRL(ppm2)}/m²
            </p>
          </div>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-medium ${
              item.available
                ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
            }`}
          >
            {item.modality}
          </span>
        </div>
      </Link>
    </SpotlightCard>
  );
}

function SearchPageInner() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const t = useTranslations('search');

  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<SearchQuery['type'] | 'todos'>('todos');
  const [modalityFilter, setModalityFilter] = useState<SearchQuery['modality'] | 'todos'>('todos');
  const [cityFilter, setCityFilter] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5_000_000);
  const [sort, setSort] = useState<SortKey>('priceAsc');
  const [showFilters, setShowFilters] = useState(false);

  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const ctrl = setTimeout(() => {
      searchProperties({
        q: query.trim() || undefined,
        type: typeFilter === 'todos' ? undefined : typeFilter,
        modality: modalityFilter === 'todos' ? undefined : modalityFilter,
        city: cityFilter.trim() || undefined,
      })
        .then((data) => {
          if (active) setItems(data?.items ?? []);
        })
        .catch(() => {
          if (active) setItems([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 200);
    return () => {
      active = false;
      clearTimeout(ctrl);
    };
  }, [query, typeFilter, modalityFilter, cityFilter]);

  const filtered = useMemo(() => {
    const f = items.filter((it) => it.price >= minPrice && it.price <= maxPrice);
    const sorted = [...f];
    switch (sort) {
      case 'priceAsc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'priceDesc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'area':
        sorted.sort((a, b) => (b.areaM2 || 0) - (a.areaM2 || 0));
        break;
      case 'date':
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
        );
        break;
    }
    return sorted;
  }, [items, minPrice, maxPrice, sort]);

  const hasActiveFilter =
    typeFilter !== 'todos' ||
    modalityFilter !== 'todos' ||
    !!cityFilter.trim() ||
    minPrice > 0 ||
    maxPrice < 5_000_000;

  function resetFilters() {
    setTypeFilter('todos');
    setModalityFilter('todos');
    setCityFilter('');
    setMinPrice(0);
    setMaxPrice(5_000_000);
  }

  return (
    <main className="relative min-h-screen text-[var(--foreground)]">
      <div className="pointer-events-none fixed bottom-4 left-4 z-[999] md:bottom-6 md:left-6">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[var(--border)]/40 bg-[var(--card)]/90 px-3 py-1.5 shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          <span className="font-display text-xs font-bold tracking-tight text-[var(--primary)]">LandMap</span>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--primary)]">{t('title')}</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                {t('title')}
              </h1>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('filters')}</p>
            </div>
            <Link
              href={`/${locale}`}
              className="text-xs text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
            >
              {t('empty') ? 'Voltar para Home' : 'Voltar para Home'}
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="mt-6">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('placeholder')}
                aria-label={t('title')}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--card)] pl-10 pr-4 py-2.5 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)] outline-none transition focus:border-[var(--primary)]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                className={`btn ${showFilters ? 'btn-primary' : 'btn-ghost'} !px-3 !py-1.5 !text-xs`}
              >
                <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5" />
                {t('applyFilters')}
                {hasActiveFilter && (
                  <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                )}
              </button>

              {(['todos', 'apartamento', 'casa', 'terreno', 'comercial'] as const).map((tp) => (
                <button
                  key={tp}
                  type="button"
                  onClick={() => setTypeFilter(tp)}
                  aria-pressed={typeFilter === tp}
                  className={`btn ${typeFilter === tp ? 'btn-primary' : 'btn-ghost'} !px-3 !py-1.5 !text-xs`}
                >
                  {tp === 'todos' ? t('type') : tp}
                </button>
              ))}

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label={t('sortLabel')}
                className="ml-auto rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]"
              >
                <option value="priceAsc">{t('sortPriceAsc')}</option>
                <option value="priceDesc">{t('sortPriceDesc')}</option>
                <option value="area">{t('sortArea')}</option>
                <option value="date">{t('sortDate')}</option>
              </select>
            </div>

            {showFilters && (
              <Reveal>
                <div className="grid gap-4 border-t border-[var(--border)] pt-4 sm:grid-cols-2 lg:grid-cols-4">
                  <label className="flex flex-col gap-1 text-xs text-[var(--muted-foreground)]">
                    {t('modality')}
                    <select
                      value={modalityFilter}
                      onChange={(e) => setModalityFilter(e.target.value as SearchQuery['modality'] | 'todos')}
                      className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    >
                      <option value="todos">{t('modality')}</option>
                      <option value="venda">venda</option>
                      <option value="aluguel">aluguel</option>
                      <option value="lancamento">lançamento</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1 text-xs text-[var(--muted-foreground)]">
                    {t('city')}
                    <input
                      value={cityFilter}
                      onChange={(e) => setCityFilter(e.target.value)}
                      placeholder={t('city')}
                      className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs text-[var(--muted-foreground)]">
                    {t('minPrice')}
                    <input
                      type="number"
                      min={0}
                      step={50000}
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value))}
                      className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-xs text-[var(--muted-foreground)]">
                    {t('maxPrice')}
                    <input
                      type="number"
                      min={0}
                      step={50000}
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]"
                    />
                  </label>

                  {hasActiveFilter && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1 self-end rounded-lg px-3 py-1.5 text-xs text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]"
                    >
                      <X className="h-3.5 w-3.5" /> {t('activeFilter')}
                    </button>
                  )}
                </div>
              </Reveal>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.15} className="mt-6">
          <p className="text-xs text-[var(--muted-foreground)]" aria-live="polite">
            {loading
              ? t('empty')
              : `${filtered.length} ${filtered.length === 1 ? t('result') : t('results')}`}
          </p>
        </Reveal>

        <Reveal delay={0.2} className="mt-4">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--card)]" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
              <p className="text-sm font-medium text-[var(--foreground)]">{t('noResults')}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{t('noProperties')}</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item) => (
                <PropertyCard key={item.id} item={item} locale={locale} />
              ))}
            </div>
          )}
        </Reveal>
      </section>
    </main>
  );
}

export default function SearchPage() {
  return (
    <RequireAuth>
      <SearchPageInner />
    </RequireAuth>
  );
}
