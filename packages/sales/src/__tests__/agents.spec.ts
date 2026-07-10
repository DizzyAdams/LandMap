import { describe, it, expect } from 'vitest';
import {
  AGENTS,
  createRoster,
  createInitialStore,
  runCycle,
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
] as const;

const GROWTH_IDS = NEW_ROLES.map((r) => `agent-${r}`);

describe('growth agents (Spec 04)', () => {
  it('extends the roster with the 5 growth agents', () => {
    const roster = createRoster();
    const roles = roster.map((a) => a.role);
    for (const r of NEW_ROLES) expect(roles).toContain(r);
    expect(roster.length).toBe(11);
  });

  it('adds the 5 growth agents to the AGENTS array', () => {
    const roles = AGENTS.map((a) => a.role);
    for (const r of NEW_ROLES) expect(roles).toContain(r);
    expect(AGENTS.length).toBe(11);
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
});
