'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Sparkles, LandMapWordmark } from '../../../components/lovable/icons';

type Plan = {
  id: string;
  name: string;
  tag: string;
  price: number;
  features: string[];
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    id: 'access',
    name: 'LandMap Access',
    tag: 'Comece com o essencial',
    price: 69.9,
    features: [
      'Acesso a todas as cidades do Brasil',
      'Mapa de valorização e desvalorização',
      'Mapa de calor básico',
      'Ranking das regiões mais valorizadas',
      'Ranking das regiões em queda',
      'Histórico de preço por m²',
      'Busca por bairro, cidade e região',
      'Salvar até 10 áreas favoritas',
      'Tendência: subindo, estável ou caindo',
    ],
  },
  {
    id: 'plus',
    name: 'LandMap Plus',
    tag: 'Mais popular',
    price: 119.9,
    highlight: true,
    features: [
      'Tudo do Access',
      'Radar de oportunidades LandMap',
      'Alertas inteligentes de valorização',
      'Alertas de queda de preço',
      'Ranking de oportunidades por cidade',
      'Comparação entre regiões',
      'Notas automáticas sobre potencial da área',
      'Salvar até 25 áreas favoritas',
    ],
  },
  {
    id: 'pro',
    name: 'LandMap Pro',
    tag: 'Para profissionais',
    price: 249.9,
    features: [
      'Tudo do Plus',
      'Acompanhar áreas monitoradas (salvas)',
      'Salvar até 50 regiões favoritas',
      'Histórico completo da área',
      'Relatório mensal geral',
      'Avaliação do seu terreno',
    ],
  },
  {
    id: 'business',
    name: 'LandMap Business',
    tag: 'Para equipes',
    price: 699.9,
    features: [
      'Tudo do Pro',
      'Até 5 usuários',
      'Painel de equipe',
      'Relatório com marca da empresa',
      'Histórico de análise da equipe',
    ],
  },
];

const formatBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PlansPage() {
  const locale = useLocale();
  const router = useRouter();
  const lh = (p: string) => `/${locale}${p}`;

  const handleSelect = (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('landmap:selected_plan', id);
    }
    router.push(lh('/auth') + '?mode=request');
  };

  return (
    <div className="mx-auto flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/90 px-4 py-3 backdrop-blur">
        <Link
          href={lh('/intro')}
          aria-label="Voltar"
          className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-[var(--muted)]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="px-6 pt-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
          <Sparkles className="h-3 w-3" />
          Escolha seu plano
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight">
          Comece a analisar o mercado agora
        </h1>
        <p className="mt-2 text-sm text-[color:color-mix(in_srgb,var(--foreground)_60%,transparent)]">
          Cancele quando quiser. Sem fidelidade.
        </p>
      </div>

      <div className="mt-8 grid gap-6 px-6 pb-12 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => (
          <div
            key={p.id}
            className={
              p.highlight
                ? 'relative flex flex-col rounded-2xl border-2 border-[var(--primary)] bg-[var(--card)] p-5 shadow-lg'
                : 'relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5'
            }
          >
            {p.highlight && (
              <span className="absolute -top-3 right-4 rounded-full bg-[var(--primary)] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--primary-foreground)]">
                {p.tag}
              </span>
            )}

            <div className="mb-4">
              <h3 className="text-lg font-bold">{p.name}</h3>
              {!p.highlight && (
                <span className="mt-1 inline-block rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[10px] font-medium text-[color:color-mix(in_srgb,var(--foreground)_60%,transparent)]">
                  {p.tag}
                </span>
              )}
            </div>

            <div className="mb-5 flex items-baseline gap-1">
              <span className="text-xs text-[color:color-mix(in_srgb,var(--foreground)_50%,transparent)]">
                R$
              </span>
              <span className="text-3xl font-bold tracking-tight">{formatBRL(p.price)}</span>
              <span className="text-sm text-[color:color-mix(in_srgb,var(--foreground)_50%,transparent)]">
                /mês
              </span>
            </div>

            <ul className="mb-6 flex-1 space-y-2.5">
              {p.features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 text-sm text-[color:color-mix(in_srgb,var(--foreground)_75%,transparent)]"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => handleSelect(p.id)}
              className={
                p.highlight
                  ? 'inline-flex h-11 w-full items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-card)] transition hover:bg-[color:color-mix(in_srgb,var(--primary)_90%,transparent)]'
                  : 'inline-flex h-11 w-full items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--muted)]'
              }
            >
              {`Assinar — R$ ${formatBRL(p.price)}/mês`}
            </button>
          </div>
        ))}
      </div>

      <div className="pb-8 text-center">
        <Link
          href={lh('/auth')}
          className="text-sm text-[color:color-mix(in_srgb,var(--foreground)_60%,transparent)] hover:text-[var(--foreground)]"
        >
          Já tem conta? <span className="font-medium text-[var(--primary)]">Entrar</span>
        </Link>
      </div>
    </div>
  );
}
