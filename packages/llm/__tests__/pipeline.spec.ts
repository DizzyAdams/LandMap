import { describe, it, expect } from 'vitest';
import { buildMarkdownChunks } from '../src/hints';

describe('packages/llm', () => {
  it('buildMarkdownChunks produz chunks não vazios sem quebrar metadados', () => {
    const chunks = buildMarkdownChunks([
      { id: 'doc1', content: '# Título\n' + 'x'.repeat(1000), metadata: { source: 'seed' } },
    ]);

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0].id).toBe('doc1');
  });
});
