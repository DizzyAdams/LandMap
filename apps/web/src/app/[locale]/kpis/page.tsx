'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { RequireAuth } from '../../../components/RequireAuth';
import { Reveal } from '../../../components/Motion';
import { MetricStat, Badge, Skeleton } from '@landmap/ui';
import {
  getOpportunities,
  type Opportunity,
  type KpiSnapshot,
  type OpportunitySeverity,
} from '../../../lib/api';
import {
  OPPORTUNITY_TYPE_LABEL,
  opportunitySeverityColor,
} from '../../../lib/opportunities';

function fmtBRL(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtPct(n: number): string {
  return `${n > 0 ? '+' : ''}${n.toFixed(1)}%`;
}

function severityVariant(sev: OpportunitySeverity): 'default' | 'warning' | 'destructive' {
  switch (sev) {
    case 'alta':
      return 'destructive';
    case 'media':
      return 'warning';
    default:
      return 'default';
  }
}

function KpisPageInner() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const t = useTranslations('kpis');

  const [kpis, setKpis] = useState<KpiSnapshot | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getOpportunities()
      .then((data) => {
        if (!active) return;
        setKpis(data.kpis);
        setOpportunities(data.opportunities ?? []);
      })
      .catch((e) => {
        if (active) setError((e as Error)?.message || t('loadError'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  const topCities = useMemo(() => kpis?.topCities ?? [], [kpis]);

  return (
    <main className="relative min-h-screen text-[var(--foreground)]">
      <div className="pointer-events-none fixed bottom-4 left-4 z-[999] md:bottom-6 md:left-6">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[var(--border)]/40 bg-[var(--card)]/90 px-3 py-1.5 shadow-sm backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
          <span className="font-display text-xs font-bold tracking-tight text-[var(--primary)]">
            LandMap
          </span>
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--primary)]">{t('eyebrow')}</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                {t('title')}
              </h1>
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">{t('subtitle')}</p>
            </div>
            <Link
              href={lh('/map')}
              className="btn btn-ghost !px-3 !py-1.5 !text-xs"
            >
              {t('viewMap')}
            </Link>
          </div>
        </Reveal>

        {error ? (
          <Reveal className="mt-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
              <p className="text-sm font-medium text-[var(--foreground)]">{t('loadError')}</p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">{error}</p>
            </div>
          </Reveal>
        ) : (
          <>
            <Reveal delay={0.1} className="mt-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricStat
                  label={t('totalProperties')}
                  value={loading || !kpis ? '—' : kpis.total.toLocaleString('pt-BR')}
                  hint={t('catalogHint')}
                  tone="neutral"
                />
                <MetricStat
                  label={t('avgPricePerM2')}
                  value={loading || !kpis ? '—' : fmtBRL(kpis.avgPricePerSqm)}
                  hint={t('medianHint')}
                  tone="emerald"
                />
                <MetricStat
                  label={t('appreciationYoy')}
                  value={loading || !kpis ? '—' : fmtPct(kpis.avgAppreciationYoy)}
                  thresholds={[{ min: 0, tone: 'emerald' }]}
                  numeric={kpis?.avgAppreciationYoy}
                  tone="emerald"
                />
                <MetricStat
                  label={t('confidence')}
                  value={loading || !kpis ? '—' : `${kpis.confidence}%`}
                  numeric={kpis?.confidence}
                  thresholds={[
                    { min: 85, tone: 'emerald' },
                    { min: 70, tone: 'cyan' },
                    { min: 0, tone: 'warning' },
                  ]}
                  hint={t('confidenceHint')}
                />
              </div>
            </Reveal>

            <Reveal delay={0.15} className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <MetricStat
                  label={t('availabilityRate')}
                  value={loading || !kpis ? '—' : `${kpis.availabilityRate}%`}
                  tone="neutral"
                />
                <MetricStat
                  label={t('avgPrice')}
                  value={loading || !kpis ? '—' : fmtBRL(kpis.avgPrice)}
                  tone="neutral"
                />
                <MetricStat
                  label={t('medianPricePerM2')}
                  value={loading || !kpis ? '—' : fmtBRL(kpis.medianPricePerSqm)}
                  tone="neutral"
                />
                <MetricStat
                  label={t('opportunities')}
                  value={loading ? '—' : opportunities.length.toLocaleString('pt-BR')}
                  hint={t('opportunitiesHint')}
                  tone="violet"
                />
              </div>
            </Reveal>

            <Reveal delay={0.2} className="mt-10">
              <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                {t('topCities')}
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-24" />
                    ))
                  : topCities.slice(0, 8).map((c) => (
                      <MetricStat
                        key={`${c.city}-${c.state}`}
                        label={`${c.city}, ${c.state}`}
                        value={fmtBRL(c.avgPrice)}
                        hint={`${c.count} ${t('units')}`}
                        tone="neutral"
                      />
                    ))}
              </div>
            </Reveal>

            <Reveal delay={0.25} className="mt-10">
              <div className="flex items-end justify-between gap-4">
                <h2 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
                  {t('opportunitiesTitle')}
                </h2>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {loading ? '' : `${opportunities.length} ${t('alerts')}`}
                </span>
              </div>

              <div className="mt-3 space-y-3">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20" />
                  ))
                ) : opportunities.length === 0 ? (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-10 text-center">
                    <p className="text-sm font-medium text-[var(--foreground)]">
                      {t('noOpportunities')}
                    </p>
                  </div>
                ) : (
                  opportunities.map((o) => (
                    <div
                      key={o.id}
                      className="flex flex-col gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--primary)]/50 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={severityVariant(o.severity)}>
                            {t(`severity.${o.severity}`)}
                          </Badge>
                          <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
                            {OPPORTUNITY_TYPE_LABEL[o.type]}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
                          {o.title}
                        </p>
                        <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                          {o.description}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end">
                        <div className="text-right">
                          <p
                            className="font-display text-xl font-bold tabular-nums"
                            style={{ color: opportunitySeverityColor(o.severity) }}
                          >
                            {o.score}
                          </p>
                          <p className="text-[11px] text-[var(--muted-foreground)]">
                            {t('score')}
                          </p>
                        </div>
                        {o.deltaPct !== undefined && o.type === 'preco_abaixo_media' && (
                          <span className="rounded-full bg-[var(--primary)]/10 px-2 py-1 text-[11px] font-medium text-[var(--primary)]">
                            {fmtPct(o.deltaPct)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Reveal>
          </>
        )}
      </section>
    </main>
  );
}

export default function KpisPage() {
  return (
    <RequireAuth>
      <KpisPageInner />
    </RequireAuth>
  );
}
