'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Sparkles } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Card, Badge, Button, Stat, buttonVariants, cn } from '@landmap/ui';
import {
  ragQuery,
  ragStatus,
  type RagQueryResult,
  type RagStatus,
} from '../../../lib/api';
import { INTELLIGENCE_REGIONS } from '../../../lib/mapIntelligence';

const EXAMPLES = [
  'O que é o Score LandMap?',
  'Como funcionam os webhooks?',
  'Heatmap de preço por bairro',
  'Inteligência territorial Fortaleza',
  'RAG retrieval e fontes',
];

export default function RagPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RagQueryResult | null>(null);
  const [status, setStatus] = useState<RagStatus | null>(null);

  useEffect(() => {
    ragStatus()
      .then(setStatus)
      .catch(() =>
        setStatus({
          ok: false,
          chunks: 0,
          documents: 0,
          dirs: [],
          mode: 'offline',
          generatedAt: new Date().toISOString(),
        }),
      );
  }, []);

  const run = useCallback(async (query: string) => {
    const text = query.trim();
    if (!text) return;
    setQ(text);
    setLoading(true);
    setError(null);
    try {
      const res = await ragQuery(text);
      setResult(res);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : 'Falha na consulta RAG');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ProductPageShell
      backHref="/assistant"
      eyebrow={
        <>
          <BookOpen className="h-3 w-3" /> Base RAG
        </>
      }
      title="Perguntas com fontes"
      description="Retrieval real via POST /rag/query sobre corpus local + docs de produto."
      maxWidth="3xl"
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Docs" value={status ? String(status.documents) : '…'} />
        <Stat label="Chunks" value={status ? String(status.chunks) : '…'} />
        <Stat label="Modo" value={status?.mode ?? '…'} />
      </section>

      <p className="mt-2 text-xs text-muted-foreground">
        {INTELLIGENCE_REGIONS.length} regiões no mapa · API{' '}
        <code className="font-mono text-[10px]">/rag/query</code>
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => run(ex)}
            className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs transition hover:border-primary hover:bg-muted"
          >
            {ex}
          </button>
        ))}
      </div>

      <Card className="mt-6 space-y-3 p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && run(q)}
          placeholder="Ex.: Score LandMap, webhooks, Meireles…"
          className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm outline-none focus:border-primary"
          disabled={loading}
        />
        <Button type="button" onClick={() => run(q)} disabled={loading || !q.trim()}>
          <Sparkles className="mr-1.5 h-4 w-4" />
          {loading ? 'Consultando…' : 'Buscar na base'}
        </Button>
      </Card>

      {error && (
        <Card className="mt-4 border-destructive/30 p-4 text-sm text-destructive">
          {error}
          <p className="mt-2 text-xs text-muted-foreground">
            Suba a API (`pnpm dev:api`) ou use o proxy `/api`. Corpus builtin funciona sem
            markdowns.
          </p>
        </Card>
      )}

      {result && (
        <>
          <Card className="mt-4 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info">resposta</Badge>
              <Badge variant={result.usedMock ? 'warning' : 'success'}>
                {result.usedMock ? 'demo / mock LLM' : 'LLM live'}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{result.answer}</p>
            <p className="mt-2 text-[10px] text-muted-foreground">{result.generatedAt}</p>
          </Card>

          {result.sources?.length > 0 && (
            <div className="mt-4 space-y-2">
              <h2 className="text-sm font-semibold">Fontes</h2>
              {result.sources.map((s, i) => (
                <Card key={`${s.path}-${i}`} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium">{s.title}</p>
                    <Badge variant="outline">{(s.score * 100).toFixed(0)}%</Badge>
                  </div>
                  <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                    {s.path}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        <Link href={lh('/chat')} className={cn(buttonVariants({ size: 'sm' }))}>
          Chat LandBot
        </Link>
        <Link
          href={lh('/developers')}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          API docs
        </Link>
        <Link
          href={lh('/admin/webhooks')}
          className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
        >
          Webhooks
        </Link>
      </div>
    </ProductPageShell>
  );
}
