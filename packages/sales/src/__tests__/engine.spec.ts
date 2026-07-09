import { describe, it, expect } from 'vitest';
import {
  createInitialStore,
  runCycle,
  applySalesEffect,
  applyTaskMutation,
  approveTask,
  rejectTask,
  applyEffectsUnderAutonomy,
  mulberry32,
  CollectingCrm,
  SalesStore,
} from '../index.js';
import type { AgentContext, AutonomyLevel, Lead, Deal, SalesTask, SalesEffect } from '../types.js';

function ctx(store: SalesStore, autonomy: AutonomyLevel, crm?: CollectingCrm): AgentContext {
  return {
    store,
    autonomy,
    rng: mulberry32(7),
    now: () => '2026-01-01T00:00:00.000Z',
    crm: crm ?? new CollectingCrm(),
  };
}

const lead = (id: string): Lead => ({
  id,
  name: 'Ana',
  source: 'orgânico',
  interest: 'apartamento',
  signals: [],
  createdAt: 't',
  engagementCount: 0,
});

const deal = (id: string, stage: Deal['stage']): Deal => ({
  id,
  leadId: 'l',
  title: 'Negócio',
  stage,
  amount: 100,
  currency: 'BRL',
  probability: 0.3,
  ownerAgent: 'a',
  lastActivityAt: 't',
  createdAt: 't',
});

describe('sales engine — applySalesEffect', () => {
  it('adds lead/deal/event and applies update patches', () => {
    const s = new SalesStore();
    applySalesEffect(s, { type: 'lead', lead: lead('l1') });
    expect(s.leads).toHaveLength(1);

    applySalesEffect(s, { type: 'updateLead', id: 'l1', patch: { score: 80, tier: 'hot' } });
    expect(s.getLead('l1')?.score).toBe(80);

    applySalesEffect(s, { type: 'deal', deal: deal('d1', 'qualified') });
    expect(s.deals).toHaveLength(1);

    applySalesEffect(s, { type: 'updateDeal', id: 'd1', patch: { stage: 'proposal' } });
    expect(s.getDeal('d1')?.stage).toBe('proposal');
  });

  it('increments channel reply stats on a reply event', () => {
    const s = new SalesStore();
    applySalesEffect(s, {
      type: 'event',
      event: {
        id: 'e1',
        at: 't',
        agentId: 'a',
        kind: 'reply',
        title: 'r',
        detail: 'x',
        dealId: 'd',
        level: 'info',
        channel: 'email',
      },
    } as SalesEffect);
    expect(s.channelStats.email.replies).toBe(1);
  });
});

describe('sales engine — applyTaskMutation', () => {
  it('bumps engagement, marks worked, advances stage and can create a deal', () => {
    const s = new SalesStore();
    s.addLead(lead('l1'));
    s.addDeal(deal('d1', 'qualified'));

    const task: SalesTask = {
      id: 't1',
      kind: 'outreach',
      agentId: 'a',
      leadId: 'l1',
      dealId: 'd1',
      title: 'x',
      detail: 'y',
      status: 'pending',
      createdAt: 't',
      advanceTo: 'scheduled',
    };
    applyTaskMutation(s, task);
    expect(s.getLead('l1')?.engagementCount).toBe(1);
    expect(s.getLead('l1')?.worked).toBe(true);
    expect(s.getDeal('d1')?.stage).toBe('scheduled');

    const createTask: SalesTask = {
      id: 't2',
      kind: 'proposal',
      agentId: 'a',
      leadId: 'l1',
      title: 'p',
      detail: '',
      status: 'pending',
      createdAt: 't',
      createDeal: { amount: 200, title: 'Novo' },
    };
    const before = s.deals.length;
    applyTaskMutation(s, createTask);
    expect(s.deals.length).toBe(before + 1);
  });
});

describe('sales engine — autonomy policy', () => {
  it('autopilot applies state-changing effects immediately', () => {
    const s = new SalesStore();
    applyEffectsUnderAutonomy(s, [{ type: 'lead', lead: lead('l1') }], ctx(s, 'autopilot'));
    expect(s.leads).toHaveLength(1);
  });

  it('copilot turns state-changing effects into pending review tasks', () => {
    const s = new SalesStore();
    applyEffectsUnderAutonomy(s, [{ type: 'lead', lead: lead('l1') }], ctx(s, 'copilot'));
    expect(s.leads).toHaveLength(0);
    const pending = s.pendingTasks();
    expect(pending).toHaveLength(1);
    expect(pending[0].kind).toBe('review');
    expect((pending[0].effect as SalesEffect)?.type).toBe('lead');
  });

  it('off applies nothing', () => {
    const s = new SalesStore();
    applyEffectsUnderAutonomy(s, [{ type: 'lead', lead: lead('l1') }], ctx(s, 'off'));
    expect(s.leads).toHaveLength(0);
    expect(s.pendingTasks()).toHaveLength(0);
  });
});

describe('sales engine — approve/reject', () => {
  it('approveTask applies the mutation and increments engagement', () => {
    const s = new SalesStore();
    s.addLead(lead('l1'));
    const task: SalesTask = {
      id: 't1',
      kind: 'follow_up',
      agentId: 'a',
      leadId: 'l1',
      title: 'x',
      detail: 'y',
      status: 'pending',
      createdAt: 't',
    };
    s.addTask(task);
    const before = s.getLead('l1')!.engagementCount;
    approveTask(s, 't1');
    expect(s.getTask('t1')?.status).toBe('approved');
    expect(s.getLead('l1')!.engagementCount).toBe(before + 1);
  });

  it('rejectTask marks the task rejected without mutating state', () => {
    const s = new SalesStore();
    const task: SalesTask = {
      id: 't1',
      kind: 'follow_up',
      agentId: 'a',
      title: 'x',
      detail: 'y',
      status: 'pending',
      createdAt: 't',
    };
    s.addTask(task);
    rejectTask(s, 't1');
    expect(s.getTask('t1')?.status).toBe('rejected');
  });
});

describe('sales engine — runCycle', () => {
  it('is deterministic for a fixed RNG under autopilot', async () => {
    const a = createInitialStore();
    const b = createInitialStore();
    await runCycle(a, ctx(a, 'autopilot'));
    await runCycle(b, ctx(b, 'autopilot'));
    expect(a.leads.length).toBe(b.leads.length);
    expect(a.analytics.totals.weightedPipeline).toBe(b.analytics.totals.weightedPipeline);
  });

  it('syncs closed-won deals to the CRM under autopilot', async () => {
    const s = createInitialStore();
    s.addDeal(deal('won', 'closed_won'));
    const crm = new CollectingCrm();
    await runCycle(s, ctx(s, 'autopilot', crm));
    expect(crm.deals.some((d) => d.id === 'won')).toBe(true);
  });

  it('off autonomy short-circuits the cycle', async () => {
    const s = createInitialStore();
    const res = await runCycle(s, ctx(s, 'off'));
    expect(res.leads).toHaveLength(0);
    expect(res.events).toHaveLength(0);
  });
});
