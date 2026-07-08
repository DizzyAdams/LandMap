import { writeFileSync, mkdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { chunkText } from '@landmap/llm/rag.js';
import { ingestSource } from '@landmap/llm';
import type { Chunk } from '@landmap/llm/rag.js';
import { normalizeListingToMarkdown } from './normalize.js';
import type { ScrapedListing } from './types.js';

export interface ListingChunkOptions {
  /** Namespace used to tag the ingested source (e.g. "apify:zapimoveis"). */
  source?: string;
  /** Max words per chunk (passed to the llm chunker). */
  maxWords?: number;
}

/**
 * Convert scraped listings into the `Chunk` shape used by `@landmap/llm`'s
 * TF-IDF ingestion pipeline. Pure — no I/O.
 */
export function listingToChunks(
  listings: ScrapedListing[],
  options: ListingChunkOptions = {},
): Chunk[] {
  const source = options.source ?? 'scraper';
  const chunks: Chunk[] = [];

  listings.forEach((listing, idx) => {
    const markdown = normalizeListingToMarkdown(listing);
    const path = `${source}://listing-${idx}`;
    chunks.push(
      ...chunkText({
        path,
        title: listing.title ?? `Listing ${idx}`,
        text: markdown,
      }),
    );
  });

  return chunks;
}

export interface IngestOptions extends ListingChunkOptions {
  /** Directory where the temporary markdown is written before ingestion. */
  workDir?: string;
}

export interface IngestResult {
  source: string;
  chunks: number;
  indexedAt: string;
}

/**
 * End-to-end: normalize scraped listings into markdown, write them to a temp
 * file and feed them into `@landmap/llm`'s ingestion pipeline (which embeds
 * and persists the vectors). Returns a summary.
 */
export async function ingestListings(
  listings: ScrapedListing[],
  options: IngestOptions = {},
): Promise<IngestResult> {
  const source = options.source ?? 'scraper';
  const workDir = options.workDir ?? tmpdir();
  const file = join(workDir, `landmap-scrape-${Date.now()}.md`);

  const markdown = listings
    .map((l, idx) => `# ${source} listing ${idx}\n\n${normalizeListingToMarkdown(l)}`)
    .join('\n\n---\n\n');

  mkdirSync(workDir, { recursive: true });
  writeFileSync(file, markdown, 'utf-8');

  const result = await ingestSource({ path: file, namespace: source });
  return {
    source: result.source,
    chunks: result.chunks.length,
    indexedAt: result.indexedAt,
  };
}
