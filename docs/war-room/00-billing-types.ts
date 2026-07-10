// docs/war-room/00-billing-types.ts
// Sketch de tipos para `packages/billing` (NÃO editar arquivos centrais do repo).
// Referência p/ implementação do pacote billing, rotas /billing/*, /cashback/*,
// /referrals/* e campos em packages/db. Valores monetários em centavos (cents).

export type PlanTier = 'free' | 'premium' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type Gateway = 'mercadopago' | 'stripe';
export type CashbackKind = 'buyer' | 'seller' | 'referral';
export type CashbackStatus = 'pending' | 'confirmed' | 'released' | 'reversed';
export type ReferralStatus = 'sent' | 'signed_up' | 'closed_won' | 'rewarded';
export type GamificationLevel = 'bronze' | 'silver' | 'gold' | 'sovereign';
export type AgentMode = 'off' | 'copilot' | 'autopilot';

export interface Plan {
  tier: PlanTier;
  name: string;
  priceBRLMonthly: number;
  priceBRLYearly: number;
  cashbackRate: number; // % sobre fechamento (0.005 / 0.01 / 0.015)
  limits: PlanLimits;
  features: PlanFeatures;
}

export interface PlanLimits {
  searchesPerDay: number; // -1 = ilimitado
  aiMessagesPerDay: number;
  savedComparisons: number;
  activeListings: number;
  agentMode: AgentMode;
  agentCyclesPerDay: number;
}

export interface PlanFeatures {
  heatmap: boolean;
  unlimitedAI: boolean;
  advancedCompare: boolean;
  cloudFavorites: boolean;
  crmTwenty: boolean;
  autopilotAgents: boolean;
  whiteLabel: boolean;
  apiAccess: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  tier: PlanTier;
  status: SubscriptionStatus;
  gateway: Gateway;
  gatewaySubscriptionId: string;
  currentPeriodEnd: string; // ISO
  cancelAtPeriodEnd: boolean;
}

export interface CashbackBalance {
  userId: string;
  cents: number;
  pendingCents: number;
}

export interface CashbackTxn {
  id: string;
  userId: string;
  kind: CashbackKind;
  amountCents: number;
  status: CashbackStatus;
  dealValueCents?: number;
  releasedAt?: string;
  createdAt: string;
}

export interface Referral {
  code: string;
  referrerId: string;
  referredId?: string;
  status: ReferralStatus;
  rewardCents: number;
  createdAt: string;
}

export interface GamificationProfile {
  userId: string;
  xp: number;
  level: GamificationLevel;
  badges: string[];
  updatedAt: string;
}

export interface XpEvent {
  userId: string;
  type:
    | 'search'
    | 'save_favorite'
    | 'compare'
    | 'agent_cycle'
    | 'referral_signup'
    | 'closed_won';
  delta: number;
  createdAt: string;
}

// Take-rate do LandMap sobre fechamento (financia o cashback).
export const LANDMAP_TAKE_RATE = 0.02; // 2%–3% (ajustar por tier/parceria)
