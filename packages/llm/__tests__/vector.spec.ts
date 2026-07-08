import { describe, it, expect } from 'vitest';
import { PgVectorStore } from '../src/vector/pgvector-store';
import type { PgPoolLike } from '../src/vector/pgvector-store';

describe('llm/PgVectorStore', () => {
  it('reports memory backend and an empty size initially', () => {
    const store = new PgVectorStore();
    expect(store.backend).toBe('memory');
    expect(store.size).toBe(0);
  });

  it('produces valid pgvector DDL', () => {
    const store = new PgVectorStore({ dimension: 128, table: 'vec_test' });
    const sql = store.schemaSql();
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS "vec_test"');
    expect(sql).toContain('vector(128)');
  });

  it('ranks the most similar document first (in-memory fallback)', async () => {
    const store = new PgVectorStore();
    await store.addDocuments([
      { id: 'a', pageContent: 'apartamento à venda em são paulo' },
      { id: 'b', pageContent: 'casa de campo com piscina' },
      { id: 'c', pageContent: 'apartamento dois quartos venda sp' },
    ]);

    const results = await store.similaritySearch('apartamento venda são paulo', 3);
    expect(results).toHaveLength(3);
    expect(results[0].id).toBe('a');
    expect(results[0].score).toBeGreaterThan(0);
  });

  it('records inserts when a pool is injected', async () => {
    const calls: string[] = [];
    const fakePool: PgPoolLike = {
      async query(text: string) {
        calls.push(text);
        return { rows: [] };
      },
    };
    const store = new PgVectorStore({ pool: fakePool, dimension: 64 });
    await store.addDocuments([{ id: 'x', pageContent: 'imóvel de luxo' }]);

    expect(calls.some((c) => c.includes('INSERT INTO'))).toBe(true);
    expect(calls.some((c) => c.includes('[64') || c.includes('vector'))).toBe(true);
  });
});
