'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Code2, Sparkles } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const ENDPOINTS = [
  { method: 'GET', path: '/api/markdowns', desc: 'Catálogo 3000 · grade, minScore, type=terreno' },
  { method: 'GET', path: '/api/markdowns/:id', desc: 'Dossiê asset schema v2 + comps + nearby' },
  { method: 'GET', path: '/api/geo/autocomplete', desc: 'Type-ahead LandMap + Nominatim BR' },
  { method: 'GET', path: '/api/geo/reverse', desc: 'Reverse + radar de ativos próximos' },
  { method: 'GET', path: '/api/geo/nearby', desc: 'Ativos no raio (haversine, score)' },
  { method: 'GET', path: '/api/market/heatmap', desc: 'Heatmap de preços por bairro' },
  { method: 'GET', path: '/api/opportunities', desc: 'Radar oportunidades (grades A–B)' },
];

export default function DevelopersPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/integrations')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Code2 className="h-3 w-3" />
          Para desenvolvedores
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">API & documentação</h1>
        <p className="mt-2 text-sm text-foreground/60">Leve os dados LandMap para o seu produto.</p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Endpoints" value={String(ENDPOINTS.length)} />
        <Stat label="Cobertura" value="100%" />
        <Stat label="Latência p95" value="120ms" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {ENDPOINTS.map((e) => (
          <Card key={e.path} variant="interactive">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={e.method === 'GET' ? 'info' : 'warning'}>{e.method}</Badge>
                  <code className="truncate font-mono text-sm">{e.path}</code>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{e.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </Reveal>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        Autenticação via chave de API (plano Business).
      </div>
    </main>
  );
}
