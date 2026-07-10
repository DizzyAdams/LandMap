// packages/gamification/src/types.ts
//
// Domínio de gamificação do LandMap.
//
// ALINHAMENTO COM O AGENTE IRMÃO (billing/cashback):
//   - `docs/war-room/00-billing-types.ts` é a fonte canônica de:
//       GamificationLevel = 'bronze' | 'silver' | 'gold' | 'sovereign'
//       CashbackBalance { userId, cents, pendingCents }
//       CashbackTxn { userId, kind, amountCents, status, ... }
//       Referral { code, referrerId, referredId, status, rewardCents }
//       XpEvent { userId, type, delta, createdAt }
//       LANDMAP_TAKE_RATE = 0.02
//   - Aqui reusamos os MESMOS nomes de tier/`XpEvent.type` para que o
//     mapeamento seja 1:1 (ver `applyEvent` -> XpEvent e `redeemCashback`
//     -> CashbackProvider). Nada é editado nos arquivos centrais.

/** Tier público de gamificação (espelha `GamificationLevel` do billing). */
export type GamificationTier = 'bronze' | 'silver' | 'gold' | 'sovereign';

/**
 * Eventos de domínio que alimentam a engine. Espelham o `XpEvent.type`
 * do pacote billing: search | save_favorite | compare | agent_cycle |
 * referral_signup | closed_won — acrescentamos view_neighborhood e
 * daily_login para cobrir streaks/métricas de descoberta.
 */
export type GamificationEventType =
  | 'search'
  | 'save_favorite'
  | 'compare'
  | 'agent_cycle'
  | 'referral_signup'
  | 'closed_won'
  | 'view_neighborhood'
  | 'daily_login';

export interface GamificationEvent {
  userId: string;
  type: GamificationEventType;
  /** Magnitude opcional (ex.: qtd comparada, valor do fechamento em centavos). */
  amount?: number;
  city?: string;
  neighborhood?: string;
  /** ISO 8601. */
  createdAt: string;
}

export type ProgressMetricKey =
  | 'searches'
  | 'favoritesSaved'
  | 'comparisonsMade'
  | 'agentCycles'
  | 'neighborhoodsExplored'
  | 'referrals'
  | 'dealsClosed';

export interface ProgressMetrics {
  searches: number;
  favoritesSaved: number;
  comparisonsMade: number;
  agentCycles: number;
  neighborhoodsExplored: number;
  referrals: number;
  dealsClosed: number;
}

export interface StreakState {
  /** Dias consecutivos de atividade. */
  current: number;
  best: number;
  /** Último dia ativo no formato YYYY-MM-DD (ou null se nunca). */
  lastActiveDate: string | null;
  /** Itens "freeze" disponíveis para não quebrar a streak em 1 dia perdido. */
  freezes: number;
}

/** Estado completo de progresso de um usuário (persistido em `packages/db`). */
export interface UserProgress {
  userId: string;
  xp: number;
  /** Nível numérico 1-based (deriva o tier). */
  level: number;
  /** Tier derivado, sincronizado com `GamificationLevel` do billing. */
  tier: GamificationTier;
  /** Saldo de LandCoins (economia virtual). */
  landcoins: number;
  metrics: ProgressMetrics;
  streak: StreakState;
  /** IDs de badges desbloqueados. */
  badges: string[];
  /** Progresso por quest (id -> QuestProgress). */
  quests: Record<string, QuestProgress>;
  /** ISO 8601. */
  updatedAt: string;
}

// ─── Badges ─────────────────────────────────────────────────────────────

export type BadgeCriterion =
  | { kind: 'xp_at_least'; value: number }
  | { kind: 'tier_at_least'; tier: GamificationTier }
  | { kind: 'metric_at_least'; metric: ProgressMetricKey; value: number }
  | { kind: 'streak_at_least'; value: number }
  | { kind: 'badge_requires'; badgeId: string };

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  /** "Raridade" do badge (== tier mínimo necessário para brilhar). */
  tier: GamificationTier;
  /** Glyph/emoji exibido no BadgeShelf. */
  icon: string;
  /** TODOS os critérios devem ser satisfeitos. */
  criteria: BadgeCriterion[];
  /** LandCoins concedidos ao desbloquear (opcional). */
  rewardLandcoins?: number;
}

// ─── Quests / Missões ─────────────────────────────────────────────────

export type QuestStatus = 'active' | 'completed' | 'claimed';

export interface QuestStep {
  id: string;
  metric: ProgressMetricKey | 'daily_login';
  target: number;
}

export interface QuestDef {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  rewardLandcoins: number;
  steps: QuestStep[];
  /** Se repetível por dia/semana (o route zera o progresso). */
  repeatable?: boolean;
}

export interface QuestProgress {
  status: QuestStatus;
  stepProgress: Record<string, number>;
  completedAt?: string;
}


// ─── Ledger de LandCoins / integração com Cashback ─────────────────────

export type LedgerEntryKind =
  | 'earn_xp_milestone'
  | 'quest_reward'
  | 'badge_reward'
  | 'streak_bonus'
  | 'referral_reward'
  | 'redeem_to_cashback';

export interface LedgerEntry {
  id: string;
  userId: string;
  kind: LedgerEntryKind;
  /** + ganho / - gasto. */
  landcoinsDelta: number;
  balanceAfter: number;
  note?: string;
  createdAt: string;
}

export interface CoinLedger {
  userId: string;
  landcoins: number;
  entries: LedgerEntry[];
}

/** Solicitação de resgate de LandCoins -> Cashback real (enviada ao billing). */
export interface RedemptionRequest {
  landcoinsToSpend: number;
  /** Taxa de conversão em centavos de BRL por LandCoin. */
  rateCentsPerCoin: number;
}

/** Payload enviado ao `CashbackProvider` do pacote billing. */
export interface PendingCashbackRedemption {
  userId: string;
  landcoinsSpent: number;
  cashbackCents: number;
  rateCentsPerCoin: number;
  createdAt: string;
}

/**
 * PORT de integração com o pacote billing (agente irmão).
 * O billing implementa esta interface; a engine permanece pura e testável.
 */
export interface CashbackProvider {
  getBalance(userId: string): Promise<{ cents: number; pendingCents: number }>;
  redeem(
    userId: string,
    amountCents: number,
    meta: PendingCashbackRedemption,
  ): Promise<{ id: string; status: 'pending' | 'confirmed' }>;
}

// ─── Leaderboard ────────────────────────────────────────────────────────

export type LeaderboardScope = 'global' | 'city';

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  city: string;
  xp: number;
  level: number;
  tier: GamificationTier;
}

export interface RankedLeaderboardEntry extends LeaderboardEntry {
  rank: number;
  isCurrentUser: boolean;
}

// ─── Resultados das funções puras ──────────────────────────────────────

export interface Clock {
  /** ISO 8601 usado para `updatedAt` e ids determinísticos. */
  now: string;
  /** YYYY-MM-DD; se omitido, é derivado de `now`. */
  today?: string;
}

export interface AwardXpResult {
  progress: UserProgress;
  xpAwarded: number;
  landcoinsEarned: number;
  leveledUp: boolean;
  newLevel: number;
  previousLevel: number;
}

export interface CheckBadgesResult {
  progress: UserProgress;
  newlyUnlocked: BadgeDef[];
}

export interface ApplyStreakResult {
  progress: UserProgress;
  streakIncreased: boolean;
  streakBroken: boolean;
  freezeUsed: boolean;
}

export interface RedeemResult {
  ledger: CoinLedger;
  pending: PendingCashbackRedemption | null;
  ok: boolean;
}

export interface QuestEvalResult {
  progress: UserProgress;
  justCompleted: boolean;
  status: QuestStatus;
  stepProgress: Record<string, number>;
}

export interface ApplyEventResult {
  progress: UserProgress;
  xp: AwardXpResult;
  streak: ApplyStreakResult | null;
  questResults: Array<QuestEvalResult & { questId: string }>;
  badgeRes: CheckBadgesResult;
  landcoinsBonus: number;
}

