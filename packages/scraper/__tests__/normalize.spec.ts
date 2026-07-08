import { describe, it, expect } from 'vitest';
import { normalizeListingToMarkdown, listingsToMarkdown } from '../src/normalize';
import type { ScrapedListing } from '../src/types';

describe('scraper/normalize', () => {
  it('turns a listing into markdown with localized price', () => {
    const listing: ScrapedListing = {
      title: 'Apartamento 2 quartos',
      price: 450000,
      areaM2: 72,
      type: 'apartamento',
      modality: 'venda',
      city: 'Curitiba',
      state: 'PR',
      neighborhood: 'Centro',
      url: 'https://example.com/1',
    };

    const md = normalizeListingToMarkdown(listing);
    expect(md).toContain('# Apartamento 2 quartos');
    expect(md).toContain('R$ 450.000');
    expect(md).toContain('72 m²');
    expect(md).toContain('Curitiba/PR');
    expect(md).toContain('https://example.com/1');
  });

  it('joins multiple listings with a separator', () => {
    const listings: ScrapedListing[] = [
      { title: 'A', price: 100 },
      { title: 'B', price: 200 },
    ];
    const md = listingsToMarkdown(listings);
    expect(md).toContain('# A');
    expect(md).toContain('# B');
    expect(md).toContain('---');
  });

  it('handles a minimal listing without throwing', () => {
    const md = normalizeListingToMarkdown({});
    expect(md.startsWith('# ')).toBe(true);
  });
});
