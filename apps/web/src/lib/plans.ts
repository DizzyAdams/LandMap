// Plan tiers for LandMap — single source of truth (mirrors pricing/plans pages).
// Demo-mode: "paid" plan is selected in localStorage, never enforced server-side.

export type PlanId = 'free' | 'access' | 'plus' | 'pro' | 'business';

// Numeric tier used to gate premium features (higher = more access).
export const PLAN_TIER: Record<PlanId, number> = {
  free: 0,
  access: 1,
  plus: 2,
  pro: 3,
  business: 4,
};

export type PlanMeta = {
  id: PlanId;
  name: string;
  priceBRL: number;
  tagline: string;
};

export const PLANS: PlanMeta[] = [
  { id: 'access', name: 'LandMap Access', priceBRL: 69.9, tagline: 'Comece com o essencial' },
  { id: 'plus', name: 'LandMap Plus', priceBRL: 119.9, tagline: 'Mais popular' },
  { id: 'pro', name: 'LandMap Pro', priceBRL: 249.9, tagline: 'Para profissionais' },
  { id: 'business', name: 'LandMap Business', priceBRL: 699.9, tagline: 'Para equipes' },
];

export function planTier(plan: PlanId | undefined | null): number {
  return PLAN_TIER[plan ?? 'free'] ?? 0;
}

/** Has the user reached (or exceeded) the required plan tier? */
export function hasPlan(plan: PlanId | undefined | null, required: PlanId): boolean {
  return planTier(plan) >= PLAN_TIER[required];
}

export function planMeta(id: PlanId): PlanMeta | undefined {
  return PLANS.find((p) => p.id === id);
}

export function formatBRL(v: number): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
