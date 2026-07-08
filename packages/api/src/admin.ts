import { Hono } from 'hono';
import type { Env } from './index.js';

type PropertyRecord = {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  areaM2: number;
  bedrooms?: number;
  type: string;
  modality: string;
  available: boolean;
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  zone?: string;
  street?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
  tags: string[];
};

type AdminStats = {
  totalProperties: number;
  totalAvailable: number;
  totalSold: number;
  totalCities: number;
  totalStates: number;
  avgPrice: number;
  medPrice: number;
  minPrice: number;
  maxPrice: number;
  totalAreaM2: number;
  avgAreaM2: number;
  byType: Record<string, number>;
  byModality: Record<string, number>;
  byStatus: Record<string, number>;
  byZone: Record<string, number>;
  typeStats: {
    type: string;
    count: number;
    avgPrice: number;
    avgAreaM2: number;
  }[];
  topCities: { city: string; state: string; count: number; avgPrice: number }[];
  priceRanges: { label: string; min: number; max: number; count: number }[];
};

export function createAdminRouter(allProperties: PropertyRecord[], getNextId: () => string) {
  const admin = new Hono<Env>();

  /** GET /admin/properties — paginado, 50 por página */
  admin.get('/properties', async (c) => {
    const page = Math.max(1, parseInt(c.req.query('page') ?? '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(c.req.query('pageSize') ?? '50', 10)));
    const start = (page - 1) * pageSize;
    const items = allProperties.slice(start, start + pageSize);
    const total = allProperties.length;

    return c.json({
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  });

  /** GET /admin/properties/:id */
  admin.get('/properties/:id', async (c) => {
    const id = c.req.param('id');
    const property = allProperties.find((p) => p.id === id);
    if (!property) {
      return c.json({ error: 'Property not found' }, 404);
    }
    return c.json(property);
  });

  /** PUT /admin/properties/:id — atualiza propriedade */
  admin.put('/properties/:id', async (c) => {
    const id = c.req.param('id');
    const idx = allProperties.findIndex((p) => p.id === id);
    if (idx === -1) {
      return c.json({ error: 'Property not found' }, 404);
    }
    const body = await c.req.json<Partial<PropertyRecord>>();
    const now_ = new Date().toISOString();
    allProperties[idx] = {
      ...allProperties[idx],
      ...body,
      id,
      updatedAt: now_,
    };
    return c.json(allProperties[idx]);
  });

  /** DELETE /admin/properties/:id — exclui (marca como reservado) */
  admin.delete('/properties/:id', async (c) => {
    const id = c.req.param('id');
    const idx = allProperties.findIndex((p) => p.id === id);
    if (idx === -1) {
      return c.json({ error: 'Property not found' }, 404);
    }
    const now_ = new Date().toISOString();
    allProperties[idx] = {
      ...allProperties[idx],
      available: false,
      status: 'reserved',
      updatedAt: now_,
    };
    return c.json({ ok: true, id });
  });

  /** GET /admin/stats — estatísticas detalhadas */
  admin.get('/stats', async (c) => {
    const n = allProperties.length;
    const available = allProperties.filter((p) => p.available);
    const prices = allProperties.map((p) => p.price).sort((a, b) => a - b);

    const citiesSet = new Set(allProperties.map((p) => `${p.city}|${p.state}`));
    const statesSet = new Set(allProperties.map((p) => p.state));
    const totalArea = allProperties.reduce((s, p) => s + p.areaM2, 0);
    const totalPrice = allProperties.reduce((s, p) => s + p.price, 0);
    const avgPrice = n > 0 ? Math.round(totalPrice / n) : 0;
    const medPrice = n > 0 ? prices[Math.floor(n / 2)] : 0;
    const minPrice = n > 0 ? prices[0] : 0;
    const maxPrice = n > 0 ? prices[n - 1] : 0;

    const byType: Record<string, number> = {};
    const byModality: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    const byZone: Record<string, number> = {};

    for (const p of allProperties) {
      byType[p.type] = (byType[p.type] ?? 0) + 1;
      byModality[p.modality] = (byModality[p.modality] ?? 0) + 1;
      byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
      if (p.zone) byZone[p.zone] = (byZone[p.zone] ?? 0) + 1;
    }

    const typeStats = Object.entries(byType).map(([type, count]) => {
      const props = allProperties.filter((p) => p.type === type);
      return {
        type,
        count,
        avgPrice: Math.round(props.reduce((s, p) => s + p.price, 0) / count),
        avgAreaM2: Math.round(props.reduce((s, p) => s + p.areaM2, 0) / count),
      };
    });

    const cityMap = new Map<string, { city: string; state: string; count: number; totalPrice: number }>();
    for (const p of allProperties) {
      const key = `${p.city}|${p.state}`;
      const existing = cityMap.get(key);
      if (existing) {
        existing.count++;
        existing.totalPrice += p.price;
      } else {
        cityMap.set(key, { city: p.city, state: p.state, count: 1, totalPrice: p.price });
      }
    }
    const topCities = Array.from(cityMap.values())
      .map((item) => ({ city: item.city, state: item.state, count: item.count, avgPrice: Math.round(item.totalPrice / item.count) }))
      .sort((a, b) => b.count - a.count);

    const priceRanges = [
      { label: 'Até R$ 200k', min: 0, max: 200000 },
      { label: 'R$ 200k–500k', min: 200000, max: 500000 },
      { label: 'R$ 500k–1M', min: 500000, max: 1000000 },
      { label: 'R$ 1M–2M', min: 1000000, max: 2000000 },
      { label: 'Acima de R$ 2M', min: 2000000, max: Infinity },
    ].map((range) => ({
      ...range,
      count: allProperties.filter((p) => p.price >= range.min && p.price < range.max).length,
    }));

    const stats: AdminStats = {
      totalProperties: n,
      totalAvailable: available.length,
      totalSold: allProperties.filter((p) => p.status === 'sold').length,
      totalCities: citiesSet.size,
      totalStates: statesSet.size,
      avgPrice,
      medPrice,
      minPrice,
      maxPrice,
      totalAreaM2: totalArea,
      avgAreaM2: n > 0 ? Math.round(totalArea / n) : 0,
      byType,
      byModality,
      byStatus,
      byZone,
      typeStats,
      topCities,
      priceRanges,
    };

    return c.json(stats);
  });

  return admin;
}
