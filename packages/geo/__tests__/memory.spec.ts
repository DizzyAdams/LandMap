import { describe, it, expect } from 'vitest';
import {
  memoryGeocode,
  memoryAutocomplete,
  memoryReverse,
  memoryBoundaries,
  createMemorySource,
} from '../src/memory';
import { createGeoRouter } from '../src/router';
import type { GeoFeature } from '../src/types';

describe('geo/memory — geocode', () => {
  it('resolves a known city', () => {
    const { features } = memoryGeocode('São Paulo');
    expect(features.length).toBeGreaterThan(0);
    expect(features[0].name).toBe('São Paulo');
    expect(features[0].type).toBe('city');
  });

  it('returns an empty feature list for gibberish', () => {
    expect(memoryGeocode('zzzqqqxxx').features).toHaveLength(0);
  });
});

describe('geo/memory — autocomplete', () => {
  it('ranks the closest match first', () => {
    const suggestions = memoryAutocomplete('curitiba');
    expect(suggestions[0].id).toBe('c-curitiba');
    expect(suggestions[0].label).toContain('Curitiba');
  });

  it('respects the limit', () => {
    expect(memoryAutocomplete('a', 3)).toHaveLength(3);
  });
});

describe('geo/memory — reverse (real-estate enrichment)', () => {
  it('attaches zone market data for covered markets', () => {
    const r = memoryReverse(-27.59, -48.55); // Florianópolis
    expect(r.city).toBe('Florianópolis');
    expect(r.pricePerM2).toBeGreaterThan(0);
    expect(r.yoy).toBeGreaterThan(0);
    expect(r.zoning).toBeTruthy();
    expect(r.schools).toBeGreaterThan(0);
  });

  it('returns coordinates even for uncovered points', () => {
    const r = memoryReverse(0, 0);
    expect(r.lat).toBe(0);
    expect(r.lng).toBe(0);
  });
});

describe('geo/memory — boundaries', () => {
  it('lists all countries at level 0', () => {
    const countries = memoryBoundaries({ level: 0 });
    expect(countries.every((b) => b.level === 0)).toBe(true);
    expect(countries.length).toBeGreaterThan(30);
  });

  it('lists Brazilian states at level 1', () => {
    const states = memoryBoundaries({ country: 'BR', level: 1 });
    expect(states.every((b) => b.level === 1)).toBe(true);
    expect(states.length).toBe(27);
  });
});

describe('geo/router — endpoint contracts', () => {
  it('GET /geocode returns features and validates input (400 on empty q)', async () => {
    const router = createGeoRouter(createMemorySource());
    const ok = await router.request('/geocode?q=Florianópolis');
    expect(ok.status).toBe(200);
    const body = (await ok.json()) as { features: GeoFeature[] };
    expect(body.features.some((f) => f.name === 'Florianópolis')).toBe(true);

    const bad = await router.request('/geocode?q=');
    expect(bad.status).toBe(400);
  });

  it('GET /reverse returns enriched context', async () => {
    const router = createGeoRouter(createMemorySource());
    const res = await router.request('/reverse?lat=-23.55&lng=-46.63'); // São Paulo
    expect(res.status).toBe(200);
    const body = (await res.json()) as { city: string; pricePerM2: number };
    expect(body.city).toBe('São Paulo');
    expect(body.pricePerM2).toBeGreaterThan(0);
  });

  it('GET /boundaries filters by country', async () => {
    const router = createGeoRouter(createMemorySource());
    const res = await router.request('/boundaries?country=BR&level=1');
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<{ level: number }>;
    expect(body).toHaveLength(27);
  });
});
