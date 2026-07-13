/* ------------------------------------------------------------------ */
/*  pgvector adapter — bridges the real `pg` driver to PgVectorStore   */
/* ------------------------------------------------------------------ */

/**
 * This module is the missing bridge between "there is a Postgres database"
 * and the existing `PgVectorStore` (see ./pgvector-store.ts). The store itself
 * uses dependency injection via the `PgPoolLike` interface and falls back to an
 * in-memory implementation, so it never statically imports `pg`.
 *
 * Here we *lazily* load the `pg` driver and return a real `pg.Pool` shaped as a
 * `PgPoolLike`, so callers can wire a live Postgres+pgvector backend into the
 * store that already exists.
 *
 * `pg` is an optional dependency (declared in package.json). We import it
 * dynamically via a non-literal specifier so that `tsc --noEmit` stays GREEN
 * even when `pg` / `@types/pg` are not installed (e.g. in CI unit-test runs
 * that only exercise the in-memory path).
 */

import { PgVectorStore } from './pgvector-store.js';
import type { PgPoolLike, PgVectorStoreOptions } from './pgvector-store.js';

export interface PgConnectionOptions {
  /** Postgres connection string. Falls back to `process.env.DATABASE_URL`. */
  databaseUrl?: string;
  /** Table name for embeddings. Defaults to the store's `landmap_embeddings`. */
  table?: string;
  /** Embedding dimension. Defaults to 1536 (OpenAI text-embedding-3-small). */
  dimension?: number;
  /** Custom dense embedding function. Falls back to PgVectorStore's hashing default. */
  embed?: (text: string) => number[];
}

/**
 * Lazily load the `pg` driver. Returned as `any` on purpose: this keeps the
 * module free of a hard `import type` / static dependency so the package
 * type-checks without `@types/pg` present.
 */
async function loadPg(): Promise<any> {
  // Non-literal specifier → TypeScript does not attempt to resolve the module
  // at compile time (no "Cannot find module 'pg'" error).
  const specifier = 'pg';
  const mod: any = await import(specifier);
  return mod && mod.default ? mod.default : mod;
}

/**
 * Create a real Postgres pool that satisfies the `PgPoolLike` contract used by
 * `PgVectorStore`. A native `pg.Pool` already returns `{ rows }` from
 * `query()`, so it is structurally compatible.
 */
export async function createPgPool(databaseUrl?: string): Promise<PgPoolLike> {
  const connectionString = databaseUrl ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'createPgPool: no Postgres connection string provided. ' +
        'Set DATABASE_URL or pass `databaseUrl`.',
    );
  }

  const pg = await loadPg();
  if (!pg || !pg.Pool) {
    throw new Error(
      "createPgPool: 'pg' driver not installed. " +
        "Run `pnpm --filter @landmap/llm add pg`.",
    );
  }

  const pool: any = new pg.Pool({ connectionString });
  return pool as PgPoolLike;
}

/**
 * Build a `PgVectorStore` wired to a live Postgres+pgvector database and ensure
 * the backing table exists. Reuses the existing adapter in `./pgvector-store.ts`.
 *
 * Example:
 *   const store = await connectPgVectorStore({ databaseUrl: process.env.DATABASE_URL });
 *   await store.addDocuments([{ pageContent: 'apartamento são paulo', metadata: { src: 'seed' } }]);
 *   const hits = await store.similaritySearch('apartamento', 5);
 */
export async function connectPgVectorStore(
  options: PgConnectionOptions = {},
): Promise<PgVectorStore> {
  const pool = await createPgPool(options.databaseUrl);

  const storeOptions: PgVectorStoreOptions = {
    pool,
    table: options.table,
    dimension: options.dimension ?? 1536,
    embed: options.embed,
  };

  const store = new PgVectorStore(storeOptions);
  await store.ensureSchema();
  return store;
}

/** Re-export the contract so callers can build their own pool-compatible object. */
export type { PgPoolLike };
