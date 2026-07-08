import type { DesignAsset, DesignAssetKind, OpenDesignConfig } from './types.js';

const DEFAULT_BASE_URL = 'https://api.opendesign.com/v1';

/**
 * Minimal OpenDesign client.
 *
 * When `apiKey` is absent the client operates in **mock mode** (returns a
 * deterministic sample feed) so the integration can be wired and tested
 * end-to-end before real credentials are provided.
 */
export class OpenDesignClient {
  private readonly apiKey?: string;
  private readonly baseUrl: string;

  constructor(config: OpenDesignConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.OPENDESIGN_API_KEY;
    this.baseUrl = (config.baseUrl ?? process.env.OPENDESIGN_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, '');
  }

  get configured(): boolean {
    return Boolean(this.apiKey);
  }

  async getDesignFeed(opts: { limit?: number } = {}): Promise<DesignAsset[]> {
    if (!this.apiKey) return mockFeed(opts.limit ?? 6);

    const res = await fetch(`${this.baseUrl}/assets?limit=${opts.limit ?? 20}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });
    if (!res.ok) {
      throw new Error(`OpenDesign API error ${res.status}`);
    }
    const json = (await res.json()) as { assets?: Array<Record<string, unknown>> };
    return (json.assets ?? []).map(mapAsset);
  }
}

export function mapAsset(item: Record<string, unknown>): DesignAsset {
  const get = (...keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = item[k];
      if (v != null && typeof v !== 'object') return String(v);
    }
    return undefined;
  };

  const kind = get('kind', 'type') as DesignAssetKind | undefined;

  return {
    id: get('id', 'uuid') ?? `od-${Math.random().toString(36).slice(2, 10)}`,
    name: get('name', 'title') ?? 'Sem nome',
    kind: kind ?? 'frame',
    url: get('url', 'webUrl', 'sourceUrl'),
    thumbnailUrl: get('thumbnailUrl', 'previewUrl'),
    updatedAt: get('updatedAt', 'updated_at') ?? new Date().toISOString(),
    source: 'opendesign',
  };
}

const SAMPLE_NAMES = [
  'Hero Surreal',
  'Navbar Glass',
  'Card Imóvel',
  'Mapa Mundial',
  'Token Emerald',
  'Protótipo Live',
];

const SAMPLE_KINDS: DesignAssetKind[] = [
  'frame',
  'component',
  'component',
  'image',
  'token',
  'prototype',
];

export function mockFeed(limit = 6): DesignAsset[] {
  return SAMPLE_NAMES.slice(0, limit).map((name, i) => ({
    id: `mock-${i}`,
    name,
    kind: SAMPLE_KINDS[i] ?? 'frame',
    updatedAt: new Date().toISOString(),
    source: 'opendesign' as const,
  }));
}
