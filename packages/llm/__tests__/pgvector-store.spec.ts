import { describe, it, expect } from 'vitest';
import { PgVectorStore, type PgPoolLike } from '../src/vector/pgvector-store';

/** Fake pool that records every call and returns a fixed set of rows. */
function fakePool(rows: Array<Record<string, unknown>> = []) {
  const calls: Array<{ text: string; params: unknown[] }> = [];
  const pool: PgPoolLike = {
    async query(text: string, params: unknown[] = []) {
      calls.push({ text, params });
      return { rows };
    },
  };
  return { pool, calls };
}

describe('llm/PgVectorStore — pg mode (fake pool)', () => {
  it('ensureSchema runs the DDL through the pool', async () => {
    const { pool, calls } = fakePool();
    const store = new PgVectorStore({ pool, table: 'vec', dimension: 8 });
    await store.ensureSchema();
    expect(calls.some((c) => c.text.includes('CREATE TABLE IF NOT EXISTS "vec"'))).toBe(true);
    expect(store.backend).toBe('pgvector');
  });

  it('addDocuments upserts with bound parameters and a vector literal', async () => {
    const { pool, calls } = fakePool();
    const store = new PgVectorStore({ pool, dimension: 8 });
    await store.addDocuments([{ id: 'a', pageContent: 'texto', metadata: { k: 'v' } }]);

    const insert = calls.find((c) => c.text.includes('INSERT INTO'));
    expect(insert).toBeDefined();
    expect(insert!.params[0]).toBe('a');
    expect(insert!.params[1]).toBe('texto');
    expect(String(insert!.params[2])).toMatch(/^\[.*\]$/); // pgvector literal
    expect(insert!.params[3]).toBe('{"k":"v"}'); // metadata serialized as JSON
    expect(insert!.text).toContain('ON CONFLICT (id) DO UPDATE');
  });

  it('similaritySearch maps pool rows to results and forwards topK', async () => {
    const rows = [
      { id: 'x', content: 'doc x', score: 0.9, metadata: { a: 1 } },
      { id: 'y', content: 'doc y', score: 0.4, metadata: { b: true } },
    ];
    const { pool, calls } = fakePool(rows);
    const store = new PgVectorStore({ pool, dimension: 8 });

    const results = await store.similaritySearch('q', 2);
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ id: 'x', text: 'doc x', score: 0.9, metadata: { a: 1 } });
    expect(results[1].metadata).toEqual({ b: true });

    const last = calls.at(-1)!;
    expect(last.text).toContain('1 - (embedding <=> $1::vector) AS score');
    expect(last.params[1]).toBe(2); // topK forwarded as $2
  });
});

describe('llm/PgVectorStore — memory mode', () => {
  it('preserves metadata across add/similarity', async () => {
    const store = new PgVectorStore();
    await store.addDocuments([{ id: 'm', pageContent: 'casa de campo', metadata: { source: 'seed' } }]);
    const res = await store.similaritySearch('casa', 1);
    expect(res).toHaveLength(1);
    expect(res[0].metadata).toEqual({ source: 'seed' });
  });

  it('reranking puts the most similar document first', async () => {
    const store = new PgVectorStore();
    await store.addDocuments([
      { id: 'a', pageContent: 'apartamento venda são paulo' },
      { id: 'b', pageContent: 'escritório comercial centro' },
    ]);
    const res = await store.similaritySearch('apartamento venda', 2);
    expect(res[0].id).toBe('a');
    expect(res[0].score).toBeGreaterThanOrEqual(res[1].score);
  });
});
