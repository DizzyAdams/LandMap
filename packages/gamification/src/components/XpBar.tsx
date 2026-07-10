import { Progress, StatPill, cn } from '@landmap/ui';
import { levelFromXp } from '../engine';
import type { GamificationTier } from '../types';

export interface XpBarProps {
  xp: number;
  level: number;
  tier?: GamificationTier;
  landcoins?: number;
  className?: string;
}

const tierLabel: Record<GamificationTier, string> = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  sovereign: 'Sovereign',
};

const tierBar: Record<GamificationTier, string> = {
  bronze: 'from-neutral-400 to-neutral-200',
  silver: 'from-cyan-400 to-sky-300',
  gold: 'from-[#d4af37] to-[#f4e2a1]',
  sovereign: 'from-emerald-400 to-cyan-400',
};

/** Barra de XP com nível/tier e saldo de LandCoins. Tema dark-premium. */
export function XpBar({ xp, level, tier, landcoins, className }: XpBarProps) {
  const info = levelFromXp(xp);
  const effectiveTier = tier ?? info.tier;
  const pct =
    info.xpForNext > 0
      ? Math.round((info.xpIntoLevel / (info.xpIntoLevel + info.xpForNext)) * 100)
      : 100;

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StatPill
            tone={effectiveTier === 'sovereign' || effectiveTier === 'gold' ? 'gold' : 'emerald'}
            label="Nível"
            value={level}
          />
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            {tierLabel[effectiveTier]}
          </span>
        </div>
        {typeof landcoins === 'number' ? (
          <StatPill tone="gold" icon={<span aria-hidden>🪙</span>} value={`${landcoins} LC`} />
        ) : null}
      </div>

      <Progress value={pct} barClassName={`bg-gradient-to-r ${tierBar[effectiveTier]}`} />

      <div className="mt-1.5 flex justify-between text-[11px] tabular-nums text-neutral-500">
        <span>{info.xpIntoLevel} XP no nível</span>
        <span>faltam {info.xpForNext} XP</span>
      </div>
    </div>
  );
}
