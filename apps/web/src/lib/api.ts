export const LANDMAP_API_BASE =
  process.env.NEXT_PUBLIC_LANDMAP_API_BASE || '/api';

/**
 * Resolve an absolute URL for an API path.
 *
 * The default base (`/api`) is relative, which is fine in the browser but
 * THROWS in React Server Components (Node `fetch` cannot parse a relative URL
 * with no origin). That silently emptied the entire catalog in production —
 * every server-rendered page (home, search, property) caught the error and
 * showed "no properties". On the server we prepend the deployment's own origin
 * (`VERCEL_URL`), which is always reachable regardless of custom-domain DNS.
 */
export function apiUrl(path: string): string {
  const base = LANDMAP_API_BASE;
  if (base.startsWith('http')) return `${base}${path}`;
  if (typeof window !== 'undefined') return `${base}${path}`;

  // Server-side: relative URLs are invalid for Node fetch. VERCEL_URL is always
  // set on Vercel and points at the current deployment, so a self-fetch to
  // `/api/...` is reachable regardless of custom-domain DNS propagation.
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}${base}${path}`;

  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${origin}${base}${path}`;
}

/** Bloco de investimento (schema v2 seed — espelho de @landmap/invest). */
export type PropertyInvest = {
  monthlyRentEstimate?: number;
  capRate?: number;
  cashOnCash?: number;
  irrPct?: number;
  totalReturnPct?: number;
  monthlyCashflow?: number;
  score?: number;
  grade?: 'A' | 'B' | 'C' | 'D' | 'F' | string;
  downPayment?: number;
  netOperatingIncome?: number;
};

export type PropertyMarket = {
  neighborhoodAvgPricePerM2?: number;
  neighborhoodCount?: number;
  liquidityScore?: number;
  demandWeight?: number;
  appreciationPct?: number;
};

export type Property = {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  areaM2: number;
  pricePerM2?: number;
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
  /** Investor-grade fields (dataset 3000 schema v2) */
  schemaVersion?: number;
  kind?: string;
  grade?: string;
  score?: number;
  capRate?: number;
  invest?: PropertyInvest;
  market?: PropertyMarket;
  assumptions?: Record<string, number>;
  risks?: string[];
  drivers?: string[];
  comps?: string[];
  thesis?: string[];
  listingAgeDays?: number;
  monthlyRentEstimate?: number;
};

export type SearchQuery = {
  q?: string;
  type?: Property['type'];
  modality?: Property['modality'];
  city?: string;
  state?: string;
  grade?: string;
  minScore?: number;
  minCapRate?: number;
  id?: string;
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
  const res = await fetch(apiUrl(path), {
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
  if (query.grade) params.set('grade', query.grade);
  if (query.minScore != null) params.set('minScore', String(query.minScore));
  if (query.minCapRate != null) params.set('minCapRate', String(query.minCapRate));
  if (query.id) params.set('id', query.id);

  const qs = params.toString();
  const path = `/markdowns${qs ? `?${qs}` : ''}`;
  return apiFetch<SearchResponse>(path);
}

export function getProperty(id: string) {
  return apiFetch<{ item: Property }>(`/markdowns/${encodeURIComponent(id)}`).then(
    (data) => data.item,
  );
}

/** GET /geo/nearby?lat=&lng=&radiusKm=&limit= — ativos LandMap no raio. */
export function geoNearby(lat: number, lng: number, opts?: { radiusKm?: number; limit?: number; type?: string }) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  });
  if (opts?.radiusKm != null) params.set('radiusKm', String(opts.radiusKm));
  if (opts?.limit != null) params.set('limit', String(opts.limit));
  if (opts?.type) params.set('type', opts.type);
  return apiFetch<{
    lat: number;
    lng: number;
    radiusKm: number;
    total: number;
    items: Array<Property & { distanceKm: number }>;
  }>(`/geo/nearby?${params.toString()}`);
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

/* ─── Oportunidades & KPIs de mercado (core: lib/opportunities.ts) ─── */

export type OpportunitySeverity = 'baixa' | 'media' | 'alta';

export type OpportunityType =
  | 'preco_abaixo_media'
  | 'valorizacao_yoy'
  | 'nova_oferta'
  | 'zona_quente'
  | 'alto_score';

export interface Opportunity {
  id: string;
  type: OpportunityType;
  severity: OpportunitySeverity;
  title: string;
  description: string;
  city: string;
  state: string;
  neighborhood?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  pricePerM2?: number;
  deltaPct?: number;
  score: number;
  createdAt: string;
}

export interface KpiSnapshot {
  total: number;
  avgPricePerSqm: number;
  medianPricePerSqm: number;
  avgPrice: number;
  avgAppreciationYoy: number;
  availabilityRate: number;
  confidence: number;
  byType: Record<string, number>;
  byModality: Record<string, number>;
  topCities: { city: string; state: string; count: number; avgPrice: number }[];
  generatedAt: string;
}

export interface OpportunitiesResponse {
  opportunities: Opportunity[];
  kpis: KpiSnapshot;
}

/** GET /opportunities — alertas de oportunidade derivados do dataset (core). */
export function getOpportunities(city?: string) {
  const qs = city ? `?city=${encodeURIComponent(city)}` : '';
  return apiFetch<OpportunitiesResponse>(`/opportunities${qs}`);
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

export type RagStatus = {
  ok: boolean;
  chunks: number;
  documents: number;
  dirs: string[];
  mode: 'llm' | 'demo' | string;
  generatedAt: string;
};

export function ragStatus() {
  return apiFetch<RagStatus>('/rag/status');
}

/* ─── Outbound webhooks ─── */

export type WebhookEventType =
  | 'property.created'
  | 'property.updated'
  | 'property.deleted'
  | 'lead.created'
  | 'lead.updated'
  | 'alert.fired'
  | 'rag.query'
  | 'score.updated'
  | 'favorite.added'
  | 'ping';

export type WebhookEndpoint = {
  id: string;
  name: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  active: boolean;
  createdAt: string;
  lastDeliveryAt?: string;
  lastStatus?: number;
  secretPreview?: string;
};

export type WebhookDelivery = {
  id: string;
  endpointId: string;
  event: WebhookEventType;
  url: string;
  status: number | null;
  ok: boolean;
  error?: string;
  createdAt: string;
  durationMs: number;
};

export function listWebhookEndpoints() {
  return apiFetch<{ ok: boolean; items: WebhookEndpoint[]; total: number }>('/webhooks/endpoints');
}

export function createWebhookEndpoint(input: {
  name: string;
  url: string;
  events?: WebhookEventType[];
}) {
  return apiFetch<{ ok: boolean; endpoint: WebhookEndpoint }>('/webhooks/endpoints', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function deleteWebhookEndpoint(id: string) {
  return apiFetch<{ ok: boolean }>(`/webhooks/endpoints/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function testWebhookEndpoint(id: string) {
  return apiFetch<{ ok: boolean; deliveries: WebhookDelivery[] }>(
    `/webhooks/endpoints/${encodeURIComponent(id)}/test`,
    { method: 'POST', body: '{}' },
  );
}

export function listWebhookDeliveries(limit = 30) {
  return apiFetch<{ ok: boolean; items: WebhookDelivery[] }>(
    `/webhooks/deliveries?limit=${limit}`,
  );
}

export function listWebhookEvents() {
  return apiFetch<{
    ok: boolean;
    events: WebhookEventType[];
    sample: Record<string, unknown>;
    headers: Record<string, string>;
  }>('/webhooks/events');
}

/* ─── Admin sales agents (autonomous follow-ups) ─── */

export type AutonomyLevel = 'off' | 'copilot' | 'autopilot';

export type SalesAgentView = {
  id: string;
  role: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'paused';
  currentTask?: string;
  actionsToday: number;
  successToday: number;
  lastActionAt?: string;
};

export type SalesTaskView = {
  id: string;
  kind: string;
  agentId: string;
  dealId?: string;
  leadId?: string;
  title: string;
  detail: string;
  channel?: string;
  draft?: string;
  status: string;
  createdAt: string;
  dueAt?: string;
  lead?: { id: string; name: string; city?: string; tier?: string };
  deal?: { id: string; title: string; stage: string };
};

export type SalesStateView = {
  autonomy: AutonomyLevel;
  agents: SalesAgentView[];
  leads: unknown[];
  deals: unknown[];
  tasks: SalesTaskView[];
  events: Array<{
    id: string;
    at: string;
    agentId: string;
    kind: string;
    title: string;
    detail?: string;
    level: string;
  }>;
  analytics?: {
    totals: {
      pipelineValue: number;
      weightedPipeline: number;
      wonValue: number;
      wonCount: number;
      meetingsBooked: number;
    };
  };
  meta?: {
    teamSize: number;
    standby: number;
    running: number;
    pendingFollowUps: number;
    pendingTasks: number;
    lastTickAt?: string | null;
    tickCount?: number;
    followupSquad?: string[];
    dueAlerts?: { total: number; overdue: number; dueSoon: number };
    crm?: {
      mode: 'live' | 'ledger';
      twentyConfigured: boolean;
      twentyBaseUrl?: string;
      ledgerLeads: number;
      ledgerDeals: number;
      recentSyncs: number;
    };
  };
};

export type DueAlert = {
  id: string;
  taskId: string;
  title: string;
  leadId?: string;
  dealId?: string;
  channel?: string;
  agentId: string;
  dueAt: string;
  hoursDelta: number;
  severity: 'overdue' | 'due_soon' | 'upcoming';
  draft?: string;
};

export type CrmLedger = {
  ok: boolean;
  leads: unknown[];
  deals: unknown[];
  syncs: Array<{
    id: string;
    at: string;
    kind: string;
    entityId: string;
    title: string;
    target: string;
    ok: boolean;
    error?: string;
    externalId?: string;
  }>;
  status: {
    mode: 'live' | 'ledger';
    twentyConfigured: boolean;
    twentyBaseUrl?: string;
    ledgerLeads: number;
    ledgerDeals: number;
    recentSyncs: number;
  };
};

export function getSalesState() {
  return apiFetch<SalesStateView>('/sales/state');
}

export function getSalesAgents() {
  return apiFetch<{ ok: boolean; autonomy: AutonomyLevel; agents: SalesAgentView[]; teamSize: number }>(
    '/sales/agents',
  );
}

export function getSalesFollowups() {
  return apiFetch<{ ok: boolean; items: SalesTaskView[]; total: number }>('/sales/followups');
}

export function runSalesCycle(autonomy?: AutonomyLevel) {
  return apiFetch<{ result: unknown; state: SalesStateView }>('/sales/cycle', {
    method: 'POST',
    body: JSON.stringify(autonomy ? { autonomy } : {}),
  });
}

export function runFollowUpCycle(autonomy?: AutonomyLevel) {
  return apiFetch<{ result: unknown; state: SalesStateView }>('/sales/followups/run', {
    method: 'POST',
    body: JSON.stringify(autonomy ? { autonomy } : {}),
  });
}

export function setSalesAutonomy(level: AutonomyLevel) {
  return apiFetch<{ autonomy: AutonomyLevel; agents: SalesAgentView[] }>('/sales/autonomy', {
    method: 'POST',
    body: JSON.stringify({ level }),
  });
}

export function approveSalesTask(id: string) {
  return apiFetch<{ task: SalesTaskView; state: SalesStateView }>(
    `/sales/approve/${encodeURIComponent(id)}`,
    { method: 'POST', body: '{}' },
  );
}

export function rejectSalesTask(id: string) {
  return apiFetch<{ task: SalesTaskView; state: SalesStateView }>(
    `/sales/reject/${encodeURIComponent(id)}`,
    { method: 'POST', body: '{}' },
  );
}

export function approveAllFollowups() {
  return apiFetch<{ ok: boolean; count: number; state: SalesStateView }>(
    '/sales/approve-all-followups',
    { method: 'POST', body: '{}' },
  );
}

/** Heartbeat do time em espera (auto-loop admin). */
export function salesTick(mode: 'followup' | 'full' = 'followup') {
  return apiFetch<{
    ok: boolean;
    skipped?: boolean;
    reason?: string;
    result?: unknown;
    state: SalesStateView;
  }>('/sales/tick', {
    method: 'POST',
    body: JSON.stringify({ mode }),
  });
}

export function getDueAlerts() {
  return apiFetch<{
    ok: boolean;
    items: DueAlert[];
    summary: { total: number; overdue: number; dueSoon: number };
  }>('/sales/alerts/due');
}

export function getCrmLedger() {
  return apiFetch<CrmLedger>('/sales/crm');
}

export function syncCrm() {
  return apiFetch<{
    ok: boolean;
    leads: number;
    deals: number;
    status: CrmLedger['status'];
    ledger: Omit<CrmLedger, 'ok'>;
  }>('/sales/crm/sync', { method: 'POST', body: '{}' });
}

/* ─── Terrenos (terrain intelligence) ─── */

export type TerrainPlot = {
  id: string;
  title: string;
  city: string;
  state: string;
  neighborhood: string;
  price: number;
  areaM2: number;
  pricePerM2: number;
  modality: string;
  available: boolean;
  latitude?: number;
  longitude?: number;
  tags: string[];
  appreciationPct: number;
  buildScore: number;
  score: number;
  reasons: string[];
};

export type TerrainKpis = {
  total: number;
  available: number;
  avgPrice: number;
  avgPriceM2: number;
  medianPriceM2: number;
  minPriceM2: number;
  maxPriceM2: number;
  avgAreaM2: number;
  totalAreaM2: number;
  avgAppreciationPct: number;
  avgBuildScore: number;
};

export type TerrainResponse = {
  city: string;
  total: number;
  kpis: TerrainKpis | null;
  trend: { month: string; avgPriceM2: number }[];
  byNeighborhood: { name: string; count: number; avgPriceM2: number; avgAreaM2: number }[];
  byTag: { tag: string; count: number }[];
  plots: TerrainPlot[];
};

/** GET /market/terrain?city= — dashboard completo de terrenos. */
export function getTerrain(city: string) {
  return apiFetch<TerrainResponse>(`/market/terrain?city=${encodeURIComponent(city)}`);
}

/* ─── Investment underwriting ─────────────────────────────────────────── */

export type InvestScoreRequest = {
  price: number;
  monthlyRent: number;
  downPaymentPct: number;
  interestRatePct: number;
  loanTermYears: number;
  annualExpensesPct: number;
  vacancyPct: number;
  annualAppreciationPct: number;
  holdingYears: number;
  taxRatePct?: number;
};

export type InvestScoreResponse = {
  downPayment: number;
  loanAmount: number;
  monthlyMortgage: number;
  grossAnnualRent: number;
  effectiveGrossIncome: number;
  operatingExpenses: number;
  netOperatingIncome: number;
  capRate: number;
  cashOnCash: number;
  priceToRent: number;
  grossRentMultiplier: number;
  monthlyCashflow: number;
  annualCashflow: number;
  remainingLoanBalance: number;
  totalEquityEnd: number;
  totalReturnPct: number;
  irrPct: number;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | string;
};

export type InspectionAnalysis = {
  brightness: number;
  contrast: number;
  sharpness: number;
  score: number;
  verdict: 'boa' | 'ok' | 'ruim' | string;
  notes: string[];
  dominantColor: string;
  edgesRatio: number;
  focusScore: number;
  imageWidth: number;
  imageHeight: number;
};

export function scoreInvestment(body: InvestScoreRequest) {
  return apiFetch<InvestScoreResponse>('/invest/score', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function analyzeInspectionImage(file: File, maxWidth = 1024) {
  const form = new FormData();
  form.append('image', file);
  form.append('max_width', String(maxWidth));

  const res = await fetch(apiUrl('/inspect/image'), {
    method: 'POST',
    body: form,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API error ${res.status}: ${text || res.statusText}`);
  }

  return res.json() as Promise<InspectionAnalysis>;
}

/* ─── Real-time valuation (numpy-ts prior, sub-ms) ─── */

export type RealtimeValuation = {
  predictedPrice: number;
  pricePerM2: number;
  engine: string;
  latencyUs: number;
};

/** GET /value/realtime — estimativa de valor ao vivo, com telemetria de latência. */
export function valueRealtime(input: {
  areaM2: number;
  type?: string;
  bedrooms?: number;
  basePpm2?: number | null;
  yoyPct?: number;
  volatility?: number;
  isLaunch?: boolean;
}) {
  const p = new URLSearchParams();
  p.set('areaM2', String(input.areaM2));
  if (input.type) p.set('type', input.type);
  if (input.bedrooms != null) p.set('bedrooms', String(input.bedrooms));
  if (input.basePpm2 != null) p.set('basePpm2', String(input.basePpm2));
  if (input.yoyPct != null) p.set('yoyPct', String(input.yoyPct));
  if (input.volatility != null) p.set('volatility', String(input.volatility));
  if (input.isLaunch != null) p.set('isLaunch', String(input.isLaunch));
  return apiFetch<RealtimeValuation>(`/value/realtime?${p.toString()}`);
}

/* ─── Worldwide geolocation API (open, MIT) ─── */

export type GeoFeature = {
  id: string;
  label: string;
  type: 'country' | 'state' | 'city' | 'neighborhood';
  name: string;
  countryCode?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  lat: number;
  lng: number;
  /** [west, south, east, north] */
  bbox?: [number, number, number, number];
  population?: number;
  pricePerM2?: number;
  yoy?: number;
  zoning?: string;
  schools?: number;
};

export type GeocodeResult = { query: string; features: GeoFeature[] };

export type ReverseResult = {
  id: string;
  label: string;
  country?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  lat: number;
  lng: number;
  pricePerM2?: number;
  yoy?: number;
  zoning?: string;
  schools?: number;
  /** Radar local (dataset 3000) anexado pelo /api/geo/reverse */
  landmap?: {
    nearbyCount?: number;
    topGradeCount?: number;
    avgScore?: number;
    nearby?: Array<{
      id: string;
      title: string;
      grade?: string;
      score?: number;
      distanceKm?: number;
      type?: string;
      price?: number;
    }>;
  };
};

export type AutocompleteSuggestion = {
  id: string;
  label: string;
  type: 'country' | 'state' | 'city' | 'neighborhood';
  countryCode?: string;
  state?: string;
  city?: string;
  neighborhood?: string;
  lat: number;
  lng: number;
  source?: 'landmap' | 'nominatim';
  assetCount?: number;
  avgScore?: number;
};

export type Boundary = {
  id: string;
  label: string;
  level: number;
  lat: number;
  lng: number;
  bbox?: [number, number, number, number];
};

/** GET /geo/geocode?q= — forward geocoding (worldwide). */
export function geoGeocode(q: string) {
  return apiFetch<GeocodeResult>(`/geo/geocode?q=${encodeURIComponent(q)}`);
}

/** GET /geo/reverse?lat=&lng= — reverse geocoding + real-estate context. */
export function geoReverse(lat: number, lng: number) {
  return apiFetch<ReverseResult>(`/geo/reverse?lat=${lat}&lng=${lng}`);
}

/** GET /geo/autocomplete?q= — type-ahead suggestions. */
export function geoAutocomplete(q: string, limit = 6) {
  return apiFetch<AutocompleteSuggestion[]>(
    `/geo/autocomplete?q=${encodeURIComponent(q)}&limit=${limit}`,
  );
}

/** GET /geo/boundaries — admin boundaries (for region/bbox filtering). */
export function geoBoundaries(opts: { level?: number; country?: string; q?: string } = {}) {
  const params = new URLSearchParams();
  if (opts.level != null) params.set('level', String(opts.level));
  if (opts.country) params.set('country', opts.country);
  if (opts.q) params.set('q', opts.q);
  const qs = params.toString();
  return apiFetch<Boundary[]>(`/geo/boundaries${qs ? `?${qs}` : ''}`);
}


