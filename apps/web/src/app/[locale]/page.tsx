import Link from 'next/link';
import React from 'react';
import { searchProperties } from '../../lib/api';
import { formatBRL } from '../../lib/format';
import { Reveal, Stagger, ScrollProgress } from '../../components/Motion';
import { SpotlightCard } from '../../components/SpotlightCard';
import { Marquee } from '../../components/Marquee';

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

      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 cadastre-grid opacity-[0.35]" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem]"
        style={{ background: 'radial-gradient(48rem 30rem at 50% -12%, rgba(52,211,153,0.10), transparent 70%)' }}
      />

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 sm:pt-28">
        <div className="h-px w-16 rule-gold" />
        <p className="eyebrow-gold mt-5">Inteligencia imobiliaria aberta</p>

        <h1 className="mt-4 max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Veja o territorio imobiliario como{' '}
          <span className="text-gradient-gold">dados</span>.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-neutral-400 sm:text-lg">
          Busca por cidade e tipo, mapa interativo, chat com IA e calculo de
          investimento. 1.500 imoveis em 10 cidades — sem custo e sem login.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="./search" className="inline-flex h-11 items-center rounded-lg bg-white px-5 text-sm font-medium text-neutral-900 transition hover:bg-neutral-200">
            Explorar imoveis
          </Link>
          <Link href="./map" className="inline-flex h-11 items-center rounded-lg border border-neutral-800 px-5 text-sm text-neutral-200 transition hover:border-neutral-500 hover:text-white">
            Abrir o mapa
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-1 text-xs text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            Dados vivos · 10 cidades
          </span>
        </div>
      </section>

      <Marquee />

      <Reveal className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Destaque no cadastro</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Imoveis em destaque</h2>
          </div>
          <Link href="./search" className="shrink-0 text-sm text-neutral-400 transition hover:text-white">
            Ver todos →
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                  <th className="border-b border-neutral-800 px-3 py-3 font-medium">Imovel</th>
                  <th className="border-b border-neutral-800 px-3 py-3 font-medium">Local</th>
                  <th className="border-b border-neutral-800 px-3 py-3 font-medium">Tipo</th>
                  <th className="border-b border-neutral-800 px-3 py-3 text-right font-medium">Area</th>
                  <th className="border-b border-neutral-800 px-3 py-3 text-right font-medium">Quartos</th>
                  <th className="border-b border-neutral-800 px-3 py-3 text-right font-medium">Preco</th>
                </tr>
              </thead>
              <tbody>
                {featured.map((p) => (
                  <tr key={p.id} className="group transition hover:bg-white/[0.03]">
                    <td className="border-b border-neutral-900 px-3 py-3">
                      <Link href={`./property/${p.id}`} className="font-medium text-neutral-100 transition group-hover:text-white">
                        {p.title}
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
          <p className="mt-8 text-sm text-neutral-400">Nenhum imovel encontrado no momento.</p>
        )}
      </Reveal>

      <Reveal delay={0.1} className="mx-auto max-w-6xl px-6 pb-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Ecossistema operando</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Agentes &amp; Skills</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/[0.06] px-3 py-1 text-xs text-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
            All systems live
          </span>
        </div>
        <Stagger className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: './sales', title: 'Agente de Vendas', desc: 'Esquadrao de 11 agentes: prospeccao → fechamento.', tag: '11 agentes' },
            { href: './chat', title: 'Chat RAG (IA gratis)', desc: 'Pergunte sobre imoveis. MiniMax via Puter.js.', tag: 'LLM' },
            { href: './map', title: 'Mapa Interativo', desc: 'Leaflet com pins, clusters e geocodificacao.', tag: 'Geo' },
            { href: './compare', title: 'Comparador', desc: 'Diff de preco, area e quartos entre imoveis.', tag: 'Diff' },
            { href: './studio', title: 'Studio (IA & Design)', desc: 'Geracao de copy e variacoes de marca.', tag: 'GenAI' },
            { href: './favorites', title: 'Favoritos & Alertas', desc: 'Salve e receba alertas por filtro.', tag: 'Sync' },
            { href: './insights', title: 'Insights de Investimento', desc: 'Metricas PURAS: cap rate, cash-on-cash, IRR.', tag: 'Invest' },
            { href: './calculator', title: 'Calculadora', desc: 'Simule financiamento e ROI.', tag: 'Fin' },
          ].map((s) => (
            <SpotlightCard key={s.href} className="border border-neutral-800 p-5">
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
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="eyebrow-gold">Plataforma aberta</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Dados, busca, mapa e IA — sem custo.</h2>
          <p className="mt-2 max-w-md text-sm text-neutral-400">API REST, schema.org, RAG local, CRM — tudo open-source.</p>
          <div className="mt-6">
            <Link href="./search" className="inline-flex h-11 items-center rounded-lg border border-neutral-800 px-5 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-white">
              Comecar busca
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
