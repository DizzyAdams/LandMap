'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Code2, Sparkles } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, buttonVariants, cn } from '@landmap/ui';

const ENDPOINTS = [
  { method: 'POST', path: '/api/rag/query', desc: 'RAG: pergunta + fontes (TF-IDF + LLM opcional)' },
  { method: 'GET', path: '/api/rag/status', desc: 'Docs/chunks indexados e modo demo|llm' },
  { method: 'GET', path: '/api/webhooks/events', desc: 'Catálogo de eventos outbound + sample' },
  { method: 'POST', path: '/api/webhooks/endpoints', desc: 'Registrar URL dos seus projetos (HMAC secret)' },
  { method: 'POST', path: '/api/webhooks/endpoints/:id/test', desc: 'Ping assinado de teste' },
  { method: 'GET', path: '/api/webhooks/deliveries', desc: 'Log das últimas entregas' },
  { method: 'GET', path: '/api/markdowns', desc: 'Catálogo 3000 · grade, minScore, type=terreno' },
  { method: 'GET', path: '/api/market/heatmap', desc: 'Heatmap de preços por bairro' },
  { method: 'GET', path: '/api/geo/autocomplete', desc: 'Type-ahead LandMap + Nominatim BR' },
  { method: 'GET', path: '/api/embeddings/search', desc: 'Busca por similaridade textual' },
  { method: 'POST', path: '/api/contact', desc: 'Lead / contato comercial' },
];

const SDKS = [
  { name: 'REST JSON', status: 'stable' },
  { name: 'Outbound Webhooks', status: 'live · HMAC' },
  { name: 'RAG local', status: 'live · TF-IDF' },
  { name: 'i18n locales', status: 'pt-BR · en-US · es-ES' },
];

const CURL_RAG = `curl -X POST /api/rag/query \\
  -H 'content-type: application/json' \\
  -d '{"query":"O que é o Score LandMap?"}'`;

const CURL_WH = `curl -X POST /api/webhooks/endpoints \\
  -H 'content-type: application/json' \\
  -d '{"name":"meu-app","url":"https://…/hooks","events":["rag.query","lead.created"]}'`;

export default function DevelopersPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <ProductPageShell
      backHref="/integrations"
      eyebrow={
        <>
          <Code2 className="h-3 w-3" /> Desenvolvedores
        </>
      }
      title="API, RAG & Webhooks"
      description="Leve Score LandMap, retrieval e eventos assinados para os seus outros projetos."
      maxWidth="5xl"
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Endpoints" value={String(ENDPOINTS.length)} />
        <Stat label="Formato" value="JSON" />
        <Stat label="Assinatura" value="HMAC" />
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={lh('/integrations')} className={cn(buttonVariants({ size: 'sm' }))}>
          Integrações
        </Link>
        <Link href={lh('/admin/webhooks')} className={cn(buttonVariants({ size: 'sm' }))}>
          Gerir webhooks
        </Link>
        <Link href={lh('/rag')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          Testar RAG
        </Link>
        <Link href={lh('/status')} className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
          Status
        </Link>
      </div>

      <h2 className="mt-8 text-sm font-semibold">Endpoints</h2>
      <Reveal className="mt-3 flex flex-col gap-3">
        {ENDPOINTS.map((e) => (
          <Card key={e.path} variant="interactive" className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={e.method === 'GET' ? 'info' : 'warning'}>{e.method}</Badge>
              <code className="font-mono text-sm">{e.path}</code>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{e.desc}</p>
          </Card>
        ))}
      </Reveal>

      <h2 className="mt-8 text-sm font-semibold">Snippets</h2>
      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Card className="p-4">
          <p className="text-xs font-medium text-primary">RAG query</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[10px] text-muted-foreground">
            {CURL_RAG}
          </pre>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-medium text-primary">Registrar webhook</p>
          <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[10px] text-muted-foreground">
            {CURL_WH}
          </pre>
        </Card>
      </div>

      <Card className="mt-3 p-4">
        <p className="text-xs font-medium text-primary">Verificar HMAC (Node)</p>
        <pre className="mt-2 overflow-x-auto whitespace-pre-wrap font-mono text-[10px] text-muted-foreground">{`import crypto from 'crypto';
function verify(rawBody, secret, header) {
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header));
}`}</pre>
      </Card>

      <h2 className="mt-8 text-sm font-semibold">Superfície</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SDKS.map((s) => (
          <Card key={s.name} className="p-4">
            <p className="font-medium">{s.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.status}</p>
          </Card>
        ))}
      </div>

      <p className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        Headers: X-LandMap-Event · X-LandMap-Delivery · X-LandMap-Signature
      </p>
    </ProductPageShell>
  );
}
