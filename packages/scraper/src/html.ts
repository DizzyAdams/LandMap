import type { ScrapedListing } from './types.js';

export type ScraperLocale = 'pt-BR' | 'en-US' | 'es-ES';

export interface HtmlExtractOptions {
  /**
   * Regex marking the START of each listing "card" in the HTML. When omitted,
   * a heuristic matches `<div class="...listing|card|item|property...">`.
   */
  itemMarker?: RegExp;
  /** Field extractors: field name → regex with exactly one capture group. */
  fields?: Record<string, RegExp>;
  locale?: ScraperLocale;
}

const DEFAULT_ITEM_MARKER =
  /<div[^>]*class="[^"]*(?:listing|card|item|property|anon)[^"]*"[^>]*>/gi;

const DEFAULT_FIELDS: Record<string, RegExp> = {
  title: /(?:title|alt)=["']([^"']{3,140})["']/i,
  price: /(?:r\$|us\$|\$|€)\s*([\d.,]+)/i,
  area: /(\d+(?:[.,]\d+)?)\s*m²/i,
  city: /([A-ZÀ-Ý][a-zA-ZÀ-ÿ\s]{2,30})/,
};

const TYPE_KEYWORDS: Record<string, string[]> = {
  apartamento: ['apartamento', 'apartment', 'apart', 'flat'],
  casa: ['casa', 'house', 'home'],
  terreno: ['terreno', 'lote', 'land', 'lot'],
  comercial: ['comercial', 'sala comercial', 'commercial', 'office'],
};

const MODALITY_KEYWORDS: Record<string, string[]> = {
  venda: ['venda', 'sale', 'for sale', 'venta'],
  aluguel: ['aluguel', 'locação', 'rent', 'rental', 'alquiler', 'arriendo'],
  lancamento: ['lançamento', 'lancamento', 'launch', 'pre-launch', 'lanzamiento'],
};

export function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractPrice(raw?: string): number | undefined {
  if (!raw) return undefined;
  let s = raw.replace(/[^\d.,]/g, '');

  // Disambiguate thousands vs decimal separators.
  if (s.includes('.') && s.includes(',')) {
    // Both present: the right-most is the decimal separator.
    if (s.lastIndexOf('.') > s.lastIndexOf(',')) {
      s = s.replace(/,/g, ''); // US style: commas are thousands
    } else {
      s = s.replace(/\./g, '').replace(',', '.'); // BR style: dots thousands, comma decimal
    }
  } else if (s.includes(',')) {
    s = s.replace(',', '.'); // only comma → decimal (BR)
  }

  // Strip remaining thousands separators (e.g. 1.200 → 1200).
  s = s.replace(/\.(?=\d{3}\b)/g, '');
  const value = parseFloat(s);
  return Number.isFinite(value) ? value : undefined;
}

export function extractArea(raw?: string): number | undefined {
  if (!raw) return undefined;
  const value = parseFloat(raw.replace(',', '.'));
  return Number.isFinite(value) ? value : undefined;
}

export function detectType(text: string, locale: ScraperLocale = 'pt-BR'): string | undefined {
  const lower = text.toLowerCase();
  for (const [type, keywords] of Object.entries(TYPE_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return type;
  }
  return undefined;
}

export function detectModality(text: string, locale: ScraperLocale = 'pt-BR'): string | undefined {
  const lower = text.toLowerCase();
  for (const [modality, keywords] of Object.entries(MODALITY_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return modality;
  }
  return undefined;
}

function extractCardListing(card: string, fields: Record<string, RegExp>, locale: ScraperLocale, index: number): ScrapedListing {
  const raw: Record<string, string> = {};
  for (const [field, pattern] of Object.entries(fields)) {
    const match = card.match(pattern);
    if (match && match[1]) raw[field] = match[1].trim();
  }

  const plain = stripTags(card);
  const listing: ScrapedListing = { raw };
  if (raw.title) listing.title = raw.title;
  if (raw.price) listing.price = extractPrice(raw.price);
  if (raw.area) listing.areaM2 = extractArea(raw.area);
  if (raw.city) listing.city = raw.city;
  if (raw.state) listing.state = raw.state;
  if (raw.neighborhood) listing.neighborhood = raw.neighborhood;
  if (raw.url) listing.url = raw.url;
  listing.type = detectType(plain, locale) ?? (raw.type as string | undefined);
  listing.modality = detectModality(plain, locale) ?? (raw.modality as string | undefined);

  return listing;
}

/**
 * Parse a raw HTML page into structured listings.
 *
 * Strategy:
 *   1. Locate "card" boundaries via `itemMarker` (or the default heuristic).
 *   2. For each card, run field regexes to pull title/price/area/city.
 *   3. Auto-detect type & modality from the card's plain text.
 */
export function parseHtmlListings(html: string, options: HtmlExtractOptions = {}): ScrapedListing[] {
  const itemMarker = options.itemMarker ?? DEFAULT_ITEM_MARKER;
  const fields = options.fields ?? DEFAULT_FIELDS;
  const locale = options.locale ?? 'pt-BR';

  const boundaries: number[] = [];
  const marker = new RegExp(itemMarker.source, itemMarker.flags.includes('g') ? itemMarker.flags : itemMarker.flags + 'g');
  let m: RegExpExecArray | null;
  while ((m = marker.exec(html)) !== null) boundaries.push(m.index);

  if (boundaries.length === 0) return [];

  const cards: string[] = [];
  for (let i = 0; i < boundaries.length; i++) {
    const start = boundaries[i];
    const end = i + 1 < boundaries.length ? boundaries[i + 1] : html.length;
    cards.push(html.slice(start, end));
  }

  return cards.map((card, idx) => extractCardListing(card, fields, locale, idx));
}

export class HtmlScraper {
  /** Parse an HTML string into listings. */
  parse(html: string, options: HtmlExtractOptions = {}): ScrapedListing[] {
    return parseHtmlListings(html, options);
  }

  /** Fetch a URL and parse it. Uses the global `fetch` (Node 18+). */
  async scrapeUrl(url: string, options: HtmlExtractOptions = {}): Promise<ScrapedListing[]> {
    const res = await fetch(url, { headers: { 'User-Agent': 'LandMapScraper/0.1 (+https://github.com/forrydev/LandMap)' } });
    if (!res.ok) throw new Error(`Scrape failed for ${url}: HTTP ${res.status}`);
    const html = await res.text();
    return this.parse(html, options);
  }
}
