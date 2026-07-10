import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale?: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'Embeddings & Busca Semântica | LandMap',
    description: 'Como usar embeddings e busca semântica no LandMap — geração de vetores, similaridade por cosseno e consultas híbridas.',
    openGraph: {
      title: 'Embeddings & Busca Semântica | LandMap',
      description: 'Guia de embeddings e busca semântica no LandMap.',
      url: `/${locale || 'pt-BR'}/docs/embedding`,
      type: 'website',
    },
  };
}

export default async function EmbeddingDocsPage({ params }: { params: Promise<{ locale?: string }> }) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="mx-auto max-w-4xl px-6 py-20">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-neutral-400">
          <a href={`/${locale}/docs`} className="transition hover:text-neutral-300">Docs</a>
          <span>/</span>
          <span className="text-neutral-300">Embeddings</span>
        </nav>

        <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">
          Embeddings & Busca Semântica
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          O LandMap utiliza embeddings vetoriais para permitir buscas por similaridade semântica,
          indo além da correspondência textual exata.
        </p>

        {/* How it works */}
        <section className="mt-10">
          <h2 className="text-lg font-medium text-neutral-100">Como funciona</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 text-sm font-bold">1</div>
              <h3 className="mt-3 text-sm font-medium text-neutral-200">Tokenização</h3>
              <p className="mt-1 text-xs text-neutral-400">
                Cada imóvel é tokenizado a partir de seus atributos (título, cidade, tipo, tags).
              </p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 text-sm font-bold">2</div>
              <h3 className="mt-3 text-sm font-medium text-neutral-200">Vetorização</h3>
              <p className="mt-1 text-xs text-neutral-400">
                Os tokens são convertidos em vetores numéricos (embeddings) de alta dimensão.
              </p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 text-sm font-bold">3</div>
              <h3 className="mt-3 text-sm font-medium text-neutral-200">Similaridade</h3>
              <p className="mt-1 text-xs text-neutral-400">
                A busca calcula similaridade por cosseno entre o vetor da consulta e os vetores indexados.
              </p>
            </div>
          </div>
        </section>

        {/* Endpoint */}
        <section className="mt-12">
          <h2 className="text-lg font-medium text-neutral-100">Endpoint</h2>
          <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
            <div className="flex items-center gap-3">
              <span className="shrink-0 rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-400">GET</span>
              <code className="text-xs text-neutral-300 font-mono">/api/embeddings/similar</code>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-neutral-300">Parâmetros</h3>
              <table className="mt-2 w-full text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400">
                    <th className="py-2 text-left font-medium">Parâmetro</th>
                    <th className="py-2 text-left font-medium">Tipo</th>
                    <th className="py-2 text-left font-medium">Obrigatório</th>
                    <th className="py-2 text-left font-medium">Descrição</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-300">
                  <tr className="border-b border-neutral-800/50">
                    <td className="py-2 font-mono">q</td>
                    <td className="py-2 text-neutral-400">string</td>
                    <td className="py-2 text-neutral-400">Sim</td>
                    <td className="py-2">Texto da consulta em linguagem natural</td>
                  </tr>
                  <tr className="border-b border-neutral-800/50">
                    <td className="py-2 font-mono">limit</td>
                    <td className="py-2 text-neutral-400">number</td>
                    <td className="py-2 text-neutral-400">Não</td>
                    <td className="py-2">Máximo de resultados (default: 5)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-neutral-300">Exemplo</h3>
              <pre className="mt-2 overflow-x-auto rounded-md bg-neutral-950 p-3 text-xs text-neutral-300">
                <code>{`curl "http://localhost:4000/embeddings/similar?q=apartamento+centro+curitiba&limit=5"`}</code>
              </pre>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-neutral-300">Resposta</h3>
              <pre className="mt-2 overflow-x-auto rounded-md bg-neutral-950 p-3 text-xs text-neutral-300">
                <code>{`{
  "items": [
    {
      "id": "1",
      "title": "Apartamento padrão",
      "score": 0.92,
      "city": "Curitiba",
      "state": "PR",
      "price": 420000,
      ...
    }
  ],
  "total": 3
}`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="mt-12">
          <h2 className="text-lg font-medium text-neutral-100">Casos de uso</h2>
          <div className="mt-4 space-y-3">
            {[
              { title: 'Busca por conceito', desc: '"Imóveis perto da praia em Florianópolis" — mesmo sem a palavra exata, a semântica encontra resultados.' },
              { title: 'Recomendação inteligente', desc: 'Encontre imóveis similares a um que o usuário já visitou, baseado em perfil vetorial.' },
              { title: 'Chat com IA contextual', desc: 'O assistente LLM combina busca semântica com geração de texto para respostas precisas.' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <h3 className="text-sm font-medium text-neutral-200">{item.title}</h3>
                <p className="mt-1 text-xs text-neutral-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
