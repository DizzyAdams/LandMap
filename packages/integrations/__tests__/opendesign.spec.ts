import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { OpenDesignClient, mapAsset, mockFeed } from '../src/index';

describe('integrations/opendesign', () => {
  it('returns a deterministic mock feed when no API key is set', async () => {
    const client = new OpenDesignClient();
    expect(client.configured).toBe(false);
    const feed = await client.getDesignFeed({ limit: 3 });
    expect(feed).toHaveLength(3);
    expect(feed[0].source).toBe('opendesign');
    expect(feed.every((a) => a.name.length > 0)).toBe(true);
  });

  it('maps a raw asset into a normalized DesignAsset', () => {
    const asset = mapAsset({ id: 'x1', title: 'Meu Frame', type: 'frame', webUrl: 'https://x' });
    expect(asset.id).toBe('x1');
    expect(asset.name).toBe('Meu Frame');
    expect(asset.kind).toBe('frame');
    expect(asset.url).toBe('https://x');
    expect(asset.source).toBe('opendesign');
  });

  it('fetches the real feed when an API key is provided', async () => {
    const json = {
      assets: [
        { id: 'a1', name: 'Real Asset', kind: 'component', webUrl: 'https://real' },
      ],
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => json }),
    );

    const client = new OpenDesignClient({ apiKey: 'secret', baseUrl: 'https://api.test/v1' });
    expect(client.configured).toBe(true);
    const feed = await client.getDesignFeed();
    expect(feed).toHaveLength(1);
    expect(feed[0].name).toBe('Real Asset');
    expect(feed[0].url).toBe('https://real');
  });

  it('exposes a sample mock feed helper', () => {
    expect(mockFeed(2)).toHaveLength(2);
  });

  afterEach(() => vi.unstubAllGlobals());
  beforeEach(() => vi.unstubAllGlobals());
});
