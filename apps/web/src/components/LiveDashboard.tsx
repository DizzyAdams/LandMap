'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { AnimatedNumber } from '@landmap/ui';
import { getStats, getKpi, getCities, type StatsResponse, type KpiResponse, type CityAggregate } from '../lib/api';

const BRLEmerald = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

/* Count-up tween between renders. */
function useCountUp(value: number, duration = 700) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

function Counter({ value, format }: { value: number; format?: (n: number) => string }) {
  const v = useCountUp(value);
  return <span>{format ? format(v) : Math.round(v).toLocaleString('pt-BR')}</span>;
}

function RulerGauge({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 34;
  const circ = 2 * Math.PI * radius;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="84" height="84" viewBox="0 0 84 84" className="rotate-[-90deg]">
        <circle cx="42" cy="42" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="7" fill="none" />
        <motion.circle
          cx="42"
          cy="42"
          r={radius}
          stroke={color}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </svg>
      <span className="-mt-12 text-sm font-semibold tabular-nums" style={{ color }}>
        {Math.round(score)}
      </span>
      <span className="text-[11px] uppercase tracking-wide text-[var(--muted-foreground)]">{label}</span>
    </div>
  );
}

const RULER_COLORS: Record<string, string> = {
  claude: '#34d399',
  jpmorgan: '#60a5fa',
  quantum: '#c084fc',
};

function Pulse({ on }: { on: boolean }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
      <span
        className={`h-2 w-2 rounded-full ${on ? 'bg-[var(--primary)]' : 'bg-neutral-600'}`}
        style={{ boxShadow: on ? '0 0 10px rgba(52,211,153,0.9)' : 'none' }}
      />
      {on ? 'AO VIVO' : 'conectando…'}
    </span>
  );
}

export function LiveDashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [kpi, setKpi] = useState<KpiResponse | null>(null);
  const [cities, setCities] = useState<CityAggregate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string>('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [s, k, c] = await Promise.all([getStats(), getKpi(), getCities()]);
        if (!active) return;
        setStats(s);
        setKpi(k);
        setCities(c.items.slice(0, 8));
        setUpdatedAt(new Date().toLocaleTimeString('pt-BR'));
        setError(null);
        setLive(true);
      } catch (e) {
        if (active) {
          setError((e as Error).message || 'Falha ao carregar dados');
          setLive(false);
        }
      }
    }
    load();
    const id = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const topCity = cities.reduce(
    (a, b) => (b.count > a.count ? b : a),
    cities[0] ?? { city: '-', state: '', count: 0, avgPrice: 0 },
  );

  return (
    <main className="relative min-h-screen bg-[#050505] text-[var(--foreground)]">

      <div className="relative mx-auto max-w-6xl px-6 pt-28 pb-24">
        <div className="flex items-end justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1 text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_rgba(0,53,148,0.35)]" />
              Live Intelligence
            </span>
            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-gradient">
              Mercado em tempo real
            </h1>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Streaming contínuo de KPIs, réguas de investimento e pulsar de cidades.
            </p>
          </div>
          <div className="text-right">
            <Pulse on={live} />
            <p className="mt-1 text-[11px] text-[var(--muted-foreground)]">{updatedAt || '—'}</p>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-300">
            {error} — verifique se a API está em <code>http://localhost:4000</code>.
          </div>
        )}

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Imóveis" value={stats?.totalProperties ?? 0} />
          <StatCard label="Cidades" value={stats?.totalCities ?? 0} />
          <StatCard label="Preço médio" value={stats?.avgPrice ?? 0} format={BRLEmerald} />
          <StatCard label="Preço/m² médio" value={kpi?.kpis.avgPricePerSqm ?? 0} format={BRLEmerald} />
        </div>

        {kpi && (
          <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Réguas de investimento</h2>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Diferentes lentes analíticas sobre o mesmo mercado: crescimento, risco e probabilidade.
            </p>
            <div className="mt-6 flex flex-wrap justify-around gap-6">
              {kpi.rulers.map((r) => (
                <RulerGauge key={r.ruler} score={r.score} label={r.ruler} color={RULER_COLORS[r.ruler] ?? '#34d399'} />
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {kpi.rulers.map((r) => (
                <p key={r.ruler} className="text-sm text-[var(--muted-foreground)]">
                  <span className="font-medium" style={{ color: RULER_COLORS[r.ruler] ?? '#34d399' }}>
                    {r.label}:
                  </span>{' '}
                  {r.commentary}
                </p>
              ))}
            </div>
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Pulsar de cidades</h2>
            {topCity.city !== '-' && (
              <span className="text-xs text-[var(--muted-foreground)]">
                maior inventário: <span className="text-[var(--primary)]">{topCity.city}/{topCity.state}</span>
              </span>
            )}
          </div>
          <div className="mt-5 space-y-3">
            {cities.map((c) => {
              const max = Math.max(1, ...cities.map((x) => x.count));
              const pct = (c.count / max) * 100;
              return (
                <div key={`${c.city}-${c.state}`} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-xs text-[var(--muted-foreground)]">
                    {c.city}/{c.state}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--card)]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-blue-700 to-blue-500"
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs tabular-nums text-[var(--muted-foreground)]">{c.count}</span>
                </div>
              );
            })}
            {cities.length === 0 && <p className="text-xs text-[var(--muted-foreground)]">Aguardando dados do stream…</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  format,
}: {
  label: string;
  value: number;
  format?: (n: number) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"
    >
      <p className="text-2xl font-semibold tabular-nums">
        {format ? <Counter value={value} format={format} /> : <AnimatedNumber value={value} />}
      </p>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">{label}</p>
    </motion.div>
  );
}


