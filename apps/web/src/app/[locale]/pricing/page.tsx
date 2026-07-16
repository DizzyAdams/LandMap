'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Sparkles, Check } from '../../../components/lovable/icons';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Button } from '@landmap/ui';
import { LandMapWordmark } from '../../../components/lovable/icons';

/** Espelha /plans Lovable (Access / Plus / Pro / Business). */
const PLANS = [
  {
    name: 'Access',
    price: 'R$ 69,90',
    feats: ['Cidades do Brasil', 'Mapa de calor', 'Histórico m²', '10 favoritos'],
    hl: false,
  },
  {
    name: 'Plus',
    price: 'R$ 119,90',
    feats: ['Radar de oportunidades', 'Alertas', 'Comparação', '25 favoritos'],
    hl: true,
  },
  {
    name: 'Pro',
    price: 'R$ 249,90',
    feats: ['Relatório mensal', 'Avaliação de terreno', '50 regiões'],
    hl: false,
  },
];

export default function PricingPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col bg-background px-4 pb-28 pt-6">
      <header className="flex items-center justify-between">
        <Link
          href={lh('/')}
          aria-label="Voltar"
          className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="mt-6 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          Planos
        </div>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Escolha seu plano</h1>
        <p className="mt-2 text-sm text-foreground/60">Cancele quando quiser. Sem fidelidade.</p>
      </div>

      <Reveal className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {PLANS.map((pl) => (
          <Card key={pl.name} variant={pl.hl ? 'highlight' : 'interactive'} className="flex flex-col">
            <div className="flex items-center justify-between">
              <p className="font-semibold">LandMap {pl.name}</p>
              {pl.hl && <Badge variant="success">popular</Badge>}
            </div>
            <p className="mt-2 font-display text-2xl font-bold">
              {pl.price}
              <span className="text-sm font-normal text-muted-foreground">/mês</span>
            </p>
            <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
              {pl.feats.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Link href={lh('/plans')} className="mt-4">
              <Button className="w-full" variant={pl.hl ? 'default' : 'ghost'}>
                Ver planos
              </Button>
            </Link>
          </Card>
        ))}
      </Reveal>
    </main>
  );
}
