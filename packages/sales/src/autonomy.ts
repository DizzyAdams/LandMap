import type { AutonomyLevel, Deal, SalesEffect, SalesTask } from './types.js';
import { SalesStore } from './store.js';
import type { AgentContext } from './types.js';

/** Apply a single concrete mutation to the store. */
export function applySalesEffect(store: SalesStore, effect: SalesEffect): void {
  switch (effect.type) {
    case 'lead':
      store.addLead(effect.lead);
      break;
    case 'deal':
      store.addDeal(effect.deal);
      break;
    case 'event':
      store.addEvent(effect.event);
      if (effect.event.kind === 'reply' && effect.event.detail) {
        const ch = (effect.event as any).channel as keyof typeof store.channelStats;
        if (ch && store.channelStats[ch]) store.channelStats[ch].replies++;
      }
      break;
    case 'task':
      store.addTask(effect.task);
      break;
    case 'updateLead':
      store.updateLead(effect.id, effect.patch);
      break;
    case 'updateDeal':
      store.updateDeal(effect.id, effect.patch);
      break;
  }
}

/** Execute the mutation carried by an approved/auto-run task. */
export function applyTaskMutation(store: SalesStore, task: SalesTask): void {
  if (task.effect) {
    applySalesEffect(store, task.effect);
  }
  if (task.channel && store.channelStats[task.channel]) {
    store.channelStats[task.channel].sent++;
  }
  if (task.leadId) {
    const lead = store.getLead(task.leadId);
    if (lead) {
      lead.engagementCount = (lead.engagementCount || 0) + 1;
      if (task.kind === 'outreach' || task.kind === 'follow_up') lead.worked = true;
    }
  }
  if (task.dealId && task.advanceTo) {
    store.updateDeal(task.dealId, {
      stage: task.advanceTo,
      lastActivityAt: new Date().toISOString(),
    });
  }
  if (task.dealId && task.createDeal) {
    const lead = task.leadId ? store.getLead(task.leadId) : undefined;
    store.addDeal({
      id: `deal-${Date.now()}-${Math.floor(Math.random() * 1e4)}`,
      leadId: task.leadId ?? 'unknown',
      title: task.createDeal.title,
      stage: 'qualified',
      amount: task.createDeal.amount,
      currency: 'BRL',
      probability: 0.35,
      ownerAgent: task.agentId,
      property: lead?.interest,
      nextAction: 'Qualificar interesse e agendar visita',
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
  }
}

export function approveTask(store: SalesStore, id: string): SalesTask | undefined {
  const task = store.getTask(id);
  if (!task || task.status !== 'pending') return task;
  task.status = 'approved';
  applyTaskMutation(store, task);
  store.recomputeAnalytics();
  return task;
}

export function rejectTask(store: SalesStore, id: string): SalesTask | undefined {
  const task = store.getTask(id);
  if (!task || task.status !== 'pending') return task;
  task.status = 'rejected';
  store.recomputeAnalytics();
  return task;
}

export function setAutonomy(store: SalesStore, level: AutonomyLevel): void {
  store.autonomy = level;
}

/**
 * Apply one cycle's worth of effects according to the autonomy policy.
 *  - autopilot: every effect is applied immediately (state mutates).
 *  - copilot:   state-changing effects become pending tasks for human approval;
 *               events are always logged for transparency.
 *  - off:       nothing is applied (agents are paused).
 */
export function applyEffectsUnderAutonomy(
  store: SalesStore,
  effects: SalesEffect[],
  ctx: AgentContext,
): void {
  if (ctx.autonomy === 'off') return;

  for (const effect of effects) {
    if (effect.type === 'event') {
      applySalesEffect(store, effect);
      continue;
    }
    if (effect.type === 'task') {
      if (ctx.autonomy === 'autopilot') {
        effect.task.status = 'approved';
        store.addTask(effect.task);
        applyTaskMutation(store, effect.task);
      } else {
        effect.task.status = 'pending';
        store.addTask(effect.task);
      }
      continue;
    }
    // State-changing effects (lead/deal/updateLead/updateDeal)
    if (ctx.autonomy === 'autopilot') {
      applySalesEffect(store, effect);
    } else {
      const review: SalesTask = {
        id: `review-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        kind: 'review',
        agentId: 'orchestrator',
        title: `Aprovar: ${describeEffect(effect)}`,
        detail: JSON.stringify(effect),
        status: 'pending',
        createdAt: new Date().toISOString(),
        effect,
      };
      store.addTask(review);
    }
  }
}

function describeEffect(effect: SalesEffect): string {
  switch (effect.type) {
    case 'lead':
      return `novo lead ${effect.lead.name}`;
    case 'deal':
      return `novo negócio ${effect.deal.title}`;
    case 'updateLead':
      return `atualizar lead ${effect.id}`;
    case 'updateDeal':
      return `atualizar negócio ${effect.id}`;
    default:
      return effect.type;
  }
}

/** Push any newly-closed deals to the CRM adapter, if configured. */
export async function syncClosedDeals(store: SalesStore, ctx: AgentContext): Promise<void> {
  if (!ctx.crm) return;
  const closed = store.deals.filter((d: Deal) => d.stage === 'closed_won');
  for (const deal of closed) {
    try {
      await ctx.crm.syncDeal(deal);
    } catch {
      /* swallow — CRM sync is best-effort */
    }
  }
}
