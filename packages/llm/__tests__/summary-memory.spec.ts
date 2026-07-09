import { describe, it, expect } from 'vitest';
import { SummaryMemory } from '../src/memory/summary-memory';

const msg = (role: 'user' | 'assistant' | 'system', content: string) => ({ role, content });

describe('llm/SummaryMemory', () => {
  it('adds messages and tracks size', () => {
    const m = new SummaryMemory();
    expect(m.size()).toBe(0);
    m.add(msg('user', 'Olá'));
    m.add(msg('assistant', 'Oi'));
    expect(m.size()).toBe(2);
  });

  it('truncates to the most recent messages once the limit is exceeded', () => {
    const m = new SummaryMemory({ maxMessages: 3 });
    for (let i = 0; i < 6; i++) m.add(msg('user', `m${i}`));
    expect(m.size()).toBe(3);
    const contents = m.getMessages(false).map((x) => x.content);
    expect(contents).toEqual(['m3', 'm4', 'm5']);
  });

  it('prefixes the rolling summary when present', () => {
    const m = new SummaryMemory();
    m.add(msg('user', 'primeira'));
    m.add(msg('assistant', 'resposta'));
    m.add(msg('user', 'segunda'));
    m.add(msg('assistant', 'resposta2'));
    m.summarize();
    const messages = m.getMessages();
    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('Resumo do histórico anterior');
    expect(messages.length).toBe(m.size() + 1);
  });

  it('summarizes the oldest half and compacts history', () => {
    const m = new SummaryMemory();
    for (let i = 0; i < 6; i++) m.add(msg(i % 2 ? 'assistant' : 'user', `turno ${i}`));
    const before = m.size();
    const summary = m.summarize();
    expect(summary.length).toBeGreaterThan(0);
    // history shrank by roughly half
    expect(m.size()).toBeLessThan(before);
    expect(m.size()).toBeGreaterThan(0);
  });

  it('does not change the summary when history is too small', () => {
    const m = new SummaryMemory();
    m.add(msg('user', 'só uma'));
    expect(m.summarize()).toBe('');
    m.add(msg('assistant', 'duas'));
    // still <= 2 -> no change from initial empty summary
    expect(m.summarize()).toBe('');
  });

  it('clear resets history and summary', () => {
    const m = new SummaryMemory();
    m.add(msg('user', 'x'));
    m.summarize();
    m.clear();
    expect(m.size()).toBe(0);
    expect(m.getMessages()).toEqual([]);
  });
});
