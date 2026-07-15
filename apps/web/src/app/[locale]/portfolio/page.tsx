'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Briefcase, TrendingUp, Sparkles } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const HOLDINGS = [
  { name: 'Terreno Pinheiros', city: 'São Paulo', value: 1_240_000, var: 11.8 },
  { name: 'Lote Batel', city: 'Curitiba', value: 860_000, var: 9.8 },
  { name: 'Área Campeche', city: 'Florianópolis', value: 2_010_000, var: 13.5 },
];

const fmtBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export default function PortfolioPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const total = HOLDINGS.reduce((a, h) => a + h.value, 0);
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/dashboard')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Briefcase className="h-3 w-3" />
          Carteira
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Sua carteira</h1>
        <p className="mt-2 text-sm text-foreground/60">Valor agregado e valorização dos seus terrenos.</p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Total" value={fmtBRL(total)} />
        <Stat label="Ativos" value={String(HOLDINGS.length)} />
        <Stat label="Valorização" value="+11.2%" trend={11} />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {HOLDINGS.map((h) => (
          <Card key={h.name} variant="interactive">
            <Link href={lh('/sales')} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="truncate font-semibold">{h.name}</p>
                  <Badge variant="outline">{h.city}</Badge>
                </div>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{fmtBRL(h.value)}</p>
              </div>
              <span className="flex items-center gap-1 text-sm font-medium text-primary">
                <TrendingUp className="h-4 w-4" />
                {h.var}%
              </span>
            </Link>
          </Card>
        ))}
      </Reveal>
    </main>
  );
}
