/**
 * Map Intelligence — paridade literal com Lovable dashboard/map
 * (`lovable_chunk_dashboard.js`: 8 camadas, score bands, Fortaleza regions).
 * Lovable usa Google Maps; LandMap usa Leaflet com o mesmo chrome/UX.
 */

export type LayerId =
  | 'valorization'
  | 'growth'
  | 'development'
  | 'infrastructure'
  | 'safety'
  | 'mobility'
  | 'urbanQuality'
  | 'populationDensity';

export type LayerScores = Record<LayerId, number>;

export type PricePoint = { year: number; value: number };

export type IntelligenceRegion = {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  priceSqm: number;
  /** Variação % 12m (Top valorização Lovable). */
  priceSqmDelta12m: number;
  score: number;
  population: number;
  incomeAvg: number;
  hdi: number;
  gdpGrowth: number;
  zoning: string;
  environmentalRisk: 'baixo' | 'medio' | 'alto';
  floodRisk: 'baixo' | 'medio' | 'alto';
  layerScores: LayerScores;
  priceHistory: PricePoint[];
  highlights: string[];
  timeline: { year: number; title: string }[];
};

export type IntelligenceLayer = {
  id: LayerId;
  label: string;
  accent: 'primary';
};

/** 8 camadas exatas do Lovable (array K no bundle). */
export const INTELLIGENCE_LAYERS: IntelligenceLayer[] = [
  { id: 'valorization', label: 'Valorização m²', accent: 'primary' },
  { id: 'growth', label: 'Velocidade de crescimento', accent: 'primary' },
  { id: 'development', label: 'Índice de desenvolvimento', accent: 'primary' },
  { id: 'infrastructure', label: 'Infraestrutura', accent: 'primary' },
  { id: 'safety', label: 'Segurança', accent: 'primary' },
  { id: 'mobility', label: 'Mobilidade', accent: 'primary' },
  { id: 'urbanQuality', label: 'Qualidade urbana', accent: 'primary' },
  { id: 'populationDensity', label: 'Densidade populacional', accent: 'primary' },
];

export const SEARCH_PLACEHOLDER = 'Buscar bairro, cidade, CEP ou zoneamento.';

export const COPY = {
  layersTitle: 'Camadas de inteligência',
  heat: 'Heatmap',
  heatScale: 'Escala do heatmap',
  critical: 'Crítico',
  medium: 'Médio',
  exceptional: 'Excepcional',
  composition: 'Composição por camada',
  score: 'Score LandMap',
  scoreHint: 'Índice composto de valorização, infra e crescimento.',
  topValorization: 'Top valorização (12m)',
  topOpportunities: 'Top oportunidades',
  indexFlow: 'Fluxo do índice',
  last7Years: 'Últimos 7 anos',
  highlights: 'Destaques',
  timeline: 'Linha do tempo',
  history: 'Histórico do m²',
  failMap: 'Falha ao carregar o mapa',
  compare: 'Comparar',
  stateRank: 'Ranking estadual',
  nationalRank: 'Ranking nacional',
  avgPrice: 'Preço médio m²',
  population: 'População',
  income: 'Renda média',
  idh: 'IDH',
  zoning: 'Zoneamento',
  envRisk: 'Risco ambiental',
  floodRisk: 'Risco enchente',
  hottest: 'Região mais aquecida',
  historyRange: '2019 - 2025',
} as const;

/** Score band — função J do Lovable. */
export function scoreLabel(score: number): string {
  if (score >= 80) return 'Excepcional';
  if (score >= 65) return 'Alto potencial';
  if (score >= 50) return 'Médio';
  if (score >= 35) return 'Baixo';
  return 'Crítico';
}

/**
 * Cor do score por banda — 100% tokenizada (sem hex de marca).
 * Leaflet circleMarker exige cor concreta, então resolvemos a
 * var(--*) computada em runtime (disponível após montagem).
 * Bandas: primary (≥80) · accent (≥65) · warning (≥50) · orange (≥35) · destructive.
 /** scoreColor: banda de cor alinhada a scoreLabel.
  * primary(≥80) · accent(≥65 e ≥50 "Médio") · warning(35–49 "Baixo") · destructive(<35 "Crítico"). */
 const SCORE_BANDS: { min: number; token: string }[] = [
   { min: 80, token: '--primary' },
   { min: 65, token: '--accent' },
   { min: 50, token: '--accent' },
   { min: 35, token: '--warning' },
 ];

/** Lê o valor computado de uma CSS var (fallback concreto se ainda não resolvida). */
export function resolveToken(token: string): string {
  if (typeof window === 'undefined') return '';
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return raw || '';
}

export function scoreColor(score: number): string {
  const band = SCORE_BANDS.find((b) => score >= b.min);
  const token = band ? band.token : '--destructive';
  return resolveToken(token) || (token === '--destructive' ? '#dc2626' : '#575ECF');
}

/** Gradiente escala heatmap — resolvido de tokens (vermelho → âmbar → indigo). */
export function heatScaleGradient(): string {
  const danger = resolveToken('--destructive') || '#dc2626';
  const warn = resolveToken('--warning') || '#eab308';
  const primary = resolveToken('--primary') || '#575ECF';
  return `linear-gradient(90deg, ${danger} 0%, ${warn} 50%, ${primary} 100%)`;
}

function scores(
  v: number,
  g: number,
  d: number,
  i: number,
  s: number,
  m: number,
  u: number,
  p: number,
): LayerScores {
  return {
    valorization: v,
    growth: g,
    development: d,
    infrastructure: i,
    safety: s,
    mobility: m,
    urbanQuality: u,
    populationDensity: p,
  };
}

function hist(base: number): PricePoint[] {
  const years = [2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const mult = [0.72, 0.78, 0.84, 0.9, 0.95, 0.98, 1];
  return years.map((year, idx) => ({
    year,
    value: Math.round(base * mult[idx]),
  }));
}

export const INTELLIGENCE_REGIONS: IntelligenceRegion[] = [
  {
    id: 'meireles',
    name: 'Meireles',
    city: 'Fortaleza',
    state: 'CE',
    lat: -3.725,
    lng: -38.493,
    priceSqm: 14800,
    priceSqmDelta12m: 5.0,
    score: 92,
    population: 38600,
    incomeAvg: 9800,
    hdi: 0.912,
    gdpGrowth: 6.2,
    zoning: 'ZR-2 / ZC-3',
    environmentalRisk: 'baixo',
    floodRisk: 'baixo',
    layerScores: scores(94, 78, 88, 96, 82, 90, 95, 88),
    priceHistory: hist(14800),
    highlights: [
      'Maior valorização dos últimos 12 meses',
      'Fronteira nova entre premium e alta liquidez',
      'Boa conexão com orla e centro',
    ],
    timeline: [
      { year: 2022, title: 'Requalificação da orla' },
      { year: 2024, title: 'Novo hotel 5 estrelas' },
      { year: 2025, title: 'Corredor cicloviário integrado' },
    ],
  },
  {
    id: 'aldeota',
    name: 'Aldeota',
    city: 'Fortaleza',
    state: 'CE',
    lat: -3.741,
    lng: -38.498,
    priceSqm: 13200,
    priceSqmDelta12m: 4.2,
    score: 88,
    population: 42100,
    incomeAvg: 8600,
    hdi: 0.894,
    gdpGrowth: 5.1,
    zoning: 'ZR-2 / ZC-2',
    environmentalRisk: 'baixo',
    floodRisk: 'baixo',
    layerScores: scores(88, 74, 84, 92, 80, 90, 89, 85),
    priceHistory: hist(13200),
    highlights: [
      'Bairro consolidado com valorização estável',
      'Boa conexão com centro e leste',
      'Alta liquidez de terrenos mistos',
    ],
    timeline: [
      { year: 2023, title: 'Ampliação hospitalar' },
      { year: 2025, title: 'Torre corporativa AAA prevista' },
    ],
  },
  {
    id: 'coco',
    name: 'Cocó',
    city: 'Fortaleza',
    state: 'CE',
    lat: -3.752,
    lng: -38.485,
    priceSqm: 12100,
    priceSqmDelta12m: 6.8,
    score: 90,
    population: 28400,
    incomeAvg: 7900,
    hdi: 0.88,
    gdpGrowth: 5.8,
    zoning: 'ZPA / ZR-1',
    environmentalRisk: 'baixo',
    floodRisk: 'medio',
    layerScores: scores(90, 88, 86, 84, 82, 76, 87, 70),
    priceHistory: hist(12100),
    highlights: [
      'Parque do Cocó como âncora de qualidade urbana',
      'Expansão de condomínios clube',
      'Risco enchente moderado em faixas baixas',
    ],
    timeline: [
      { year: 2024, title: 'Novo parque linear' },
      { year: 2026, title: 'Novo shopping regional' },
    ],
  },
  {
    id: 'papicu',
    name: 'Papicu',
    city: 'Fortaleza',
    state: 'CE',
    lat: -3.738,
    lng: -38.472,
    priceSqm: 9800,
    priceSqmDelta12m: 3.6,
    score: 84,
    population: 31200,
    incomeAvg: 6200,
    hdi: 0.84,
    gdpGrowth: 4.4,
    zoning: 'ZR-3 / ZC-1',
    environmentalRisk: 'medio',
    floodRisk: 'baixo',
    layerScores: scores(76, 82, 74, 78, 68, 85, 76, 75),
    priceHistory: hist(9800),
    highlights: [
      'Novo eixo viário Alberto Craveiro',
      'Terminal integrado previsto',
      'Boa mobilidade leste–centro',
    ],
    timeline: [
      { year: 2025, title: 'Novo BRT previsto' },
      { year: 2026, title: 'Duplicação da CE-025 prevista' },
    ],
  },
  {
    id: 'sapiranga',
    name: 'Sapiranga',
    city: 'Fortaleza',
    state: 'CE',
    lat: -3.798,
    lng: -38.468,
    priceSqm: 7200,
    priceSqmDelta12m: 8.1,
    score: 86,
    population: 19800,
    incomeAvg: 5400,
    hdi: 0.81,
    gdpGrowth: 7.0,
    zoning: 'ZEIS / ZR-4',
    environmentalRisk: 'baixo',
    floodRisk: 'baixo',
    layerScores: scores(84, 92, 82, 68, 66, 64, 72, 60),
    priceHistory: hist(7200),
    highlights: [
      'Velocidade de crescimento entre as mais altas',
      'Instalação de galpões logísticos',
      'Fronteira de expansão sul',
    ],
    timeline: [
      { year: 2024, title: 'Instalação de 2 galpões logísticos' },
      { year: 2025, title: '3 lançamentos residenciais de alto padrão' },
    ],
  },
  {
    id: 'cambeba',
    name: 'Cambeba',
    city: 'Fortaleza',
    state: 'CE',
    lat: -3.812,
    lng: -38.492,
    priceSqm: 6900,
    priceSqmDelta12m: 9.4,
    score: 90,
    population: 15200,
    incomeAvg: 6100,
    hdi: 0.83,
    gdpGrowth: 6.5,
    zoning: 'ZC-4 / institucional',
    environmentalRisk: 'baixo',
    floodRisk: 'baixo',
    layerScores: scores(90, 96, 92, 74, 72, 70, 80, 55),
    priceHistory: hist(6900),
    highlights: [
      'Centro administrativo estadual',
      'Novo campus universitário',
      'Melhor oportunidade de yield em expansão',
    ],
    timeline: [
      { year: 2023, title: 'Centro administrativo estadual' },
      { year: 2025, title: 'Novo campus universitário' },
    ],
  },
  {
    id: 'montese',
    name: 'Montese',
    city: 'Fortaleza',
    state: 'CE',
    lat: -3.762,
    lng: -38.542,
    priceSqm: 5400,
    priceSqmDelta12m: 1.2,
    score: 58,
    population: 45600,
    incomeAvg: 3200,
    hdi: 0.74,
    gdpGrowth: 2.1,
    zoning: 'ZR-4 / comércio de rua',
    environmentalRisk: 'medio',
    floodRisk: 'medio',
    layerScores: scores(54, 46, 48, 70, 58, 72, 58, 88),
    priceHistory: hist(5400),
    highlights: [
      'Baixa oferta de empreendimentos novos',
      'Alta densidade e comércio de rua',
      'Valorização mais lenta',
    ],
    timeline: [{ year: 2024, title: 'Recapeamento Av. Santos Dumont' }],
  },
  {
    id: 'eusebio',
    name: 'Eusébio Centro',
    city: 'Eusébio',
    state: 'CE',
    lat: -3.89,
    lng: -38.45,
    priceSqm: 6100,
    priceSqmDelta12m: 7.2,
    score: 78,
    population: 22100,
    incomeAvg: 4800,
    hdi: 0.79,
    gdpGrowth: 5.5,
    zoning: 'ZR-2 / expansão',
    environmentalRisk: 'baixo',
    floodRisk: 'baixo',
    layerScores: scores(78, 84, 76, 62, 70, 55, 68, 48),
    priceHistory: hist(6100),
    highlights: [
      'Condomínios clube em expansão',
      'Novo hospital regional',
      'Fronteira metropolitana leste',
    ],
    timeline: [
      { year: 2025, title: 'Novo hospital regional' },
      { year: 2026, title: 'Novo shopping vertical' },
    ],
  },
  {
    id: 'barra',
    name: 'Barra do Ceará',
    city: 'Fortaleza',
    state: 'CE',
    lat: -3.705,
    lng: -38.58,
    priceSqm: 3800,
    priceSqmDelta12m: -2.4,
    score: 34,
    population: 52000,
    incomeAvg: 2100,
    hdi: 0.68,
    gdpGrowth: 0.8,
    zoning: 'ZEIS / orla',
    environmentalRisk: 'alto',
    floodRisk: 'alto',
    layerScores: scores(30, 34, 38, 52, 40, 50, 40, 70),
    priceHistory: hist(3800),
    highlights: [
      'Região com desvalorização recente',
      'Risco ambiental costeiro elevado',
      'Baixa entrada de capital institucional',
    ],
    timeline: [{ year: 2024, title: 'Requalificação de praças' }],
  },
];

export function layerValue(r: IntelligenceRegion, layer: LayerId): number {
  return r.layerScores[layer] ?? r.score;
}

export function topByValorization(n = 5): IntelligenceRegion[] {
  return [...INTELLIGENCE_REGIONS]
    .sort((a, b) => b.priceSqmDelta12m - a.priceSqmDelta12m)
    .slice(0, n);
}

export function topByScore(n = 5): IntelligenceRegion[] {
  return [...INTELLIGENCE_REGIONS].sort((a, b) => b.score - a.score).slice(0, n);
}

export function filterRegions(q: string): IntelligenceRegion[] {
  const s = q.trim().toLowerCase();
  if (!s) return INTELLIGENCE_REGIONS;
  return INTELLIGENCE_REGIONS.filter(
    (r) =>
      r.name.toLowerCase().includes(s) ||
      r.city.toLowerCase().includes(s) ||
      r.state.toLowerCase().includes(s) ||
      r.zoning.toLowerCase().includes(s) ||
      r.id.includes(s),
  );
}

export function fmtPriceSqm(n: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtDelta(n: number): string {
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(1)}%`;
}

export const MAP_CENTER: [number, number] = [-3.76, -38.5];
export const MAP_DEFAULT_ZOOM = 12;

/** Alias para páginas de mercado que ainda importam topOpportunities. */
export function topOpportunities(n = 5): IntelligenceRegion[] {
  return topByScore(n);
}

export function topByLayer(layer: LayerId, n = 5): IntelligenceRegion[] {
  return [...INTELLIGENCE_REGIONS]
    .sort((a, b) => layerValue(b, layer) - layerValue(a, layer))
    .slice(0, n);
}
