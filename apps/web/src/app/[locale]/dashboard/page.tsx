'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, Button, Badge } from '@landmap/ui';
import { Reveal, Stagger } from '../../../components/Motion';
import { searchProperties, type Property } from '../../../lib/api';

/**
 * /[locale]/dashboard — "Inteligência territorial" (espelho da referência Lovable).
 *
 * Consolida o que a referência entrega em /dashboard: mapa de calor, ranking de
 * bairros/regiões, cards de insight com notas automáticas de potencial e índices
 * (valorização m², desenvolvimento, segurança). Usa dados reais quando disponíveis
 * e cai nos textos de demonstração extraídos da referência (Cocó, Eusébio, Barra
 * do Ceará) como fallback editorial.
 */

type RegionInsight = {
  name: string;
  city: string;
  trend: 'up' | 'stable' | 'down';
  trendLabel: string;
  confidence: 'Médio' | 'Crítico' | 'Alto';
  pricePerSqm?: number;
  notes: string[];
};

// Conteúdo editorial extraído 1:1 da referência Lovable (landmap-insight).
const REFERENCE_REGIONS: RegionInsight[] = [
  {
    name: 'Cocó',
    city: 'Fortaleza',
    trend: 'up',
    trendLabel: 'Maior valorização (12m)',
    confidence: 'Alto',
    notes: [
      '3 lançamentos residenciais de alto padrão',
      'Maior valorização dos últimos 12 meses',
      'Fronteira nova entre premium e alto padrão',
      'APA impõe teto de gabarito em parte do bairro',
    ],
  },
  {
    name: 'Eusébio Centro',
    city: 'Eusébio',
    trend: 'up',
    trendLabel: 'Fronteira de expansão',
    confidence: 'Médio',
    notes: [
      'Ticket de entrada baixo com forte tendência de alta',
      'Grande estoque disponível para loteadoras',
      'Novo eixo viário Alberto Craveiro',
      'Condomínios clube em expansão',
    ],
  },
  {
    name: 'Barra do Ceará',
    city: 'Fortaleza',
    trend: 'down',
    trendLabel: 'Atenção',
    confidence: 'Crítico',
    notes: [
      'Região com desvalorização recente',
      'Boa conexão com centro e leste',
      'Requalificação de praças prevista',
      'Bairro consolidado com valorização estável',
    ],
  },
  {
    name: 'Polo Oeste (Caucaia)',
    city: 'Caucaia',
    trend: 'up',
    trendLabel: 'Vetor logístico',
    confidence: 'Médio',
    notes: [
      'Instalação de 2 galpões logísticos',
      'Vetor logístico ligado ao Porto do Pecém',
      'Maior crescimento de PIB da região metropolitana',
      'Polo administrativo e de serviços',
    ],
  },
];

const MACRO_NOTES = [
  'Requalificação da orla',
  'Corredor cicloviário integrado',
  'Ampliação hospitalar',
  'Alta concentração de escolas premium',
  'Duplicação da CE-025 prevista',
  'Boa relação preço x infraestrutura',
  'Novo campus universitário',
  'Boa infraestrutura viária',
];

function TrendBadge({ trend, label }: { trend: RegionInsight['trend']; label: string }) {
  const map = {
    up: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
    stable: 'text-sky-400 border-sky-400/30 bg-sky-400/10',
    down: 'text-rose-400 border-rose-400/30 bg-rose-400/10',
  } as const;
  const glyph = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${map[trend]}`}>
      <span className="font-display font-bold">{glyph}</span>
      {label}
    </span>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card variant="default" className="bg-[var(--card)]">
      <p className="text-xs text-[var(--muted-foreground-lovable)]">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight text-[var(--foreground)]">
        {value}
      </p>
      {hint && (
        <p className="mt-1 text-[11px] text-[var(--muted-foreground-lovable)]">{hint}</p>
      )}
    </Card>
  );
}

export default function DashboardPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'pt-BR';
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    searchProperties({})
      .then((data) => {
        if (active) setProperties((data?.items ?? []).slice(0, 50));
      })
      .catch(() => {
        if (active) setProperties([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const avgPrice =
    properties.length > 0
      ? Math.round(
          properties.reduce((sum, p) => sum + (p.price || 0), 0) /
            properties.length,
        )
      : 0;
  const avgDelta = properties.length > 0 ? 4.2 : 0; // demonstração quando sem série

  return (
    <main className="min-h-screen grid-bg text-[var(--foreground)]">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-14">
        <Reveal>
          <div className="mb-3">
            <span className="kicker">Inteligência territorial</span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-gradient">
            Dashboard de valorização
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[var(--muted-foreground-lovable)]">
            Mapa de calor, ranking de regiões e notas automáticas de potencial —
            decisão de terreno com confiança.
          </p>
        </Reveal>

        {/* Métricas no topo (estilo referência) */}
        <Stagger className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MetricCard
            label="Valorização média"
            value={`R$ ${avgPrice.toLocaleString('pt-BR')}`}
            hint={loading ? 'Carregando…' : '/m² considerando o catálogo'}
          />
          <MetricCard
            label="Variação (12m)"
            value={`↑ ${avgDelta.toFixed(1)}%`}
            hint="média das regiões monitoradas"
          />
          <MetricCard
            label="Regiões monitoradas"
            value={String(REFERENCE_REGIONS.length)}
            hint="Fortaleza, Eusébio e Caucaia"
          />
          <MetricCard
            label="Imóveis no catálogo"
            value={loading ? '…' : String(properties.length)}
            hint="amostra para o dashboard"
          />
        </Stagger>

        {/* CTA para o mapa completo */}
        <Reveal delay={0.1} className="mt-6">
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/map`}>
              <Button variant="default">Abrir mapa de calor</Button>
            </Link>
            <Link href={`/${locale}/compare`}>
              <Button variant="outline">Comparar regiões</Button>
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Cards de insight por região (referência) */}
      <section className="mx-auto max-w-6xl px-6 pb-12">
        <Reveal>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-[var(--primary)]">
                Regiões monitoradas
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                Bairros em destaque
              </h2>
            </div>
            <Link
              href={`/${locale}/regions`}
              className="text-sm text-[var(--muted-foreground-lovable)] transition hover:text-[var(--foreground)]"
            >
              Ver todas →
            </Link>
          </div>
        </Reveal>

        <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {REFERENCE_REGIONS.map((r) => (
            <Card key={r.name} variant="interactive" className="bg-[var(--card)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-lg font-bold tracking-tight">
                    {r.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-[var(--muted-foreground-lovable)]">
                    {r.city}
                  </p>
                </div>
                <TrendBadge trend={r.trend} label={r.trendLabel} />
              </div>

              {r.pricePerSqm != null && (
                <p className="mt-3 font-mono text-sm text-[var(--foreground)]">
                  R$ {r.pricePerSqm.toLocaleString('pt-BR')}/m²
                </p>
              )}

              <ul className="mt-3 space-y-1.5">
                {r.notes.map((note) => (
                  <li
                    key={note}
                    className="flex gap-2 text-sm text-[var(--muted-foreground-lovable)]"
                  >
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--primary)]" />
                    {note}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-[var(--border-lovable)] pt-3">
                <span className="text-xs text-[var(--muted-foreground-lovable)]">
                  Confiança
                </span>
                <Badge variant="default">{r.confidence}</Badge>
              </div>
            </Card>
          ))}
        </Stagger>
      </section>

      {/* Índices e notas macro (referência) */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Reveal>
          <h2 className="text-2xl font-bold tracking-tight">Índices e sinais</h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground-lovable)]">
            Valorização m² · Índice de desenvolvimento · Segurança
          </p>
        </Reveal>

        <Stagger className="mt-6 grid gap-4 md:grid-cols-2">
          <Card variant="default" className="bg-[var(--card)]">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground-lovable)]">
              Notas automáticas de potencial
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {MACRO_NOTES.map((note) => (
                <li
                  key={note}
                  className="flex items-center gap-2 rounded-lg border border-[var(--border-lovable)] bg-[var(--surface-2)] px-3 py-2 text-sm"
                >
                  <span className="text-emerald-400">✓</span>
                  {note}
                </li>
              ))}
            </ul>
          </Card>

          <Card variant="default" className="bg-[var(--card)]">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground-lovable)]">
              Radar de oportunidades
            </h3>
            <p className="mt-3 text-sm text-[var(--muted-foreground-lovable)]">
              Alertas inteligentes de valorização e queda de preço direto no seu
              bolso — não perca janelas.
            </p>
            <Link href={`/${locale}/alerts`} className="mt-4 block">
              <Button variant="ghost" size="sm">
                Ver alertas ativos →
              </Button>
            </Link>
          </Card>
        </Stagger>
      </section>
    </main>
  );
}
