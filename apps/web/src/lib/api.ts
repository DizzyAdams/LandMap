export const LANDMAP_API_BASE =
  process.env.NEXT_PUBLIC_LANDMAP_API_BASE || '/api';

export type Property = {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  areaM2: number;
  bedrooms?: number;
  type: 'apartamento' | 'casa' | 'terreno' | 'comercial';
  modality: 'venda' | 'aluguel' | 'lancamento';
  available: boolean;
  latitude?: number;
  longitude?: number;
  neighborhood?: string;
  zone?: string;
  street?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  images?: string[];
  tags?: string[];
  priceHistory?: { date: string; price: number; source: string }[];
  priceFormatted?: string;
};

export type SearchQuery = {
  q?: string;
  type?: Property['type'];
  modality?: Property['modality'];
  city?: string;
  state?: string;
};

export type SearchResponse = {
  items: Property[];
  total: number;
};

export type Neighborhood = {
  name: string;
  city: string;
  state: string;
  schools: number;
  hospitals: number;
  transit: string[];
  crimeIndex: number;
  avgPriceM2: number;
};

export type AdminPropertyList = {
  items: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminStats = {
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
  typeStats: { type: string; count: number; avgPrice: number; avgAreaM2: number }[];
  topCities: { city: string; state: string; count: number; avgPrice: number }[];
  priceRanges: { label: string; min: number; max: number; count: number }[];
};

export type RecommendationsResponse = {
  source: Property;
  recommendations: Property[];
  total: number;
};

async function apiFetch<T>(path: string, init?: RequestInit) {
  const res = await fetch(`${LANDMAP_API_BASE}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export function searchProperties(query: SearchQuery) {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.type) params.set('type', query.type);
  if (query.modality) params.set('modality', query.modality);
  if (query.city) params.set('city', query.city);
  if (query.state) params.set('state', query.state);

  const qs = params.toString();
  const path = `/markdowns${qs ? `?${qs}` : ''}`;
  return apiFetch<SearchResponse>(path);
}

export function getProperty(id: string) {
  const url = new URL(`${LANDMAP_API_BASE}/markdowns`);
  url.searchParams.set('q', '');
  return apiFetch<{ items: Property[] }>(`${url.pathname}?${url.searchParams.toString()}`).then(
    (data) => data.items.find((item) => item.id === id) as Property | undefined
  );
}

/** GET /properties/recommendations/:id */
export function getRecommendations(id: string) {
  return apiFetch<RecommendationsResponse>(`/properties/recommendations/${id}`);
}

/** GET /neighborhoods?city=X */
export function getNeighborhoods(city: string) {
  return apiFetch<{ items: Neighborhood[]; total: number }>(
    `/neighborhoods?city=${encodeURIComponent(city)}`
  );
}

/** GET /neighborhoods/all */
export function getAllNeighborhoods() {
  return apiFetch<{ items: Neighborhood[]; total: number }>('/neighborhoods/all');
}

/** POST /properties/bulk — if available, bulk insert properties */
export function bulkCreateProperties(properties: Partial<Property>[]) {
  return apiFetch<{ items: Property[]; total: number }>('/properties/bulk', {
    method: 'POST',
    body: JSON.stringify(properties),
  });
}

/** GET /admin/properties (paginated) */
export function getAdminProperties(page = 1, pageSize = 50) {
  return apiFetch<AdminPropertyList>(`/admin/properties?page=${page}&pageSize=${pageSize}`);
}

/** GET /admin/properties/:id */
export function getAdminProperty(id: string) {
  return apiFetch<Property>(`/admin/properties/${id}`);
}

/** GET /admin/stats */
export function getAdminStats() {
  return apiFetch<AdminStats>('/admin/stats');
}

/* ─── AI & Data Intelligence ─── */

/** POST /embeddings/similarity — busca imóveis similares */
export function getPropertySimilarity(propertyId: string, limit = 5) {
  return apiFetch<{ propertyId: string; similar: Array<{ id: string; text: string; score: number; metadata?: Record<string, string> }>; total: number }>(
    '/embeddings/similarity',
    { method: 'POST', body: JSON.stringify({ propertyId, limit }) },
  );
}

/** GET /embeddings/search?q=... — busca textual */
export function searchEmbeddings(q: string, limit = 5) {
  return apiFetch<{ query: string; results: Array<{ id: string; text: string; score: number; metadata?: Record<string, string> }>; total: number }>(
    `/embeddings/search?q=${encodeURIComponent(q)}&limit=${limit}`,
  );
}

/** GET /insights/neighborhood/:name — análise de bairro */
export function getNeighborhoodInsights(name: string) {
  return apiFetch<{ neighborhood: Record<string, unknown>; analysis: { avgPriceM2: number; hotTypes: string[]; priceTrend: string; demandScore: number; recommendation: string; summary: string } }>(
    `/insights/neighborhood/${encodeURIComponent(name.toLowerCase())}`,
  );
}

/** GET /insights/investment/:propertyId — ROI analysis */
export function getInvestmentAnalysis(propertyId: string) {
  return apiFetch<{ propertyId: string; estimatedROI: number; estimatedROIFormatted: string; paybackYears: number; recommendation: string; riskLevel: string }>(
    `/insights/investment/${propertyId}`,
  );
}

/* ─── Live market intelligence ─── */

export type StatsResponse = {
  totalProperties: number;
  totalCities: number;
  avgPrice: number;
  byType: Record<string, number>;
  byModality: Record<string, number>;
};

export type CityAggregate = {
  city: string;
  state: string;
  count: number;
  avgPrice: number;
};

export type KpiResponse = {
  kpis: {
    total: number;
    avgPrice: number;
    medianPrice: number;
    avgPricePerSqm: number;
    medianPricePerSqm: number;
    availabilityRate: number;
    rentShare: number;
    byType: Record<string, number>;
    byModality: Record<string, number>;
    cities: CityAggregate[];
  };
  rulers: Array<{
    ruler: 'claude' | 'jpmorgan' | 'quantum';
    score: number;
    label: string;
    commentary: string;
  }>;
  generatedAt: string;
};

/** GET /stats */
export function getStats() {
  return apiFetch<StatsResponse>('/stats');
}

/** GET /cities */
export function getCities() {
  return apiFetch<{ items: CityAggregate[]; total: number }>('/cities');
}

/** GET /kpi — market KPIs + investment rulers */
export function getKpi() {
  return apiFetch<KpiResponse>('/kpi');
}

/* ─── LangFlow-style workflow engine ─── */

export type WorkflowDefinition = {
  id: string;
  name: string;
  description: string;
  category: 'report' | 'lead' | 'copy' | 'rag';
  inputSchema: Record<string, string>;
};

export type WorkflowRunStep = {
  id: string;
  status: 'ok' | 'error';
  output?: unknown;
};

export type WorkflowRunResult = {
  workflowId: string;
  status: 'ok' | 'error';
  result?: {
    workflowId: string;
    status: 'ok' | 'error';
    error?: string;
    result?: {
      workflowId: string;
      status: 'ok' | 'error';
      steps: WorkflowRunStep[];
      durationMs: number;
    };
  };
  error?: string;
};

/** GET /langflow/workflows — list built-in workflows */
export function listWorkflows() {
  return apiFetch<{ ok: boolean; items: WorkflowDefinition[] }>('/langflow/workflows');
}

/** POST /langflow/workflows/:id/run — execute a workflow */
export function runWorkflow(id: string, input: Record<string, unknown>) {
  return apiFetch<{
    ok: boolean;
    result: {
      workflowId: string;
      status: 'ok' | 'error';
      error?: string;
      steps: WorkflowRunStep[];
      durationMs: number;
    };
  }>(`/langflow/workflows/${id}/run`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

/* ─── RAG chat (server-backed) ─── */

export type RagQueryResult = {
  ok: boolean;
  query: string;
  answer: string;
  sources: Array<{ title: string; path: string; score: number }>;
  usedMock: boolean;
  generatedAt: string;
};

/** POST /rag/query — retrieve + answer over the local knowledge base */
export function ragQuery(query: string) {
  return apiFetch<RagQueryResult>('/rag/query', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}

