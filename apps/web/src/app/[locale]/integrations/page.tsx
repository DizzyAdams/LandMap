'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Sparkles, Check, ArrowRight } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, buttonVariants, cn } from '@landmap/ui';

const INTEGRATIONS = [
  {
    id: 'webhooks',
    name: 'Outbound Webhooks',
    status: 'live',
    desc: 'Eventos assinados (HMAC) para os seus outros projetos. Admin + API /webhooks.',
  },
  {
    id: 'rag',
    name: 'RAG Knowledge',
    status: 'live',
    desc: 'POST /rag/query · corpus markdown + docs de produto.',
  },
  { id: 'viacep', name: 'ViaCEP', status: 'live', desc: 'CEP → endereço (BrasilAPI/ViaCEP).' },
  { id: 'ibge', name: 'IBGE', status: 'live', desc: 'UF e municípios oficiais.' },
  { id: 'bacen', name: 'Bacen SGS', status: 'live', desc: 'Selic, CDI, IPCA.' },
  { id: 'cambio', name: 'Câmbio', status: 'live', desc: 'Cotações BCB via AwesomeAPI.' },
  { id: 'cnpj', name: 'CNPJ', status: 'live', desc: 'Receita Federal (BrasilAPI).' },
  { id: 'geo', name: 'Nominatim / Geo', status: 'live', desc: 'Geocodificação e reverse.' },
  { id: 'whatsapp', name: 'WhatsApp Business', status: 'mock', desc: 'Envio e webhook WABA.' },
  { id: 'crie', name: 'CRIE', status: 'mock', desc: 'Registro de Imóveis Eletrônico.' },
  { id: 'leilao', name: 'Leilão', status: 'mock', desc: 'Imóveis judiciais + Caixa.' },
  { id: 'twenty', name: 'Twenty CRM', status: 'beta', desc: 'CRM open-source de leads.' },
  { id: 'opendesign', name: 'OpenDesign', status: 'mock', desc: 'Feed de design assets.' },
];

export default function IntegrationsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const live = INTEGRATIONS.filter((i) => i.status === 'live').length;

  return (
    <ProductPageShell
      backHref="/developers"
      eyebrow={
        <>
          <Sparkles className="h-3 w-3" /> Integrações
        </>
      }
      title="Hub de integrações"
      description="Conectores oficiais do monorepo @landmap/integrations — live e mock."
      maxWidth="5xl"
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Conectores" value={String(INTEGRATIONS.length)} />
        <Stat label="Live" value={String(live)} />
        <Stat label="Mock/beta" value={String(INTEGRATIONS.length - live)} />
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href={lh('/developers')} className={cn(buttonVariants({ size: 'sm' }))}>
          Ver API
        </Link>
        <Link href={lh('/admin/webhooks')} className={cn(buttonVariants({ size: 'sm' }))}>
          Webhooks
        </Link>
        <Link href={lh('/rag')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          RAG
        </Link>
        <Link href={lh('/status')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          Status
        </Link>
      </div>

      <Reveal className="mt-6 grid gap-3 sm:grid-cols-2">
        {INTEGRATIONS.map((i) => (
          <Card key={i.id} variant="interactive" className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{i.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{i.desc}</p>
              </div>
              <Badge
                variant={
                  i.status === 'live' ? 'success' : i.status === 'beta' ? 'info' : 'outline'
                }
              >
                {i.status}
              </Badge>
            </div>
            {i.status === 'live' && (
              <p className="mt-2 flex items-center gap-1 text-[10px] text-primary">
                <Check className="h-3 w-3" /> pronto para produção
              </p>
            )}
          </Card>
        ))}
      </Reveal>

      <Link
        href={lh('/developers')}
        className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-primary"
      >
        Documentação de endpoints <ArrowRight className="h-4 w-4" />
      </Link>
    </ProductPageShell>
  );
}
