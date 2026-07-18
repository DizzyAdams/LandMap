'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Sparkles, Check } from '../../../components/lovable/icons';
import { ProductPageShell } from '../../../components/ProductPageShell';
import { Reveal } from '../../../components/Motion';
import { Card, Badge, Stat, buttonVariants, cn } from '@landmap/ui';

const PLANS = [
  {
    name: 'Access',
    price: 'R$ 69,90',
    feats: ['Mapa intelligence (camadas)', 'Heatmap de valorização', 'Histórico m²', '10 favoritos'],
    hl: false,
  },
  {
    name: 'Plus',
    price: 'R$ 119,90',
    feats: [
      'Tudo do Access',
      'Radar de oportunidades',
      'Alertas inteligentes',
      'Comparação de regiões',
      '25 favoritos',
    ],
    hl: true,
  },
  {
    name: 'Pro',
    price: 'R$ 249,90',
    feats: ['Relatório mensal', 'Avaliação de terreno', 'Score detalhado', '50 regiões'],
    hl: false,
  },
  {
    name: 'Business',
    price: 'R$ 699,90',
    feats: ['API & webhooks', 'Multi-usuário', 'Exports admin', 'SLA comercial'],
    hl: false,
  },
];

export default function PricingPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <ProductPageShell
      backHref="/plans"
      eyebrow={
        <>
          <Sparkles className="h-3 w-3" /> Planos
        </>
      }
      title="Escolha seu plano"
      description="Comece a analisar o mercado agora. Cancele quando quiser. Sem fidelidade."
      maxWidth="5xl"
    >
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Planos" value="4" />
        <Stat label="Mais popular" value="Plus" />
        <Stat label="Mapa" value="incluído" />
        <Stat label="Fidelidade" value="0 dias" />
      </section>

      <Reveal className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((pl) => (
          <Card
            key={pl.name}
            variant={pl.hl ? 'highlight' : 'interactive'}
            className={cn(
              'flex flex-col p-4',
              pl.hl && 'shadow-[var(--shadow-card)]',
            )}
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold">LandMap {pl.name}</p>
              {pl.hl && <Badge variant="default">Mais popular</Badge>}
            </div>
            <p className="mt-2 font-display text-2xl font-bold">
              {pl.price}
              <span className="text-sm font-normal text-muted-foreground">/mês</span>
            </p>
            <ul className="mt-4 flex flex-1 flex-col gap-2 text-sm">
              {pl.feats.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={lh('/plans')}
              className={cn(
                buttonVariants({ variant: pl.hl ? 'default' : 'outline' }),
                'mt-4 w-full',
              )}
            >
              Assinar {pl.name}
            </Link>
          </Card>
        ))}
      </Reveal>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Pagamento não ativado — fluxo de demonstração.{' '}
        <Link href={lh('/auth')} className="text-primary hover:underline">
          Já tem conta? Entrar
        </Link>
      </p>
    </ProductPageShell>
  );
}
