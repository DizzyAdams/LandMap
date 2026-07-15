'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { ArrowLeft, Sparkles, LineChart } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Input, Button } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function CalculatorPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  const [area, setArea] = useState(500);
  const [pricePerM2, setPricePerM2] = useState(8000);
  const [appreciation, setAppreciation] = useState(8); // % a.a.
  const [years, setYears] = useState(5);

  const total = area * pricePerM2;
  const projected = total * Math.pow(1 + appreciation / 100, years);
  const gain = projected - total;
  const gainPct = total > 0 ? (gain / total) * 100 : 0;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/map')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <LineChart className="h-3 w-3" />
          Calculadora de valoração
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Simule a valorização</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Estime o retorno projetado do seu terreno com base na valorização média da região.
        </p>
      </div>

      <Card className="mt-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted-foreground">Área (m²)</span>
            <Input type="number" value={area} onChange={(e) => setArea(Number(e.target.value) || 0)} className="mt-1" />
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Preço por m² (R$)</span>
            <Input type="number" value={pricePerM2} onChange={(e) => setPricePerM2(Number(e.target.value) || 0)} className="mt-1" />
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Valorização a.a. (%)</span>
            <Input type="number" value={appreciation} onChange={(e) => setAppreciation(Number(e.target.value) || 0)} className="mt-1" />
          </label>
          <label className="block text-sm">
            <span className="text-muted-foreground">Período (anos)</span>
            <Input type="number" value={years} onChange={(e) => setYears(Number(e.target.value) || 0)} className="mt-1" />
          </label>
        </div>
      </Card>

      <Reveal className="mt-6">
        <Card variant="highlight">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <p className="font-semibold">Projeção</p>
            <Badge variant="info">estimada</Badge>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Investimento hoje</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{fmtBRL(total)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valor projetado</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{fmtBRL(projected)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ganho estimado</p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-primary">
                +{gainPct.toFixed(1)}%
              </p>
            </div>
          </div>
          <Link
            href={lh('/plans')}
            className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary-glow"
          >
            Destravar relatório completo
          </Link>
        </Card>
      </Reveal>
    </main>
  );
}
