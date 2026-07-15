'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Plug, ShieldCheck } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

const INTEGRATIONS = [
  { name: 'CRM', desc: 'Sincronize leads e negócios', status: 'conectado' },
  { name: 'E-mail', desc: 'Disparos transacionais', status: 'conectado' },
  { name: 'Planilhas', desc: 'Exportação de relatórios', status: 'disponível' },
  { name: 'Webhooks', desc: 'Eventos em tempo real', status: 'disponível' },
];

const variant = (s: string) => (s === 'conectado' ? 'success' : 'outline');

export default function IntegrationsPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link href={lh('/assistant')} aria-label="Voltar" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Plug className="h-3 w-3" />
          Integrações
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Conecte suas ferramentas</h1>
        <p className="mt-2 text-sm text-foreground/60">Leve a IA LandMap para onde seu time já trabalha.</p>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Integrações" value="4" />
        <Stat label="Conectadas" value="2" />
        <Stat label="Webhooks" value="3" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {INTEGRATIONS.map((i) => (
          <Card key={i.name} variant={i.status === 'conectado' ? 'interactive' : 'default'}>
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Plug className="h-4 w-4 text-primary" />
                  <p className="truncate font-semibold">{i.name}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{i.desc}</p>
              </div>
              <Badge variant={variant(i.status)}>{i.status}</Badge>
            </div>
          </Card>
        ))}
      </Reveal>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        Conexões criptografadas de ponta a ponta.
      </div>
    </main>
  );
}
