'use client';

import { useTranslations } from 'next-intl';
import type { WorldAnalysis } from '../lib/bmap';

export default function EnergyPanel({ data }: { data: WorldAnalysis }) {
  const t = useTranslations('world');

  const energyKpis = [
    { label: t('energy.totalMwp'), value: `${data.energy.totalMwp} MWp`, accent: true },
    { label: t('energy.co2'), value: `${data.energy.co2TonsYr} tCO₂/ano`, accent: true },
    { label: t('energy.score'), value: `${data.energy.renewableScore}/100`, gold: true },
  ];

  const thermalKpis = [
    { label: t('thermal.avg'), value: `${data.thermal.avgHeat}/100 heat`, accent: true },
    { label: t('thermal.green'), value: `${data.thermal.greenCooling}/100 green`, gold: true },
    { label: t('thermal.hottest'), value: `${data.thermal.hottest.length} zonas` },
  ];

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] backdrop-blur-md p-4 text-sm text-[var(--foreground)]">
      {/* SECTION 1 — Renewable energy / solar */}
      <header className="mb-4">
        <h3 className="text-base font-semibold text-gradient">{t('energy.title')}</h3>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {energyKpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="text-xs text-[var(--muted-foreground)] mb-1">{kpi.label}</div>
            <div className={kpi.gold ? 'text-[var(--gold-soft)] text-xl font-bold' : 'text-emerald-300 text-xl font-bold'}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
          {t('energy.topSolar')}
        </div>
        <ul className="flex flex-col gap-2">
          {data.energy.topSolar.slice(0, 6).map((roof) => (
            <li key={roof.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="truncate font-medium text-[var(--foreground)]">{roof.id}</span>
                <span className="shrink-0 rounded-full bg-amber-400/15 text-[var(--gold-soft)] text-[10px] font-medium px-2 py-0.5">
                  {roof.kwProxy} kWp
                </span>
              </div>
              <div className="grid grid-cols-3 gap-x-3 gap-y-1 text-xs">
                <div className="flex flex-col">
                  <span className="text-[var(--muted-foreground)]">{t('energy.roof')}</span>
                  <span className="text-[var(--foreground)] tabular-nums">{roof.roofM2} m²</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[var(--muted-foreground)]">{t('energy.kwp')}</span>
                  <span className="text-[var(--primary)] tabular-nums">{roof.kwProxy} kWp</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[var(--muted-foreground)]">{t('energy.co2')}</span>
                  <span className="text-[var(--foreground)] tabular-nums">{roof.co2TonsYr} tCO₂/ano</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>


      {/* SECTION 2 — Thermal zoning */}
      <header className="mb-4">
        <h3 className="text-base font-semibold text-gradient">{t('thermal.title')}</h3>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {thermalKpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
            <div className="text-xs text-[var(--muted-foreground)] mb-1">{kpi.label}</div>
            <div
              className={
                kpi.gold
                  ? 'text-[var(--gold-soft)] text-xl font-bold'
                  : kpi.accent
                    ? 'text-emerald-300 text-xl font-bold'
                    : 'text-neutral-100 text-xl font-bold'
              }
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4">
        <div className="text-xs uppercase tracking-wider text-[var(--muted-foreground)] mb-2">
          {t('thermal.hottest')}
        </div>
        <ul className="flex flex-col gap-2">
          {data.thermal.hottest.slice(0, 4).map((cell) => (
            <li key={cell.id} className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="truncate font-medium text-[var(--foreground)]">{cell.id}</span>
                <span className="shrink-0 rounded-full bg-rose-500/15 text-rose-300 text-[10px] font-medium px-2 py-0.5">
                  {cell.heatIndex} {t('thermal.heat')}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div className="flex justify-between gap-2">
                  <span className="text-[var(--muted-foreground)]">{t('thermal.heat')}</span>
                  <span className="text-[var(--foreground)] tabular-nums">{cell.heatIndex}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[var(--muted-foreground)]">{t('thermal.buildings')}</span>
                  <span className="text-[var(--foreground)] tabular-nums">{cell.buildings}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Heat legend gradient bar */}
      <div>
        <div
          className="h-2.5 rounded-full"
          style={{ background: 'linear-gradient(90deg,#34d399,#f59e0b,#ef4444)' }}
          role="img"
          aria-label={`${t('thermal.legendCool')} → ${t('thermal.legendHot')}`}
        />
        <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] mt-1">
          <span>{t('thermal.legendCool')}</span>
          <span>{t('thermal.legendHot')}</span>
        </div>
      </div>
    </section>
  );
}
