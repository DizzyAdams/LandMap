import type { AgentContext, CycleResult, SalesEffect } from './types.js';
import { SalesStore } from './store.js';
import { AGENTS } from './agents.js';
import { applyEffectsUnderAutonomy, syncClosedDeals } from './autonomy.js';

/**
 * Run one full sales cycle: each specialised agent perceives the current
 * store, emits effects, and those effects are applied according to the
 * autonomy policy. Returns a snapshot of what happened for the UI.
 */
export async function runCycle(store: SalesStore, ctx: AgentContext): Promise<CycleResult> {
  if (ctx.autonomy === 'off') {
    return {
      events: [],
      tasks: [],
      leads: [],
      deals: [],
      autonomy: 'off',
      generatedAt: ctx.now(),
    };
  }

  const allEffects: SalesEffect[] = [];

  for (const agent of AGENTS) {
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
      agentState.currentTask = undefined;
      agentState.actionsToday += Math.max(1, effects.filter((e) => e.type !== 'event').length);
      agentState.successToday += 1;
      agentState.lastActionAt = ctx.now();
    }

    allEffects.push(...effects);
  }

  store.recomputeAnalytics();
  await syncClosedDeals(store, ctx);

  return SalesStore.cycleResult(store, allEffects, ctx.autonomy);
}
