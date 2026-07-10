import { describe, it, expect } from 'vitest';
import {
  createInitialStore,
  runCycle,
  approveTask,
  rejectTask,
  mulberry32,
  NoopCrm,
} from '../index.js';
import type { AgentContext, AutonomyLevel, SalesTask } from '../types.js';

function makeCtx(store: ReturnType<typeof createInitialStore>, autonomy: AutonomyLevel): AgentContext {
  const rng = mulberry32(42);
  return {
    store,
    autonomy,
    rng,
    now: () => new Date().toISOString(),
    crm: new NoopCrm(),
  };
}

describe('LandMap autonomous sales engine', () => {
  it('seeds a coherent demo store', () => {
    const s = createInitialStore();
    expect(s.leads.length).toBe(8);
    expect(s.deals.length).toBe(6);
    expect(s.analytics.funnel.length).toBe(8);
    expect(s.analytics.totals.pipelineValue).toBeGreaterThan(0);
    expect(s.agents.length).toBe(11);
  });

  it('autopilot cycle advances the pipeline and logs events', async () => {
    const s = createInitialStore();
    const ctx = makeCtx(s, 'autopilot');
    const res = await runCycle(s, ctx);
    expect(res.events.length).toBeGreaterThan(0);
    // Prospector adds new leads immediately under autopilot
    expect(s.leads.length).toBeGreaterThan(8);
    expect(s.analytics.totals.weightedPipeline).toBeGreaterThan(0);
  });

  it('copilot produces pending tasks instead of mutating state', async () => {
    const s = createInitialStore();
    const ctx = makeCtx(s, 'copilot');
    await runCycle(s, ctx);
    const pending = s.pendingTasks();
    expect(pending.length).toBeGreaterThan(0);
    // No leads added directly — mutations wait for human approval
    expect(s.leads.length).toBe(8);
  });

  it('approveTask marks the task approved and applies it', () => {
    const s = createInitialStore();
    const task = s.tasks.find((t: SalesTask) => t.status === 'pending');
    expect(task).toBeDefined();
    if (task) {
      const engagementBefore =
        task.leadId != null ? s.getLead(task.leadId)?.engagementCount ?? 0 : 0;
      approveTask(s, task.id);
      expect(task.status).toBe('approved');
      if (task.kind === 'outreach' || task.kind === 'follow_up') {
        const lead = task.leadId != null ? s.getLead(task.leadId) : undefined;
        expect(lead?.engagementCount).toBe(engagementBefore + 1);
      }
    }
  });

  it('rejectTask marks the task rejected', () => {
    const s = createInitialStore();
    const task = s.tasks.find((t: SalesTask) => t.status === 'pending');
    expect(task).toBeDefined();
    if (task) {
      rejectTask(s, task.id);
      expect(task.status).toBe('rejected');
    }
  });

  it('off autonomy runs no agents', async () => {
    const s = createInitialStore();
    const ctx = makeCtx(s, 'off');
    const res = await runCycle(s, ctx);
    expect(res.leads.length).toBe(0);
    expect(res.events.length).toBe(0);
    expect(s.leads.length).toBe(8);
  });
});
