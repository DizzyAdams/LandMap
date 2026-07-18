'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocale } from 'next-intl';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Card, Badge, Button } from '@landmap/ui';
import { Satellite, Minus, Zap, Activity, TrendingUp, TrendingDown } from '../../../components/lovable/icons';
import { apiUrl } from '../../../lib/api';
import { opportunitySeverityColor, OPPORTUNITY_TYPE_LABEL, type Opportunity, type KpiSnapshot } from '../../../lib/opportunities';
import { formatBRL } from '../../../lib/plans';

export default function RadarPage() {
  const locale = useLocale();
  const [ops, setOps] = useState<Opportunity[]>([]);
  const [kpis, setKpis] = useState<KpiSnapshot | null>(null);
  const [live, setLive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string>('');
  const [city, setCity] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async () => {
    try {
      const q = city ? `?city=${encodeURIComponent(city)}` : '';
      const res = await fetch(apiUrl(`/opportunities${q}`), { cache: 'no-store' });
      const data = await res.json();
      setOps(data.opportunities ?? []);
      setKpis(data.kpis ?? null);
      setLastSync(new Date().toLocaleTimeString('pt-BR'));
    } catch {
      /* noop */
    } finally {
      setLoading(false);
    }
  }, [city]);

  useEffect(() => {
    load();
    if (live) {
      timer.current = setInterval(load, 8000);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [load, live]);

  return (
    <ProductPageShell
      backHref={`/${locale}`}
      eyebrow="Radar ao vivo"
      title="Live Market Radar"
      description="Oportunidades de mercado calculadas em tempo real a partir do dataset de 3.000 imóveis."
      maxWidth="7xl"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Badge variant={live ? 'success' : 'secondary'}>
            <span className={`mr-1 h-2 w-2 rounded-full ${live ? 'animate-pulse bg-[var(--success)]' : 'bg-[var(--muted-foreground)]'}`} />
            {live ? 'AO VIVO' : 'PAUSADO'}
          </Badge>
          <span className="text-xs text-[var(--muted-foreground)]">
            {loading ? 'sincronizando…' : `última sync ${lastSync}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Filtrar cidade…"
            className="w-40 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm text-[var(--foreground)] outline-none focus-visible:shadow-[var(--ring)]"
          />
          <Button variant="ghost" onClick={() => setLive((v) => !v)}>
            {live ? <Minus className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
            {live ? 'Pausar' : 'Retomar'}
          </Button>
          <Button variant="outline" onClick={load}>
            <Satellite className="h-4 w-4" /> Sync
          </Button>
        </div>
      </div>

      {kpis && (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card variant="default" className="p-4">
            <p className="text-xs text-[var(--muted-foreground)]">Preço/m² médio</p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{formatBRL(kpis.avgPricePerSqm)}</p>
          </Card>
          <Card variant="default" className="p-4">
            <p className="text-xs text-[var(--muted-foreground)]">Valorização a.a.</p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">+{kpis.avgAppreciationYoy}%</p>
          </Card>
          <Card variant="default" className="p-4">
            <p className="text-xs text-[var(--muted-foreground)]">Disponibilidade</p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{kpis.availabilityRate}%</p>
          </Card>
          <Card variant="default" className="p-4">
            <p className="text-xs text-[var(--muted-foreground)]">Confiança</p>
            <p className="mt-1 text-lg font-semibold text-[var(--foreground)]">{kpis.confidence}%</p>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-[var(--muted-foreground)]">
          <Activity className="h-5 w-5 animate-spin" /> Carregando radar…
        </div>
      ) : ops.length === 0 ? (
        <Card variant="default" className="py-14 text-center text-sm text-[var(--muted-foreground)]">
          Nenhuma oportunidade no filtro atual.
        </Card>
      ) : (
        <div className="space-y-2">
          {ops.slice(0, 24).map((o) => (
            <Card key={o.id} variant="interactive" className="flex items-start gap-3 p-4">
              <span
                className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: opportunitySeverityColor(o.severity) }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{OPPORTUNITY_TYPE_LABEL[o.type]}</Badge>
                  <span className="text-sm font-medium text-[var(--foreground)]">{o.title}</span>
                </div>
                <p className="mt-1 truncate text-xs text-[var(--muted-foreground)]">{o.description}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                  {o.city} · score {o.score}
                  {typeof o.pricePerM2 === 'number' && ` · ${formatBRL(o.pricePerM2)}/m²`}
                </p>
              </div>
              {typeof o.deltaPct === 'number' &&
                (o.deltaPct < 0 ? (
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--success)]">
                    <TrendingDown className="h-3.5 w-3.5" /> {o.deltaPct}%
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-[var(--accent)]">
                    <TrendingUp className="h-3.5 w-3.5" /> {o.deltaPct}%
                  </span>
                ))}
            </Card>
          ))}
        </div>
      )}
    </ProductPageShell>
  );
}
