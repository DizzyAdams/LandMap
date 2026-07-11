import { Hono } from 'hono';
import { z } from 'zod';
import { handle } from 'hono/vercel';
import type { AnalyzeInput, AnalyzeResult, LlmMessage } from '@landmap/llm';
import { computeMarketKpis, applyRulers } from '@landmap/llm';
import type { Property } from '@landmap/db';
import { createAdminRouter } from './admin.js';
import { createNeighborhoodsRouter } from './neighborhoods.js';
import { createMarketRouter } from './market.js';
import { marketApp } from './routes/market.js';
import { investApp } from './routes/invest.js';
import { createEmbeddingsRouter } from './routes/embeddings.js';
import { createInsightsRouter } from './routes/insights.js';
import { createSearchSuggestionsRouter } from './routes/search-suggestions.js';
import { createLangflowRouter } from './routes/langflow.js';
import { createRagRouter } from './routes/rag.js';
import { createSalesRouter } from './routes/sales.js';
import { createIntegrationsRouter } from './routes/integrations.js';
import allPropertiesData from './data/properties.json'
import { createGeoRouter, createGeoSource } from '@landmap/geo';


export type Env = {
  Bindings: {
    DATABASE_URL?: string;
  };
};

const app = new Hono<Env>();

/* â”€â”€â”€ Request logging middleware â”€â”€â”€ */
app.use('*', async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  await next();
  const elapsed = Date.now() - start;
  console.log(`[${new Date().toISOString()}] ${method} ${path} â†’ ${c.res.status} (${elapsed}ms)`);
});

app.get('/health', (c) => c.json({ status: 'ok', env: c.env ? 'bound' : 'missing' }));

// Uniform error responses â€” never leak raw stack traces; Zod input errors -> 400.
app.onError((err, c) => {
  console.error('[api error]', err);
  if (err instanceof z.ZodError) {
    return c.json({ error: 'Invalid input', issues: err.issues }, 400);
  }
  const status = (err as { status?: number }).status ?? 500;
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  return c.json({ error: message }, { status });
});

const propertySchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string(),
  state: z.string(),
  price: z.number(),
  areaM2: z.number(),
  bedrooms: z.number().optional(),
  type: z.enum(['apartamento', 'casa', 'terreno', 'comercial']),
  modality: z.enum(['venda', 'aluguel', 'lancamento']),
  available: z.boolean(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  neighborhood: z.string().optional(),
  zone: z.string().optional(),
  street: z.string().optional(),
  status: z.enum(['active', 'sold', 'rented', 'reserved']),
  createdAt: z.string(),
  updatedAt: z.string(),
  images: z.array(z.string()),
  tags: z.array(z.string()),
});

type PropertyRecord = z.infer<typeof propertySchema>;

const now = new Date().toISOString();

const allProperties: PropertyRecord[] = allPropertiesData as unknown as PropertyRecord[];

let nextId = allProperties.length + 1;

// Lenient search input: empty-string / null / missing fields are treated as
// "no filter" so clients (and the validation harness) never get a 500 from
// Zod enum coercion. `query` is accepted as an alias of `q` for convenience.
const emptyToUndef = (v: unknown) =>
  v === '' || v === null || v === undefined ? undefined : v;

const searchInput = z.object({
  q: z.preprocess(emptyToUndef, z.string().optional()),
  query: z.preprocess(emptyToUndef, z.string().optional()),
  type: z.preprocess(emptyToUndef, z.enum(['apartamento', 'casa', 'terreno', 'comercial']).optional()),
  modality: z.preprocess(emptyToUndef, z.enum(['venda', 'aluguel', 'lancamento']).optional()),
  city: z.preprocess(emptyToUndef, z.string().optional()),
  state: z.preprocess(emptyToUndef, z.string().optional()),
});

type SearchInput = z.infer<typeof searchInput>;

function applySearchFilters(query: SearchInput) {
  const term = (query.q ?? query.query ?? '').toLowerCase();
  return allProperties.filter((item) => {
    if (term && !item.title.toLowerCase().includes(term)) return false;
    if (query.type && item.type !== query.type) return false;
    if (query.modality && item.modality !== query.modality) return false;
    if (query.city && item.city.toLowerCase() !== query.city.toLowerCase()) return false;
    if (query.state && item.state.toLowerCase() !== query.state.toLowerCase()) return false;
    return true;
  });
}

app.get('/markdowns', async (c) => {
  const query = searchInput.parse(c.req.query());
  const filtered = applySearchFilters(query);

  return c.json({ items: filtered, total: filtered.length });
});

app.post('/search', async (c) => {
  let raw: unknown = {};
  try {
    raw = await c.req.json();
  } catch {
    raw = {};
  }
  const query = searchInput.parse(raw);
  const filtered = applySearchFilters(query);

  return c.json({ ok: true, items: filtered, total: filtered.length, query });
});

const analyzeInputSchema = z.object({
  prompt: z.string().min(1),
  filters: z
    .object({
      city: z.string().optional(),
      state: z.string().optional(),
      type: z.string().optional(),
      modality: z.string().optional(),
    })
    .optional(),
});

app.post('/analyze', async (c) => {
  const body = analyzeInputSchema.parse(await c.req.json()) as AnalyzeInput;

  const systemPrompt =
    'VocÃª Ã© um assistente especializado em imÃ³veis brasileiros. Responda em portuguÃªs de forma objetiva e mencionar cidade, estado, tipo, modalidade, Ã¡rea, preÃ§o e quartos quando disponÃ­veis.';

  const messages: LlmMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: body.prompt },
  ];

  const filters = body.filters ?? {};
  const filtered = allProperties.filter((item) => {
    if (filters.city && item.city.toLowerCase() !== filters.city.toLowerCase()) return false;
    if (filters.state && item.state.toLowerCase() !== filters.state.toLowerCase()) return false;
    if (filters.type && item.type !== filters.type) return false;
    if (filters.modality && item.modality !== filters.modality) return false;
    return true;
  });

  const candidates = filtered.map((item, index) => ({
    id: item.id,
    score: filtered.length ? 1 - index / filtered.length : 0,
  }));

  const answer =
    filtered.length === 0
      ? 'No momento nÃ£o hÃ¡ imÃ³veis que correspondam exatamente a esses filtros. VocÃª pode ampliar a cidade, estado ou modalidade.'
      : filtered
          .slice(0, 3)
          .map((item) => {
            const location = `${item.city}/${item.state}`;
            const bedrooms = item.bedrooms ? `, ${item.bedrooms} quarto(s)` : '';
            const area = `${item.areaM2}mÂ²`;
            const price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price);
            return `${item.title} (${item.type}, ${item.modality}) em ${location}: ${area}, ${price}${bedrooms}.`;
          })
          .join('\n');

  const result: AnalyzeResult = {
    answer,
    candidates,
  };

  return c.json(result);
});

/** GET /favorites?ids=1,2,3 â€” returns properties matching the given IDs */
app.get('/favorites', async (c) => {
  const raw = c.req.query('ids');
  if (!raw) {
    return c.json({ items: [], total: 0 });
  }

  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const items = allProperties.filter((p) => ids.includes(p.id));
  return c.json({ items, total: items.length });
});

/** GET /compare?ids=1,2 â€” returns a diff/comparison between 2+ properties */
app.get('/compare', async (c) => {
  const raw = c.req.query('ids');
  if (!raw) {
    return c.json({ error: 'Query parameter "ids" is required (e.g. ?ids=1,2)' }, 400);
  }

  const ids = raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (ids.length < 2) {
    return c.json({ error: 'At least 2 IDs are required for comparison' }, 400);
  }

  const items = allProperties.filter((p) => ids.includes(p.id));

  if (items.length < 2) {
    return c.json({ error: 'Could not find at least 2 properties for the given IDs' }, 404);
  }

  const base = items[0];
  const diffs = items.slice(1).map((item) => ({
    id: item.id,
    title: item.title,
    priceDiff: item.price - base.price,
    priceDiffPercent: base.price ? Math.round(((item.price - base.price) / base.price) * 100) : 0,
    areaDiff: item.areaM2 - base.areaM2,
    areaDiffPercent: base.areaM2 ? Math.round(((item.areaM2 - base.areaM2) / base.areaM2) * 100) : 0,
    bedroomsDiff: (item.bedrooms ?? 0) - (base.bedrooms ?? 0),
    pricePerM2: base.areaM2 ? Math.round(item.price / item.areaM2) : 0,
    basePricePerM2: base.areaM2 ? Math.round(base.price / base.areaM2) : 0,
  }));

  return c.json({
    base: items[0],
    items,
    diffs,
    total: items.length,
  });
});

/** POST /properties â€” cria nova propriedade */
app.post('/properties', async (c) => {
  const body = await c.req.json<Partial<PropertyRecord>>();
  const now_ = new Date().toISOString();
  const property: PropertyRecord = {
    id: String(nextId++),
    title: body.title ?? '',
    city: body.city ?? '',
    state: body.state ?? '',
    price: body.price ?? 0,
    areaM2: body.areaM2 ?? 0,
    bedrooms: body.bedrooms,
    type: body.type ?? 'apartamento',
    modality: body.modality ?? 'venda',
    available: body.available ?? true,
    latitude: body.latitude,
    longitude: body.longitude,
    neighborhood: body.neighborhood,
    zone: body.zone,
    street: body.street,
    status: body.status ?? 'active',
    createdAt: now_,
    updatedAt: now_,
    images: body.images ?? [],
    tags: body.tags ?? [],
  };
  allProperties.push(property);
  return c.json(property, 201);
});

/** PUT /properties/:id â€” atualiza propriedade existente */
app.put('/properties/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<Partial<PropertyRecord>>();
  const idx = allProperties.findIndex((p) => p.id === id);
  if (idx === -1) {
    return c.json({ error: 'Property not found' }, 404);
  }
  const now_ = new Date().toISOString();
  allProperties[idx] = {
    ...allProperties[idx],
    ...body,
    id,
    updatedAt: now_,
  };
  return c.json(allProperties[idx]);
});

/** DELETE /properties/:id â€” soft delete (set available=false) */
app.delete('/properties/:id', async (c) => {
  const id = c.req.param('id');
  const idx = allProperties.findIndex((p) => p.id === id);
  if (idx === -1) {
    return c.json({ error: 'Property not found' }, 404);
  }
  const now_ = new Date().toISOString();
  allProperties[idx] = {
    ...allProperties[idx],
    available: false,
    status: 'sold',
    updatedAt: now_,
  };
  return c.json({ ok: true, id });
});

/** GET /cities â€” agregaÃ§Ã£o por cidade */
app.get('/cities', async (c) => {
  const map = new Map<string, { city: string; state: string; count: number; totalPrice: number }>();
  for (const p of allProperties) {
    const key = `${p.city}|${p.state}`;
    const existing = map.get(key);
    if (existing) {
      existing.count++;
      existing.totalPrice += p.price;
    } else {
      map.set(key, { city: p.city, state: p.state, count: 1, totalPrice: p.price });
    }
  }
  const cities = Array.from(map.values()).map((item) => ({
    city: item.city,
    state: item.state,
    count: item.count,
    avgPrice: Math.round(item.totalPrice / item.count),
  }));
  return c.json({ items: cities, total: cities.length });
});

/** GET /stats â€” estatÃ­sticas gerais */
app.get('/stats', async (c) => {
  const totalProperties = allProperties.length;
  const citiesSet = new Set(allProperties.map((p) => `${p.city}|${p.state}`));
  const totalCities = citiesSet.size;
  const totalPrice = allProperties.reduce((acc, p) => acc + p.price, 0);
  const avgPrice = totalProperties > 0 ? Math.round(totalPrice / totalProperties) : 0;

  const byType: Record<string, number> = {};
  const byModality: Record<string, number> = {};

  for (const p of allProperties) {
    byType[p.type] = (byType[p.type] ?? 0) + 1;
    byModality[p.modality] = (byModality[p.modality] ?? 0) + 1;
  }

  return c.json({ totalProperties, totalCities, avgPrice, byType, byModality });
});

/* â”€â”€â”€ Admin routes â”€â”€â”€ */
/**
 * POST /seo/generate â€” gera o JSON-LD (PropertyListingPage) + slug para a
 * landing de um imÃ³vel. Usado pelo workflow n8n `landmap-seo-publish`.
 * Auto-contido (espelha `buildPropertyListingPageSchema` de @landmap/seo)
 * para nÃ£o acoplar a API ao build do pacote seo.
 */
app.post('/seo/generate', async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as {
    property?: { id?: string; title?: string; city?: string; state?: string; price?: number };
    types?: string[];
  };
  const p = body.property ?? {};
  const title = p.title ?? 'ImÃ³vel';
  const slug = (p.id ?? title)
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'PropertyListingPage',
    name: title,
    url: `https://landmapprod.vercel.app/imovel/${slug}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: p.city ?? 'Curitiba',
      addressRegion: p.state ?? 'PR',
      addressCountry: 'BR',
    },
    offers: { '@type': 'Offer', priceCurrency: 'BRL', price: p.price ?? 0 },
  };
  return c.json({ schema, slug });
});

app.route('/admin', createAdminRouter(allProperties as any, () => String(nextId++)));

/* â”€â”€â”€ Neighborhoods routes â”€â”€â”€ */
app.route('/neighborhoods', createNeighborhoodsRouter());

/* â”€â”€â”€ Market routes â”€â”€â”€ */
app.route('/market', createMarketRouter());

/* â”€â”€â”€ Market intelligence (neighborhoods / price-trend / heatmap) â”€â”€â”€ */
/* Investment intelligence: /invest/analyze, /invest/opportunities, /invest/score */
app.route('/invest', investApp);
app.route('/market', marketApp);

/* â”€â”€â”€ Embeddings routes â”€â”€â”€ */
app.route('/embeddings', createEmbeddingsRouter());

/* â”€â”€â”€ Insights routes â”€â”€â”€ */
app.route('/insights', createInsightsRouter());

/* ?* LangFlow-style workflow routes ?* */
app.route('/langflow', createLangflowRouter());

/* ?* RAG chat routes ?* */
app.route('/rag', createRagRouter());

/* â”€â”€â”€ Autonomous Sales Agent routes â”€â”€â”€ */
app.route('/geo', createGeoRouter(createGeoSource()));
app.route('/sales', createSalesRouter());

/* â”€â”€â”€ Integrations hub (WABA + CRIE + OpenDesign + registry) â”€â”€â”€ */
app.route('/integrations', createIntegrationsRouter());


/* â”€â”€â”€ Search suggestions routes â”€â”€â”€ */
app.route('/', createSearchSuggestionsRouter());

/* â”€â”€â”€ POST /properties/bulk â€” bulk insert â”€â”€â”€ */
app.post('/properties/bulk', async (c) => {
  const body = await c.req.json<Array<Partial<PropertyRecord>>>();
  if (!Array.isArray(body) || body.length === 0) {
    return c.json({ error: 'Array of properties is required' }, 400);
  }

  const now_ = new Date().toISOString();
  const created = body.map((item) => {
    const property: PropertyRecord = {
      id: String(nextId++),
      title: item.title ?? '',
      city: item.city ?? '',
      state: item.state ?? '',
      price: item.price ?? 0,
      areaM2: item.areaM2 ?? 0,
      bedrooms: item.bedrooms,
      type: item.type ?? 'apartamento',
      modality: item.modality ?? 'venda',
      available: item.available ?? true,
      latitude: item.latitude,
      longitude: item.longitude,
      neighborhood: item.neighborhood,
      zone: item.zone,
      street: item.street,
      status: item.status ?? 'active',
      createdAt: now_,
      updatedAt: now_,
      images: item.images ?? [],
      tags: item.tags ?? [],
    };
    allProperties.push(property);
    return property;
  });

  return c.json({ items: created, total: created.length }, 201);
});

/* â”€â”€â”€ GET /properties/recommendations/:id â€” 3 similar properties â”€â”€â”€ */
app.get('/properties/recommendations/:id', async (c) => {
  const id = c.req.param('id');
  const property = allProperties.find((p) => p.id === id);
  if (!property) {
    return c.json({ error: 'Property not found' }, 404);
  }

  const priceMin = property.price * 0.7;
  const priceMax = property.price * 1.3;

  const candidates = allProperties.filter(
    (p) =>
      p.id !== id &&
      p.city === property.city &&
      p.type === property.type &&
      p.price >= priceMin &&
      p.price <= priceMax
  );

  // Score by price proximity
  const scored = candidates.map((p) => ({
    ...p,
    _score: Math.abs(p.price - property.price) / property.price,
  }));
  scored.sort((a, b) => a._score - b._score);

  const recommendations = scored.slice(0, 3).map(({ _score, ...item }) => item);

  return c.json({
    source: property,
    recommendations,
    total: recommendations.length,
  });
});

/* â”€â”€â”€ KPI + investment rulers â”€â”€â”€ */
app.get('/kpi', (c) => {
  const kpis = computeMarketKpis(allProperties as unknown as Property[]);
  const rulers = applyRulers(kpis);
  return c.json({
    kpis,
    rulers,
    generatedAt: new Date().toISOString(),
  });
});

export default app;
