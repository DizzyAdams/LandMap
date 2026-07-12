'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowLeft, Check, Sparkles, LandMapWordmark } from '../../../components/lovable/icons';

type Plan = {
  name: string;
  price: string;
  period: string;
  features: string[];
  highlight?: boolean;
  cta: string;
};

const PLANS: Plan[] = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    features: ['3 buscas por mês', 'Mapa de 1 cidade', 'Comparador básico', 'Alertas por e-mail'],
    cta: 'Começar grátis',
  },
  {
    name: 'Profissional',
    price: 'R$ 49',
    period: '/mês',
    highlight: true,
    features: [
      'Buscas ilimitadas',
      'Mapa de 10 cidades',
      'Camadas de calor e ROI',
      'Chat com IA (ilimitado)',
      'Comparador avançado',
    ],
    cta: 'Assinar Pro',
  },
  {
    name: 'Enterprise',
    price: 'R$ 199',
    period: '/mês',
    features: ['Tudo do Profissional', 'Acesso à API REST', 'CRM e webhooks', 'Suporte prioritário'],
    cta: 'Falar com vendas',
  },
];

export default function PlansPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-[var(--background)] pb-32 text-[var(--foreground)]">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-lovable)] bg-[var(--background)]/90 px-4 py-3 backdrop-blur">
        <Link
          href={lh('/intro')}
          aria-label="Voltar"
          className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-[var(--muted-lovable)]"
        >
          <ArrowLeft size={18} />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="px-6 pt-8">
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--primary) 10%, transparent)',
            color: 'var(--primary)',
          }}
        >
          <Sparkles size={14} />
          Escolha seu plano
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight">
          Comece a analisar o mercado agora
        </h1>
        <p className="mt-2 text-sm text-[var(--muted-foreground-lovable)]">
          Cancele quando quiser. Sem fidelidade.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 px-6">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className="relative rounded-2xl border p-5 text-left transition-all hover:border-[var(--primary)]/40"
            style={{
              borderColor: plan.highlight ? 'var(--primary)' : 'var(--border-lovable)',
              backgroundColor: plan.highlight
                ? 'color-mix(in srgb, var(--primary) 4%, transparent)'
                : 'var(--card)',
            }}
          >
            {plan.highlight && (
              <span
                className="absolute right-4 top-5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                style={{
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-foreground)',
                }}
              >
                Popular
              </span>
            )}
            <div className="text-sm font-medium text-[var(--muted-foreground-lovable)]">{plan.name}</div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-bold">{plan.price}</span>
              <span className="text-sm text-[var(--muted-foreground-lovable)]">{plan.period}</span>
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check size={16} className="shrink-0 text-[var(--primary)]" />
                  <span className="text-[var(--foreground)]">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={lh('/auth')}
              className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition"
              style={
                plan.highlight
                  ? { backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }
                  : { border: '1px solid var(--border-lovable)', color: 'var(--foreground)' }
              }
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
