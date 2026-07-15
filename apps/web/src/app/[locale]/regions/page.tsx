'use client';

import Link from 'next/link';
import { RequireAuth } from '../../../components/RequireAuth';
import { useLocale } from 'next-intl';
import { Star, GitCompare, MapPinned } from '../../../components/lovable/icons';
import { useFavorites } from '../../../lib/favorites';
import { REGIONS, fmtBRL, fmtPrice } from '../../../lib/regions-data';

function RegionsPageInner() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const { ids, hydrated, isFavorite, toggle } = useFavorites();

  // Compare the user's favorited regions; fall back to all when none selected.
  const compareIds = ids.length > 0 ? ids : REGIONS.map((r) => r.id);
  const compareHref = `${lh('/compare')}?ids=${compareIds.join(',')}`;

  return (
    <div className="mx-auto max-w-7xl space-y-6 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)]">
            <MapPinned className="h-4 w-4" />
            Regiões monitoradas
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Bairros de Fortaleza</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            Preços médios anunciados e observados, faixa estimada e confiança dos dados.
          </p>
        </div>
        <Link
          href={compareHref}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90"
        >
          <GitCompare className="mr-2 h-4 w-4" />
          Comparar regiões
        </Link>
      </header>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr>
                <th className="h-10 w-10 px-2 text-left align-middle font-medium text-[var(--muted-foreground)]">
                  <span className="sr-only">Favoritar</span>
                </th>
                <th className="h-10 px-2 text-left align-middle font-medium text-[var(--muted-foreground)]">
                  Bairro
                </th>
                <th className="h-10 px-2 text-right align-middle font-medium text-[var(--muted-foreground)]">
                  Observado (R$/m²)
                </th>
                <th className="h-10 px-2 text-right align-middle font-medium text-[var(--muted-foreground)]">
                  Faixa estimada
                </th>
                <th className="h-10 px-2 text-right align-middle font-medium text-[var(--muted-foreground)]">
                  Dados
                </th>
                <th className="h-10 px-2 text-left align-middle font-medium text-[var(--muted-foreground)]">
                  Confiança
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {REGIONS.map((region) => {
                const active = hydrated && isFavorite(region.id);
                return (
                  <tr
                    key={region.id}
                    className="border-b transition-colors hover:bg-[var(--muted)]"
                  >
                    <td className="p-2 align-middle">
                      <button
                        type="button"
                        onClick={() => toggle(region.id)}
                        aria-label={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        className="inline-flex items-center justify-center rounded-md p-1 transition-colors hover:bg-[var(--muted)]"
                      >
                        <Star
                          className={`h-4 w-4 ${
                            active ? 'text-warning' : 'text-[var(--muted-foreground)]'
                          }`}
                          fill={active ? 'currentColor' : 'none'}
                        />
                      </button>
                    </td>
                    <td className="p-2 align-middle font-medium">{region.name}</td>
                    <td className="p-2 align-middle text-right tabular-nums font-semibold">
                      {fmtBRL(region.avgObservedPrice)}
                    </td>
                    <td className="p-2 align-middle text-right tabular-nums text-[var(--muted-foreground)]">
                      {fmtPrice(region.minPrice)} – {fmtPrice(region.maxPrice)}
                    </td>
                    <td className="p-2 align-middle text-right tabular-nums">{region.dataPoints}</td>
                    <td className="p-2 align-middle">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < region.confidence
                                ? 'text-[var(--primary)]'
                                : 'text-[var(--muted-foreground)]'
                            }`}
                            fill={i < region.confidence ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function RegionsPage() {
  return (
    <RequireAuth>
      <RegionsPageInner />
    </RequireAuth>
  );
}
