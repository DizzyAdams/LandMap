'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useMemo } from 'react';
import {
  ArrowLeft,
  BellRing,
  LandMapWordmark,
  TrendingUp,
  MapPin,
} from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, buttonVariants, cn } from '@landmap/ui';
import {
  INTELLIGENCE_REGIONS,
  topByLayer,
  topOpportunities,
} from '../../../lib/mapIntelligence';

type AlertItem = {
  id: string;
  title: string;
  body: string;
  severity: 'alta' | 'media' | 'baixa';
  region: string;
  kind: string;
};

export default function AlertsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  const alerts = useMemo((): AlertItem[] => {
    const hot = topByLayer('valorization', 3);
    const opp = topOpportunities(3);
    const flood = INTELLIGENCE_REGIONS.filter((r) => r.floodRisk === 'alto');
    const list: AlertItem[] = [];
    hot.forEach((r, i) => {
      list.push({
        id: `val-${r.id}`,
        title: `Alta valorização em ${r.name}`,
        body: `Camada Valorização m² em ${r.layerScores.valorization} — top ${i + 1} da região.`,
        severity: i === 0 ? 'alta' : 'media',
        region: r.name,
        kind: 'valorizacao_yoy',
      });
    });
    opp.forEach((r) => {
      list.push({
        id: `opp-${r.id}`,
        title: `Oportunidade: ${r.name}`,
        body: `Score LandMap ${r.score} com crescimento ${r.layerScores.growth ?? '—'}.`,
        severity: r.score >= 88 ? 'alta' : 'media',
        region: r.name,
        kind: 'zona_quente',
      });
    });
    flood.forEach((r) => {
      list.push({
        id: `flood-${r.id}`,
        title: `Risco enchente: ${r.name}`,
        body: `Camada risco enchente marcada como alto — revisar antes de ofertar.`,
        severity: 'alta',
        region: r.name,
        kind: 'risco',
      });
    });
    return list;
  }, []);

  const alta = alerts.filter((a) => a.severity === 'alta').length;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link
          href={lh('/dashboard')}
          aria-label="Voltar"
          className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <BellRing className="h-3 w-3" />
          Alertas
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">
          Alertas de inteligência
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          Derivados das camadas do mapa — valorização, oportunidades e risco.
        </p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Ativos" value={String(alerts.length)} />
        <Stat label="Alta" value={String(alta)} />
        <Stat label="Regiões" value={String(INTELLIGENCE_REGIONS.length)} />
      </section>

      <div className="mt-4 flex gap-2">
        <Link href={lh('/dashboard')} className={cn(buttonVariants({ size: 'sm' }))}>
          Mapa
        </Link>
        <Link href={lh('/kpis')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          KPIs
        </Link>
      </div>

      <Reveal className="mt-6 space-y-3">
        {alerts.map((a) => (
          <Card key={a.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{a.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {a.region} · {a.kind}
                </p>
              </div>
              <Badge
                variant={
                  a.severity === 'alta' ? 'destructive' : a.severity === 'media' ? 'warning' : 'outline'
                }
              >
                {a.severity}
              </Badge>
            </div>
            <Link
              href={lh('/dashboard')}
              className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary"
            >
              <TrendingUp className="h-3 w-3" />
              Ver no mapa intelligence
            </Link>
          </Card>
        ))}
      </Reveal>
    </main>
  );
}
