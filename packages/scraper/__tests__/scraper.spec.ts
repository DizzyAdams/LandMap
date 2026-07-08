import { describe, it, expect } from 'vitest';
import { HtmlScraper, parseHtmlListings, stripTags, extractPrice, detectType, detectModality } from '../src/html';

const SAMPLE_HTML = `
<html><body>
  <div class="listing-card">
    <h2 data-title="Apartamento 2 quartos"></h2>
    <span class="price">R$ 450.000</span>
    <span class="area">72 m²</span>
    <span class="city">Curitiba</span>
    <p>Venda de apartamento no centro</p>
  </div>
  <div class="listing-card">
    <h2 data-title="Casa com piscina"></h2>
    <span class="price">R$ 890.000</span>
    <span class="area">180 m²</span>
    <span class="city">Florianópolis</span>
    <p>Casa para aluguel com piscina</p>
  </div>
</body></html>
`;

const FIELDS = {
  title: /data-title="([^"]+)"/,
  price: /R\$\s*([\d.,]+)/,
  area: /(\d+(?:[.,]\d+)?)\s*m²/,
  city: /class="city"[^>]*>([^<]+)/,
};

describe('scraper/html', () => {
  it('strips tags and collapses whitespace', () => {
    expect(stripTags('<p>Hello <b>world</b></p>')).toBe('Hello world');
  });

  it('extracts a numeric price', () => {
    expect(extractPrice('R$ 450.000')).toBe(450000);
    expect(extractPrice('US$ 1,200')).toBe(1200);
    expect(extractPrice('no price')).toBeUndefined();
  });

  it('detects property type and modality from text', () => {
    expect(detectType('linda casa de campo')).toBe('casa');
    expect(detectModality('apartamento para aluguel')).toBe('aluguel');
    expect(detectModality('imóvel à venda')).toBe('venda');
  });

  it('parses multiple listing cards from HTML', () => {
    const listings = parseHtmlListings(SAMPLE_HTML, { fields: FIELDS });
    expect(listings).toHaveLength(2);
    expect(listings[0].title).toBe('Apartamento 2 quartos');
    expect(listings[0].price).toBe(450000);
    expect(listings[0].areaM2).toBe(72);
    expect(listings[0].city).toBe('Curitiba');
    expect(listings[0].type).toBe('apartamento');
    expect(listings[0].modality).toBe('venda');

    expect(listings[1].title).toBe('Casa com piscina');
    expect(listings[1].modality).toBe('aluguel');
  });

  it('HtmlScraper.parse delegates to parseHtmlListings', () => {
    const scraper = new HtmlScraper();
    const listings = scraper.parse(SAMPLE_HTML, { fields: FIELDS });
    expect(listings).toHaveLength(2);
  });

  it('returns empty array when no cards match', () => {
    expect(parseHtmlListings('<div>nothing here</div>')).toEqual([]);
  });
});
