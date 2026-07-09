import { z } from 'zod';

/**
 * LandMap worldwide geolocation types.
 *
 * The brand wedge is NOT raw geocoding (a commodity) — it is real-estate
 * intelligence attached to a coordinate: price/m² of the zone, annual
 * variation, zoning and nearby schools. `pricePerM2`/`yoy`/`zoning`/`schools`
 * are optional and only present where LandMap has market data.
 */

export const geoFeatureSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['country', 'state', 'city', 'neighborhood']),
  name: z.string(),
  countryCode: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  /** [west, south, east, north] */
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  population: z.number().optional(),
  pricePerM2: z.number().optional(),
  yoy: z.number().optional(),
  zoning: z.string().optional(),
  schools: z.number().optional(),
});
export type GeoFeature = z.infer<typeof geoFeatureSchema>;

export const geocodeResultSchema = z.object({
  query: z.string(),
  features: z.array(geoFeatureSchema),
});
export type GeocodeResult = z.infer<typeof geocodeResultSchema>;

export const reverseResultSchema = z.object({
  id: z.string(),
  label: z.string(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  pricePerM2: z.number().optional(),
  yoy: z.number().optional(),
  zoning: z.string().optional(),
  schools: z.number().optional(),
});
export type ReverseResult = z.infer<typeof reverseResultSchema>;

export const autocompleteSuggestionSchema = z.object({
  id: z.string(),
  label: z.string(),
  type: z.enum(['country', 'state', 'city', 'neighborhood']),
  countryCode: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
});
export type AutocompleteSuggestion = z.infer<typeof autocompleteSuggestionSchema>;

export const boundarySchema = z.object({
  id: z.string(),
  label: z.string(),
  level: z.number(),
  lat: z.number(),
  lng: z.number(),
  bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
});
export type Boundary = z.infer<typeof boundarySchema>;

/* ─── Query schemas (query params arrive as strings → coerce) ─── */

export const geocodeQuery = z.object({ q: z.string().min(1).max(200) });
export const reverseQuery = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});
export const autocompleteQuery = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(20).default(6),
});
export const boundariesQuery = z.object({
  level: z.coerce.number().int().min(0).max(3).optional(),
  country: z.string().optional(),
  q: z.string().optional(),
});

/** A pluggable geolocation backend. Memory by default; PostGIS when a DB is bound. */
export interface GeoSource {
  geocode(q: string): GeocodeResult | Promise<GeocodeResult>;
  reverse(lat: number, lng: number): ReverseResult | Promise<ReverseResult>;
  autocomplete(q: string, limit?: number): AutocompleteSuggestion[] | Promise<AutocompleteSuggestion[]>;
  boundaries(opts: { level?: number; country?: string; q?: string }): Boundary[] | Promise<Boundary[]>;
}
