import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  mockCompletion,
  chatCompletion,
  analyzeIntent,
  recommendProperties,
  type Property,
} from '../src/completion';

const jsonResponse = (obj: unknown) => ({
  ok: true,
  json: async () => ({ choices: [{ message: { content: JSON.stringify(obj) } }], model: 'm', usage: { total_tokens: 1 } }),
});

beforeEach(() => {
  // Default: demo/offline mode so nothing hits the network.
  vi.stubEnv('LANDMAP_LLM_KEY', '');
  vi.stubEnv('LANDMAP_LLM_MOCK', '1');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('llm/completion — mockCompletion', () => {
  it('is deterministic and echoes a snippet of the last user message', () => {
    const res = mockCompletion([
      { role: 'system', content: 'ignore' },
      { role: 'user', content: 'Quero um apartamento em Curitiba' },
    ]);
    expect(res.model).toBe('mock');
    expect(res.tokens).toBe(0);
    expect(res.content).toContain('modo demo');
    expect(res.content).toContain('Quero um apartamento em Curitiba');
  });

  it('reports an empty request gracefully', () => {
    const res = mockCompletion([]);
    expect(res.content).toContain('vazia');
  });
});

describe('llm/completion — chatCompletion', () => {
  it('returns the deterministic mock when no key/mock is set', async () => {
    const res = await chatCompletion([{ role: 'user', content: 'Olá mundo' }]);
    expect(res.model).toBe('mock');
    expect(res.content).toContain('modo demo');
    expect(res.content).toContain('Olá mundo');
  });

  it('parses a real LLM response when a key is configured', async () => {
    vi.stubEnv('LANDMAP_LLM_KEY', 'sk-test');
    vi.stubEnv('LANDMAP_LLM_MOCK', '0');
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'resposta' } }], model: 'openai/gpt-4o-mini', usage: { total_tokens: 9 } }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const res = await chatCompletion([{ role: 'user', content: 'oi' }]);
    expect(res.content).toBe('resposta');
    expect(res.model).toBe('openai/gpt-4o-mini');
    expect(res.tokens).toBe(9);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('throws a clear error when the LLM endpoint fails', async () => {
    vi.stubEnv('LANDMAP_LLM_KEY', 'sk-test');
    vi.stubEnv('LANDMAP_LLM_MOCK', '0');
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 503, text: async () => 'down' })));

    await expect(chatCompletion([{ role: 'user', content: 'x' }])).rejects.toThrow(/503/);
  });
});

describe('llm/completion — analyzeIntent', () => {
  it('falls back to a general intent when the model output is not JSON', async () => {
    const out = await analyzeIntent('apartamento são paulo');
    expect(out.intent).toBe('general');
    expect(out.filters).toEqual({});
  });

  it('parses structured intent from a JSON model response', async () => {
    vi.stubEnv('LANDMAP_LLM_KEY', 'sk-test');
    vi.stubEnv('LANDMAP_LLM_MOCK', '0');
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ intent: 'search', filters: { city: 'Curitiba', state: 'PR' } })));

    const out = await analyzeIntent('apartamento curitiba');
    expect(out.intent).toBe('search');
    expect(out.filters.city).toBe('Curitiba');
  });
});

describe('llm/completion — recommendProperties', () => {
  const properties: Property[] = [
    { id: 'p1', title: 'Apto SP', city: 'São Paulo', state: 'SP', price: 500000, type: 'apartamento', modality: 'venda', description: 'ótimo' } as Property,
    { id: 'p2', title: 'Casa RJ', city: 'Rio', state: 'RJ', price: 800000, type: 'casa', modality: 'venda', description: 'mare' } as Property,
  ];

  it('falls back to retrieved candidates when no model is configured', async () => {
    const out = await recommendProperties('apartamento são paulo', properties);
    expect(out.answer).toContain('modo demo');
    expect(out.candidates.map((c) => c.id).sort()).toEqual(['p1', 'p2']);
  });

  it('parses an AnalyzeResult from a JSON model response', async () => {
    vi.stubEnv('LANDMAP_LLM_KEY', 'sk-test');
    vi.stubEnv('LANDMAP_LLM_MOCK', '0');
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse({ answer: 'veja', candidates: [{ id: 'p1', score: 0.9 }] })));

    const out = await recommendProperties('x', properties);
    expect(out.answer).toBe('veja');
    expect(out.candidates[0].id).toBe('p1');
  });
});
