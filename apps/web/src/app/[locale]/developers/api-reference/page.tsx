'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ProductPageShell } from '../../../../components/ProductPageShell';
import { Card, Badge, Button } from '@landmap/ui';
import { Code2, Copy, Link2, ShieldCheck } from '../../../../components/lovable/icons';

interface Endpoint {
  method: 'GET' | 'POST';
  path: string;
  desc: string;
  example: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: 'GET',
    path: '/v1/regions',
    desc: 'Lista regiões com score de inteligência e valorização.',
    example: `{
  "regions": [
    { "id": "sp-pinheiros", "score": 86, "grade": "A", "priceSqm": 12400 }
  ]
}`,
  },
  {
    method: 'GET',
    path: '/v1/regions/{id}',
    desc: 'Detalhe de uma região (camadas, histórico, heat).',
    example: `{
  "id": "sp-pinheiros",
  "layers": { "valorization": 88, "mobility": 74 },
  "priceHistory": [ { "year": 2025, "value": 12100 } ]
}`,
  },
  {
    method: 'GET',
    path: '/v1/valorization',
    desc: 'Série de valorização por região e janela temporal.',
    example: `{ "id": "sp-pinheiros", "delta12m": 0.132 }`,
  },
  {
    method: 'POST',
    path: '/v1/webhooks',
    desc: 'Registra um endpoint de webhook outbound (HMAC assinado).',
    example: `{
  "url": "https://seu-app.com/hook",
  "events": ["alert.match", "region.update"]
}`,
  },
  {
    method: 'GET',
    path: '/v1/properties',
    desc: 'Imóveis indexados com filtros de score e preço.',
    example: `{ "properties": [ { "id": "abc123", "priceSqm": 9800 } ] }`,
  },
];

function methodVariant(m: Endpoint['method']) {
  return m === 'GET' ? 'success' : 'info';
}

function curl(ep: Endpoint) {
  return `curl -X ${ep.method} https://api.landmap.com${ep.path} \\\n  -H "Authorization: Bearer lm_live_..."`;
}

export default function ApiReferencePage() {
  const locale = useLocale();
  const [copied, setCopied] = useState<string | null>(null);

  function copy(ep: Endpoint) {
    try {
      navigator.clipboard.writeText(curl(ep));
      setCopied(ep.path);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* noop */
    }
  }

  return (
    <ProductPageShell
      backHref="/developers"
      eyebrow="API"
      title="Referência da API"
      description="REST endpoints para integrar a inteligência de terrenos LandMap."
      maxWidth="7xl"
    >
      <Card variant="default" className="mb-5 flex items-start gap-3 border-[var(--border)] p-4">
        <ShieldCheck className="mt-0.5 h-5 w-5 text-[var(--primary)]" />
        <p className="text-sm text-[var(--muted-foreground)]">
          Autentique com sua chave Business em{' '}
          <code className="rounded bg-[var(--card)] px-1.5 py-0.5 text-[var(--primary)]">
            Authorization: Bearer lm_live_...
          </code>
          . Gere uma chave em{' '}
          <Link href={`/${locale}/api-keys`} className="text-[var(--primary)] underline">
            /api-keys
          </Link>
          .
        </p>
      </Card>

      <div className="space-y-3">
        {ENDPOINTS.map((ep) => (
          <Card key={ep.path} variant="default" className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge variant={methodVariant(ep.method)}>{ep.method}</Badge>
                <code className="text-sm font-medium text-[var(--foreground)]">{ep.path}</code>
              </div>
              <Button variant="ghost" onClick={() => copy(ep)}>
                <Copy className="h-4 w-4" /> {copied === ep.path ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">{ep.desc}</p>
            <details className="mt-3 group">
              <summary className="cursor-pointer text-xs text-[var(--primary)]">Ver exemplo JSON</summary>
              <pre className="mt-2 overflow-auto rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 text-xs text-[var(--foreground)]">
                {ep.example}
              </pre>
            </details>
          </Card>
        ))}
      </div>
    </ProductPageShell>
  );
}
