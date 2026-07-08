export interface ScrapedListing {
  title?: string;
  price?: number;
  areaM2?: number;
  type?: 'apartamento' | 'casa' | 'terreno' | 'comercial' | string;
  modality?: 'venda' | 'aluguel' | 'lancamento' | string;
  city?: string;
  state?: string;
  neighborhood?: string;
  url?: string;
  source?: string;
  /** Raw extracted field map for debugging / custom mapping. */
  raw?: Record<string, string>;
}

export interface ScraperAdapter {
  name: string;
  scrape(target: string, opts?: Record<string, unknown>): Promise<ScrapedListing[]>;
}
