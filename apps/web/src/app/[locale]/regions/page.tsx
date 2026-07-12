'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { Star, GitCompare } from '../../../components/lovable/icons';

type Region = {
  id: string;
  name: string;
  avgObservedPrice: number;
  minPrice: number;
  maxPrice: number;
  confidence: number;
  dataPoints: number;
};

const REGIONS: Region[] = [
  { id: '1', name: 'Meireles', avgObservedPrice: 9500, minPrice: 7800, maxPrice: 11200, confidence: 5, dataPoints: 1840 },
  { id: '2', name: 'Aldeota', avgObservedPrice: 8200, minPrice: 6800, maxPrice: 9600, confidence: 5, dataPoints: 1520 },
  { id: '3', name: 'Dionísio Torres', avgObservedPrice: 7800, minPrice: 6400, maxPrice: 9100, confidence: 4, dataPoints: 1310 },
  { id: '4', name: 'Cocó', avgObservedPrice: 7500, minPrice: 6100, maxPrice: 8800, confidence: 4, dataPoints: 1120 },
  { id: '5', name: 'Guararapes', avgObservedPrice: 7000, minPrice: 5600, maxPrice: 8400, confidence: 4, dataPoints: 980 },
  { id: '6', name: 'Praia do Futuro', avgObservedPrice: 6500, minPrice: 5200, maxPrice: 7900, confidence: 3, dataPoints: 870 },
  { id: '7', name: 'Fátima', avgObservedPrice: 5600, minPrice: 4400, maxPrice: 6800, confidence: 3, dataPoints: 760 },
  { id: '8', name: 'Benfica', avgObservedPrice: 5000, minPrice: 3900, maxPrice: 6200, confidence: 3, dataPoints: 640 },
];

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

const fmtPrice = (v: number) => v.toLocaleString('pt-BR');

export default function RegionsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [regions] = useState<Region[]>(REGIONS);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--primary)]">Regiões monitoradas</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Bairros de Fortaleza</h1>
          <p className="mt-1 text-[var(--muted-foreground-lovable)]">
            Preços médios anunciados e observados, faixa estimada e confiança dos dados.
          </p>
        </div>
        <Link
          href={lh('/compare')}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] transition-colors hover:bg-[var(--primary)]/90"
        >
          <GitCompare className="mr-2 h-4 w-4" />
          Comparar regiões
        </Link>
      </header>

      <div className="bg-[var(--card)] border border-[var(--border-lovable)] rounded-lg">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr>
                <th className="h-10 px-2 text-left align-middle font-medium text-[var(--muted-foreground-lovable)]">
                  Bairro
                </th>
                <th className="h-10 px-2 text-right align-middle font-medium text-[var(--muted-foreground-lovable)]">
                  Observado (R$/m²)
                </th>
                <th className="h-10 px-2 text-right align-middle font-medium text-[var(--muted-foreground-lovable)]">
                  Faixa estimada
                </th>
                <th className="h-10 px-2 text-right align-middle font-medium text-[var(--muted-foreground-lovable)]">
                  Dados
                </th>
                <th className="h-10 px-2 text-left align-middle font-medium text-[var(--muted-foreground-lovable)]">
                  Confiança
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {regions.map((region) => (
                <tr
                  key={region.id}
                  className="border-b transition-colors hover:bg-[var(--muted-lovable)]"
                >
                  <td className="p-2 align-middle font-medium">{region.name}</td>
                  <td className="p-2 align-middle text-right tabular-nums font-semibold">
                    {fmtBRL(region.avgObservedPrice)}
                  </td>
                  <td className="p-2 align-middle text-right tabular-nums text-[var(--muted-foreground-lovable)]">
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
                              : 'text-[var(--muted-foreground-lovable)]'
                          }`}
                          fill={i < region.confidence ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
