import type { ReactNode } from 'react';
import { Card, Badge, Tooltip, cn } from '@landmap/ui';
import type { BadgeDef, GamificationTier } from '../types';

export interface BadgeView {
  def: BadgeDef;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface BadgeShelfProps {
  badges: BadgeView[];
  columns?: number;
  className?: string;
}

const tierTone: Record<GamificationTier, 'default' | 'success' | 'warning' | 'info' | 'destructive'> = {
  bronze: 'default',
  silver: 'info',
  gold: 'warning',
  sovereign: 'success',
};

/**
 * Prateleira de conquistas. Badges desbloqueados brilham com o tom do
 * tier; bloqueados ficam esmaecidos com cadeado. Reusa Card/Badge/Tooltip.
 */
export function BadgeShelf({ badges, columns = 4, className }: BadgeShelfProps) {
  return (
    <Card variant="default" className={cn('w-full', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-100">Conquistas</h3>
        <span className="text-xs text-neutral-400">
          {badges.filter((b) => b.unlocked).length}/{badges.length}
        </span>
      </div>
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {badges.map(({ def, unlocked }) => {
          const body: ReactNode = (
            <span
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition',
                unlocked
                  ? 'border-white/10 bg-white/[0.04]'
                  : 'border-white/5 bg-white/[0.02] opacity-40 grayscale',
              )}
              style={
                unlocked && def.tier === 'sovereign'
                  ? { boxShadow: 'var(--glow-sovereign)' }
                  : unlocked && def.tier === 'gold'
                    ? { boxShadow: 'var(--glow-gold)' }
                    : undefined
              }
            >
              <span className="text-2xl leading-none" aria-hidden>
                {unlocked ? def.icon : '🔒'}
              </span>
              <span className="text-[11px] font-medium leading-tight text-neutral-200">
                {def.name}
              </span>
            </span>
          );

          return (
            <Tooltip
              key={def.id}
              side="top"
              content={
                <div className="max-w-[220px]">
                  <div className="mb-0.5 flex items-center gap-1.5 font-semibold">
                    <span>{def.icon}</span>
                    {def.name}
                  </div>
                  <p className="text-neutral-300">{def.description}</p>
                  {def.rewardLandcoins ? (
                    <p className="mt-1 text-[var(--gold-soft)]">
                      +{def.rewardLandcoins} LandCoins
                    </p>
                  ) : null}
                </div>
              }
            >
              {unlocked ? (
                <Badge variant={tierTone[def.tier]} className="block">
                  {body}
                </Badge>
              ) : (
                body
              )}
            </Tooltip>
          );
        })}
      </div>
    </Card>
  );
}
