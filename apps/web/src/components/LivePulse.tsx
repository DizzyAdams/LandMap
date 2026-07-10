'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export function useLiveMarket(initial: { priceM2: number; roi: number }) {
  const [priceM2, setPriceM2] = useState(initial.priceM2);
  const [roi, setRoi] = useState(initial.roi);

  useEffect(() => {
    const id = setInterval(() => {
      setPriceM2((prev) => {
        const jitter = prev * (Math.random() * 1.6 - 0.8) / 100;
        return Math.round(prev + jitter);
      });
      setRoi((prev) => {
        const jitter = prev * (Math.random() * 0.8 - 0.4) / 100;
        return Math.round((prev + jitter) * 100) / 100;
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return { priceM2, roi };
}

export default function LivePulse({ priceM2, roi }: { priceM2: number; roi: number }) {
  const live = useLiveMarket({ priceM2, roi });
  const t = useTranslations('world');

  const brl = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });

  const priceUp = live.priceM2 >= priceM2;
  const roiUp = live.roi >= roi;

  return (
    <div className="inline-flex items-center gap-3 rounded-lg border border-emerald-900/50 bg-emerald-950/20 px-3 py-1.5 text-neutral-200 backdrop-blur-md">
      <div className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ring-2 ring-emerald-400/30" />
          <span className="relative inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        </span>
        <span className="text-[11px] uppercase tracking-wide text-emerald-300">{t('live.label')}</span>
      </div>

      <div className="flex items-center gap-1 text-sm font-medium tabular-nums">
        <span className="text-neutral-400">{t('live.priceM2')}:</span>
        <span className={priceUp ? 'text-emerald-300' : 'text-rose-300'}>
          {brl.format(live.priceM2)}
        </span>
        <span className={priceUp ? 'text-emerald-400' : 'text-rose-400'}>
          {priceUp ? '▲' : '▼'}
        </span>
      </div>

      <div className="flex items-center gap-1 text-sm font-medium tabular-nums">
        <span className="text-neutral-400">{t('live.roi')}:</span>
        <span className={roiUp ? 'text-emerald-300' : 'text-rose-300'}>
          {live.roi}%
        </span>
        <span className={roiUp ? 'text-emerald-400' : 'text-rose-400'}>
          {roiUp ? '▲' : '▼'}
        </span>
      </div>
    </div>
  );
}
