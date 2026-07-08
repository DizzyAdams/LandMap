/* ------------------------------------------------------------------ */
/*  PgVectorStore — pgvector-backed vector store                       */
/* ------------------------------------------------------------------ */

/**
 * A Postgres + pgvector vector store.
 *
 * This module has **no hard dependency** on `pg` or `pgvector`. You inject a
 * `PgPoolLike` (anything with a `query(text, params)` method — e.g. a real
 * `pg.Pool`, or a fake used in tests). When no pool is provided the store
 * falls back to an in-memory implementation so it can be used and unit-tested
 * without a running database.
 */

export interface PgPoolLike {
  query(text: string, params?: unknown[]): Promise<{ rows: Array<Record<string, unknown>> }>;
}

export interface PgVectorDoc {
  id?: string;
  pageContent: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface PgVectorSearchResult {
  id: string;
  text: string;
  score: number;
  metadata: Record<string, string | number | boolean>;
}

export interface PgVectorStoreOptions {
  pool?: PgPoolLike;
  /** Embedding dimension used when storing vectors in pgvector. */
  dimension?: number;
  /** Table name (escaped as identifier). */
  table?: string;
  /**
   * Embedding function. Defaults to a deterministic, dependency-free hashing
   * embedding so the store works out-of-the-box. In production, inject a real
   * model-backed embedder (OpenAI, local transformer, etc.).
   */
  embed?: (text: string) => number[];
}

/* ------------------------------------------------------------------ */
/*  Deterministic hashing embedding (no external dependency)            */
/* ------------------------------------------------------------------ */

function hashEmbedding(text: string, dimension = 256): number[] {
  const vec = new Array<number>(dimension).fill(0);
  const normalized = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

  for (let i = 0; i < normalized.length - 2; i++) {
    const trigram = normalized.slice(i, i + 3);
    let h = 2166136261;
    for (let j = 0; j < trigram.length; j++) {
      h ^= trigram.charCodeAt(j);
      h = Math.imul(h, 16777619);
    }
    const bucket = Math.abs(h) % dimension;
    vec[bucket] += 1;
  }

  const norm = Math.sqrt(vec.reduce((acc, v) => acc + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

function cosine(a: number[], b: number[]): number {
  let ab = 0;
  let aa = 0;
  let bb = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    ab += a[i] * b[i];
    aa += a[i] * a[i];
    bb += b[i] * b[i];
  }
  return aa && bb ? ab / (Math.sqrt(aa) * Math.sqrt(bb)) : 0;
}

function toPgVectorLiteral(vec: number[]): string {
  return `[${vec.join(',')}]`;
}

interface MemoryEntry {
  id: string;
  text: string;
  vec: number[];
  metadata: Record<string, string | number | boolean>;
}

export class PgVectorStore {
  private pool?: PgPoolLike;
  private dimension: number;
  private table: string;
  private embed: (text: string) => number[];
  private memory: MemoryEntry[] = [];
  private seq = 0;

  constructor(options: PgVectorStoreOptions = {}) {
    this.pool = options.pool;
    this.dimension = options.dimension ?? 256;
    this.table = options.table ?? 'landmap_embeddings';
    this.embed = options.embed ?? ((text: string) => hashEmbedding(text, this.dimension));
  }

  get backend(): 'pgvector' | 'memory' {
    return this.pool ? 'pgvector' : 'memory';
  }

  get size(): number {
    return this.memory.length;
  }

  /** DDL used to create the backing table. Safe to re-run (IF NOT EXISTS). */
  schemaSql(): string {
    return [
      `CREATE TABLE IF NOT EXISTS "${this.table}" (`,
      '  id TEXT PRIMARY KEY,',
      '  content TEXT NOT NULL,',
      '  embedding vector(' + this.dimension + '),',
      '  metadata JSONB NOT NULL DEFAULT \'{}\'::jsonb',
      ');',
    ].join('\n');
  }

  /** Create the table in Postgres if a pool was injected. */
  async ensureSchema(): Promise<void> {
    if (!this.pool) return;
    await this.pool.query(this.schemaSql());
  }

  async addDocuments(documents: PgVectorDoc[]): Promise<string[]> {
    const ids: string[] = [];

    for (const doc of documents) {
      const id = doc.id ?? `vec_${this.seq++}`;
      const vec = this.embed(doc.pageContent);
      const metadata = doc.metadata ?? {};

      if (this.pool) {
        await this.pool.query(
          `INSERT INTO "${this.table}" (id, content, embedding, metadata)
           VALUES ($1, $2, $3::vector, $4::jsonb)
           ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content, embedding = EXCLUDED.embedding, metadata = EXCLUDED.metadata`,
          [id, doc.pageContent, toPgVectorLiteral(vec), JSON.stringify(metadata)],
        );
      }

      const idx = this.memory.findIndex((m) => m.id === id);
      const entry: MemoryEntry = { id, text: doc.pageContent, vec, metadata };
      if (idx >= 0) this.memory[idx] = entry;
      else this.memory.push(entry);

      ids.push(id);
    }

    return ids;
  }

  /**
   * Similarity search. In pgvector mode it uses the `<=>` (cosine distance)
   * operator; otherwise it falls back to an in-memory cosine scan.
   */
  async similaritySearch(query: string, topK = 5): Promise<PgVectorSearchResult[]> {
    const qVec = this.embed(query);

    if (this.pool) {
      const res = await this.pool.query(
        `SELECT id, content, metadata, 1 - (embedding <=> $1::vector) AS score
         FROM "${this.table}"
         ORDER BY embedding <=> $1::vector
         LIMIT $2`,
        [toPgVectorLiteral(qVec), topK],
      );
      return res.rows.map((r) => ({
        id: String(r.id),
        text: String(r.content),
        score: Number(r.score),
        metadata: (r.metadata as Record<string, string | number | boolean>) ?? {},
      }));
    }

    return this.memory
      .map((m) => ({ id: m.id, text: m.text, score: cosine(qVec, m.vec), metadata: m.metadata }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }
}

