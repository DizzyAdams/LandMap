'use client';

import Link from 'next/link';
import { useState } from 'react';
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

  const [selected, setSelected] = useState<string>('plus');
  const selectedPlan = PLANS.find((p) => p.id === selected) ?? PLANS[1];

  const handleSelect = (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('landmap:selected_plan', id);
    }
    router.push(lh('/auth') + '?mode=request');
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-background pb-28">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-background/90 px-4 py-3 backdrop-blur">
        <Link
          href={lh('/onboarding')}
          aria-label="Voltar"
          className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <LandMapWordmark />
        <div className="w-9" />
      </header>

      <div className="px-6 pt-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3 w-3" />
          Escolha seu plano
        </div>
        <h1 className="mt-3 text-3xl font-bold leading-tight tracking-tight">
          Comece a analisar o mercado agora
        </h1>
        <p className="mt-2 text-sm text-foreground/60">
          Cancele quando quiser. Sem fidelidade.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 px-6">
        {PLANS.map((p) => {
          const isSel = p.id === selected;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelected(p.id)}
              className={
                isSel
                  ? 'relative w-full rounded-2xl border-2 border-primary p-5 text-left transition-all'
                  : 'relative w-full rounded-2xl border border-border p-5 text-left transition-all'
              }
            >
              {p.highlight && (
                <span className="absolute -top-2 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                  {p.tag}
                </span>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold">{p.name}</h3>
                </div>
                <div
                  className={
                    isSel
                      ? 'grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary'
                      : 'grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border'
                  }
                >
                  {isSel && <Check className="h-3.5 w-3.5 text-primary-foreground" />}
                </div>
              </div>

              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-xs text-foreground/50">R$</span>
                <span className="text-2xl font-bold tracking-tight">{formatBRL(p.price)}</span>
                <span className="text-sm text-foreground/50">/mês</span>
              </div>

              {isSel && p.features.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-border/60 pt-4">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-foreground/75"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 px-6 text-center">
        <Link
          href={lh('/auth')}
          className="text-sm text-foreground/60 hover:text-foreground"
        >
          Já tem conta? <span className="font-medium text-primary">Entrar</span>
        </Link>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t border-border bg-background/95 px-6 pb-6 pt-4 backdrop-blur">
        <button
          type="button"
          onClick={() => handleSelect(selected)}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition hover:bg-primary/90"
        >
          Assinar {selectedPlan.name} — R$ {formatBRL(selectedPlan.price)}/mês
        </button>
        <p className="mt-2 text-center text-[11px] text-foreground/40">
          Pagamento não ativado — fluxo de demonstração.
        </p>
      </div>
    </div>
  );
}
