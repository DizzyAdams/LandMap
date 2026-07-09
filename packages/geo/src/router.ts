import { Hono } from 'hono';
import { z } from 'zod';
import { createMemorySource } from './memory.js';
import {
  geocodeQuery,
  reverseQuery,
  autocompleteQuery,
  boundariesQuery,
  type GeoSource,
} from './types.js';

/**
 * Hono router exposing the worldwide geolocation API.
 *
 *   GET /geo/geocode?q=        → forward geocoding
 *   GET /geo/reverse?lat=&lng=  → reverse geocoding (real-estate enriched)
 *   GET /geo/autocomplete?q=    → type-ahead suggestions
 *   GET /geo/boundaries?...     → admin boundaries (for region/bbox filtering)
 *
 * Invalid query input throws a ZodError, which the host app's `onError`
 * turns into a 400 (same convention used across @landmap/api).
 */
export function createGeoRouter(source: GeoSource = createMemorySource()): Hono {
  const router = new Hono();

  // Self-contained validation errors so the router works standalone (it is the
  // default "no DB" source). Mirrors the host API's onError convention.
  router.onError((err, c) => {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', issues: err.issues }, 400);
    }
    const status = (err as { status?: number }).status ?? 500;
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return c.json({ error: message }, { status });
  });

  router.get('/geocode', async (c) => {
    const { q } = geocodeQuery.parse({ q: c.req.query('q') });
    return c.json(await source.geocode(q));
  });

  router.get('/reverse', async (c) => {
    const { lat, lng } = reverseQuery.parse({
      lat: c.req.query('lat'),
      lng: c.req.query('lng'),
    });
    return c.json(await source.reverse(lat, lng));
  });

  router.get('/autocomplete', async (c) => {
    const { q, limit } = autocompleteQuery.parse({
      q: c.req.query('q'),
      limit: c.req.query('limit'),
    });
    return c.json(await source.autocomplete(q, limit));
  });

  router.get('/boundaries', async (c) => {
    const { level, country, q } = boundariesQuery.parse({
      level: c.req.query('level'),
      country: c.req.query('country'),
      q: c.req.query('q'),
    });
    return c.json(await source.boundaries({ level, country, q }));
  });

  return router;
}
