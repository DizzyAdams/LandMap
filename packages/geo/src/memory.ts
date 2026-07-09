import { WORLD, type RawFeature } from './data/world.js';
import type {
  GeoFeature,
  GeocodeResult,
  ReverseResult,
  AutocompleteSuggestion,
  Boundary,
  GeoSource,
} from './types.js';

const EARTH_RADIUS_KM = 6371;

function labelFor(f: RawFeature): string {
  if (f.type === 'country') return f.name;
  if (f.type === 'state') return `${f.name}, ${f.countryCode}`;
  return [f.name, f.state, f.countryCode].filter(Boolean).join(', ');
}

function toFeature(f: RawFeature): GeoFeature {
  return {
    id: f.id,
    label: labelFor(f),
    type: f.type,
    name: f.name,
    countryCode: f.countryCode,
    state: f.state,
    city: f.city,
    lat: f.lat,
    lng: f.lng,
    bbox: f.bbox,
    population: f.population,
    pricePerM2: f.enrichment?.pricePerM2,
    yoy: f.enrichment?.yoy,
    zoning: f.enrichment?.zoning,
    schools: f.enrichment?.schools,
  };
}

function scoreMatch(f: RawFeature, q: string): number {
  const needle = q.trim().toLowerCase().normalize('NFC');
  if (!needle) return 0;
  const name = f.name.toLowerCase();
  if (name === needle) return 100;
  if (name.startsWith(needle)) return 80 - (name.length - needle.length);
  if (name.includes(needle)) return 60;
  if (f.state?.toLowerCase().includes(needle)) return 45;
  if (f.countryCode?.toLowerCase() === needle) return 55;
  if (f.city?.toLowerCase().includes(needle)) return 50;
  return 0;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function inBbox(f: RawFeature, lat: number, lng: number): boolean {
  if (!f.bbox) return false;
  const [w, s, e, n] = f.bbox;
  return lng >= w && lng <= e && lat >= s && lat <= n;
}

function levelOf(f: RawFeature): number {
  return f.type === 'country' ? 0 : f.type === 'state' ? 1 : f.type === 'city' ? 2 : 3;
}

// Within a tied score, prefer the most specific feature (city > state > country).
// For a real-estate map, typing "São Paulo" should resolve to the city, not the state.
function specificityOf(f: RawFeature): number {
  return f.type === 'city' ? 3 : f.type === 'state' ? 2 : f.type === 'country' ? 1 : 4;
}

export function memoryGeocode(q: string): GeocodeResult {
  const trimmed = q.trim();
  const scored = WORLD.map((f) => ({ f, s: scoreMatch(f, trimmed) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || specificityOf(b.f) - specificityOf(a.f))
    .slice(0, 10)
    .map((x) => x.f);
  return { query: trimmed, features: scored.map(toFeature) };
}

export function memoryAutocomplete(q: string, limit = 6): AutocompleteSuggestion[] {
  const trimmed = q.trim();
  return WORLD.map((f) => ({ f, s: scoreMatch(f, trimmed) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => ({
      id: x.f.id,
      label: labelFor(x.f),
      type: x.f.type,
      countryCode: x.f.countryCode,
      state: x.f.state,
      city: x.f.city,
      lat: x.f.lat,
      lng: x.f.lng,
    }));
}

export function memoryReverse(lat: number, lng: number): ReverseResult {
  let best: RawFeature | null = null;
  let bestDist = Infinity;
  for (const f of WORLD) {
    const d = haversineKm(lat, lng, f.lat, f.lng);
    if (d < bestDist) {
      bestDist = d;
      best = f;
    }
  }

  if (!best) return { id: '', label: '', lat, lng };

  const country = best.countryCode
    ? WORLD.find((f) => f.type === 'country' && f.countryCode === best!.countryCode)
    : undefined;

  return {
    id: best.id,
    label: labelFor(best),
    country: country?.name,
    state: best.state,
    city: best.type === 'city' ? best.name : undefined,
    lat,
    lng,
    pricePerM2: best.enrichment?.pricePerM2,
    yoy: best.enrichment?.yoy,
    zoning: best.enrichment?.zoning,
    schools: best.enrichment?.schools,
  };
}

export function memoryBoundaries(opts: {
  level?: number;
  country?: string;
  q?: string;
}): Boundary[] {
  return WORLD.filter((f) => {
    if (opts.level != null && levelOf(f) !== opts.level) return false;
    if (opts.country && f.countryCode !== opts.country.toUpperCase()) return false;
    if (opts.q && scoreMatch(f, opts.q) === 0) return false;
    return true;
  }).map((f) => ({
    id: f.id,
    label: labelFor(f),
    level: levelOf(f),
    lat: f.lat,
    lng: f.lng,
    bbox: f.bbox,
  }));
}

/** In-memory geolocation backend (default — no DB required). */
export function createMemorySource(): GeoSource {
  return {
    geocode: memoryGeocode,
    reverse: memoryReverse,
    autocomplete: memoryAutocomplete,
    boundaries: memoryBoundaries,
  };
}
