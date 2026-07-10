// packages/gamification/src/engine.ts
//
// Engine PURA de gamificação — zero dependências de React/Next/IO.
// Toda função é determinística e testável: recebe estado + `Clock`
// (nunca chama Date.now()/Math.random()) e devolve o novo estado.

import type {
  ApplyEventResult,
  ApplyStreakResult,
  AwardXpResult,
  BadgeDef,
  CheckBadgesResult,
  Clock,
  CoinLedger,
  GamificationEvent,
  GamificationEventType,
  GamificationTier,
  LeaderboardEntry,
  LedgerEntry,
  LedgerEntryKind,
  PendingCashbackRedemption,
  ProgressMetricKey,
  ProgressMetrics,
  QuestDef,
  QuestEvalResult,
  QuestProgress,
  RedemptionRequest,
  RedeemResult,
  StreakState,
  UserProgress,
} from './types';

// ─── Constantes da economia ──────────────────────────────────────────────

/** XP necessário para subir do nível L para L+1 cresce linearmente: */
export const XP_PER_LEVEL_BASE = 100;

/** A cada múltiplo de XP cruzado, concede LandCoins. */
export const LANDCOIN_XP_STEP = 500;
export const LANDCOIN_PER_STEP = 5;

/** Taxa padrão de resgate: 1 LandCoin = R$ 0,10 (em centavos). */
export const DEFAULT_REDEEM_RATE_CENTS = 10;

/**
 * XP concedido por tipo de evento (espelha `XpEvent.type` do billing).
 * Centralizado para facilitar balanceamento.
 */
export const XP_TABLE: Record<GamificationEventType, number> = {
  search: 5,
  save_favorite: 10,
  compare: 15,
  agent_cycle: 20,
  referral_signup: 50,
  closed_won: 200,
  view_neighborhood: 8,
  daily_login: 3,
};

/** LandCoins diretos concedidos por evento (além dos ganhos por XP). */
export const LANDCOIN_TABLE: Record<GamificationEventType, number> = {
  search: 0,
  save_favorite: 1,
  compare: 2,
  agent_cycle: 3,
  referral_signup: 20,
  closed_won: 50,
  view_neighborhood: 1,
  daily_login: 0,
};

// ─── Curva de níveis ─────────────────────────────────────────────────────

/** XP cumulativo necessário para *estar* no nível `level` (level 1 = 0). */
export function cumulativeXpForLevel(level: number): number {
  const l = Math.max(1, Math.floor(level));
  return (XP_PER_LEVEL_BASE / 2) * l * (l - 1); // 50 * l * (l - 1)
}

export function tierFromLevel(level: number): GamificationTier {
  if (level >= 15) return 'sovereign';
  if (level >= 10) return 'gold';
  if (level >= 5) return 'silver';
  return 'bronze';
}

/** Resolve nível/tier a partir do XP total absoluto. */
export function levelFromXp(xp: number): {
  level: number;
  tier: GamificationTier;
  xpIntoLevel: number;
  xpForNext: number;
} {
  const safe = Math.max(0, Math.floor(xp));
  const raw = Math.floor((1 + Math.sqrt(1 + safe / 12.5)) / 2);
  const level = raw < 1 ? 1 : raw;
  const tier = tierFromLevel(level);
  const levelStart = cumulativeXpForLevel(level);
  const nextStart = cumulativeXpForLevel(level + 1);
  return {
    level,
    tier,
    xpIntoLevel: safe - levelStart,
    xpForNext: nextStart - safe,
  };
}

// ─── Relógio determinístico ─────────────────────────────────────────────

function todayFromIso(iso: string): string {
  return iso.slice(0, 10);
}

function parseYmd(date: string): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, (m ?? 1) - 1, d ?? 1) / 86_400_000;
}

function dayDiff(fromYmd: string, toYmd: string): number {
  return parseYmd(toYmd) - parseYmd(fromYmd);
}

function resolveToday(clock: Clock): string {
  return clock.today ?? todayFromIso(clock.now);
}

// ─── awardXp ─────────────────────────────────────────────────────────────

export function awardXp(
  progress: UserProgress,
  xpDelta: number,
  clock: Clock,
): AwardXpResult {
  const previousLevel = progress.level;
  const prevXp = progress.xp;
  const newXp = Math.max(0, prevXp + Math.floor(xpDelta));

  const stepsCrossed =
    Math.floor(newXp / LANDCOIN_XP_STEP) -
    Math.floor(prevXp / LANDCOIN_XP_STEP);
  const landcoinsEarned = Math.max(0, stepsCrossed) * LANDCOIN_PER_STEP;

  const lvl = levelFromXp(newXp);
  const updated: UserProgress = {
    ...progress,
    xp: newXp,
    level: lvl.level,
    tier: lvl.tier,
    landcoins: progress.landcoins + landcoinsEarned,
    updatedAt: clock.now,
  };

  return {
    progress: updated,
    xpAwarded: newXp - prevXp,
    landcoinsEarned,
    leveledUp: lvl.level > previousLevel,
    newLevel: lvl.level,
    previousLevel,
  };
}

// ─── applyStreak ─────────────────────────────────────────────────────────

/**
 * Atualiza a streak diária de forma pura.
 *  - mesmo dia: sem alteração.
 *  - 1 dia depois: +1.
 *  - 2 dias depois + freeze disponível: consome 1 freeze, +1.
 *  - qualquer outro gap: reseta para 1 (streak quebrada, exceto 1ª vez).
 */
export function applyStreak(
  progress: UserProgress,
  clock: Clock,
  opts: { allowFreeze?: boolean } = {},
): ApplyStreakResult {
  const allowFreeze = opts.allowFreeze ?? true;
  const today = resolveToday(clock);
  const prev: StreakState = progress.streak;

  if (prev.lastActiveDate === today) {
    return {
      progress,
      streakIncreased: false,
      streakBroken: false,
      freezeUsed: false,
    };
  }

  let current = prev.current;
  let best = prev.best;
  let freezes = prev.freezes;
  let freezeUsed = false;

  if (prev.lastActiveDate === null) {
    current = 1;
  } else {
    const diff = dayDiff(prev.lastActiveDate, today);
    if (diff === 1) {
      current += 1;
    } else if (diff === 2 && allowFreeze && freezes > 0) {
      freezes -= 1;
      freezeUsed = true;
      current += 1;
    } else {
      current = 1;
    }
  }

  if (current > best) best = current;

  const updated: UserProgress = {
    ...progress,
    streak: { current, best, lastActiveDate: today, freezes },
    updatedAt: clock.now,
  };

  const streakBroken =
    prev.lastActiveDate !== null && prev.current > 1 && current === 1;

  return {
    progress: updated,
    streakIncreased: current > prev.current,
    streakBroken,
    freezeUsed,
  };
}

// ─── Badges ─────────────────────────────────────────────────────────────

const TIER_RANK: Record<GamificationTier, number> = {
  bronze: 0,
  silver: 1,
  gold: 2,
  sovereign: 3,
};

export function evaluateCriterion(
  c: BadgeDef['criteria'][number],
  ctx: {
    xp: number;
    tier: GamificationTier;
    metrics: ProgressMetrics;
    streak: StreakState;
    ownedBadges: string[];
  },
): boolean {
  switch (c.kind) {
    case 'xp_at_least':
      return ctx.xp >= c.value;
    case 'tier_at_least':
      return TIER_RANK[ctx.tier] >= TIER_RANK[c.tier];
    case 'metric_at_least':
      return ctx.metrics[c.metric] >= c.value;
    case 'streak_at_least':
      return ctx.streak.current >= c.value;
    case 'badge_requires':
      return ctx.ownedBadges.includes(c.badgeId);
  }
}

export function checkBadges(
  progress: UserProgress,
  catalog: BadgeDef[],
): CheckBadgesResult {
  const ctx = {
    xp: progress.xp,
    tier: progress.tier,
    metrics: progress.metrics,
    streak: progress.streak,
    ownedBadges: progress.badges,
  };

  const badges = [...progress.badges];
  const newlyUnlocked: BadgeDef[] = [];
  let landcoins = progress.landcoins;

  for (const def of catalog) {
    if (badges.includes(def.id)) continue;
    const ok = def.criteria.every((cr) => evaluateCriterion(cr, ctx));
    if (ok) {
      badges.push(def.id);
      if (def.rewardLandcoins) landcoins += def.rewardLandcoins;
      newlyUnlocked.push(def);
    }
  }

  const updated: UserProgress = { ...progress, badges, landcoins };
  return { progress: updated, newlyUnlocked };
}

// ─── Ledger de LandCoins ───────────────────────────────────────────────

export function awardLandcoins(
  ledger: CoinLedger,
  delta: number,
  kind: LedgerEntryKind,
  clock: Clock,
  note?: string,
): { ledger: CoinLedger; entry: LedgerEntry } {
  const balanceAfter = Math.max(0, ledger.landcoins + delta);
  const entry: LedgerEntry = {
    id: `${ledger.userId}:${kind}:${clock.now}`,
    userId: ledger.userId,
    kind,
    landcoinsDelta: delta,
    balanceAfter,
    note,
    createdAt: clock.now,
  };
  return {
    ledger: {
      ...ledger,
      landcoins: balanceAfter,
      entries: [...ledger.entries, entry],
    },
    entry,
  };
}

// ─── Resgate LandCoins -> Cashback ─────────────────────────────────────

/**
 * Cotação pura do resgate. Clampa `landcoinsToSpend` ao saldo disponível
 * e calcula o cashback em centavos (arredondado para baixo).
 */
export function quoteRedemption(
  landcoinsToSpend: number,
  rateCentsPerCoin: number,
  available: number,
): { spent: number; cashbackCents: number } {
  const spend = Math.max(
    0,
    Math.min(Math.floor(landcoinsToSpend), Math.floor(available)),
  );
  const cashbackCents = Math.floor(spend * rateCentsPerCoin);
  return { spent: spend, cashbackCents };
}

/**
 * Aplica o resgate ao ledger (subtrai LandCoins, gera entry) e produz o
 * `PendingCashbackRedemption` a ser enviado ao `CashbackProvider` do billing.
 * Função pura: a IO (chamar o provider) fica fora da engine.
 */
export function redeemCashback(
  ledger: CoinLedger,
  request: RedemptionRequest,
  clock: Clock,
): RedeemResult {
  const { spent, cashbackCents } = quoteRedemption(
    request.landcoinsToSpend,
    request.rateCentsPerCoin,
    ledger.landcoins,
  );

  if (spent <= 0) {
    return { ledger, pending: null, ok: false };
  }

  const { ledger: newLedger } = awardLandcoins(
    ledger,
    -spent,
    'redeem_to_cashback',
    clock,
    `Resgate -> cashback ${cashbackCents}c`,
  );

  const pending: PendingCashbackRedemption = {
    userId: ledger.userId,
    landcoinsSpent: spent,
    cashbackCents,
    rateCentsPerCoin: request.rateCentsPerCoin,
    createdAt: clock.now,
  };

  return { ledger: newLedger, pending, ok: true };
}

// ─── Quests ─────────────────────────────────────────────────────────────

function metricValue(
  progress: UserProgress,
  metric: ProgressMetricKey | 'daily_login',
): number {
  if (metric === 'daily_login') return progress.streak.current;
  return progress.metrics[metric];
}

export function evaluateQuest(
  progress: UserProgress,
  quest: QuestDef,
  clock: Clock,
): QuestEvalResult {
  const existing: QuestProgress | undefined = progress.quests[quest.id];
  const stepProgress: Record<string, number> = existing
    ? { ...existing.stepProgress }
    : {};

  for (const step of quest.steps) {
    const cur = stepProgress[step.id] ?? 0;
    const val = metricValue(progress, step.metric);
    stepProgress[step.id] = Math.max(cur, Math.min(val, step.target));
  }

  const allDone = quest.steps.every(
    (s) => (stepProgress[s.id] ?? 0) >= s.target,
  );

  const prevStatus = existing?.status ?? 'active';
  let status: QuestProgress['status'] = prevStatus;
  if (allDone && status === 'active') status = 'completed';

  const justCompleted = status === 'completed' && prevStatus !== 'completed';
  const completedAt =
    justCompleted && !existing?.completedAt
      ? clock.now
      : existing?.completedAt;

  const updated: UserProgress = {
    ...progress,
    quests: {
      ...progress.quests,
      [quest.id]: { status, stepProgress, completedAt },
    },
  };

  return { progress: updated, justCompleted, status, stepProgress };
}


// ─── applyEvent: reducer central ───────────────────────────────────────
//
// Processa um `GamificationEvent` aplicando, em ordem:
//   1. atualização de métricas
//   2. streak (se daily_login)
//   3. awardXp (+ LandCoins por milestone de XP)
//   4. bônus direto de LandCoins por evento
//   5. avaliação de quests
//   6. checagem de badges
// Espelha o fluxo `POST /events` do billing (XpEvent -> xp/level/badge).

export function applyEvent(
  progress: UserProgress,
  event: GamificationEvent,
  badges: BadgeDef[],
  quests: QuestDef[],
  clock: Clock,
): ApplyEventResult {
  const metrics: ProgressMetrics = { ...progress.metrics };
  switch (event.type) {
    case 'search':
      metrics.searches += event.amount ?? 1;
      break;
    case 'save_favorite':
      metrics.favoritesSaved += event.amount ?? 1;
      break;
    case 'compare':
      metrics.comparisonsMade += event.amount ?? 1;
      break;
    case 'agent_cycle':
      metrics.agentCycles += event.amount ?? 1;
      break;
    case 'view_neighborhood':
      metrics.neighborhoodsExplored += event.amount ?? 1;
      break;
    case 'referral_signup':
      metrics.referrals += event.amount ?? 1;
      break;
    case 'closed_won':
      metrics.dealsClosed += event.amount ?? 1;
      break;
    case 'daily_login':
      break;
  }

  let p: UserProgress = { ...progress, metrics };

  const streakRes = event.type === 'daily_login' ? applyStreak(p, clock) : null;
  if (streakRes) p = streakRes.progress;

  const xpDelta = XP_TABLE[event.type] ?? 0;
  const xpRes = awardXp(p, xpDelta, clock);
  p = xpRes.progress;

  const lc = LANDCOIN_TABLE[event.type] ?? 0;
  if (lc > 0) p = { ...p, landcoins: p.landcoins + lc };

  const questResults = quests.map((q) => {
    const r = evaluateQuest(p, q, clock);
    p = r.progress;
    return { questId: q.id, ...r };
  });

  const badgeRes = checkBadges(p, badges);
  p = badgeRes.progress;

  return {
    progress: p,
    xp: xpRes,
    streak: streakRes,
    questResults,
    badgeRes,
    landcoinsBonus: lc,
  };
}

// ─── Leaderboard ────────────────────────────────────────────────────────

/**
 * Ranqueia entradas por xp (desempate por nível, depois userId estável).
 * Usa ranking denso por xp: empatados no mesmo xp dividem o mesmo rank.
 */
export function buildLeaderboard(
  entries: Array<
    { userId: string; xp: number; level: number } & Partial<LeaderboardEntry>
  >,
  currentUserId: string,
  opts: { limit?: number; scope?: 'global' | 'city'; city?: string } = {},
): Array<LeaderboardEntry & { rank: number; isCurrentUser: boolean }> {
  const limit = opts.limit ?? entries.length;
  const sorted = [...entries]
    .filter((e) => (opts.scope === 'city' ? e.city === opts.city : true))
    .sort(
      (a, b) =>
        b.xp - a.xp || b.level - a.level || a.userId.localeCompare(b.userId),
    );

  const ranked: Array<
    LeaderboardEntry & { rank: number; isCurrentUser: boolean }
  > = [];
  let lastXp: number | null = null;
  let lastRank = 0;
  sorted.forEach((e, i) => {
    const rank = e.xp === lastXp ? lastRank : i + 1;
    lastXp = e.xp;
    lastRank = rank;
    ranked.push({
      userId: e.userId,
      displayName: e.displayName ?? e.userId,
      city: e.city ?? '',
      xp: e.xp,
      level: e.level,
      tier: tierFromLevel(e.level),
      rank,
      isCurrentUser: e.userId === currentUserId,
    });
  });

  return ranked.slice(0, limit);
}

// ─── Factory ────────────────────────────────────────────────────────────

export function createInitialProgress(
  userId: string,
  clock: Clock,
): UserProgress {
  return {
    userId,
    xp: 0,
    level: 1,
    tier: 'bronze',
    landcoins: 0,
    metrics: {
      searches: 0,
      favoritesSaved: 0,
      comparisonsMade: 0,
      agentCycles: 0,
      neighborhoodsExplored: 0,
      referrals: 0,
      dealsClosed: 0,
    },
    streak: { current: 0, best: 0, lastActiveDate: null, freezes: 0 },
    badges: [],
    quests: {},
    updatedAt: clock.now,
  };
}


// ─── Catálogos padrão (data-driven, serializáveis) ────────────────────

export const DEFAULT_BADGES: BadgeDef[] = [
  {
    id: 'first_search',
    name: 'Primeira Busca',
    description: 'Executou sua primeira busca no LandMap.',
    tier: 'bronze',
    icon: '🔎',
    criteria: [{ kind: 'xp_at_least', value: 5 }],
    rewardLandcoins: 2,
  },
  {
    id: 'deal_hunter',
    name: 'Caçador de Ofertas',
    description: 'Salvou 10 imóveis como favoritos.',
    tier: 'silver',
    icon: '🎯',
    criteria: [{ kind: 'metric_at_least', metric: 'favoritesSaved', value: 10 }],
    rewardLandcoins: 10,
  },
  {
    id: 'neighborhood_master',
    name: 'Mestre do Bairro',
    description: 'Explorou 3 bairros diferentes.',
    tier: 'silver',
    icon: '🗺️',
    criteria: [{ kind: 'metric_at_least', metric: 'neighborhoodsExplored', value: 3 }],
    rewardLandcoins: 15,
  },
  {
    id: 'compare_3',
    name: 'Viciado em Comparar',
    description: 'Comparou 3 imóveis.',
    tier: 'bronze',
    icon: '⚖️',
    criteria: [{ kind: 'metric_at_least', metric: 'comparisonsMade', value: 3 }],
    rewardLandcoins: 8,
  },
  {
    id: 'streak_7',
    name: 'Streak de Ferro',
    description: 'Manteve 7 dias seguidos de atividade.',
    tier: 'gold',
    icon: '🔥',
    criteria: [{ kind: 'streak_at_least', value: 7 }],
    rewardLandcoins: 20,
  },
  {
    id: 'referrer',
    name: 'Embaixador',
    description: 'Indicou um amigo que se cadastrou.',
    tier: 'gold',
    icon: '🤝',
    criteria: [{ kind: 'metric_at_least', metric: 'referrals', value: 1 }],
    rewardLandcoins: 25,
  },
  {
    id: 'gold_tier',
    name: 'Sovereign Gold',
    description: 'Atingiu o tier Gold (nível 10).',
    tier: 'gold',
    icon: '🥇',
    criteria: [{ kind: 'tier_at_least', tier: 'gold' }],
    rewardLandcoins: 50,
  },
  {
    id: 'investor_sovereign',
    name: 'Investidor Sovereign',
    description: 'Atingiu o tier Sovereign (nível 15) — o ápice do LandMap.',
    tier: 'sovereign',
    icon: '👑',
    criteria: [{ kind: 'tier_at_least', tier: 'sovereign' }],
    rewardLandcoins: 100,
  },
];

export const DEFAULT_QUESTS: QuestDef[] = [
  {
    id: 'q_compare3',
    title: 'Compare 3 imóveis',
    description: 'Use a tela /compare em 3 propriedades.',
    rewardXp: 45,
    rewardLandcoins: 10,
    steps: [{ id: 's1', metric: 'comparisonsMade', target: 3 }],
    repeatable: true,
  },
  {
    id: 'q_fav5',
    title: 'Salve 5 favoritos',
    description: 'Marque 5 imóveis como favoritos.',
    rewardXp: 30,
    rewardLandcoins: 8,
    steps: [{ id: 's1', metric: 'favoritesSaved', target: 5 }],
    repeatable: true,
  },
  {
    id: 'q_refer1',
    title: 'Indique um amigo',
    description: 'Compartilhe seu link e ganhe quando ele se cadastrar.',
    rewardXp: 60,
    rewardLandcoins: 25,
    steps: [{ id: 's1', metric: 'referrals', target: 1 }],
  },
  {
    id: 'q_explore',
    title: 'Explore 3 bairros',
    description: 'Analise o heatmap de 3 bairros diferentes.',
    rewardXp: 40,
    rewardLandcoins: 12,
    steps: [{ id: 's1', metric: 'neighborhoodsExplored', target: 3 }],
    repeatable: true,
  },
];

