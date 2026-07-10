import { Card, Avatar, StatPill, cn } from '@landmap/ui';
import type { LeaderboardScope, RankedLeaderboardEntry } from '../types';

export interface LeaderboardProps {
  entries: RankedLeaderboardEntry[];
  scope?: LeaderboardScope;
  title?: string;
  className?: string;
}

const rankMedal = (rank: number): string => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

/** Leaderboard global ou por cidade. Reusa Card/Avatar/StatPill do design system. */
export function Leaderboard({
  entries,
  scope = 'global',
  title,
  className,
}: LeaderboardProps) {
  return (
    <Card variant="default" className={cn('w-full', className)}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-100">
          {title ?? (scope === 'city' ? 'Ranking da cidade' : 'Ranking global')}
        </h3>
        <span className="text-xs text-neutral-500">{entries.length} jogadores</span>
      </div>

      <ol className="flex flex-col gap-1.5">
        {entries.map((e) => (
          <li
            key={e.userId}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-3 py-2 transition',
              e.isCurrentUser
                ? 'border-[#d4af37]/40 bg-[#d4af37]/[0.06]'
                : 'border-white/5 bg-white/[0.02]',
            )}
            style={e.isCurrentUser ? { boxShadow: 'var(--glow-old)' } : undefined}
          >
            <span className="w-7 text-center text-sm font-semibold tabular-nums text-neutral-300">
              {rankMedal(e.rank)}
            </span>
            <Avatar name={e.displayName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-100">
                {e.displayName}
                {e.isCurrentUser ? (
                  <span className="ml-1.5 text-[10px] uppercase tracking-wide text-[var(--gold-soft)]">
                    você
                  </span>
                ) : null}
              </p>
              <p className="truncate text-[11px] text-neutral-500">{e.city}</p>
            </div>
            <StatPill tone={e.tier === 'sovereign' || e.tier === 'gold' ? 'gold' : 'emerald'} value={e.xp} />
          </li>
        ))}
      </ol>
    </Card>
  );
}
