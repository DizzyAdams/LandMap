import type { Metadata } from 'next';
import { Reveal, Stagger } from '../../../components/Motion';
import { SpotlightCard } from '../../../components/SpotlightCard';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Documentação da API | LandMap',
    description: 'Referência completa da API REST do LandMap — endpoints, parâmetros, autenticação e exemplos.',
    openGraph: {
      title: 'Documentação da API | LandMap',
      description: 'Referência completa da API REST do LandMap.',
      url: `/${locale || 'pt-BR'}/docs`,
      type: 'website',
    },
  };
}

type Endpoint = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  desc: string;
  auth: boolean;
  params?: string;
  example?: string;
};

const CATEGORIES: Array<{ title: string; endpoints: Endpoint[] }> = [
  {
    title: 'Properties',
    endpoints: [
      { method: 'GET', path: '/api/properties', desc: 'Listar imóveis com filtros opcionais', auth: false, params: '?type=&modality=&city=&state=', example: 'curl http://localhost:4000/markdowns' },
      { method: 'GET', path: '/api/properties/:id', desc: 'Obter detalhes de um imóvel', auth: false, example: 'curl http://localhost:4000/properties/1' },
      { method: 'POST', path: '/api/properties', desc: 'Criar um novo imóvel', auth: true, example: `curl -X POST http://localhost:4000/properties \\
  -H "Content-Type: application/json" \\
  -d '{"title":"Casa nova","city":"São Paulo","state":"SP","price":500000,"areaM2":120,"type":"casa","modality":"venda"}'` },
      { method: 'PUT', path: '/api/properties/:id', desc: 'Atualizar um imóvel existente', auth: true, example: `curl -X PUT http://localhost:4000/properties/1 \\
  -H "Content-Type: application/json" \\
  -d '{"price":450000}'` },
      { method: 'DELETE', path: '/api/properties/:id', desc: 'Excluir (soft delete) um imóvel', auth: true, example: 'curl -X DELETE http://localhost:4000/properties/1' },
      { method: 'POST', path: '/api/properties/bulk', desc: 'Inserir múltiplos imóveis', auth: true, example: `curl -X POST http://localhost:4000/properties/bulk \\
  -H "Content-Type: application/json" \\
  -d '[{"title":"Lote 1","city":"Curitiba","state":"PR","price":200000,"areaM2":300,"type":"terreno","modality":"venda"}]'` },
      { method: 'GET', path: '/api/properties/recommendations/:id', desc: 'Recomendações de imóveis similares', auth: false, example: 'curl http://localhost:4000/properties/recommendations/1' },
    ],
  },
  {
    title: 'Search',
    endpoints: [
      { method: 'GET', path: '/api/markdowns', desc: 'Busca textual com filtros por tipo, cidade e estado', auth: false, params: '?q=&type=&modality=&city=&state=', example: 'curl "http://localhost:4000/markdowns?q=apartamento&city=Curitiba"' },
      { method: 'POST', path: '/api/search', desc: 'Busca via POST (body JSON)', auth: false, example: `curl -X POST http://localhost:4000/search \\
  -H "Content-Type: application/json" \\
  -d '{"q":"casa","city":"Florianópolis"}'` },
    ],
  },
  {
    title: 'Comparison',
    endpoints: [
      { method: 'GET', path: '/api/favorites', desc: 'Buscar imóveis por IDs (favoritos)', auth: false, params: '?ids=1,2,3', example: 'curl "http://localhost:4000/favorites?ids=1,2"' },
      { method: 'GET', path: '/api/compare', desc: 'Comparar 2+ imóveis com diffs percentuais', auth: false, params: '?ids=1,2', example: 'curl "http://localhost:4000/compare?ids=1,2"' },
    ],
  },
  {
    title: 'LLM / AI',
    endpoints: [
      { method: 'POST', path: '/api/analyze', desc: 'Análise com IA — perguntas em linguagem natural sobre imóveis', auth: false, example: `curl -X POST http://localhost:4000/analyze \\
  -H "Content-Type: application/json" \\
  -d '{"prompt":"Quais apartamentos estão disponíveis em Curitiba?"}'` },
      { method: 'GET', path: '/api/embeddings/similar', desc: 'Busca semântica por embeddings', auth: false, params: '?q=&limit=5', example: 'curl "http://localhost:4000/embeddings/similar?q=apartamento+centro&limit=3"' },
    ],
  },
  {
    title: 'Admin',
    endpoints: [
      { method: 'GET', path: '/api/admin/stats', desc: 'Estatísticas do dashboard', auth: true, example: 'curl http://localhost:4000/admin/stats' },
      { method: 'GET', path: '/api/admin/properties', desc: 'Listar todos os imóveis (admin)', auth: true, example: 'curl http://localhost:4000/admin/properties' },
      { method: 'PUT', path: '/api/admin/properties/:id', desc: 'Atualizar imóvel como admin', auth: true, example: `curl -X PUT http://localhost:4000/admin/properties/1 \\
  -H "Content-Type: application/json" \\
  -d '{"status":"sold"}'` },
      { method: 'DELETE', path: '/api/admin/properties/:id', desc: 'Excluir imóvel como admin', auth: true, example: 'curl -X DELETE http://localhost:4000/admin/properties/1' },
      { method: 'GET', path: '/api/admin/leads', desc: 'Listar leads capturados', auth: true, example: 'curl http://localhost:4000/admin/leads' },
    ],
  },
  {
    title: 'Market & Insights',
    endpoints: [
      { method: 'GET', path: '/api/cities', desc: 'Agregação por cidade (contagem e preço médio)', auth: false, example: 'curl http://localhost:4000/cities' },
      { method: 'GET', path: '/api/stats', desc: 'Estatísticas gerais do mercado', auth: false, example: 'curl http://localhost:4000/stats' },
      { method: 'GET', path: '/api/market/trends', desc: 'Tendências de mercado por cidade', auth: false, example: 'curl http://localhost:4000/market/trends' },
      { method: 'GET', path: '/api/neighborhoods', desc: 'Listar bairros e zonas', auth: false, example: 'curl http://localhost:4000/neighborhoods' },
      { method: 'GET', path: '/api/insights/summary', desc: 'Resumo inteligente do mercado', auth: false, example: 'curl http://localhost:4000/insights/summary' },
    ],
  },
];

const methodColors: Record<string, string> = {
  GET: 'text-emerald-400',
  POST: 'text-blue-400',
  PUT: 'text-amber-400',
  DELETE: 'text-red-400',
};

export default async function DocsPage({ params }: { params: Promise<{ locale?: string }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              Dados abertos
            </span>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-gradient sm:text-3xl">
              Documentação da API
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Referência completa dos endpoints REST do LandMap
            </p>
          </div>
          <p className="text-xs text-neutral-500">Base URL: <code className="text-neutral-400">http://localhost:4000</code></p>
        </Reveal>

        {/* Auth + Rate limit card */}
        <Stagger className="mt-8 grid gap-4 sm:grid-cols-2">
          <SpotlightCard className="p-5">
            <h2 className="text-sm font-medium text-neutral-50">Autenticação</h2>
            <p className="mt-2 text-xs text-neutral-500">
              Endpoints marcados com <span className="text-amber-400">🔒 Auth</span> exigem o header{' '}
              <code className="text-neutral-400">Authorization: Bearer seu_token</code>.
            </p>
          </SpotlightCard>
          <SpotlightCard className="p-5">
            <h2 className="text-sm font-medium text-neutral-50">Rate Limiting</h2>
            <p className="mt-2 text-xs text-neutral-500">
              Gratuito: <span className="text-neutral-300">100 req/min</span>
              {' · '}Profissional: <span className="text-neutral-300">1.000 req/min</span>
              {' · '}Enterprise: <span className="text-neutral-300">Sob consulta</span>
            </p>
          </SpotlightCard>
        </Stagger>

        {/* Categories */}
        {CATEGORIES.map((cat) => (
          <Reveal key={cat.title} className="mt-12">
            <h2 className="text-lg font-medium text-neutral-100">{cat.title}</h2>
            <Stagger className="mt-4 space-y-2">
              {cat.endpoints.map((ep) => (
                <details
                  key={`${ep.method}-${ep.path}`}
                  className="group rounded-xl border border-neutral-800 bg-neutral-900/40 transition hover:border-emerald-500/40 hover:shadow-[0_0_40px_-12px_rgba(52,211,153,0.25)]"
                >
                  <summary className="flex cursor-pointer items-center gap-3 px-5 py-3.5">
                    <span
                      className={`shrink-0 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold ${methodColors[ep.method] ?? 'text-neutral-400'} bg-neutral-950/60`}
                    >
                      {ep.method}
                    </span>
                    <code className="text-xs text-neutral-300 font-mono">{ep.path}</code>
                    {ep.auth && (
                      <span className="text-[10px] text-amber-500 uppercase tracking-wide">🔒 Auth</span>
                    )}
                    <span className="ml-auto text-xs text-neutral-500">{ep.desc}</span>
                    <svg
                      className="h-4 w-4 shrink-0 text-neutral-500 transition group-open:rotate-180"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="border-t border-neutral-800 px-5 py-4 space-y-3">
                    {ep.params && (
                      <div>
                        <p className="text-xs font-medium text-neutral-400">Parâmetros</p>
                        <code className="mt-1 block rounded-md bg-neutral-950 px-3 py-2 font-mono text-xs text-neutral-300">
                          {ep.params}
                        </code>
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-medium text-neutral-400">Exemplo</p>
                      <pre className="mt-1 overflow-x-auto rounded-md bg-neutral-950 p-3 text-xs text-neutral-300">
                        <code>{ep.example}</code>
                      </pre>
                    </div>
                  </div>
                </details>
              ))}
            </Stagger>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
