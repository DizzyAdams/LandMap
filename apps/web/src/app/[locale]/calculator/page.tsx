'use client';

import { useState } from 'react';

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
      <section className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Simulador de financiamento</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Calcule a parcela mensal e o total de juros do seu financiamento imobiliário.
        </p>

        <div className="mt-8 space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
          <label className="block">
            <span className="text-xs text-neutral-500">Preço do imóvel</span>
            <input
              type="number"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              className="input mt-1"
            />
          </label>
          <label className="block">
            <span className="text-xs text-neutral-500">Entrada (%)</span>
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
            <span className="text-xs text-neutral-500">Taxa de juros anual (%)</span>
            <input
              type="number"
              value={taxaAnual}
              onChange={(e) => setTaxaAnual(e.target.value)}
              className="input mt-1"
              step="0.01"
            />
          </label>
          <label className="block">
            <span className="text-xs text-neutral-500">Prazo (meses)</span>
            <input
              type="number"
              value={prazo}
              onChange={(e) => setPrazo(e.target.value)}
              className="input mt-1"
              min={1}
            />
          </label>

          <button onClick={calc} className="btn-primary w-full">
            Calcular
          </button>
        </div>

        {result && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
              <p className="text-xs text-neutral-500">Parcela mensal</p>
              <p className="mt-1 text-xl font-medium text-neutral-100">{fmt(result.parcela)}</p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
              <p className="text-xs text-neutral-500">Total de juros</p>
              <p className="mt-1 text-xl font-medium text-neutral-100">{fmt(result.totalJuros)}</p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
