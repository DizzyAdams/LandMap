'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, EmptyState } from '@landmap/ui';
import { GitCompare, Star } from '../../../components/lovable/icons';
import { getRegionById, fmtBRL, fmtPrice } from '../../../lib/regions-data';
import { RequireAuth } from '../../../components/RequireAuth';

function CompareInner() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const params = useParams();
  const searchParams = useSearchParams();
  const idsParam = (searchParams.get('ids') as string | null) ?? undefined;
  const ids = idsParam ? idsParam.split(',').filter(Boolean) : [];
  const regions = ids
    .map((id) => getRegionById(id))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  return (
    <div className="mx-auto max-w-7xl space-y-6 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-medium text-[var(--primary)]">
            <GitCompare className="h-4 w-4" />
            Comparação
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Comparar imóveis</h1>
          <p className="mt-1 text-[var(--muted-foreground)]">
            Diff de preço, área e quartos entre os imóveis selecionados.
          </p>
        </div>
        <Link
          href={lh('/regions')}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90"
        >
          Ver regiões
        </Link>
      </header>

      {regions.length === 0 ? (
        <EmptyState
          title="Nenhum imóvel selecionado para comparação."
          description="Selecione imóveis na busca para compará-los lado a lado."
        />
      ) : (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr>
                  <th className="h-10 px-2 text-left align-middle font-medium text-[var(--muted-foreground)]">
                    Região
                  </th>
                  {regions.map((r) => (
                    <th key={r.id} className="h-10 px-2 text-right align-middle font-medium">
                      {r.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                <tr className="border-b">
                  <td className="p-2 align-middle text-[var(--muted-foreground)]">Observado (R$/m²)</td>
                  {regions.map((r) => (
                    <td key={r.id} className="p-2 text-right tabular-nums font-semibold">
                      {fmtBRL(r.avgObservedPrice)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 align-middle text-[var(--muted-foreground)]">Faixa estimada</td>
                  {regions.map((r) => (
                    <td key={r.id} className="p-2 text-right tabular-nums text-[var(--muted-foreground)]">
                      {fmtPrice(r.minPrice)} – {fmtPrice(r.maxPrice)}
                    </td>
                  ))}
                </tr>
                <tr className="border-b">
                  <td className="p-2 align-middle text-[var(--muted-foreground)]">Dados</td>
                  {regions.map((r) => (
                    <td key={r.id} className="p-2 text-right tabular-nums">
                      {r.dataPoints}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-2 align-middle text-[var(--muted-foreground)]">Confiança</td>
                  {regions.map((r) => (
                    <td key={r.id} className="p-2">
                      <div className="flex items-center justify-end gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < r.confidence ? 'text-[var(--primary)]' : 'text-[var(--muted-foreground)]'
                            }`}
                            fill={i < r.confidence ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <Link href={lh('/regions')} className="text-sm text-[var(--primary)] hover:underline">
          Voltar para regiões
        </Link>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <RequireAuth>
      <CompareInner />
    </RequireAuth>
  );
}
