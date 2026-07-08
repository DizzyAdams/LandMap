import type { ScrapedListing } from './types.js';

/**
 * Cheerio-based HTML parser.
 *
 * Cheerio is an **optional peer dependency** for `@landmap/scraper`. If you
 * install it (`pnpm add cheerio`) you can use CSS selectors for robust
 * extraction instead of the regex-based `HtmlScraper`.
 *
 * The dynamic import is wrapped in `@ts-ignore` so the package builds and runs
 * without cheerio present; it is only resolved at runtime when you call this.
 */
export interface CheerioParseOptions {
  /** CSS selector for each listing card (e.g. `.listing-card`). */
  itemSelector: string;
  /** Map of field name → CSS selector (text of the first match is used). */
  fields: Record<string, string>;
  locale?: 'pt-BR' | 'en-US' | 'es-ES';
}

export async function parseHtmlWithCheerio(
  html: string,
  opts: CheerioParseOptions,
): Promise<ScrapedListing[]> {
  // @ts-ignore optional peer dependency — only resolved when cheerio is installed
  const cheerioMod: any = await import('cheerio');
  // @ts-ignore handle both default + namespace export shapes
  const load = cheerioMod.default?.load ?? cheerioMod.load;
  if (typeof load !== 'function') {
    throw new Error('cheerio is not installed. Run `pnpm add cheerio` to use parseHtmlWithCheerio.');
  }

  const $ = load(html);
  const results: ScrapedListing[] = [];

  $(opts.itemSelector).each((_: number, el: any) => {
    const node = $(el);
    const raw: Record<string, string> = {};
    for (const [field, selector] of Object.entries(opts.fields)) {
      const value = node.find(selector).first().text().trim();
      if (value) raw[field] = value;
    }
    results.push({ raw, ...(Object.keys(raw).length ? raw : {}) } as ScrapedListing);
  });

  return results;
}
