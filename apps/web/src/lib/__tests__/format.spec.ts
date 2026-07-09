import { describe, it, expect } from 'vitest';
import {
  formatBRL,
  formatCompactBRL,
  formatNumber,
  formatM2,
  formatPercent,
} from '../format';

describe('format helpers (pt-BR)', () => {
  it('formats BRL without cents', () => {
    expect(formatBRL(1250000)).toBe('R$ 1.250.000');
  });

  it('formats compact BRL', () => {
    expect(formatCompactBRL(1300000)).toMatch(/R\$|mi/);
  });

  it('formats grouped integers', () => {
    expect(formatNumber(1250000)).toBe('1.250.000');
  });

  it('formats square metres', () => {
    expect(formatM2(120)).toBe('120 m²');
  });

  it('formats percentages', () => {
    expect(formatPercent(0.123)).toBe('12,3%');
  });
});
