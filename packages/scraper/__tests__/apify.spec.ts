import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApifyClient, mapApifyItem } from '../src/apify';

function jsonResponse(body: unknown) {
  return {
    ok: true,
    status: 200,
    json: async () => body,
  } as Response;
}

describe('scraper/apify', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps a raw dataset item into a normalized listing', () => {
    const item = mapApifyItem({
      title: 'Casa térrea',
      price: 'R$ 890.000',
      area: '180 m²',
      city: 'Florianópolis',
      state: 'SC',
      url: 'https://example.com/x',
    });
    expect(item.title).toBe('Casa térrea');
    expect(item.price).toBe(890000);
    expect(item.areaM2).toBe(180);
    expect(item.city).toBe('Florianópolis');
    expect(item.state).toBe('SC');
    expect(item.type).toBe('casa');
  });

  it('runs an actor, polls until SUCCEEDED and reads the dataset', async () => {
    const fetchMock = vi.fn()
      // 1) start run
      .mockResolvedValueOnce(jsonResponse({ data: { id: 'run_1', actId: 'act_1' } }))
      // 2) poll status (already succeeded)
      .mockResolvedValueOnce(jsonResponse({ data: { status: 'SUCCEEDED', defaultDatasetId: 'ds_1' } }))
      // 3) dataset items
      .mockResolvedValueOnce(jsonResponse({ items: [{ title: 'Apartamento', price: 'R$ 450.000' }] }));

    vi.stubGlobal('fetch', fetchMock);

    const client = new ApifyClient({ token: 'test-token' });
    const listings = await client.scrape({ actorId: 'my/actor', timeoutMs: 5000 });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(listings).toHaveLength(1);
    expect(listings[0].price).toBe(450000);
    expect(listings[0].source).toBe('apify');
  });

  it('throws when the run fails', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ data: { id: 'run_2', actId: 'act_2' } }))
      .mockResolvedValueOnce(jsonResponse({ data: { status: 'FAILED' } }));
    vi.stubGlobal('fetch', fetchMock);

    const client = new ApifyClient({ token: 'test-token' });
    await expect(client.scrape({ actorId: 'my/actor' })).rejects.toThrow(/FAILED/);
  });
});
