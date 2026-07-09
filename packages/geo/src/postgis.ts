import type { GeoSource, GeoFeature, ReverseResult, AutocompleteSuggestion, Boundary } from './types.js';

/**
 * PostGIS-backed geolocation source. Activated automatically when DATABASE_URL
 * is bound (see createGeoSource in index.ts). Mirrors the in-memory API but
 * queries a `geo_boundary` table (hierarchical, with PostGIS geometry) and an
 * optional `geo_zone_market` table for real-estate enrichment.
 *
 * All queries use bound parameters — never string interpolation — so they are
 * safe against SQL injection.
 */
export interface GeoPoolLike {
  query<T = Record<string, unknown>>(
    text: string,
    params?: unknown[],
  ): Promise<{ rows: T[]; rowCount?: number }>;
}

interface BoundaryRow {
  id: string;
  name: string;
  level: number;
  country_code: string | null;
  admin1: string | null;
  admin2: string | null;
  lat: number;
  lng: number;
  bbox: number[] | null; // [w, s, e, n]
  price_per_m2: number | null;
  yoy: number | null;
  zoning: string | null;
  schools: number | null;
}

function mapBoundaryRow(row: BoundaryRow): GeoFeature {
  const type = row.level === 0 ? 'country' : row.level === 1 ? 'state' : 'city';
  return {
    id: row.id,
    label: [row.name, row.admin1, row.country_code].filter(Boolean).join(', '),
    type,
    name: row.name,
    countryCode: row.country_code ?? undefined,
    state: row.admin1 ?? undefined,
    city: type === 'city' ? row.name : undefined,
    lat: row.lat,
    lng: row.lng,
    bbox: row.bbox ? [row.bbox[0], row.bbox[1], row.bbox[2], row.bbox[3]] : undefined,
    pricePerM2: row.price_per_m2 ?? undefined,
    yoy: row.yoy ?? undefined,
    zoning: row.zoning ?? undefined,
    schools: row.schools ?? undefined,
  };
}

export function createPostgisSource(pool: GeoPoolLike): GeoSource {
  return {
    async geocode(q: string): Promise<{ query: string; features: GeoFeature[] }> {
      const res = await pool.query<BoundaryRow>(
        `SELECT * FROM geo_boundary
         WHERE name ILIKE $1 OR $2 = ANY(aliases)
         ORDER BY char_length(name) ASC
         LIMIT 10`,
        [`%${q.trim()}%`, q.trim()],
      );
      return { query: q.trim(), features: res.rows.map(mapBoundaryRow) };
    },

    async reverse(lat: number, lng: number): Promise<ReverseResult> {
      const res = await pool.query<BoundaryRow>(
        `SELECT * FROM geo_boundary
         ORDER BY centroid <-> ST_MakePoint($1, $2)
         LIMIT 1`,
        [lng, lat],
      );
      const row = res.rows[0];
      if (!row) return { id: '', label: '', lat, lng };
      const f = mapBoundaryRow(row);
      return {
        id: f.id,
        label: f.label,
        country: f.countryCode,
        state: f.state,
        city: f.type === 'city' ? f.name : undefined,
        lat,
        lng,
        pricePerM2: f.pricePerM2,
        yoy: f.yoy,
        zoning: f.zoning,
        schools: f.schools,
      };
    },

    async autocomplete(q: string, limit = 6): Promise<AutocompleteSuggestion[]> {
      const res = await pool.query<BoundaryRow>(
        `SELECT * FROM geo_boundary
         WHERE name ILIKE $1
         ORDER BY char_length(name) ASC
         LIMIT $2`,
        [`%${q.trim()}%`, limit],
      );
      return res.rows.map((row) => {
        const f = mapBoundaryRow(row);
        return {
          id: f.id,
          label: f.label,
          type: f.type as AutocompleteSuggestion['type'],
          countryCode: f.countryCode,
          state: f.state,
          city: f.city,
          lat: f.lat,
          lng: f.lng,
        };
      });
    },

    async boundaries(opts: { level?: number; country?: string; q?: string }): Promise<Boundary[]> {
      const clauses: string[] = [];
      const params: unknown[] = [];
      if (opts.level != null) {
        params.push(opts.level);
        clauses.push(`level = $${params.length}`);
      }
      if (opts.country) {
        params.push(opts.country.toUpperCase());
        clauses.push(`country_code = $${params.length}`);
      }
      if (opts.q) {
        params.push(`%${opts.q.trim()}%`);
        clauses.push(`name ILIKE $${params.length}`);
      }
      const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
      const res = await pool.query<BoundaryRow>(
        `SELECT * FROM geo_boundary ${where} ORDER BY name ASC LIMIT 200`,
        params,
      );
      return res.rows.map((row) => ({
        id: row.id,
        label: [row.name, row.admin1, row.country_code].filter(Boolean).join(', '),
        level: row.level,
        lat: row.lat,
        lng: row.lng,
        bbox: row.bbox ? [row.bbox[0], row.bbox[1], row.bbox[2], row.bbox[3]] : undefined,
      }));
    },
  };
}
