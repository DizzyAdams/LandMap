'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  BellRing,
  MapPin,
  Plus,
  Trash2,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  Star,
} from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { PlanGate } from '../../../components/PlanGate';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Button, Stat, Sparkline, EmptyState, Input } from '@landmap/ui';
import {
  INTELLIGENCE_REGIONS,
  topByValorization,
  fmtPriceSqm,
  fmtDelta,
  scoreLabel,
  type IntelligenceRegion,
} from '../../../lib/mapIntelligence';

const WATCH_KEY = 'landmap:watchlist';
const ALERTS_KEY = 'landmap:alerts';
const SUGGEST_CAP = 12;

function readIds(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* ignore */
  }
}

function gradeFor(score: number): {
  label: string;
  variant: 'success' | 'warning' | 'destructive';
} {
  const label = scoreLabel(score);
  if (score >= 80) return { label, variant: 'success' };
  if (score >= 50) return { label, variant: 'warning' };
  return { label, variant: 'destructive' };
}

function autoNote(r: IntelligenceRegion): string {
  const attr =
    r.score >= 85
      ? 'Alta atratividade'
      : r.score >= 65
        ? 'Bom potencial'
        : 'Potencial moderado';
  const dir =
    r.priceSqmDelta12m > 0
      ? 'Em valorização'
      : r.priceSqmDelta12m < 0
        ? 'Em queda'
        : 'Estável';
  return `${attr} · ${dir}`;
}

function WatchlistContent() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [watch, setWatch] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setWatch(readIds(WATCH_KEY));
    setAlerts(readIds(ALERTS_KEY));
    setMounted(true);
  }, []);

  const watched = useMemo(
    () => INTELLIGENCE_REGIONS.filter((r) => watch.includes(r.id)),
    [watch],
  );

  const best = topByValorization(1)[0];

  const toggleWatch = (id: string) => {
    setWatch((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      writeIds(WATCH_KEY, next);
      return next;
    });
  };

  const toggleAlert = (id: string) => {
    setAlerts((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      writeIds(ALERTS_KEY, next);
      return next;
    });
  };

  const q = query.trim().toLowerCase();
  const suggestions = INTELLIGENCE_REGIONS.filter(
    (r) =>
      !watch.includes(r.id) &&
      (!q ||
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.state.toLowerCase().includes(q)),
  ).slice(0, SUGGEST_CAP);

  return (
    <>
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Monitoradas" value={mounted ? watch.length : 0} />
        <Stat label="Com alerta" value={mounted ? alerts.length : 0} />
        <Stat
          label="Melhor desempenho"
          value={best ? best.name : '—'}
          hint={best ? fmtDelta(best.priceSqmDelta12m) : undefined}
        />
      </section>

      <Reveal className="mt-8">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-[var(--primary)]" />
          <h2 className="font-display text-lg font-semibold">Regiões monitoradas</h2>
        </div>
      </Reveal>

      {mounted && watched.length === 0 ? (
        <EmptyState
          className="mt-4"
          title="Nenhuma região monitorada"
          description="Adicione regiões abaixo para acompanhar a valorização e receber alertas automáticos."
        />
      ) : (
        <Reveal className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {mounted &&
            watched.map((r) => {
              const up = r.priceSqmDelta12m >= 0;
              const g = gradeFor(r.score);
              const alertOn = alerts.includes(r.id);
              return (
                <Card
                  key={r.id}
                  variant="highlight"
                  className="flex flex-col gap-3 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold leading-tight">{r.name}</p>
                      <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {r.city}, {r.state}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label={alertOn ? 'Desativar alerta' : 'Ativar alerta'}
                      aria-pressed={alertOn}
                      onClick={() => toggleAlert(r.id)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full transition hover:bg-[var(--muted)] motion-reduce:transition-none"
                    >
                      {alertOn ? (
                        <BellRing className="h-4 w-4 text-[var(--primary)]" />
                      ) : (
                        <Bell className="h-4 w-4 text-[var(--muted-foreground)]" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <div>
                      <p className="text-xs text-[var(--muted-foreground)]">Preço m²</p>
                      <p className="text-xl font-semibold tabular-nums">
                        {fmtPriceSqm(r.priceSqm)}
                      </p>
                    </div>
                    <p
                      className={`inline-flex items-center gap-1 text-sm font-medium tabular-nums ${
                        up ? 'text-[var(--primary)]' : 'text-[var(--destructive)]'
                      }`}
                    >
                      {up ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      {fmtDelta(r.priceSqmDelta12m)}
                    </p>
                  </div>

                  <Sparkline
                    data={r.priceHistory.map((p) => p.value)}
                    color={up ? 'var(--primary)' : 'var(--destructive)'}
                    width={200}
                    height={32}
                    className="w-full"
                    aria-label={`Histórico de preço de ${r.name}`}
                  />

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={g.variant}>{g.label}</Badge>
                    <span className="inline-flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
                      <Star className="h-3 w-3 text-[var(--primary)]" />
                      Score {r.score}
                    </span>
                  </div>

                  <p className="rounded-md bg-[var(--card)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
                    {autoNote(r)}
                  </p>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 w-full"
                    onClick={() => toggleWatch(r.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remover
                  </Button>
                </Card>
              );
            })}
        </Reveal>
      )}

      <Reveal className="mt-8">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-[var(--primary)]" />
          <h2 className="font-display text-lg font-semibold">Adicionar região</h2>
        </div>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Busque e monitore novas regiões. Você recebe notas automáticas e alertas
          de valorização.
        </p>
      </Reveal>

      <div className="mt-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar bairro, cidade ou estado…"
          aria-label="Buscar região"
        />
      </div>

      {suggestions.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--muted-foreground)]">
          Todas as regiões disponíveis já estão monitoradas ou não houve resultado para
          a busca.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {suggestions.map((r) => (
            <Card
              key={r.id}
              variant="interactive"
              className="flex items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{r.name}</p>
                <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">
                  {r.city}, {r.state} · {fmtPriceSqm(r.priceSqm)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleWatch(r.id)}
                aria-label={`Adicionar ${r.name} aos monitorados`}
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

export default function WatchlistPage() {
  return (
    <ProductPageShell
      backHref="/plans"
      eyebrow={
        <>
          <Sparkles className="h-3 w-3" /> Relatórios monitorados
        </>
      }
      title="Regiões monitoradas"
      description="Acompanhe regiões com notas automáticas e alertas de valorização. Monitore o mercado sem esforço."
      maxWidth="7xl"
    >
      <PlanGate required="plus">
        <WatchlistContent />
      </PlanGate>
    </ProductPageShell>
  );
}
