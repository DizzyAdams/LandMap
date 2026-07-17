import { describe, it, expect } from 'vitest';
import {
  AGENTS,
  createRoster,
  createInitialStore,
  runCycle,
  runFollowUpCycle,
  mulberry32,
  NoopCrm,
} from '../index.js';
import type { AgentContext, AutonomyLevel } from '../types.js';

function makeCtx(
  store: ReturnType<typeof createInitialStore>,
  autonomy: AutonomyLevel,
): AgentContext {
  return {
    store,
    autonomy,
    rng: mulberry32(42),
    now: () => new Date().toISOString(),
    crm: new NoopCrm(),
  };
}

const NEW_ROLES = [
  'seo_agent',
  'lead_enricher',
  'market_intel',
  'onboarding',
  'negotiator',
  'followup',
  'cold_recovery',
  'waba_followup',
] as const;

const GROWTH_IDS = NEW_ROLES.map((r) => `agent-${r}`);

describe('growth agents (Spec 04)', () => {
  it('extends the roster with growth + followup squad', () => {
    const roster = createRoster();
    const roles = roster.map((a) => a.role);
    for (const r of NEW_ROLES) expect(roles).toContain(r);
    expect(roster.length).toBe(14);
  });

  it('adds growth + followup squad to the AGENTS array', () => {
    const roles = AGENTS.map((a) => a.role);
    for (const r of NEW_ROLES) expect(roles).toContain(r);
    expect(AGENTS.length).toBe(14);
  });

  it('growth agents run and emit HITL tasks in copilot', async () => {
    const s = createInitialStore();
    await runCycle(s, makeCtx(s, 'copilot'));
    const kinds = new Set(s.pendingTasks().map((t) => t.kind));
    // Each growth agent should have produced at least one review task.
    expect(kinds.has('seo_publish')).toBe(true);
    expect(kinds.has('enrich')).toBe(true);
    expect(kinds.has('alert')).toBe(true);
    expect(kinds.has('onboard')).toBe(true);
    expect(kinds.has('negotiate')).toBe(true);
  });

  it('growth agents never own or create deals (HITL only)', async () => {
    const s = createInitialStore();
    await runCycle(s, makeCtx(s, 'autopilot'));
    // Growth agents only emit updateLead/updateDeal effects — they must not
    // create deals nor appear as deal owners.
    expect(s.deals.every((d) => !GROWTH_IDS.includes(d.ownerAgent))).toBe(true);
  });

  it('seeds pending follow-ups and team on standby', () => {
    const s = createInitialStore();
    const fus = s.pendingTasks().filter((t) => t.kind === 'follow_up');
    expect(fus.length).toBeGreaterThanOrEqual(3);
    expect(s.agents.every((a) => a.status === 'idle')).toBe(true);
    expect(s.agents.some((a) => a.role === 'followup')).toBe(true);
  });

  it('runFollowUpCycle enqueues or keeps follow_up tasks in copilot', async () => {
    const s = createInitialStore();
    const before = s.pendingTasks().filter((t) => t.kind === 'follow_up').length;
    await runFollowUpCycle(s, makeCtx(s, 'copilot'));
    const after = s.pendingTasks().filter((t) => t.kind === 'follow_up').length;
    expect(after).toBeGreaterThanOrEqual(before);
  });
});

