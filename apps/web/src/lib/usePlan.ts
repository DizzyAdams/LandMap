'use client';

import { useEffect, useState } from 'react';
import { MockUser, readMockUser } from './mockAuth';
import { hasPlan, PlanId, planMeta } from './plans';

export type PlanState = {
  user: MockUser | null;
  plan: PlanId;
  /** Demo-mode upgrade (localStorage only). */
  upgrade: (plan: PlanId) => void;
  /** Demo-mode downgrade. */
  reset: () => void;
  has: (required: PlanId) => boolean;
  planName: string;
};

const PLAN_KEY = 'landmap:selected_plan';

function readPlan(): PlanId {
  try {
    const raw = window.localStorage.getItem(PLAN_KEY);
    if (raw === 'access' || raw === 'plus' || raw === 'pro' || raw === 'business') return raw;
  } catch {
    /* ignore */
  }
  return 'free';
}

function writePlan(plan: PlanId) {
  try {
    window.localStorage.setItem(PLAN_KEY, plan);
  } catch {
    /* ignore */
  }
}

/** plan = selected_plan (demo) if present, else user.plan, else free. */
export function usePlan(): PlanState {
  const [user, setUser] = useState<MockUser | null>(null);
  const [plan, setPlan] = useState<PlanId>('free');

  useEffect(() => {
    const u = readMockUser();
    setUser(u);
    const stored = readPlan();
    setPlan(stored !== 'free' ? stored : (u?.plan as PlanId) ?? 'free');
  }, []);

  const upgrade = (next: PlanId) => {
    writePlan(next);
    setPlan(next);
    if (user) {
      try {
        const updated = { ...user, plan: next };
        window.localStorage.setItem('landmap_mock_user', JSON.stringify(updated));
        setUser(updated);
      } catch {
        /* ignore */
      }
    }
  };

  const reset = () => {
    writePlan('free');
    setPlan('free');
  };

  return {
    user,
    plan,
    upgrade,
    reset,
    has: (required) => hasPlan(plan, required),
    planName: planMeta(plan)?.name ?? 'LandMap Grátis',
  };
}
