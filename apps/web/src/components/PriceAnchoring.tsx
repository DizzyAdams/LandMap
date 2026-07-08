'use client';

interface PriceAnchoringProps {
  originalPrice: number;
  currentPrice: number;
  currency?: string;
}

export function PriceAnchoring({
  originalPrice,
  currentPrice,
  currency = 'BRL',
}: PriceAnchoringProps) {
  const savings = originalPrice - currentPrice;

  if (savings <= 0) return null;

  const fmt = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);

  const savingsPercent = Math.round((savings / originalPrice) * 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <span className="text-sm text-neutral-500 line-through">{fmt(originalPrice)}</span>
        <span className="rounded bg-emerald-950/40 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">
          -{savingsPercent}%
        </span>
      </div>
      <p className="text-2xl font-medium text-neutral-50">{fmt(currentPrice)}</p>
      <p className="text-xs text-emerald-400/80">
        Economia de {fmt(savings)}
      </p>
    </div>
  );
}
