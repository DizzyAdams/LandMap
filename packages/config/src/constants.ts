export const APP_NAME = 'LandMap';
export const DEFAULT_LOCALE = 'pt-BR';
export const LOCALES = ['pt-BR', 'en-US', 'es-ES'] as const;
export const API_BASE_URL = process.env.NEXT_PUBLIC_LANDMAP_API_URL ?? 'http://localhost:4000';
export const APP_URL = process.env.NEXT_PUBLIC_LANDMAP_APP_URL ?? 'http://localhost:3000';
export const CACHE_TTL_MS = 300_000;
export const SEARCH_DEBOUNCE_MS = 250;
export const MAX_RESULTS_DEFAULT = 24;

export type Locale = typeof LOCALES[number];
