'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen bg-[#050505]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-50">
            Planos e Preços
          </h1>
          <p className="mt-3 text-sm text-neutral-500">
            Escolha o plano ideal para o seu negócio
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-6 transition ${
                plan.highlight
                  ? 'border-neutral-600 bg-neutral-900/60 shadow-lg shadow-neutral-900/50'
                  : 'border-neutral-800 bg-neutral-900/40 hover:border-neutral-700'
              }`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-neutral-50 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-[#050505]">
                  Mais Popular
                </span>
              )}
              <h3 className="text-sm font-medium text-neutral-50">{plan.name}</h3>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-3xl font-semibold text-neutral-50">{plan.price}</span>
                <span className="text-xs text-neutral-500">{plan.period}</span>
              </div>
              <p className="mt-2 text-xs text-neutral-500">{plan.description}</p>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2 text-xs text-neutral-400">
                    <span className="mt-0.5 text-neutral-600">✓</span>
                    {feat}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.highlight ? `/${locale}/register` : `/${locale}/register?plan=free`}
                className={`mt-6 flex w-full items-center justify-center rounded-lg py-2.5 text-xs font-medium transition ${
                  plan.highlight
                    ? 'bg-neutral-50 text-[#050505] hover:bg-neutral-200'
                    : 'border border-neutral-800 text-neutral-300 hover:border-neutral-600 hover:text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Comparative table */}
        <div className="mt-20">
          <h2 className="text-center text-lg font-medium text-neutral-50">
            Comparação de Planos
          </h2>
          <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-800 bg-neutral-900/60">
                <tr>
                  <Th> </Th>
                  <Th className="text-center">Gratuito</Th>
                  <Th className="text-center text-neutral-50">Profissional</Th>
                  <Th className="text-center">Enterprise</Th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr
                    key={row.label}
                    className="border-b border-neutral-800/50 transition hover:bg-neutral-900/20"
                  >
                    <td className="px-4 py-3 text-xs text-neutral-300">{row.label}</td>
                    <td className="px-4 py-3 text-center text-xs text-neutral-600">{row.free}</td>
                    <td className="px-4 py-3 text-center text-xs text-neutral-400">{row.pro}</td>
                    <td className="px-4 py-3 text-center text-xs text-neutral-400">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-neutral-500 ${className ?? ''}`}
    >
      {children}
    </th>
  );
}
