'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Reveal, Stagger } from '../../../components/Motion';
import { SpotlightCard } from '../../../components/SpotlightCard';

const PLANS = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    description: 'Para quem está começando',
    features: [
      'Até 50 imóveis cadastrados',
      'Busca básica por localização',
      'Mapa interativo',
      'Suporte por email',
    ],
    limits: '50 imóveis/mês',
    cta: 'Começar Grátis',
    href: 'search',
    highlight: false,
  },
  {
    name: 'Profissional',
    price: 'R$ 97',
    period: '/mês',
    description: 'Para corretores e imobiliárias',
    features: [
      'Até 500 imóveis cadastrados',
      'API REST completa',
      'Relatórios e analytics',
      'Exportação de dados (CSV/JSON)',
      'Leads e CRM integrado',
      'Suporte prioritário',
    ],
    limits: '500 imóveis',
    cta: 'Assinar',
    href: 'sales',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'R$ 497',
    period: '/mês',
    description: 'Para grandes operações',
    features: [
      'Imóveis ilimitados',
      'SSO / LDAP',
      'Webhooks e automações',
      'Auditoria completa',
      'API Rate Limit customizado',
      'Suporte 24h dedicado',
      'SLA 99.9%',
      'Onboarding personalizado',
    ],
    limits: 'Ilimitado',
    cta: 'Falar com Vendas',
    href: 'sales',
    highlight: false,
  },
];

const COMPARISON_ROWS = [
  { label: 'Imóveis', free: '50/mês', pro: '500', enterprise: 'Ilimitado' },
  { label: 'API REST', free: '—', pro: '✓', enterprise: '✓' },
  { label: 'Relatórios', free: '—', pro: '✓', enterprise: '✓' },
  { label: 'Exportação', free: '—', pro: 'CSV/JSON', enterprise: 'CSV/JSON' },
  { label: 'Leads CRM', free: '—', pro: '✓', enterprise: '✓' },
  { label: 'Webhooks', free: '—', pro: '—', enterprise: '✓' },
  { label: 'SSO', free: '—', pro: '—', enterprise: '✓' },
  { label: 'Auditoria', free: '—', pro: '—', enterprise: '✓' },
  { label: 'Suporte', free: 'Email', pro: 'Prioritário', enterprise: '24h Dedicado' },
];

export default function PricingPage() {
  const params = useParams();
  const locale = (params.locale as string) || 'pt-BR';

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {/* Header */}
        <Reveal className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_rgba(0,53,148,0.35)]" />
            Preços em reais (BRL) · Sem fidelidade
          </span>
          <span className="kicker mt-6">Planos LandMap</span>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
            Planos e Preços
          </h1>
          <p className="mt-3 text-sm text-[var(--muted-foreground)]">
            Escolha o plano ideal para o seu negócio
          </p>
        </Reveal>

        {/* Cards */}
        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <SpotlightCard
              key={plan.name}
              className={`flex h-full flex-col p-6 transition-all duration-300 hover:-translate-y-1 ${
                plan.highlight ? ' ring-1 ring-[var(--primary)]/40' : ''
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-[var(--primary)]/40 bg-gradient-to-r from-blue-700/20 to-blue-500/20 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[var(--primary)]">
                  Mais Popular
                </span>
              )}
              <h3 className="text-sm font-medium text-[var(--foreground)]">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-[var(--foreground)]">{plan.price}</span>
                <span className="text-xs text-[var(--muted-foreground)]">{plan.period}</span>
              </div>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-xs text-[var(--muted-foreground)]">
                    <span className="mt-0.5 text-[var(--primary)]">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href={`/${locale}/${plan.href}`}
                className={`group mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all duration-300 ${
                  plan.highlight ? ' ' : ''
                }${
                  plan.highlight
                    ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-foreground)] shadow-[0_0_0_1px_rgba(0,53,148,0.15),0_8px_30px_-12px_rgba(0,53,148,0.5)] hover:-translate-y-px hover:shadow-[0_0_0_1px_rgba(0,53,148,0.45),0_14px_44px_-12px_rgba(0,53,148,0.65)]'
                    : 'border border-[var(--primary)]/30 text-[var(--primary-foreground)] hover:border-[var(--primary)]/60 hover:text-[var(--primary-foreground)] hover:shadow-[0_0_0_1px_rgba(0,53,148,0.3),0_12px_48px_-12px_rgba(0,53,148,0.35)]'
                }`}
              >
                {plan.cta}
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </Link>
            </SpotlightCard>
          ))}
        </Stagger>

        {/* Honest trust signal */}
        <Reveal className="mt-8 text-center text-xs text-[var(--muted-foreground)]">
          Todos os planos incluem acesso à base de dados abertos do LandMap. Cancele a qualquer
          momento, sem multa.
        </Reveal>

        {/* Comparative table */}
        <Reveal className="mt-20">
          <h2 className="text-center text-lg font-medium text-[var(--foreground)]">
            Comparação de Planos
          </h2>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--border)] bg-[var(--card)]/60">
                <tr>
                  <Th> </Th>
                  <Th className="text-center">Gratuito</Th>
                  <Th className="text-center text-[var(--foreground)]">Profissional</Th>
                  <Th className="text-center">Enterprise</Th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-[var(--border)]/50 transition hover:bg-[var(--card)]/20"
                  >
                    <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">{row.label}</td>
                    <td className="px-4 py-3 text-center text-xs text-[var(--muted-foreground)]">{row.free}</td>
                    <td className="px-4 py-3 text-center text-xs text-[var(--muted-foreground)]">{row.pro}</td>
                    <td className="px-4 py-3 text-center text-xs text-[var(--muted-foreground)]">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-[var(--muted-foreground)] ${className ?? ''}`}
    >
      {children}
    </th>
  );
}
