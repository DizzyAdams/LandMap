'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { WorldAnalysis } from '../lib/bmap';

const KIND_LABEL: Record<WorldAnalysis['investment']['opportunities'][number]['kind'], string> = {
  multifamily: 'Multifamiliar',
  commercial: 'Comercial',
  mixed: 'Misto',
  land: 'Terreno',
};

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

export default function InvestorPanel({ data }: { data: WorldAnalysis['investment'] }) {
  const t = useTranslations('world');
  const [copied, setCopied] = useState(false);

  const handleExport = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data.opportunities));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const kpis = [
    { label: t('investor.fundReady'), value: String(data.fundReady), accent: true },
    { label: t('investor.avgCap'), value: `${data.avgCapRate}%` },
    { label: t('investor.totalTicket'), value: brl.format(data.totalTicketBRL) },
  ];

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950/80 backdrop-blur-md p-4 text-sm text-neutral-200">
      <header className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-semibold text-neutral-100">{t('investor.title')}</h3>
        <span className="rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold tracking-wider px-2 py-0.5 uppercase">
          Fundos
        </span>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
            <div className="text-xs text-neutral-400 mb-1">{kpi.label}</div>
            <div className={kpi.accent ? 'text-gradient text-xl font-bold' : 'text-emerald-300 text-xl font-bold'}>
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      <ul className="flex flex-col gap-3 mb-4">
        {data.topByScore.slice(0, 6).map((opp) => (
          <li key={opp.id} className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="truncate font-medium text-neutral-100">{opp.title}</span>
                <span className="shrink-0 rounded-full bg-neutral-800 text-neutral-300 text-[10px] px-2 py-0.5">
                  {KIND_LABEL[opp.kind]}
                </span>
              </div>
              {opp.fundReady && (
                <span className="shrink-0 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-medium px-2 py-0.5">
                  {t('investor.badge')}
                </span>
              )}
            </div>

            <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden mb-3">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(0, Math.min(100, opp.score))}%`,
                  backgroundImage: opp.fundReady
                    ? undefined
                    : 'linear-gradient(90deg, #34d399, #22d3ee)',
                  backgroundColor: opp.fundReady ? '#34d399' : undefined,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-neutral-400">{t('investor.priceM2')}</span>
                <span className="text-neutral-200 tabular-nums">{brl.format(opp.priceM2Proxy)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-neutral-400">{t('investor.capRate')}</span>
                <span className="text-neutral-200 tabular-nums">{opp.capRateProxy}%</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-neutral-400">{t('investor.roi')}</span>
                <span className="text-neutral-200 tabular-nums">{opp.roiProxy}%</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-neutral-400">{t('investor.ticket')}</span>
                <span className="text-neutral-200 tabular-nums">{brl.format(opp.ticketBRL)}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={handleExport}
        className="btn btn-ghost w-full text-sm"
        aria-live="polite"
      >
        {copied ? t('investor.copied') : t('investor.export')}
      </button>
    </section>
  );
}
