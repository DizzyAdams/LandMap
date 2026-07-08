import { describe, it, expect } from 'vitest';
import app from '../src/index';

describe('packages/api feature-injection', () => {
  it('GET /kpi returns market KPIs and the three rulers', async () => {
    const res = await app.request('/kpi');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.kpis.total).toBeGreaterThan(0);
    expect(Array.isArray(data.rulers)).toBe(true);
    expect(data.rulers).toHaveLength(3);
    expect(data.rulers.map((r: any) => r.ruler).sort()).toEqual([
      'claude',
      'jpmorgan',
      'quantum',
    ]);
  });

  it('GET /integrations/opendesign/feed works without credentials (mock)', async () => {
    const res = await app.request('/integrations/opendesign/feed');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.configured).toBe(false);
    expect(Array.isArray(data.feed)).toBe(true);
    expect(data.feed.length).toBeGreaterThan(0);
    expect(data.feed[0].source).toBe('opendesign');
  });
});
