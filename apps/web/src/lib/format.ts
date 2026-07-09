/**
 * Shared, locale-aware formatting helpers for LandMap (pt-BR).
 *
 * Centralises the repeated
 *   new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
 * idiom that was duplicated across a dozen web call-sites, so price / area /
 * number rendering stays consistent and DRY.
 */

const brl0 = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const number0 = new Intl.NumberFormat('pt-BR');

/** BRL currency without cents, e.g. `R$ 1.250.000`. */
export function formatBRL(value: number): string {
  return brl0.format(value);
}

/** Compact BRL for tight UI, e.g. `R$ 1,3 mi`. */
export function formatCompactBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/** Grouped integer, e.g. `1.250.000`. */
export function formatNumber(value: number): string {
  return number0.format(value);
}

/** Area in square metres, e.g. `120 m²`. */
export function formatM2(value: number): string {
  return `${number0.format(value)} m²`;
}

/** Ratio as a percentage, e.g. `12,3%`. */
export function formatPercent(value: number, fractionDigits = 1): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
