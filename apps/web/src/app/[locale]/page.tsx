import Link from 'next/link';
import React from 'react';
import { searchProperties } from '../../lib/api';
import { formatBRL } from '../../lib/format';
import { Reveal, Stagger, ScrollProgress } from '../../components/Motion';
import { SpotlightCard } from '../../components/SpotlightCard';
import { Marquee } from '../../components/Marquee';
import { CountUp } from '../../components/CountUp';
import { PropertyThumb } from '../../components/PropertyThumb';
import { buttonVariants, cn } from '@landmap/ui';

const TERMINAL_ROWS = [
  { city: 'São Paulo', price: 'R$ 1,2M', delta: 4.2 },
  { city: 'Curitiba', price: 'R$ 860k', delta: 2.8 },
  { city: 'Florianópolis', price: 'R$ 1,4M', delta: 5.1 },
  { city: 'Belo Horizonte', price: 'R$ 720k', delta: -1.3 },
  { city: 'Recife', price: 'R$ 640k', delta: 3.4 },
];

function Metric({ value, suffix = '', label }: { value: number; suffix?: string; label: string }) {
  return (
    <div>
      <div className="ledger-num text-3xl font-semibold text-white">
        <CountUp value={value} suffix={suffix} />
      </div>
      <div className="mt-1 text-xs text-neutral-400">{label}</div>
    </div>
  );
}

export const dynamic = 'force-dynamic';

export default async function LocaleHomePage() {
  let featured: Array<{
    id: string; title: string; city: string; state: string;
    price: number; areaM2: number; bedrooms?: number;
    type: string; modality: string;
  }> = [];
  try {
    const res = await searchProperties({});
    featured = res.items.slice(0, 6);
  } catch {}

  return (
    <main className="relative min-h-[100dvh] overflow-hidden text-neutral-50">
      <ScrollProgress />

      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-14 px-6 lg:px-24 pb-24 pt-24 sm:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <span className="kicker">Inteligência imobiliária aberta</span>

          <h1 className="text-display text-balance mt-5 text-white">
            Veja o território imobiliário como{' '}
            <span className="text-emerald-300">dados</span>.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg">
            Busca por cidade e tipo, mapa interativo, chat com IA e cálculo de
            investimento. 1.500 imóveis em 10 cidades - sem custo e sem login.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="./search"
              className={cn(buttonVariants({ variant: 'default' }), 'group h-12 px-6')}
            >
              Explorar imóveis
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              href="./map"
              className={cn(buttonVariants({ variant: 'outline' }), 'group h-12 px-6')}
            >
              Abrir o mapa
              <span aria-hidden className="text-emerald-400 transition-transform duration-300 group-hover:translate-x-0.5">↗</span>
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-[var(--emerald-tint)] px-3 py-1 text-xs text-emerald-200">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
              </span>
              Dados vivos · 10 cidades
            </span>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            <Metric value={1500} suffix="+" label="Imóveis catalogados" />
            <Metric value={10} label="Cidades mapeadas" />
            <Metric value={6} label="Modalidades" />
          </div>
        </div>

        <div className="relative">
          <div className="terminal relative overflow-hidden border border-neutral-800 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                <span className="font-mono text-xs text-neutral-400">landmap · live feed</span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-[var(--emerald-tint)] px-2.5 py-1 text-[10px] uppercase tracking-wide text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> live
              </span>
            </div>
            <svg viewBox="0 0 320 90" className="mt-4 h-24 w-full" fill="none" aria-hidden>
              <defs>
                <linearGradient id="spark" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              <polyline
                points="0,72 40,58 80,64 120,42 160,50 200,30 240,40 280,20 320,28"
                stroke="url(#spark)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ strokeDasharray: 600, strokeDashoffset: 600, animation: 'dash 2.4s ease forwards' }}
              />
            </svg>
            <div className="mt-2 space-y-2">
              {TERMINAL_ROWS.map((r) => (
                <div key={r.city} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                  <span className="text-sm text-neutral-300">{r.city}</span>
                  <span className="ledger-num text-sm text-neutral-100">{r.price}</span>
                  <span className={`ledger-num text-xs ${r.delta >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {r.delta >= 0 ? '▲' : '▼'} {Math.abs(r.delta).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Marquee />

      <Reveal className="mx-auto max-w-[1200px] px-6 lg:px-24 py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Destaque no cadastro</p>
            <h2 className="mt-2 text-[1.75rem] font-semibold tracking-tight">Imóveis em destaque</h2>
          </div>
          <Link href="./search" className="group shrink-0 text-sm text-neutral-400 transition hover:text-white">
            <span className="link-underline">Ver todos</span>
            <span aria-hidden className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                  <th className="border-b border-neutral-800 px-3 py-3 font-medium">Imóvel</th>
                  <th className="border-b border-neutral-800 px-3 py-3 font-medium">Local</th>
                  <th className="border-b border-neutral-800 px-3 py-3 font-medium">Tipo</th>
                  <th className="border-b border-neutral-800 px-3 py-3 text-right font-medium">Área</th>
                  <th className="border-b border-neutral-800 px-3 py-3 text-right font-medium">Quartos</th>
                  <th className="border-b border-neutral-800 px-3 py-3 text-right font-medium">Preço</th>
                </tr>
              </thead>
              <tbody>
                {featured.map((p) => (
                  <tr key={p.id} className="group transition hover:bg-white/[0.03]">
                    <td className="border-b border-neutral-900 px-3 py-3">
                      <Link href={`./property/${p.id}`} className="flex items-center gap-3 font-medium text-neutral-100 transition group-hover:text-white">
                        <PropertyThumb seed={p.id} className="h-11 w-9 shrink-0 border border-neutral-800" />
                        <span className="link-underline">{p.title}</span>
                      </Link>
                    </td>
                    <td className="ledger-num border-b border-neutral-900 px-3 py-3 text-neutral-400">{p.city}/{p.state}</td>
                    <td className="border-b border-neutral-900 px-3 py-3 text-neutral-400">{p.type} · {p.modality}</td>
                    <td className="ledger-num border-b border-neutral-900 px-3 py-3 text-right text-neutral-300">{p.areaM2} m²</td>
                    <td className="ledger-num border-b border-neutral-900 px-3 py-3 text-right text-neutral-300">{p.bedrooms ?? '—'}</td>
                    <td className="ledger-num border-b border-neutral-900 px-3 py-3 text-right font-medium text-white">{formatBRL(p.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-8 text-sm text-neutral-400">Nenhum imóvel encontrado no momento.</p>
        )}
      </Reveal>

      <Reveal delay={0.1} className="mx-auto max-w-[1200px] px-6 lg:px-24 pb-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Ecossistema operando</p>
            <h2 className="mt-2 text-[1.75rem] font-semibold tracking-tight">Agentes &amp; Skills</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-1 text-xs text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            All systems live
          </span>
        </div>
        <Stagger className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: './sales', title: 'Agente de Vendas', desc: 'Esquadrão de 11 agentes: prospecção → fechamento.', tag: '11 agentes' },
            { href: './chat', title: 'Chat RAG (IA grátis)', desc: 'Pergunte sobre imóveis. MiniMax via Puter.js.', tag: 'LLM' },
            { href: './map', title: 'Mapa Interativo', desc: 'Leaflet com pins, clusters e geocodificação.', tag: 'Geo' },
            { href: './compare', title: 'Comparador', desc: 'Diff de preço, área e quartos entre imóveis.', tag: 'Diff' },
            { href: './studio', title: 'Studio (IA & Design)', desc: 'Geração de copy e variações de marca.', tag: 'GenAI' },
            { href: './favorites', title: 'Favoritos & Alertas', desc: 'Salve e receba alertas por filtro.', tag: 'Sync' },
            { href: './insights', title: 'Insights de Investimento', desc: 'Métricas PURAS: cap rate, cash-on-cash, IRR.', tag: 'Invest' },
            { href: './calculator', title: 'Calculadora', desc: 'Simule financiamento e ROI.', tag: 'Fin' },
          ].map((s) => (
            <SpotlightCard key={s.href} className="border border-neutral-800 p-5 hover:-translate-y-1">
              <Link href={s.href} className="group block h-full">
                <div className="flex items-center justify-between">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                  <span className="rounded-md border border-neutral-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-400">{s.tag}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-neutral-100 transition group-hover:text-white">{s.title}</p>
                <p className="mt-1 text-xs text-neutral-400">{s.desc}</p>
              </Link>
            </SpotlightCard>
          ))}
        </Stagger>
      </Reveal>

      <Reveal className="border-t border-neutral-800">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-24 py-16">
          <p className="eyebrow-gold">Plataforma aberta</p>
          <h2 className="mt-2 text-[1.75rem] font-semibold tracking-tight sm:text-3xl">Dados, busca, mapa e IA - sem custo.</h2>
          <p className="mt-2 max-w-md text-sm text-neutral-400">API REST, schema.org, RAG local, CRM - tudo open-source.</p>
          <div className="mt-6">
            <Link
              href="./search"
              className={cn(buttonVariants({ variant: 'outline' }), 'group h-12 px-6')}
            >
              Começar busca
              <span aria-hidden className="text-emerald-400 transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
