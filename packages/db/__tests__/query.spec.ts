import { describe, it, expect } from 'vitest';
import {
  mapPropertyRow,
  getPropertyById,
  listProperties,
  insertProperty,
  updateProperty,
  softDeleteProperty,
  type PgPoolLike,
} from '../src/query';

type Row = Record<string, unknown>;

/** Fake pool that records every call and returns rows from a handler. */
function fakePool(handler: (text: string, params: unknown[]) => { rows: Row[]; rowCount?: number }) {
  const calls: Array<{ text: string; params: unknown[] }> = [];
  const pool: PgPoolLike = {
    async query(text: string, params: unknown[] = []) {
      calls.push({ text, params });
      return handler(text, params);
    },
  };
  return { pool, calls };
}

const sampleRow: Row = {
  id: 'p1',
  title: 'Apartamento Centro',
  city: 'Curitiba',
  state: 'PR',
  price: 450000,
  area_m2: 68,
  bedrooms: 2,
  type: 'apartamento',
  modality: 'venda',
  available: true,
  latitude: -25.4,
  longitude: -49.2,
  neighborhood: 'Batel',
  zone: 'centro',
  street: 'Rua XV',
  status: 'active',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
  images: '{"a.jpg","b.jpg"}',
  tags: '{novo,prox-metro}',
};

describe('packages/db — query layer', () => {
  describe('mapPropertyRow', () => {
    it('maps snake_case columns to the camelCase domain type', () => {
      const p = mapPropertyRow(sampleRow);
      expect(p.id).toBe('p1');
      expect(p.areaM2).toBe(68);
      expect(p.bedrooms).toBe(2);
      expect(p.createdAt).toBe('2026-01-01T00:00:00.000Z');
      expect(p.updatedAt).toBe('2026-01-02T00:00:00.000Z');
    });

    it('coerces postgres array literals into string arrays', () => {
      const p = mapPropertyRow(sampleRow);
      expect(p.images).toEqual(['a.jpg', 'b.jpg']);
      expect(p.tags).toEqual(['novo', 'prox-metro']);
    });

    it('coerces JSON arrays and handles missing optional fields', () => {
      const p = mapPropertyRow({
        id: 'p2',
        title: 'Casa',
        city: 'Floripa',
        state: 'SC',
        price: 800000,
        area_m2: 120,
        type: 'casa',
        modality: 'venda',
        available: false,
        status: 'sold',
        created_at: '2026-02-01T00:00:00.000Z',
        updated_at: '2026-02-01T00:00:00.000Z',
        images: '["x.png"]',
        tags: '{}',
      });
      expect(p.bedrooms).toBeUndefined();
      expect(p.latitude).toBeUndefined();
      expect(p.images).toEqual(['x.png']);
      expect(p.tags).toEqual([]);
      expect(p.available).toBe(false);
    });
  });

  describe('getPropertyById', () => {
    it('returns the mapped property when a row exists', async () => {
      const { pool, calls } = fakePool(() => ({ rows: [sampleRow] }));
      const p = await getPropertyById(pool, 'p1');
      expect(calls[0].text).toContain('WHERE id = $1');
      expect(calls[0].params).toEqual(['p1']);
      expect(p?.city).toBe('Curitiba');
    });

    it('returns null when no row is found', async () => {
      const { pool } = fakePool(() => ({ rows: [] }));
      const p = await getPropertyById(pool, 'missing');
      expect(p).toBeNull();
    });
  });

  describe('listProperties', () => {
    it('builds parameterized WHERE filters and never interpolates values', async () => {
      const { pool, calls } = fakePool(() => ({ rows: [sampleRow] }));
      const result = await listProperties(pool, {
        city: 'Curitiba',
        type: 'apartamento',
        minPrice: 100000,
        maxPrice: 900000,
        limit: 10,
        offset: 5,
      });

      const sql = calls[0].text;
      expect(sql).toContain('WHERE city = $1');
      expect(sql).toContain('type = $2');
      expect(sql).toContain('price >= $3');
      expect(sql).toContain('price <= $4');
      expect(sql).toContain('LIMIT 10 OFFSET 5');
      expect(calls[0].params).toEqual(['Curitiba', 'apartamento', 100000, 900000]);
      expect(result[0].id).toBe('p1');
    });

    it('omits the WHERE clause when no filters are given', async () => {
      const { pool, calls } = fakePool(() => ({ rows: [] }));
      await listProperties(pool);
      expect(calls[0].text).not.toContain('WHERE');
      expect(calls[0].params).toEqual([]);
    });
  });

  describe('insertProperty', () => {
    it('emits an INSERT with all columns as bound parameters', async () => {
      const { pool, calls } = fakePool(() => ({ rows: [sampleRow] }));
      const created = await insertProperty(pool, {
        id: 'p1',
        title: 'Apartamento Centro',
        city: 'Curitiba',
        state: 'PR',
        price: 450000,
        areaM2: 68,
        bedrooms: 2,
        type: 'apartamento',
        modality: 'venda',
        available: true,
        status: 'active',
        images: ['a.jpg'],
        tags: ['novo'],
      });

      const sql = calls[0].text;
      expect(sql).toContain('INSERT INTO properties');
      expect(sql).toContain('area_m2');
      expect(sql).toContain('created_at');
      expect(sql).toContain('RETURNING *');
      // 20 columns -> 20 bound parameters
      expect(calls[0].params).toHaveLength(20);
      expect(created.id).toBe('p1');
    });

    it('throws a clear error when the row is not returned', async () => {
      const { pool } = fakePool(() => ({ rows: [] }));
      await expect(
        insertProperty(pool, {
          id: 'x',
          title: 't',
          city: 'c',
          state: 's',
          price: 1,
          areaM2: 1,
          type: 'casa',
          modality: 'venda',
          available: true,
          status: 'active',
          images: [],
          tags: [],
        }),
      ).rejects.toThrow(/did not return the inserted row/);
    });
  });

  describe('updateProperty', () => {
    it('updates only provided fields and skips id/createdAt', async () => {
      const { pool, calls } = fakePool(() => ({ rows: [sampleRow] }));
      await updateProperty(pool, 'p1', { price: 500000, status: 'reserved' });

      const sql = calls[0].text;
      expect(sql).toContain('UPDATE properties SET');
      expect(sql).toContain('price = $1');
      expect(sql).toContain('status = $2');
      expect(sql).toContain('updated_at = now()');
      expect(sql).toContain('WHERE id = $3');
      expect(sql).not.toContain('SET id');
      expect(calls[0].params).toEqual([500000, 'reserved', 'p1']);
    });

    it('falls back to getPropertyById when the patch is empty', async () => {
      const { pool, calls } = fakePool(() => ({ rows: [sampleRow] }));
      const p = await updateProperty(pool, 'p1', {});
      expect(calls[0].text).toContain('WHERE id = $1');
      expect(p?.id).toBe('p1');
    });
  });

  describe('softDeleteProperty', () => {
    it('flags the row unavailable and returns true when a row is affected', async () => {
      const { pool, calls } = fakePool(() => ({ rows: [], rowCount: 1 }));
      const ok = await softDeleteProperty(pool, 'p1');
      expect(ok).toBe(true);
      expect(calls[0].text).toContain("available = false");
      expect(calls[0].text).toContain("status = 'reserved'");
      expect(calls[0].params).toEqual(['p1']);
    });

    it('returns false when no row matches the id', async () => {
      const { pool } = fakePool(() => ({ rows: [], rowCount: 0 }));
      expect(await softDeleteProperty(pool, 'nope')).toBe(false);
    });
  });
});
