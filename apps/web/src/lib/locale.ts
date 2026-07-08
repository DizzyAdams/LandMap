import { useLocale } from 'next-intl';

export const LOCALES = ['pt-BR', 'en-US', 'es-ES'] as const;

export type Locale = (typeof LOCALES)[number];

/**
 * Prefix an internal path with the active locale segment.
 *
 * @example
 *   localeHref('/search')            // '/pt-BR/search'
 *   localeHref('search', 'en-US')    // '/en-US/search'
 *   localeHref('/map?q=x', 'es-ES')  // '/es-ES/map?q=x'
 */
export function localeHref(path: string, locale?: string): string {
  const l = locale || 'pt-BR';
  const clean = path.startsWith('/') ? path : '/' + path;
  return '/' + l + clean;
}

/** Client hook to read the active locale provided by next-intl. */
export function useActiveLocale(): string {
  return useLocale() || 'pt-BR';
}
