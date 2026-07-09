import { createMemorySource } from './memory.js';
import { createPostgisSource, type GeoPoolLike } from './postgis.js';

export * from './types.js';
export { createMemorySource } from './memory.js';
export { createPostgisSource, type GeoPoolLike } from './postgis.js';
export { createGeoRouter } from './router.js';

/**
 * Picks the geolocation backend: PostGIS when a database is bound, otherwise
 * the embedded in-memory dataset. This is what makes the API work with zero
 * infrastructure for demos/CI and scale to a real DB in production.
 */
export function createGeoSource(pool?: GeoPoolLike) {
  if (process.env.DATABASE_URL && pool) {
    return createPostgisSource(pool);
  }
  return createMemorySource();
}
