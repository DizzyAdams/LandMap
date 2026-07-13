import Link from 'next/link';
import React from 'react';
import { searchProperties } from '../../lib/api';
import { formatBRL } from '../../lib/format';
import { Reveal, Stagger, ScrollProgress } from '../../components/Motion';
import { SpotlightCard } from '../../components/SpotlightCard';
import { Marquee } from '../../components/Marquee';
import { CountUp } from '../../components/CountUp';
import { PropertyThumb } from '../../components/PropertyThumb';
import { buttonVariants, cn } from '@landmap/ui/server';

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
      <div className="ledger-num text-3xl font-semibold text-[var(--foreground)]">
        <CountUp value={value} suffix={suffix} />
      </div>
      <div className="mt-1 text-xs text-[var(--muted-foreground)]">{label}</div>
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
    <main className="relative min-h-[100dvh] overflow-hidden text-[var(--foreground)]">
      <ScrollProgress />

      <section className="mx-auto grid max-w-[1200px] grid-cols-1 gap-14 px-6 lg:px-24 pb-24 pt-24 sm:pt-32 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
            Inteligência imobiliária aberta
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance mt-5 text-[var(--foreground)]">
            Veja o território imobiliário como{' '}
            <span className="text-[var(--primary)]">dados</span>.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-[color:color-mix(in_srgb,var(--foreground)_62%,transparent)] sm:text-lg">
            Busca por cidade e tipo, mapa interativo, chat com IA e cálculo de
            investimento. 1.500 imóveis em 10 cidades - sem custo e sem login.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="./search"
              className={cn(buttonVariants({ variant: 'default' }), 'group h-12 px-6 rounded-full')}
            >
              Explorar imóveis
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              href="./map"
              className={cn(buttonVariants({ variant: 'outline' }), 'group h-12 px-6 rounded-full')}
            >
              Abrir o mapa
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 border-t border-[var(--border)] pt-6">
            <Metric value={1500} suffix="+" label="Imóveis catalogados" />
            <Metric value={10} label="Cidades mapeadas" />
            <Metric value={6} label="Modalidades" />
          </div>
        </div>

        <div className="relative">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_rgba(0,53,148,0.35)]" />
                <span className="text-sm font-medium text-[var(--foreground)]">Últimas transações</span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--primary)]/20 bg-[color:color-mix(in_srgb,var(--primary)_10%,transparent)] px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--primary)] font-medium">
                Live
              </span>
            </div>
            
            <div className="space-y-4">
              {TERMINAL_ROWS.map((r) => (
                <div key={r.city} className="flex items-center justify-between border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
                  <span className="text-sm text-[color:color-mix(in_srgb,var(--foreground)_62%,transparent)]">{r.city}</span>
                  <span className="font-semibold text-[var(--foreground)]">{r.price}</span>
                  <span className={`text-xs font-medium ${r.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
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
          <Link href="./search" className="group shrink-0 text-sm text-[var(--muted-foreground)] transition hover:text-[var(--foreground)]">
            <span className="link-underline">Ver todos</span>
            <span aria-hidden className="ml-1 inline-block transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  <th className="border-b border-[var(--border)] px-3 py-3 font-medium">Imóvel</th>
                  <th className="border-b border-[var(--border)] px-3 py-3 font-medium">Local</th>
                  <th className="border-b border-[var(--border)] px-3 py-3 font-medium">Tipo</th>
                  <th className="border-b border-[var(--border)] px-3 py-3 text-right font-medium">Área</th>
                  <th className="border-b border-[var(--border)] px-3 py-3 text-right font-medium">Quartos</th>
                  <th className="border-b border-[var(--border)] px-3 py-3 text-right font-medium">Preço</th>
                </tr>
              </thead>
              <tbody>
                {featured.map((p) => (
                  <tr key={p.id} className="group transition hover:bg-[var(--muted)]">
                    <td className="border-b border-[var(--border)] px-3 py-3">
                      <Link href={`./property/${p.id}`} className="flex items-center gap-3 font-medium text-[var(--foreground)] transition group-hover:text-[var(--foreground)]">
                        <PropertyThumb seed={p.id} className="h-11 w-9 shrink-0 border border-[var(--border)]" />
                        <span className="link-underline">{p.title}</span>
                      </Link>
                    </td>
                    <td className="ledger-num border-b border-[var(--border)] px-3 py-3 text-[var(--muted-foreground)]">{p.city}/{p.state}</td>
                    <td className="border-b border-[var(--border)] px-3 py-3 text-[var(--muted-foreground)]">{p.type} · {p.modality}</td>
                    <td className="ledger-num border-b border-[var(--border)] px-3 py-3 text-right text-[var(--muted-foreground)]">{p.areaM2} m²</td>
                    <td className="ledger-num border-b border-[var(--border)] px-3 py-3 text-right text-[var(--muted-foreground)]">{p.bedrooms ?? '—'}</td>
                    <td className="ledger-num border-b border-[var(--border)] px-3 py-3 text-right font-medium text-[var(--foreground)]">{formatBRL(p.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-8 text-sm text-[var(--muted-foreground)]">Nenhum imóvel encontrado no momento.</p>
        )}
      </Reveal>

      <Reveal delay={0.1} className="mx-auto max-w-[1200px] px-6 lg:px-24 pb-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Ecossistema operando</p>
            <h2 className="mt-2 text-[1.75rem] font-semibold tracking-tight">Agentes &amp; Skills</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--primary)]/25 bg-[var(--primary)]/[0.06] px-3 py-1 text-xs text-[var(--primary)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_8px_rgba(0,53,148,0.35)]" />
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
            <SpotlightCard key={s.href} className="border border-[var(--border)] p-5 hover:-translate-y-1">
              <Link href={s.href} className="group block h-full">
                <div className="flex items-center justify-between">
                  <span className="h-2 w-2 rounded-full bg-[var(--primary)] shadow-[0_0_8px_rgba(0,53,148,0.35)]" />
                  <span className="rounded-md border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">{s.tag}</span>
                </div>
                <p className="mt-3 text-sm font-medium text-[var(--foreground)] transition group-hover:text-[var(--foreground)]">{s.title}</p>
                <p className="mt-1 text-xs text-[var(--muted-foreground)]">{s.desc}</p>
              </Link>
            </SpotlightCard>
          ))}
        </Stagger>
      </Reveal>

      <Reveal className="border-t border-[var(--border)] bg-[var(--muted)]/50">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-24 py-16">
          <p className="text-sm font-medium text-[var(--primary)]">Plataforma aberta</p>
          <h2 className="mt-2 text-[1.75rem] font-semibold tracking-tight sm:text-3xl">Dados, busca, mapa e IA - sem custo.</h2>
          <p className="mt-2 max-w-md text-sm text-[var(--muted-foreground)]">API REST, schema.org, RAG local, CRM - tudo open-source.</p>
          <div className="mt-6">
            <Link
              href="./search"
              className={cn(buttonVariants({ variant: 'outline' }), 'group h-12 px-6')}
            >
              Começar busca
              <span aria-hidden className="text-[var(--primary)] transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
