'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Workflow, Plus, BellRing, Zap } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, Button } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

type Rule = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  active: boolean;
  runs: number;
};

const RULES: Rule[] = [
  { id: 'r1', name: 'Alerta de valorização', trigger: 'Quando m² sobe > 5%', action: 'Notificar no app', active: true, runs: 142 },
  { id: 'r2', name: 'Lead quente', trigger: 'Novo contato em terreno ativo', action: 'Criar tarefa', active: true, runs: 38 },
  { id: 'r3', name: 'Relatório semanal', trigger: 'Toda segunda 08h', action: 'Enviar e-mail', active: false, runs: 12 },
];

export default function AutomationsPage() {
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

      <div className="mt-6 flex items-start justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Workflow className="h-3 w-3" />
            Automações
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Regras que rodam sozinhas</h1>
          <p className="mt-2 text-sm text-foreground/60">Dispare notificações e tarefas sem intervenção manual.</p>
        </div>
        <Button className="h-9 shrink-0 !px-3 text-xs">
          <Plus className="h-4 w-4" />
          Nova regra
        </Button>
      </div>

      <section className="mt-6 grid grid-cols-3 gap-3">
        <Stat label="Regras ativas" value="2" />
        <Stat label="Execuções" value="192" trend={24} />
        <Stat label="Economia/h" value="9h" />
      </section>

      <Reveal className="mt-6 flex flex-col gap-3">
        {RULES.map((r) => (
          <Card key={r.id} variant={r.active ? 'interactive' : 'default'}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <p className="font-semibold">{r.name}</p>
                  <Badge variant={r.active ? 'success' : 'outline'}>{r.active ? 'ativo' : 'pausado'}</Badge>
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <BellRing className="h-3 w-3" />
                  {r.trigger} → {r.action}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{r.runs} execuções</p>
              </div>
            </div>
          </Card>
        ))}
      </Reveal>
    </main>
  );
}
