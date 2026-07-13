'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkline, Stat, Skeleton, Badge, EmptyState } from '@landmap/ui';
import { SpotlightCard } from '../../../components/SpotlightCard';
import { RealtimeValuator } from '../../../components/RealtimeValuator';
import { getTerrain, type TerrainResponse } from '../../../lib/api';
import { FEATURED_CITIES } from '../../../lib/constants';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat('pt-BR');

const CITIES = FEATURED_CITIES;

/* Anel de score animado, reutilizável e legível. */
function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 34;
  const circ = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="88" height="88" viewBox="0 0 88 88" className="rotate-[-90deg]">
        <circle cx="44" cy="44" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="7" fill="none" />
        <motion.circle
          cx="44"
          cy="44"
          r={r}
          stroke={color}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      </svg>
      <span className="-mt-14 text-lg font-semibold tabular-nums" style={{ color }}>
        {Math.round(score)}
      </span>
      <span className="mt-6 text-[11px] uppercase tracking-wide text-[var(--muted-foreground)]">{label}</span>
    </div>
  );
}

function scoreColor(v: number): string {
  if (v >= 75) return '#34d399';
  if (v >= 55) return '#22d3ee';
  if (v >= 40) return '#c084fc';
  return '#f59e0b';
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: 'up' | 'down';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-5"
    >
      <p
        className={`ledger-num text-2xl font-semibold tabular-nums ${
          accent === 'up' ? 'text-emerald-300' : accent === 'down' ? 'text-red-400' : 'text-neutral-50'
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-[var(--muted-foreground)]">{sub}</p>}
    </motion.div>
  );
}


export default function TerrenosPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'pt-BR';

  const [city, setCity] = useState('Curitiba');
  const [input, setInput] = useState('Curitiba');
  const [data, setData] = useState<TerrainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState('');

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getTerrain(city)
      .then((d) => {
        if (!active) return;
        setData(d);
        setUpdatedAt(new Date().toLocaleTimeString('pt-BR'));
      })
      .catch((e: Error) => {
        if (!active) return;
        setError(e.message);
        setData(null);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [city, reloadKey]);

  const series = useMemo(() => data?.trend.map((t) => t.avgPriceM2) ?? [], [data]);
  const trendPct = useMemo(() => {
    if (series.length < 2) return 0;
    const first = series[0];
    const last = series[series.length - 1];
    return first > 0 ? Number((((last - first) / first) * 100).toFixed(1)) : 0;
  }, [series]);

  const kpis = data?.kpis;
  const maxNb = Math.max(1, ...(data?.byNeighborhood.map((n) => n.avgPriceM2) ?? [1]));
  const maxTag = Math.max(1, ...(data?.byTag.map((t) => t.count) ?? [1]));

  return (
    <main className="relative min-h-screen overflow-hidden text-[var(--foreground)]">
      <section className="mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="kicker">Inteligência de terrenos</span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-gradient sm:text-4xl">
              Terrenos & Lotes
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted-foreground)]">
              Tudo que você precisa para escolher um terreno com segurança: preço por m²,
              valorização, potencial de aproveitamento e os melhores lotes — em linguagem simples.
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
              placeholder="Buscar cidade…"
              aria-label="Buscar cidade"
              className="rounded-xl border border-[var(--border)] bg-[var(--card)]/50 px-3 py-2 text-sm text-[var(--foreground)] outline-none focus:border-[var(--primary)]/60"
            />
            <button type="submit" className="btn btn-primary">
              Analisar
            </button>
          </form>
        </div>

        {/* City chips + live badge */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span role="group" aria-label="Escolher cidade" className="flex flex-wrap gap-2">
            {CITIES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={c === city}
                onClick={() => {
                  setCity(c);
                  setInput(c);
                }}
                className={c === city ? 'btn btn-primary' : 'btn btn-ghost'}
              >
                {c}
              </button>
            ))}
          </span>
          {updatedAt && !loading && (
            <span className="chip ml-auto pulse-primary">
              <span
                className="h-2 w-2 rounded-full bg-[var(--primary)]"
                style={{ boxShadow: '0 0 10px rgba(52,211,153,0.9)' }}
              />
              dados vivos · {updatedAt}
            </span>
          )}
        </div>

        {/* Status para leitores de tela */}
        <p className="sr-only" aria-live="polite">
          {loading
            ? `Carregando terrenos de ${city}…`
            : error
              ? `Erro ao carregar terrenos: ${error}`
              : data
                ? `${data.total} terreno${data.total === 1 ? '' : 's'} encontrado${data.total === 1 ? '' : 's'} em ${city}.`
                : ''}
        </p>

        {loading && (
          <div className="mt-10 space-y-6" aria-busy="true">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-56 rounded-xl" />
          </div>
        )}

        {!loading && error && (
          <EmptyState
            className="mt-10"
            title="Não foi possível carregar os terrenos"
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

        {!loading && !error && data && data.total === 0 && (
          <EmptyState
            className="mt-10"
            title={`Nenhum terreno em ${city}`}
            description="Tente outra cidade — sugerimos Curitiba, Rio de Janeiro ou Porto Alegre."
          >
            <button
              type="button"
              onClick={() => {
                setCity('Curitiba');
                setInput('Curitiba');
              }}
              className="btn btn-ghost mt-4"
            >
              Ver Curitiba
            </button>
          </EmptyState>
        )}

        {!loading && kpis && data && (
          <>
            {/* KPIs */}
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <KpiCard label="Terrenos disponíveis" value={num.format(kpis.available)} sub={`de ${num.format(kpis.total)} no total`} />
              <KpiCard label="Preço médio / m²" value={brl.format(kpis.avgPriceM2)} sub={`mediana ${brl.format(kpis.medianPriceM2)}`} />
              <KpiCard label="Área média" value={`${num.format(kpis.avgAreaM2)} m²`} sub={`${num.format(kpis.totalAreaM2)} m² ofertados`} />
              <KpiCard
                label="Valorização média"
                value={`${kpis.avgAppreciationPct > 0 ? '+' : ''}${kpis.avgAppreciationPct}%`}
                sub="histórico dos lotes"
                accent={kpis.avgAppreciationPct >= 0 ? 'up' : 'down'}
              />
            </div>

            {/* Trend + aproveitamento */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 lg:col-span-2">
                <div className="surface glow-dual rounded-xl p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-gradient text-xl font-semibold">
                        Tendência de preço / m² — {data.city}
                      </h2>
                      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                        Média mensal de terrenos · últimos 12 meses
                      </p>
                    </div>
                    <div className="text-right">
                      <Sparkline data={series} width={200} height={52} color="#34d399" aria-label={`Tendência de terrenos em ${data.city}`} />
                      <p className={`mt-1 text-sm font-medium ${trendPct >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                        {trendPct >= 0 ? '▲' : '▼'} {Math.abs(trendPct)}% em 12m
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Stat label="Mais barato / m²" value={brl.format(kpis.minPriceM2)} />
                    <Stat label="Mais caro / m²" value={brl.format(kpis.maxPriceM2)} />
                    <Stat label="Ticket médio" value={brl.format(kpis.avgPrice)} />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="surface rounded-xl p-6">
                  <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Aproveitamento do lote</h2>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Quanto do terreno tende a ser útil para construir (0–100).
                  </p>
                  <div className="mt-4 flex justify-center">
                    <ScoreRing score={kpis.avgBuildScore} label="potencial médio" color={scoreColor(kpis.avgBuildScore)} />
                  </div>
                  <p className="mt-3 text-center text-xs text-[var(--muted-foreground)]">
                    Considera tamanho, loteamento e documentação.
                  </p>
                </div>
              </div>
            </div>

            {/* Rankings */}
            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="surface rounded-xl p-6">
                  <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Bairros por preço / m²</h2>
                  <div className="mt-5 space-y-3">
                    {data.byNeighborhood.map((n) => (
                      <div key={n.name} className="flex items-center gap-3">
                        <span className="w-36 shrink-0 truncate text-xs text-[var(--muted-foreground)]" title={n.name}>
                          {n.name}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--card)]">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-blue-700 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(n.avgPriceM2 / maxNb) * 100}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="w-24 text-right text-xs tabular-nums text-[var(--muted-foreground)]">
                          {brl.format(n.avgPriceM2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <div className="surface rounded-xl p-6">
                  <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Características dos lotes</h2>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    O que está mais presente nas ofertas de terrenos.
                  </p>
                  <div className="mt-5 space-y-3">
                    {data.byTag.map((t) => (
                      <div key={t.tag} className="flex items-center gap-3">
                        <span className="w-32 shrink-0 truncate text-xs capitalize text-[var(--muted-foreground)]">
                          {t.tag}
                        </span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--card)]">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-violet-400 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(t.count / maxTag) * 100}%` }}
                            transition={{ duration: 0.7, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs tabular-nums text-[var(--muted-foreground)]">{t.count}</span>
                      </div>
                    ))}
                    {data.byTag.length === 0 && (
                      <p className="text-xs text-[var(--muted-foreground)]">Sem características catalogadas.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>


            {/* Simulador ao vivo */}
            <div className="mt-6">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
                <RealtimeValuator basePpm2={kpis.avgPriceM2} defaultType="terreno" defaultArea={kpis.avgAreaM2} />
              </div>
            </div>

            {/* Melhores terrenos */}
            <section className="mt-10">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-gradient text-xl font-semibold">Melhores terrenos em {city}</h2>
                  <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                    Ranqueados por custo-benefício, tamanho, valorização e prontidão.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {data.plots.length >= 2 && (
                    <Link
                      href={`/${locale}/compare?ids=${data.plots.slice(0, 3).map((p) => p.id).join(',')}`}
                      className="btn btn-ghost"
                    >
                      Comparar top 3 ⚖️
                    </Link>
                  )}
                  <Link href={`/${locale}/map`} className="btn btn-ghost">
                    Ver no mapa →
                  </Link>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.plots.map((p, idx) => (
                  <SpotlightCard key={p.id}>
                    <Link
                      href={`/${locale}/property/${p.id}`}
                      className="block rounded-xl p-5 transition duration-300 group-hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[var(--foreground)]">{p.title}</p>
                          <p className="mt-0.5 truncate text-xs text-[var(--muted-foreground)]">
                            {p.neighborhood} · {p.state}
                          </p>
                        </div>
                        <span
                          className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold tabular-nums"
                          style={{ color: scoreColor(p.score), background: 'rgba(255,255,255,0.05)' }}
                          title="Nota geral 0–100"
                        >
                          {idx < 3 ? '★ ' : ''}
                          {p.score}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <Stat label="Preço" value={brl.format(p.price)} />
                        <Stat label="Preço / m²" value={brl.format(p.pricePerM2)} />
                        <Stat label="Área" value={`${num.format(p.areaM2)} m²`} />
                        <Stat
                          label="Valorização"
                          value={`${p.appreciationPct > 0 ? '+' : ''}${p.appreciationPct}%`}
                        />
                      </div>

                      <ul className="mt-4 space-y-1.5">
                        {p.reasons.map((r) => (
                          <li key={r} className="flex items-start gap-2 text-xs text-[var(--muted-foreground)]">
                            <span className="mt-0.5 text-[var(--primary)]">✓</span>
                            {r}
                          </li>
                        ))}
                      </ul>

                      {p.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {p.tags.slice(0, 3).map((t) => (
                            <Badge key={t} className="capitalize">
                              {t}
                            </Badge>
                          ))}
                          {!p.available && <Badge>indisponível</Badge>}
                        </div>
                      )}
                    </Link>
                  </SpotlightCard>
                ))}
              </div>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

