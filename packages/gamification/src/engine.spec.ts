// packages/gamification/src/engine.spec.ts
import { describe, it, expect } from 'vitest';
import {
  awardXp,
  applyStreak,
  applyEvent,
  buildLeaderboard,
  checkBadges,
  createInitialProgress,
  cumulativeXpForLevel,
  evaluateQuest,
  levelFromXp,
  quoteRedemption,
  redeemCashback,
  tierFromLevel,
  DEFAULT_BADGES,
  DEFAULT_QUESTS,
} from './engine';
import type { BadgeDef, Clock, CoinLedger, QuestDef } from './types';

const clock: Clock = { now: '2026-07-09T12:00:00.000Z', today: '2026-07-09' };

function freshLedger(userId = 'u1', landcoins = 100): CoinLedger {
  return { userId, landcoins, entries: [] };
}

describe('curva de níveis', () => {
  it('cumulativeXpForLevel bate com 50*l*(l-1)', () => {
    expect(cumulativeXpForLevel(1)).toBe(0);
    expect(cumulativeXpForLevel(2)).toBe(100);
    expect(cumulativeXpForLevel(3)).toBe(300);
    expect(cumulativeXpForLevel(10)).toBe(4500);
  });

  it('levelFromXp resolve nível e tier', () => {
    expect(levelFromXp(0)).toMatchObject({ level: 1, tier: 'bronze', xpIntoLevel: 0, xpForNext: 100 });
    expect(levelFromXp(100)).toMatchObject({ level: 2 });
    expect(levelFromXp(250)).toMatchObject({ level: 2, xpIntoLevel: 150, xpForNext: 50 });
    expect(levelFromXp(4500)).toMatchObject({ level: 10, tier: 'gold' });
    expect(levelFromXp(100_000)).toMatchObject({ tier: 'sovereign' });
  });

  it('tierFromLevel mapeia faixas', () => {
    expect(tierFromLevel(1)).toBe('bronze');
    expect(tierFromLevel(4)).toBe('bronze');
    expect(tierFromLevel(5)).toBe('silver');
    expect(tierFromLevel(10)).toBe('gold');
    expect(tierFromLevel(15)).toBe('sovereign');
  });
});

describe('awardXp', () => {
  it('concede XP, sobe nível e marca leveledUp', () => {
    const p0 = createInitialProgress('u1', clock);
    const r = awardXp(p0, 120, clock);
    expect(r.xpAwarded).toBe(120);
    expect(r.progress.xp).toBe(120);
    expect(r.progress.level).toBe(2);
    expect(r.leveledUp).toBe(true);
    expect(r.progress.tier).toBe('bronze');
  });

  it('concede LandCoins a cada múltiplo de 500 XP cruzado', () => {
    const p0 = createInitialProgress('u1', clock);
    // 0 -> 1250 cruza 500 e 1000 => 2 * 5 = 10 LandCoins
    const r = awardXp(p0, 1250, clock);
    expect(r.landcoinsEarned).toBe(10);
    expect(r.progress.landcoins).toBe(10);
  });

  it('não gera LandCoins negativos', () => {
    const p0 = createInitialProgress('u1', clock);
    const r = awardXp(p0, -50, clock);
    expect(r.progress.xp).toBe(0);
    expect(r.landcoinsEarned).toBe(0);
  });
});

describe('applyStreak', () => {
  it('primeira atividade inicia streak em 1', () => {
    const p0 = createInitialProgress('u1', clock);
    const r = applyStreak(p0, clock);
    expect(r.progress.streak.current).toBe(1);
    expect(r.progress.streak.lastActiveDate).toBe('2026-07-09');
  });

  it('mesmo dia não altera', () => {
    let p = createInitialProgress('u1', clock);
    p = applyStreak(p, clock).progress;
    const r = applyStreak(p, clock);
    expect(r.streakIncreased).toBe(false);
    expect(r.progress.streak.current).toBe(1);
  });

  it('dia consecutivo incrementa', () => {
    let p = createInitialProgress('u1', clock);
    p = applyStreak(p, { now: clock.now, today: '2026-07-09' }).progress;
    const r = applyStreak(p, { now: clock.now, today: '2026-07-10' });
    expect(r.progress.streak.current).toBe(2);
    expect(r.streakIncreased).toBe(true);
  });

  it('gap sem freeze reseta para 1 (quebrada)', () => {
    let p = createInitialProgress('u1', clock);
    p = applyStreak(p, { now: clock.now, today: '2026-07-09' }).progress;
    p = applyStreak(p, { now: clock.now, today: '2026-07-10' }).progress;
    const r = applyStreak(p, { now: clock.now, today: '2026-07-15' });
    expect(r.progress.streak.current).toBe(1);
    expect(r.streakBroken).toBe(true);
  });

  it('gap de 1 dia é coberto por freeze', () => {
    let p = createInitialProgress('u1', clock);
    // streak já existente: 5 dias, último dia 07-09, 1 freeze disponível
    p = {
      ...p,
      streak: { current: 5, best: 5, lastActiveDate: '2026-07-09', freezes: 1 },
    };
    const r = applyStreak(p, { now: clock.now, today: '2026-07-11' });
    expect(r.freezeUsed).toBe(true);
    expect(r.progress.streak.current).toBe(6);
    expect(r.progress.streak.freezes).toBe(0);
  });
});

describe('checkBadges', () => {
  const catalog: BadgeDef[] = [
    { id: 'a', name: 'A', description: '', tier: 'bronze', icon: '🔎',
      criteria: [{ kind: 'xp_at_least', value: 100 }], rewardLandcoins: 5 },
    { id: 'b', name: 'B', description: '', tier: 'bronze', icon: '⚖️',
      criteria: [{ kind: 'metric_at_least', metric: 'comparisonsMade', value: 3 }] },
  ];

  it('desbloqueia badge elegível e concede LandCoins', () => {
    let p = createInitialProgress('u1', clock);
    p = awardXp(p, 100, clock).progress; // xp=100 -> level 2
    const r = checkBadges(p, catalog);
    expect(r.newlyUnlocked.map((b) => b.id)).toContain('a');
    expect(r.progress.badges).toContain('a');
    expect(r.progress.landcoins).toBe(5);
  });

  it('é idempotente (não re-desbloqueia)', () => {
    let p = createInitialProgress('u1', clock);
    p = awardXp(p, 100, clock).progress;
    const r1 = checkBadges(p, catalog);
    const r2 = checkBadges(r1.progress, catalog);
    expect(r2.newlyUnlocked).toHaveLength(0);
    expect(r2.progress.landcoins).toBe(5);
  });

  it('badge por métrica desbloqueia ao atingir target', () => {
    let p = createInitialProgress('u1', clock);
    p = { ...p, metrics: { ...p.metrics, comparisonsMade: 3 } };
    const r = checkBadges(p, catalog);
    expect(r.progress.badges).toContain('b');
  });
});

describe('resgate de cashback', () => {
  it('quoteRedemption clampa ao saldo e calcula centavos', () => {
    expect(quoteRedemption(1000, 10, 50)).toEqual({ spent: 50, cashbackCents: 500 });
    expect(quoteRedemption(30, 10, 50)).toEqual({ spent: 30, cashbackCents: 300 });
  });

  it('redeemCashback subtrai LandCoins e gera payload', () => {
    const ledger = freshLedger('u1', 80);
    const r = redeemCashback(ledger, { landcoinsToSpend: 50, rateCentsPerCoin: 10 }, clock);
    expect(r.ok).toBe(true);
    expect(r.ledger.landcoins).toBe(30);
    expect(r.pending).toMatchObject({ landcoinsSpent: 50, cashbackCents: 500 });
    expect(r.ledger.entries.at(-1)?.kind).toBe('redeem_to_cashback');
  });

  it('falha graciosamente quando saldo é zero', () => {
    const ledger = freshLedger('u1', 0);
    const r = redeemCashback(ledger, { landcoinsToSpend: 50, rateCentsPerCoin: 10 }, clock);
    expect(r.ok).toBe(false);
    expect(r.pending).toBeNull();
    expect(r.ledger.landcoins).toBe(0);
  });

  it('resgata parcialmente quando pede mais do que tem', () => {
    const ledger = freshLedger('u1', 10);
    const r = redeemCashback(ledger, { landcoinsToSpend: 50, rateCentsPerCoin: 10 }, clock);
    expect(r.ok).toBe(true);
    expect(r.ledger.landcoins).toBe(0);
    expect(r.pending).toMatchObject({ landcoinsSpent: 10, cashbackCents: 100 });
  });
});

describe('evaluateQuest', () => {
  const quests: QuestDef[] = [
    { id: 'q', title: '', description: '', rewardXp: 0, rewardLandcoins: 0,
      steps: [{ id: 's1', metric: 'comparisonsMade', target: 3 }] },
  ];
  it('completa quando atinge target', () => {
    let p = createInitialProgress('u1', clock);
    p = { ...p, metrics: { ...p.metrics, comparisonsMade: 3 } };
    const r = evaluateQuest(p, quests[0], clock);
    expect(r.status).toBe('completed');
    expect(r.justCompleted).toBe(true);
    expect(r.stepProgress.s1).toBe(3);
  });
});

describe('applyEvent (reducer central)', () => {
  it('search -> xp + métrica + badge first_search', () => {
    let p = createInitialProgress('u1', clock);
    const r = applyEvent(
      p,
      { userId: 'u1', type: 'search', createdAt: clock.now },
      DEFAULT_BADGES,
      DEFAULT_QUESTS,
      clock,
    );
    expect(r.progress.xp).toBe(5);
    expect(r.progress.metrics.searches).toBe(1);
    expect(r.progress.badges).toContain('first_search');
    expect(r.badgeRes.newlyUnlocked.map((b) => b.id)).toContain('first_search');
  });

  it('daily_login aplica streak', () => {
    let p = createInitialProgress('u1', clock);
    const r = applyEvent(
      p,
      { userId: 'u1', type: 'daily_login', createdAt: clock.now },
      DEFAULT_BADGES,
      DEFAULT_QUESTS,
      clock,
    );
    expect(r.streak?.progress.streak.current).toBe(1);
  });

  it('compare avança quest q_compare3', () => {
    let p = createInitialProgress('u1', clock);
    p = applyEvent(
      p,
      { userId: 'u1', type: 'compare', amount: 3, createdAt: clock.now },
      DEFAULT_BADGES,
      DEFAULT_QUESTS,
      clock,
    ).progress;
    expect(p.quests['q_compare3']?.status).toBe('completed');
  });
});

describe('buildLeaderboard', () => {
  const entries = [
    { userId: 'a', displayName: 'Ana', city: 'SP', xp: 1000, level: 5 },
    { userId: 'b', displayName: 'Bob', city: 'SP', xp: 1000, level: 5 },
    { userId: 'c', displayName: 'Caio', city: 'RJ', xp: 500, level: 3 },
  ];
  it('ranqueia com ranking denso e marca usuário atual', () => {
    const ranked = buildLeaderboard(entries, 'b');
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(1); // empate no xp
    expect(ranked[2].rank).toBe(3);
    expect(ranked.find((e) => e.userId === 'b')?.isCurrentUser).toBe(true);
  });
  it('filtra por cidade', () => {
    const ranked = buildLeaderboard(entries, 'x', { scope: 'city', city: 'RJ' });
    expect(ranked).toHaveLength(1);
    expect(ranked[0].userId).toBe('c');
  });
});

