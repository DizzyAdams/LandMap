/**
 * Shared UI constants.
 *
 * `FEATURED_CITIES` is the single source of truth for the city chips shown on
 * the market dashboards (`/terrenos`, `/insights`, …). Previously each page
 * hard-coded its own divergent list; centralising keeps them consistent.
 */
export const FEATURED_CITIES = [
  'Curitiba',
  'Rio de Janeiro',
  'São Paulo',
  'Porto Alegre',
  'Florianópolis',
  'Joinville',
  'Londrina',
  'Balneário Camboriú',
] as const;
