import { describe, it, expect } from 'vitest';
import { buildMarketReportPrompt, buildSummarizePrompt } from '../src/langchain/chain';

describe('langchain prompt builders', () => {
  it('builds a market report prompt from stats', () => {
    const prompt = buildMarketReportPrompt('São Paulo', {
      total: 10,
      avgPrice: 500000,
      cities: [{ city: 'São Paulo', state: 'SP', count: 5, avgPrice: 600000 }],
    });
    expect(prompt).toContain('São Paulo');
    expect(prompt).toContain('10');
    expect(prompt).toContain('São Paulo/SP');
  });

  it('builds a summarize prompt with a sentence budget', () => {
    const prompt = buildSummarizePrompt('Texto longo demais para resumir aqui.', 2);
    expect(prompt).toContain('2 frases');
  });
});
