'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Workflow, Sparkles } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, buttonVariants, cn } from '@landmap/ui';

const FLOWS = [
  {
    id: 'alert-valorization',
    name: 'Alerta de valorização',
    trigger: 'Camada Valorização m² > 85',
    actions: ['Notificar app', 'Criar lead', 'Email resumo'],
    status: 'ativo',
  },
  {
    id: 'heat-zone',
    name: 'Zona quente',
    trigger: 'Top oportunidades score ≥ 88',
    actions: ['Push radar', 'Salvar favorito'],
    status: 'ativo',
  },
  {
    id: 'risk-flood',
    name: 'Risco enchente',
    trigger: 'floodRisk = alto',
    actions: ['Badge alerta', 'Webhook CRM'],
    status: 'pausado',
  },
  {
    id: 'weekly-report',
    name: 'Relatório semanal',
    trigger: 'Cron segunda 08:00',
    actions: ['PDF overview', 'Email assinantes'],
    status: 'ativo',
  },
  {
    id: 'rag-digest',
    name: 'Digest RAG',
    trigger: 'Novos markdowns',
    actions: ['Indexar', 'Resumo no LandBot'],
    status: 'rascunho',
  },
];

export default function WorkflowsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  const active = FLOWS.filter((f) => f.status === 'ativo').length;

  return (
    <ProductPageShell
      backHref="/automations"
      eyebrow={
        <>
          <Workflow className="h-3 w-3" /> Fluxos
        </>
      }
      title="Fluxos de trabalho"
      description="Automações ligadas ao mapa intelligence e ao radar de oportunidades."
    >
      <section className="grid grid-cols-3 gap-3">
        <Stat label="Fluxos" value={String(FLOWS.length)} />
        <Stat label="Ativos" value={String(active)} />
        <Stat label="Gatilhos" value="mapa · cron · RAG" />
      </section>

      <div className="mt-4 flex gap-2">
        <Link href={lh('/automations')} className={cn(buttonVariants({ size: 'sm' }))}>
          Automações
        </Link>
        <Link href={lh('/alerts')} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
          Alertas
        </Link>
      </div>

      <Reveal className="mt-6 space-y-3">
        {FLOWS.map((f) => (
          <Card key={f.id} variant="interactive" className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{f.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">Quando: {f.trigger}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {f.actions.map((a) => (
                    <Badge key={a} variant="outline">
                      {a}
                    </Badge>
                  ))}
                </div>
              </div>
              <Badge
                variant={
                  f.status === 'ativo' ? 'success' : f.status === 'pausado' ? 'warning' : 'outline'
                }
              >
                {f.status}
              </Badge>
            </div>
          </Card>
        ))}
      </Reveal>
    </ProductPageShell>
  );
}
