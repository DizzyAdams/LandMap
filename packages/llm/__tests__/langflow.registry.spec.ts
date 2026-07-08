import { describe, it, expect } from 'vitest';
import { listWorkflows, runWorkflowById, getWorkflowDefinition } from '../src/langflow/registry';

describe('langflow registry', () => {
  it('lists the built-in workflows', () => {
    const wf = listWorkflows();
    expect(wf.length).toBe(3);
    const ids = wf.map((w) => w.id);
    expect(ids).toContain('market-report');
    expect(ids).toContain('lead-enrich');
    expect(ids).toContain('property-copy');
  });

  it('exposes a definition per workflow', () => {
    const def = getWorkflowDefinition('property-copy');
    expect(def?.category).toBe('copy');
    expect(def?.inputSchema.property).toBe('object');
  });

  it('runs the market-report workflow end-to-end', async () => {
    delete process.env.LANDMAP_LLM_KEY;
    const res = await runWorkflowById('market-report', {
      query: 'São Paulo',
      stats: { total: 1500, avgPrice: 500000, cities: [{ city: 'São Paulo', state: 'SP', count: 320, avgPrice: 600000 }] },
    });
    expect(res.status).toBe('ok');
    expect(res.steps.length).toBe(2);
    expect(res.steps.every((s) => s.status === 'ok')).toBe(true);
  });

  it('runs the lead-enrich workflow and returns a score', async () => {
    delete process.env.LANDMAP_LLM_KEY;
    const res = await runWorkflowById('lead-enrich', {
      lead: { id: 'L1', name: 'Ana', city: 'Curitiba', interest: 'apartamento 2 quartos', source: 'organic', engagementCount: 4 },
    });
    expect(res.status).toBe('ok');
    const scoreStep = JSON.parse(String(res.steps[0]?.output ?? '{}'));
    expect(typeof scoreStep.score).toBe('number');
    expect(['quente', 'morno', 'frio']).toContain(scoreStep.segment);
  });

  it('runs the property-copy workflow and returns JSON copy', async () => {
    delete process.env.LANDMAP_LLM_KEY;
    const res = await runWorkflowById('property-copy', {
      property: { title: 'Apto', city: 'Curitiba', state: 'PR', price: 420000, type: 'apartamento', modality: 'venda' },
    });
    expect(res.status).toBe('ok');
    const copy = JSON.parse(String(res.steps[0]?.output ?? '{}'));
    expect(copy.headline).toBeTruthy();
  });

  it('returns an error result for an unknown workflow', async () => {
    const res = await runWorkflowById('does-not-exist', {});
    expect(res.status).toBe('error');
    expect(res.error).toContain('does-not-exist');
  });
});
