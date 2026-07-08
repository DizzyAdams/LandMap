import { describe, it, expect } from 'vitest';
import { TwentyClient, TWENTY_PIPELINE_STAGES } from '../src/index';

describe('packages/twenty', () => {
  it('exports TwentyClient class', () => {
    expect(TwentyClient).toBeDefined();
    expect(typeof TwentyClient).toBe('function');
  });

  it('exports pipeline stages', () => {
    expect(Array.isArray(TWENTY_PIPELINE_STAGES)).toBe(true);
    expect(TWENTY_PIPELINE_STAGES).toContain('captured');
    expect(TWENTY_PIPELINE_STAGES).toContain('closed_won');
    expect(TWENTY_PIPELINE_STAGES).toContain('closed_lost');
  });

  it('has methods for people, leads, opportunities, notes', () => {
    const client = new TwentyClient({
      baseUrl: 'http://localhost:3000',
      apiKey: 'test',
    });

    expect(typeof client.listPeople).toBe('function');
    expect(typeof client.createPerson).toBe('function');
    expect(typeof client.listLeads).toBe('function');
    expect(typeof client.createLead).toBe('function');
    expect(typeof client.updateLead).toBe('function');
    expect(typeof client.listOpportunities).toBe('function');
    expect(typeof client.createOpportunity).toBe('function');
    expect(typeof client.updateOpportunity).toBe('function');
    expect(typeof client.listNotes).toBe('function');
    expect(typeof client.createNote).toBe('function');
  });
});
