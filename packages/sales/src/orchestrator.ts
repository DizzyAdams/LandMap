import type { AgentContext, CycleResult, SalesEffect } from './types.js';
import { SalesStore } from './store.js';
import { AGENTS, FOLLOWUP_SQUAD, followupAgent } from './agents.js';
import { applyEffectsUnderAutonomy, syncClosedDeals } from './autonomy.js';

function markStandby(store: SalesStore, autonomy: AgentContext['autonomy']) {
  for (const a of store.agents) {
    if (autonomy === 'off') {
      a.status = 'paused';
      a.currentTask = 'Em espera (autonomia off)';
    } else if (a.status !== 'running') {
      a.status = 'idle';
      if (!a.currentTask || a.currentTask.startsWith('Em espera')) {
        a.currentTask = 'Em espera na fila';
      }
    }
  }
}

async function runAgentList(
  store: SalesStore,
  ctx: AgentContext,
  list: typeof AGENTS,
): Promise<SalesEffect[]> {
  const allEffects: SalesEffect[] = [];

  for (const agent of list) {
    const agentState = store.getAgent(agent.id);
    if (agentState) {
      agentState.status = 'running';
      agentState.currentTask = `${agent.name} atuando`;
    }

    let effects: SalesEffect[] = [];
    try {
      effects = agent.run(ctx, store);
    } catch {
      effects = [];
    }

    applyEffectsUnderAutonomy(store, effects, ctx);

    if (agentState) {
      agentState.status = 'idle';
      agentState.currentTask = 'Em espera na fila';
      agentState.actionsToday += Math.max(1, effects.filter((e) => e.type !== 'event').length);
      agentState.successToday += 1;
      agentState.lastActionAt = ctx.now();
    }

    allEffects.push(...effects);
  }

  return allEffects;
}

/**
 * Run one full sales cycle: each specialised agent perceives the current
 * store, emits effects, and those effects are applied according to the
 * autonomy policy. Returns a snapshot of what happened for the UI.
 */
export async function runCycle(store: SalesStore, ctx: AgentContext): Promise<CycleResult> {
  if (ctx.autonomy === 'off') {
    markStandby(store, 'off');
    return {
      events: [],
      tasks: [],
      leads: [],
      deals: [],
      autonomy: 'off',
      generatedAt: ctx.now(),
    };
  }

  const allEffects = await runAgentList(store, ctx, AGENTS);
  store.recomputeAnalytics();
  await syncClosedDeals(store, ctx);
  markStandby(store, ctx.autonomy);

  return SalesStore.cycleResult(store, allEffects, ctx.autonomy);
}

/**
 * Ciclo só do agente Follow-up (admin: “rodar fila de recontatos”).
 */
export async function runFollowUpCycle(
  store: SalesStore,
  ctx: AgentContext,
): Promise<CycleResult> {
  if (ctx.autonomy === 'off') {
    markStandby(store, 'off');
    return {
      events: [],
      tasks: [],
      leads: [],
      deals: [],
      autonomy: 'off',
      generatedAt: ctx.now(),
    };
  }

  const allEffects = await runAgentList(store, ctx, FOLLOWUP_SQUAD);
  store.recomputeAnalytics();
  markStandby(store, ctx.autonomy);
  return SalesStore.cycleResult(store, allEffects, ctx.autonomy);
}

/**
 * Tick leve de standby: squad de follow-up (para auto-loop no admin).
 * Mesmo que runFollowUpCycle — nome semântico para o loop.
 */
export async function runStandbyTick(
  store: SalesStore,
  ctx: AgentContext,
): Promise<CycleResult> {
  return runFollowUpCycle(store, ctx);
}

export { followupAgent };
