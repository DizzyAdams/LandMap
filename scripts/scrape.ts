#!/usr/bin/env tsx
/**
 * LandMap scraper CLI.
 *
 * Scrapes a real-estate listing page (regex-based) or runs an Apify actor,
 * then feeds the results into the `@landmap/llm` ingestion pipeline so they
 * become searchable via RAG.
 *
 * Usage:
 *   pnpm exec tsx scripts/scrape.ts url <https://...> [--source name]
 *   pnpm exec tsx scripts/scrape.ts apify <actorId> [--input '{"key":"value"}']
 *
 * Requires the workspace to be built first (`pnpm -r build`) so that
 * `@landmap/llm` and `@landmap/scraper` resolve.
 */

import { HtmlScraper } from '@landmap/scraper';
import { ApifyClient } from '@landmap/scraper';
import { ingestListings } from '@landmap/scraper';
import type { ScrapedListing } from '@landmap/scraper';

async function main(): Promise<void> {
  const [command, target, ...rest] = process.argv.slice(2);
  if (!command) {
    console.error('Missing command. Use "url <url>" or "apify <actorId>".');
    process.exit(1);
    return;
  }

  const source = pickFlag(rest, '--source') ?? pickFlag(rest, '--name') ?? command;
  let listings: ScrapedListing[] = [];

  if (command === 'url') {
    if (!target) {
      console.error('Missing URL.');
      process.exit(1);
      return;
    }
    const scraper = new HtmlScraper();
    listings = await scraper.scrapeUrl(target);
  } else if (command === 'apify') {
    if (!target) {
      console.error('Missing actorId.');
      process.exit(1);
      return;
    }
    const inputRaw = pickFlag(rest, '--input');
    const runInput = inputRaw ? JSON.parse(inputRaw) : {};
    const client = new ApifyClient();
    listings = await client.scrape({ actorId: target, runInput });
  } else {
    console.error(`Unknown command: ${command}`);
    process.exit(1);
    return;
  }

  console.log(`Scraped ${listings.length} listings from ${source}.`);
  const result = await ingestListings(listings, { source });
  console.log(`Ingested into @landmap/llm → ${result.chunks} chunks @ ${result.indexedAt}`);
}

function pickFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  return idx >= 0 ? args[idx + 1] : undefined;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
