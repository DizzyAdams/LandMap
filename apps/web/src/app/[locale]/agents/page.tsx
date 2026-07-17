'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Bot, Sparkles } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, buttonVariants, cn } from '@landmap/ui';

const AGENTS = [
  { id: 'scout', name: 'Scout territorial', role: 'Mapa & camadas', desc: 'Varre Score LandMap e top valorização.', href: '/map' },
  { id: 'analyst', name: 'Analista de risco', role: 'Risco', desc: 'Cruza enchente, ambiental e zoneamento.', href: '/alerts' },
  { id: 'writer', name: 'Copywriter de anúncio', role: 'Conteúdo', desc: 'Gera descrições de terreno e região.', href: '/writer' },
  { id: 'sales', name: 'Closer de leads', role: 'Vendas', desc: 'Prioriza leads por score da região.', href: '/leads' },
  { id: 'rag', name: 'Bibliotecário RAG', role: 'Conhecimento', desc: 'Responde com base nos markdowns.', href: '/rag' },
  { id: 'ops', name: 'Ops de alertas', role: 'Automação', desc: 'Dispara fluxos quando a camada muda.', href: '/workflows' },
];

export default function AgentsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <ProductPageShell
      backHref="/assistant"
      eyebrow={
        <>
          <Bot className="h-3 w-3" /> Agentes
        </>
      }
      title="Catálogo de agentes IA"
      description="Especialistas virtuais no padrão visual LandMap / Lovable indigo."
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Agentes" value={String(AGENTS.length)} />
        <Stat label="Domínios" value="6" />
        <Stat label="Status" value="demo" />
      </section>

      <Reveal className="mt-6 grid gap-3 sm:grid-cols-2">
        {AGENTS.map((a) => (
          <Card key={a.id} variant="interactive" className="p-4">
            <Link href={lh(a.href)} className="block">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{a.name}</p>
                <Badge variant="outline">{a.role}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{a.desc}</p>
            </Link>
          </Card>
        ))}
      </Reveal>

      <Link href={lh('/automations')} className={cn(buttonVariants({ size: 'sm' }), 'mt-6')}>
        Ver automações
      </Link>
    </ProductPageShell>
  );
}
