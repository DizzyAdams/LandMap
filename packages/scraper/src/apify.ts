import type { ScrapedListing } from './types.js';
import { extractPrice, extractArea, detectType, detectModality } from './html.js';

export interface ApifyClientConfig {
  token?: string;
  /** Apify API base URL. */
  baseUrl?: string;
}

export interface ApifyRunOptions {
  /** Actor or task id to run (or `<username>/<actor-name>`). */
  actorId: string;
  /** Input passed to the actor run. */
  runInput?: unknown;
  /** Reuse an existing dataset id instead of running an actor. */
  datasetId?: string;
  /** Polling timeout in ms (default 120_000). */
  timeoutMs?: number;
  /** Override the API token for this call. */
  token?: string;
}

const DEFAULT_BASE_URL = 'https://api.apify.com/v2';

/**
 * Minimal Apify client: run an actor (or read a dataset) and map the result
 * rows into `ScrapedListing`. Uses the global `fetch` — no SDK dependency.
 */
export class ApifyClient {
  private readonly token?: string;
  private readonly baseUrl: string;

  constructor(config: ApifyClientConfig = {}) {
    this.token = config.token ?? process.env.APIFY_TOKEN;
    this.baseUrl = (config.baseUrl ?? process.env.APIFY_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  private authHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) headers['Authorization'] = `Bearer ${this.token}`;
    return headers;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: { ...this.authHeaders(), ...(init.headers as Record<string, string>) },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Apify API error ${res.status} on ${path}: ${text || res.statusText}`);
    }
    return (await res.json()) as T;
  }

  /** Run an actor and wait until it finishes, returning the dataset id. */
  async runActor(opts: ApifyRunOptions): Promise<string> {
    if (opts.datasetId) return opts.datasetId;

    const run = await this.request<{ data: { id: string; actId: string } }>(
      `/acts/${encodeURIComponent(opts.actorId)}/runs`,
      { method: 'POST', body: JSON.stringify(opts.runInput ?? {}) },
    );
    const runId = run.data.id;

    const deadline = Date.now() + (opts.timeoutMs ?? 120_000);
    while (Date.now() < deadline) {
      const status = await this.request<{ data: { status: string; defaultDatasetId?: string } }>(
        `/actor-runs/${runId}`,
      );
      if (status.data.status === 'SUCCEEDED') return status.data.defaultDatasetId ?? '';
      if (['FAILED', 'ABORTED', 'TIMED-OUT'].includes(status.data.status)) {
        throw new Error(`Apify run ${runId} ended with status ${status.data.status}`);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error(`Apify run ${runId} timed out after ${opts.timeoutMs ?? 120_000}ms`);
  }

  /** Fetch all items from a dataset and map them to listings. */
  async getDatasetItems(datasetId: string): Promise<ScrapedListing[]> {
    const res = await this.request<{ items: Record<string, unknown>[] }>(
      `/datasets/${datasetId}/items?clean=true`,
    );
    return (res.items ?? []).map(mapApifyItem);
  }

  /** One-shot: run (or reuse) an actor and return mapped listings. */
  async scrape(opts: ApifyRunOptions): Promise<ScrapedListing[]> {
    const datasetId = await this.runActor(opts);
    if (!datasetId) throw new Error('Apify run did not produce a dataset id');
    return this.getDatasetItems(datasetId);
  }
}

/** Map an arbitrary Apify dataset row into a normalized `ScrapedListing`. */
export function mapApifyItem(item: Record<string, unknown>): ScrapedListing {
  const get = (...keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = item[k];
      if (v != null && typeof v !== 'object') return String(v);
    }
    return undefined;
  };

  const title = get('title', 'name', 'description');
  const priceRaw = get('price', 'priceCents', 'priceValue', 'valor');
  const areaRaw = get('area', 'areaM2', 'livingArea', 'metragem');
  const city = get('city', 'cidade', 'cityName', 'municipality');
  const state = get('state', 'estado', 'stateCode', 'region');
  const neighborhood = get('neighborhood', 'bairro', 'district');
  const url = get('url', 'link', 'sourceUrl', 'pageUrl');

  const plain = [title, city, neighborhood, url].filter(Boolean).join(' ');
  const listing: ScrapedListing = { source: 'apify', raw: {} };
  if (title) listing.title = title;
  if (priceRaw) listing.price = extractPrice(priceRaw);
  if (areaRaw) listing.areaM2 = extractArea(areaRaw);
  if (city) listing.city = city;
  if (state) listing.state = state;
  if (neighborhood) listing.neighborhood = neighborhood;
  if (url) listing.url = url;
  listing.type = detectType(plain) ?? get('type', 'tipo') ?? undefined;
  listing.modality = detectModality(plain) ?? get('modality', 'modalidade') ?? undefined;

  return listing;
}
