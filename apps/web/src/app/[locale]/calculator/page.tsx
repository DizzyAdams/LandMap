'use client';

import { useState } from 'react';
import { Button } from '@landmap/ui';
import { Reveal } from '../../../components/Motion';
import { GlowPanel } from '../../../components/GlowPanel';

export default function CalculatorPage() {
  const [preco, setPreco] = useState('500000');
  const [entradaPct, setEntradaPct] = useState('20');
  const [taxaAnual, setTaxaAnual] = useState('9');
  const [prazo, setPrazo] = useState('360');
  const [result, setResult] = useState<{ parcela: number; totalJuros: number } | null>(null);

  const calc = () => {
    const p = Number(preco);
    const e = Number(entradaPct) / 100;
    const t = Number(taxaAnual) / 100 / 12;
    const n = Number(prazo);

    if (!p || !n || !t) return;

    const financed = p * (1 - e);
    const parcela = (financed * t * Math.pow(1 + t, n)) / (Math.pow(1 + t, n) - 1);
    const totalPago = parcela * n;
    const totalJuros = totalPago - financed;

    setResult({ parcela, totalJuros });
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

  return (
    <main className="min-h-screen bg-[#050505] text-neutral-50">
      <Reveal className="mx-auto max-w-2xl px-6 py-10">
        <span className="chip">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          Simulação de referência
        </span>
        <span className="kicker mt-4">Financiamento inteligente</span>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-gradient sm:text-3xl">
          Simulador de financiamento
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          Calcule a parcela mensal e o total de juros do seu financiamento imobiliário.
        </p>

        <GlowPanel className="mt-8">
          <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
          <label className="block">
            <span className="text-xs text-neutral-400">Preço do imóvel</span>
            <input
              type="number"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className="input mt-1"
            />
          </label>
          <label className="block">
            <span className="text-xs text-neutral-400">Entrada (%)</span>
            <input
              type="number"
              value={entradaPct}
              onChange={(e) => setEntradaPct(e.target.value)}
              className="input mt-1"
              min={0}
              max={100}
            />
          </label>
          <label className="block">
            <span className="text-xs text-neutral-400">Taxa de juros anual (%)</span>
            <input
              type="number"
              value={taxaAnual}
              onChange={(e) => setTaxaAnual(e.target.value)}
              className="input mt-1"
              step="0.01"
            />
          </label>
          <label className="block">
            <span className="text-xs text-neutral-400">Prazo (meses)</span>
            <input
              type="number"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="input mt-1"
              min={1}
            />
          </label>

          <Button onClick={calc} className="mt-2 w-full cta-glow">
            Calcular
          </Button>
          </div>
        </GlowPanel>

        {result && (
          <>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="panel rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 transition hover:border-emerald-400/40 hover:shadow-[0_0_40px_-12px_rgba(52,211,153,0.3)]">
                <p className="text-xs text-neutral-400">Parcela mensal</p>
                <p className="mt-1 text-xl font-medium text-emerald-300">{fmt(result.parcela)}</p>
              </div>
              <div className="panel rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 transition hover:border-emerald-400/40 hover:shadow-[0_0_40px_-12px_rgba(52,211,153,0.3)]">
                <p className="text-xs text-neutral-400">Total de juros</p>
                <p className="mt-1 text-xl font-medium text-neutral-100">{fmt(result.totalJuros)}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-neutral-400">
              Simulação de referência. Taxas, prazos e encargos são exemplos — confirme as
              condições com seu banco.
            </p>
          </>
        )}
      </Reveal>
    </main>
  );
}
