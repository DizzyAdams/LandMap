import type { ScrapedListing } from './types.js';

/**
 * Convert a single scraped listing into a markdown document suitable for the
 * `@landmap/llm` ingestion pipeline (TF-IDF chunking + vector store).
 */
export function normalizeListingToMarkdown(listing: ScrapedListing): string {
  const lines: string[] = [`# ${listing.title ?? 'Imóvel sem título'}`, ''];

  if (listing.price != null && Number.isFinite(listing.price)) {
    lines.push(`**Preço:** R$ ${listing.price.toLocaleString('pt-BR')}`);
  }
  if (listing.areaM2 != null && Number.isFinite(listing.areaM2)) {
    lines.push(`**Área:** ${listing.areaM2} m²`);
  }
  if (listing.type) lines.push(`**Tipo:** ${listing.type}`);
  if (listing.modality) lines.push(`**Modalidade:** ${listing.modality}`);
  if (listing.city || listing.state) {
    lines.push(`**Localização:** ${[listing.city, listing.state].filter(Boolean).join('/')}`);
  }
  if (listing.neighborhood) lines.push(`**Bairro:** ${listing.neighborhood}`);
  if (listing.url) lines.push(`**Fonte:** ${listing.url}`);

  return lines.join('\n');
}

export function listingsToMarkdown(listings: ScrapedListing[]): string {
  return listings.map(normalizeListingToMarkdown).join('\n\n---\n\n');
}
