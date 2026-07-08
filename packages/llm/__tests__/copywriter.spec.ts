import { describe, it, expect } from 'vitest';
import { CopywriterAgent } from '../src/agents/CopywriterAgent';

describe('CopywriterAgent', () => {
  it('generates on-brand copy without an LLM key (mock/fallback)', async () => {
    delete process.env.LANDMAP_LLM_KEY;
    delete process.env.LANDMAP_LLM_MOCK;

    const agent = new CopywriterAgent('standard');
    const result = await agent.generate({
      title: 'Apto Centro',
      city: 'Curitiba',
      state: 'PR',
      price: 420000,
      type: 'apartamento',
      modality: 'venda',
      areaM2: 72,
      bedrooms: 2,
      neighborhood: 'Centro',
      tags: ['centro', 'financiamento'],
    });

    expect(result.headline).toContain('Curitiba');
    expect(result.headline).toContain('Centro');
    expect(typeof result.description).toBe('string');
    expect(result.description.length).toBeGreaterThan(10);
    expect(Array.isArray(result.bullets)).toBe(true);
    expect(result.bullets.length).toBeGreaterThan(0);
    expect(result.cta.length).toBeGreaterThan(0);
    expect(result.model).toBe('fallback-template');
  });

  it('never throws and returns usable copy when LANDMAP_LLM_MOCK is set', async () => {
    delete process.env.LANDMAP_LLM_KEY;
    process.env.LANDMAP_LLM_MOCK = '1';

    const agent = new CopywriterAgent('luxury');
    const result = await agent.generate({
      title: 'Cobertura',
      city: 'Florianópolis',
      state: 'SC',
      price: 2_500_000,
      type: 'apartamento',
      modality: 'venda',
    });

    expect(result.headline.length).toBeGreaterThan(0);
    expect(result.description.length).toBeGreaterThan(0);
    // mock content is free-text (not JSON) so the agent safely falls back
    expect(['mock', 'fallback-template']).toContain(result.model);
  });
});
