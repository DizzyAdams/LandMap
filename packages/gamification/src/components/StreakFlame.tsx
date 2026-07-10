import type { ReactNode } from 'react';
import { cn } from '@landmap/ui';

export interface StreakFlameProps {
  streak: number;
  best?: number;
  frozen?: boolean;
  className?: string;
}

/**
 * Chama da streak diária. O brilho gold cresce com o número de dias;
 * acima de 7 dias usa o glow sovereign. Reusa tokens via CSS vars.
 */
export function StreakFlame({ streak, best, frozen, className }: StreakFlameProps) {
  const intensity = Math.min(streak, 30) / 30;
  const glow =
    streak >= 7 ? 'var(--glow-sovereign)' : 'var(--glow-gold)';
  const body: ReactNode = (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5',
        className,
      )}
      style={{ boxShadow: streak > 0 ? glow : undefined }}
    >
      <span
        aria-hidden
        className="text-xl leading-none transition-transform"
        style={{ transform: `scale(${1 + intensity * 0.4})`, filter: streak > 0 ? 'none' : 'grayscale(1)' }}
      >
        {frozen ? '❄️' : '🔥'}
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-sm font-semibold tabular-nums text-neutral-50">
          {streak} {streak === 1 ? 'dia' : 'dias'}
        </span>
        {typeof best === 'number' ? (
          <span className="text-[10px] text-neutral-500">recorde: {best}</span>
        ) : null}
      </span>
    </div>
  );
  return body;
}
