import { Hono } from 'hono';
import type { Env } from '../index.js';
import { MarketAnalyzerAgent, SimplePricePredictor } from '@landmap/llm';

let analyzer: MarketAnalyzerAgent | null = null;
let predictor: SimplePricePredictor | null = null;

function getAnalyzer(): MarketAnalyzerAgent {
  if (!analyzer) analyzer = new MarketAnalyzerAgent();
  return analyzer;
}

function getPredictor(): SimplePricePredictor {
  if (!predictor) predictor = new SimplePricePredictor();
  return predictor;
}

const neighborhoodData: Record<string, { name: string; city: string; state: string; schools: number; hospitals: number; transit: string[]; crimeIndex: number; avgPriceM2: number }> = {
  'batel': { name: 'Batel', city: 'Curitiba', state: 'PR', schools: 12, hospitals: 3, transit: ['Linha Azul', 'Linha Verde'], crimeIndex: 15, avgPriceM2: 9500 },
  'centro': { name: 'Centro', city: 'Curitiba', state: 'PR', schools: 8, hospitals: 4, transit: ['Linha Azul', 'Linha Vermelha', 'Linha Laranja'], crimeIndex: 30, avgPriceM2: 6200 },
  'trindade': { name: 'Trindade', city: 'Florianópolis', state: 'SC', schools: 14, hospitals: 3, transit: ['Linha Norte', 'Linha Leste'], crimeIndex: 20, avgPriceM2: 8500 },
};

export function createInsightsRouter() {
  const router = new Hono<Env>();

  router.get('/neighborhood/:name', async (c) => {
    const name = c.req.param('name').toLowerCase();
    const hood = neighborhoodData[name];
    if (!hood) {
      return c.json({ error: `Bairro "${name}" não encontrado` }, 404);
    }
    const agent = getAnalyzer();
    const mockProperties = [
      { id: 'mock-1', title: `${hood.name} padrão`, city: hood.city, state: hood.state, type: 'apartamento', modality: 'venda', price: hood.avgPriceM2 * 80, areaM2: 80, bedrooms: 2, neighborhood: hood.name, status: 'active' as const },
      { id: 'mock-2', title: `${hood.name} amplo`, city: hood.city, state: hood.state, type: 'apartamento', modality: 'venda', price: hood.avgPriceM2 * 120, areaM2: 120, bedrooms: 3, neighborhood: hood.name, status: 'active' as const },
      { id: 'mock-3', title: `Casa ${hood.name}`, city: hood.city, state: hood.state, type: 'casa', modality: 'venda', price: hood.avgPriceM2 * 180, areaM2: 180, bedrooms: 4, neighborhood: hood.name, status: 'active' as const },
    ];
    const marketAnalysis = await agent.analyze(mockProperties);
    return c.json({ neighborhood: hood, analysis: marketAnalysis });
  });

  router.get('/investment/:propertyId', async (c) => {
    const propertyId = c.req.param('propertyId');
    const roi = Math.round(4 + Math.random() * 8);
    return c.json({
      propertyId,
      estimatedROI: roi,
      estimatedROIFormatted: `${roi}% a.a.`,
      paybackYears: Math.round(100 / roi * 10) / 10,
      recommendation: roi >= 8
        ? 'Excelente potencial de valorização. Recomendado para investimento de longo prazo.'
        : roi >= 5
          ? 'Potencial moderado. Avalie outras opções na região.'
          : 'Retorno abaixo da média. Considere outras regiões ou tipos de imóvel.',
      riskLevel: roi >= 8 ? 'baixo' : roi >= 5 ? 'médio' : 'alto',
    });
  });

  router.post('/predict-price', async (c) => {
    const body = await c.req.json<{ city: string; state: string; type: string; areaM2: number; bedrooms?: number; modality: string }>();
    const pred = getPredictor();
    const trainingData = [
      { id: 't1', city: 'Curitiba', state: 'PR', type: 'apartamento', price: 350000, areaM2: 65, bedrooms: 2, modality: 'venda' },
      { id: 't2', city: 'Curitiba', state: 'PR', type: 'apartamento', price: 520000, areaM2: 85, bedrooms: 3, modality: 'venda' },
      { id: 't3', city: 'Curitiba', state: 'PR', type: 'apartamento', price: 780000, areaM2: 120, bedrooms: 3, modality: 'venda' },
      { id: 't4', city: 'Curitiba', state: 'PR', type: 'casa', price: 650000, areaM2: 150, bedrooms: 3, modality: 'venda' },
      { id: 't5', city: 'Florianópolis', state: 'SC', type: 'apartamento', price: 480000, areaM2: 60, bedrooms: 2, modality: 'venda' },
      { id: 't6', city: 'Florianópolis', state: 'SC', type: 'apartamento', price: 890000, areaM2: 90, bedrooms: 3, modality: 'venda' },
      { id: 't7', city: 'Florianópolis', state: 'SC', type: 'casa', price: 1200000, areaM2: 200, bedrooms: 4, modality: 'venda' },
      { id: 't8', city: 'Balneário Camboriú', state: 'SC', type: 'apartamento', price: 680000, areaM2: 70, bedrooms: 2, modality: 'venda' },
    ];
    pred.train(trainingData as any);
    const result = pred.predict({ city: body.city, state: body.state, type: body.type, areaM2: body.areaM2, bedrooms: body.bedrooms ?? 0, modality: body.modality });
    return c.json(result);
  });

  return router;
}
