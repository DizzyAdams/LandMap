'use client';

import { useEffect, useState } from 'react';
import { Sparkline, Stat, Skeleton, EmptyState } from '@landmap/ui';
import { GlowPanel } from '../../../components/GlowPanel';
import { apiUrl } from '../../../lib/api';
import { FEATURED_CITIES } from '../../../lib/constants';

// URL resolvida via apiUrl() (lib/api) — fonte única de verdade, compatível com SSR/origem

type NeighborhoodStat = {
  name: string;
  city: string;
  state: string;
  count: number;
  avgPriceM2: number;
  avgPrice: number;
};

type PriceTrendResponse = {
  city: string;
  type: string;
  currentAvg: number;
  monthly: { month: string; avgPrice: number }[];
};

type NeighborhoodsResponse = {
  city: string;
  type: string;
  total: number;
  items: NeighborhoodStat[];
};

async function fetchMarket<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), { cache: 'no-store' });
  if (!res.ok) throw new Error(`Falha ao buscar ${path} (${res.status})`);
  return (await res.json()) as T;
}

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const CITIES = FEATURED_CITIES;

export default function InsightsPage() {
  const [city, setCity] = useState('Curitiba');
  const [input, setInput] = useState('Curitiba');
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodStat[]>([]);
  const [trend, setTrend] = useState<PriceTrendResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);


  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([
      fetchMarket<NeighborhoodsResponse>(
        `/market/neighborhoods?city=${encodeURIComponent(city)}`,
      ),
      fetchMarket<PriceTrendResponse>(
        `/market/price-trend?city=${encodeURIComponent(city)}&type=apartamento`,
      ),
    ])
      .then(([n, t]) => {
        if (!active) return;
        setNeighborhoods(n.items);
        setTrend(t);
      })
      .catch((e: Error) => {
        if (!active) return;
        setError(e.message);
        setNeighborhoods([]);
        setTrend(null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [city, reloadKey]);

  const series = trend?.monthly.map((m) => m.avgPrice) ?? [];
  const minAvg = series.length ? Math.min(...series) : 0;
  const maxAvg = series.length ? Math.max(...series) : 0;
  const variation = maxAvg > 0 ? ((maxAvg - minAvg) / maxAvg) * 100 : 0;

  return (
    <main className="min-h-screen grid-bg text-neutral-50">
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="kicker">Inteligência de mercado</span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gradient">
              Insights de mercado
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Bairros mais ativos e tendência de preço — dados agregados da LandMap.
            </p>
          </div>
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setCity(input.trim() || 'Curitiba');
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Cidade para análise"
              placeholder="Cidade"
              className="input w-44"
            />
            <button type="submit" className="btn btn-primary">
              Analisar
            </button>
          </form>
        </div>

        <div role="group" aria-label="Escolher cidade" className="mt-4 flex flex-wrap gap-2">
          {CITIES.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCity(c);
                setInput(c);
              }}
              aria-pressed={c === city}
              className={c === city ? 'btn btn-primary' : 'btn btn-ghost'}
            >
              {c}
            </button>
          ))}
        </div>
        {/* Status para leitores de tela */}
        <p className="sr-only" aria-live="polite">
          {loading
            ? `Carregando insights de ${city}…`
            : error
              ? `Erro: ${error}`
              : `${neighborhoods.length} bairro${neighborhoods.length === 1 ? '' : 's'} em ${city}.`}
        </p>



        {loading && (
          <div className="mt-10 space-y-6" aria-busy="true" aria-live="polite">
            <Skeleton className="h-48 rounded-xl" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-xl" />
              ))}
            </div>
          </div>
        )}
        {!loading && error && (
          <EmptyState
            className="mt-10"
            title="Não foi possível carregar os insights"
            description={error}
          >
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="btn btn-primary cta-glow mt-4"
            >
              Tentar de novo
            </button>
          </EmptyState>
        )}

        {!loading && trend && (
          <GlowPanel className="mt-10" as="section">
            <div className="surface glow-dual rounded-xl p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-gradient text-2xl font-semibold">
                  Tendência de preço — {trend.city}
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Média mensal de apartamentos · últimos 12 meses
                </p>
              </div>
              <Sparkline
                data={series}
                width={180}
                height={48}
                color="#34d399"
                aria-label={`Tendência de preço em ${trend.city}`}
              />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Preço atual" value={brl.format(trend.currentAvg)} />
              <Stat label="Mín. 12m" value={brl.format(minAvg)} />
              <Stat label="Máx. 12m" value={brl.format(maxAvg)} />
              <Stat
                label="Variação"
                value={`${variation > 0 ? '+' : ''}${variation.toFixed(1)}%`}
                trend={Number(variation.toFixed(1))}
              />
            </div>
            </div>
          </GlowPanel>
        )}

        {!loading && neighborhoods.length > 0 && (
          <section className="mt-10">
            <h2 className="text-gradient text-xl font-semibold">
              Bairros mais ativos em {city}
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {neighborhoods.map((n) => (
                <article key={n.name} className="surface glow-emerald rounded-xl p-5 panel">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-neutral-50">{n.name}</h3>
                    <span className="badge">{n.count} imóveis</span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <Stat label="Preço/m²" value={brl.format(n.avgPriceM2)} />
                    <Stat label="Preço médio" value={brl.format(n.avgPrice)} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {!loading && !error && neighborhoods.length === 0 && (
          <p className="mt-10 text-sm text-neutral-400">
            Nenhum dado encontrado para {city}.
          </p>
        )}
      </section>
    </main>
  );
}
