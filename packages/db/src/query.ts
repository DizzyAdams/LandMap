/* ------------------------------------------------------------------ */
/*  Postgres query layer (pgvector/pg compatible)                      */
/* ------------------------------------------------------------------ */
/*
 * Dependency-free data-access helpers for the `properties` table.
 *
 * Every function receives a `PgPoolLike` (anything with
 * `query(text, params)`) so it can be unit-tested with a fake pool and
 * used in production with a real `pg.Pool`. All user-provided values are
 * sent as bound parameters - never interpolated into the SQL string - so
 * the helpers are safe against SQL injection.
 */

import type { Property, PropertyStatus } from './index.js';

export interface PgPoolLike {
  query(
    text: string,
    params?: unknown[],
  ): Promise<{ rows: Array<Record<string, unknown>>; rowCount?: number }>;
}

/* ------------------------------------------------------------------ */
/*  Row mapping (snake_case DB <-> camelCase domain)                   */
/* ------------------------------------------------------------------ */

const toNumber = (v: unknown): number => (typeof v === 'number' ? v : Number(v));

const toBool = (v: unknown): boolean =>
  v === true || v === 'true' || v === 1 || v === '1';

const toStr = (v: unknown, fallback = ''): string => (v == null ? fallback : String(v));

const toStrArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch {
        /* fall through to postgres array-literal handling */
      }
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        return trimmed
          .slice(1, -1)
          .split(',')
          .map((s) => s.trim().replace(/^"|"$/g, ''))
          .filter((s) => s.length > 0);
      }
      return trimmed ? [trimmed] : [];
    }
  }
  return [];
};

export function mapPropertyRow(row: Record<string, unknown>): Property {
  return {
    id: toStr(row.id),
    title: toStr(row.title),
    city: toStr(row.city),
    state: toStr(row.state),
    price: toNumber(row.price),
    areaM2: toNumber(row.area_m2 ?? row.areaM2),
    bedrooms: row.bedrooms == null ? undefined : toNumber(row.bedrooms),
    type: toStr(row.type, 'apartamento') as Property['type'],
    modality: toStr(row.modality, 'venda') as Property['modality'],
    available: toBool(row.available),
    latitude: row.latitude == null ? undefined : toNumber(row.latitude),
    longitude: row.longitude == null ? undefined : toNumber(row.longitude),
    neighborhood: row.neighborhood == null ? undefined : toStr(row.neighborhood),
    zone: row.zone == null ? undefined : toStr(row.zone),
    street: row.street == null ? undefined : toStr(row.street),
    status: toStr(row.status, 'active') as PropertyStatus,
    createdAt: toStr(row.created_at ?? row.createdAt),
    updatedAt: toStr(row.updated_at ?? row.updatedAt),
    images: toStrArray(row.images),
    tags: toStrArray(row.tags),
  };
}

/* ------------------------------------------------------------------ */
/*  Column map (camelCase field -> snake_case column)                  */
/* ------------------------------------------------------------------ */

const COLUMN_MAP: Record<string, string> = {
  id: 'id',
  title: 'title',
  city: 'city',
  state: 'state',
  price: 'price',
  areaM2: 'area_m2',
  bedrooms: 'bedrooms',
  type: 'type',
  modality: 'modality',
  available: 'available',
  latitude: 'latitude',
  longitude: 'longitude',
  neighborhood: 'neighborhood',
  zone: 'zone',
  street: 'street',
  status: 'status',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  images: 'images',
  tags: 'tags',
};

const READ_ONLY = new Set(['id', 'createdAt', 'updatedAt']);

/* ------------------------------------------------------------------ */
/*  Queries                                                            */
/* ------------------------------------------------------------------ */

export type NewProperty = Omit<Property, 'createdAt' | 'updatedAt'> & {
  createdAt?: string;
  updatedAt?: string;
};

export async function getPropertyById(
  pool: PgPoolLike,
  id: string,
): Promise<Property | null> {
  const res = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
  return res.rows[0] ? mapPropertyRow(res.rows[0]) : null;
}

export interface ListPropertiesOptions {
  city?: string;
  state?: string;
  type?: Property['type'];
  modality?: Property['modality'];
  status?: PropertyStatus;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export async function listProperties(
  pool: PgPoolLike,
  opts: ListPropertiesOptions = {},
): Promise<Property[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];

  const eq = (col: string, val: unknown) => {
    params.push(val);
    clauses.push(`${col} = $${params.length}`);
  };

  if (opts.city) eq('city', opts.city);
  if (opts.state) eq('state', opts.state);
  if (opts.type) eq('type', opts.type);
  if (opts.modality) eq('modality', opts.modality);
  if (opts.status) eq('status', opts.status);
  if (opts.minPrice != null && Number.isFinite(opts.minPrice)) {
    params.push(opts.minPrice);
    clauses.push(`price >= $${params.length}`);
  }
  if (opts.maxPrice != null && Number.isFinite(opts.maxPrice)) {
    params.push(opts.maxPrice);
    clauses.push(`price <= $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const limit = Number.isFinite(opts.limit)
    ? Math.max(0, Math.floor(opts.limit as number))
    : 50;
  const offset = Number.isFinite(opts.offset)
    ? Math.max(0, Math.floor(opts.offset as number))
    : 0;
  const sql = `SELECT * FROM properties ${where} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

  const res = await pool.query(sql, params);
  return res.rows.map(mapPropertyRow);
}

export async function insertProperty(
  pool: PgPoolLike,
  input: NewProperty,
): Promise<Property> {
  const now = new Date().toISOString();
  const record: Record<string, unknown> = {
    id: input.id,
    title: input.title,
    city: input.city,
    state: input.state,
    price: input.price,
    areaM2: input.areaM2,
    bedrooms: input.bedrooms,
    type: input.type,
    modality: input.modality,
    available: input.available,
    latitude: input.latitude,
    longitude: input.longitude,
    neighborhood: input.neighborhood,
    zone: input.zone,
    street: input.street,
    status: input.status,
    images: input.images ?? [],
    tags: input.tags ?? [],
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  };

  const columns: string[] = [];
  const placeholders: string[] = [];
  const params: unknown[] = [];
  for (const [camel, snake] of Object.entries(COLUMN_MAP)) {
    columns.push(snake);
    params.push(record[camel]);
    placeholders.push(`$${params.length}`);
  }

  const sql = `INSERT INTO properties (${columns.join(', ')}) VALUES (${placeholders.join(
    ', ',
  )}) RETURNING *`;

  const res = await pool.query(sql, params);
  if (!res.rows[0]) {
    throw new Error('insertProperty: database did not return the inserted row');
  }
  return mapPropertyRow(res.rows[0]);
}

export async function updateProperty(
  pool: PgPoolLike,
  id: string,
  patch: Partial<Property>,
): Promise<Property | null> {
  const sets: string[] = [];
  const params: unknown[] = [];

  for (const [camel, snake] of Object.entries(COLUMN_MAP)) {
    if (READ_ONLY.has(camel)) continue;
    const value = (patch as Record<string, unknown>)[camel];
    if (camel in patch && value !== undefined) {
      params.push(value);
      sets.push(`${snake} = $${params.length}`);
    }
  }

  if (sets.length === 0) {
    return getPropertyById(pool, id);
  }

  params.push(id);
  const sql = `UPDATE properties SET ${sets.join(', ')}, updated_at = now() WHERE id = $${params.length} RETURNING *`;

  const res = await pool.query(sql, params);
  return res.rows[0] ? mapPropertyRow(res.rows[0]) : null;
}

export async function softDeleteProperty(pool: PgPoolLike, id: string): Promise<boolean> {
  const res = await pool.query(
    `UPDATE properties SET available = false, status = 'reserved', updated_at = now() WHERE id = $1`,
    [id],
  );
  return (res.rowCount ?? 0) > 0;
}

