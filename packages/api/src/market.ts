import { Hono } from 'hono';

export function createMarketRouter() {
  const app = new Hono();

  /* ─── GET /market/trends — mock market trends ─── */
  app.get('/trends', (c) => {
    return c.json({
      avgPriceChange: '+5.2%',
      hotCities: [
        { city: 'Balneário Camboriú', growth: '+12%' },
        { city: 'Florianópolis', growth: '+8.7%' },
        { city: 'Curitiba', growth: '+6.3%' },
        { city: 'São Paulo', growth: '+4.1%' },
        { city: 'Brasília', growth: '+3.8%' },
      ],
      demandIndex: 78,
      updatedAt: new Date().toISOString(),
    });
  });

  /* ─── GET /market/comparison?city=X&city=Y — mock city comparison ─── */
  app.get('/comparison', (c) => {
    const cities = c.req.queries('city') || [];

    if (cities.length < 2) {
      return c.json({ error: 'At least 2 city parameters are required (e.g. ?city=Curitiba&city=Florianópolis)' }, 400);
    }

    const mockData: Record<string, { avgPrice: number; avgPriceM2: number; inventory: number; demandScore: number }> = {
      'Balneário Camboriú': { avgPrice: 850000, avgPriceM2: 12000, inventory: 320, demandScore: 95 },
      'Florianópolis': { avgPrice: 620000, avgPriceM2: 8500, inventory: 580, demandScore: 82 },
      'Curitiba': { avgPrice: 380000, avgPriceM2: 5200, inventory: 920, demandScore: 71 },
      'São Paulo': { avgPrice: 720000, avgPriceM2: 9800, inventory: 2400, demandScore: 88 },
      'Brasília': { avgPrice: 450000, avgPriceM2: 6100, inventory: 670, demandScore: 65 },
      'Rio de Janeiro': { avgPrice: 560000, avgPriceM2: 7800, inventory: 1100, demandScore: 74 },
    };

    const items = cities.map((city) => {
      const data = mockData[city] || { avgPrice: 0, avgPriceM2: 0, inventory: 0, demandScore: 0 };
      return { city, ...data };
    });

    return c.json({ items, total: items.length });
  });

  return app;
}
