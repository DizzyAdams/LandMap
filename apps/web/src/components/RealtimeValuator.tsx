'use client';

import { useEffect, useRef, useState } from 'react';
import { valueRealtime, type RealtimeValuation } from '../lib/api';

const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

/* Count-up tween for the estimated value. */
function useCountUp(value: number, duration = 500) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return display;
}

const TYPES = [
  { v: 'terreno', label: 'Terreno' },
  { v: 'apartamento', label: 'Apartamento' },
  { v: 'casa', label: 'Casa' },
  { v: 'comercial', label: 'Comercial' },
];

/**
 * Simulador de valor ao vivo — envia os parâmetros ao endpoint `/value/realtime`
 * (prior calibrado, sub-ms) a cada mudança e mostra o valor estimado com selo
 * de latência. Prático: qualquer usuário move o slider e vê o preço na hora.
 */
export function RealtimeValuator({
  basePpm2,
  defaultType = 'terreno',
  defaultArea = 300,
}: {
  basePpm2?: number;
  defaultType?: string;
  defaultArea?: number;
}) {
  const [area, setArea] = useState(defaultArea);
  const [type, setType] = useState(defaultType);
  const [result, setResult] = useState<RealtimeValuation | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    const t = setTimeout(() => {
      valueRealtime({ areaM2: area, type, basePpm2: basePpm2 ?? null })
        .then((r) => active && (setResult(r), setError(false)))
        .catch(() => active && setError(true));
    }, 120);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [area, type, basePpm2]);

  const value = useCountUp(result?.predictedPrice ?? 0);

  return (
    <div className="surface rounded-xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Simulador de valor ao vivo</h2>
        {result && !error && (
          <span
            className="chip pulse-primary"
            title="Latência da inferência em microssegundos"
          >
            <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
            {result.latencyUs < 1000
              ? `${result.latencyUs.toFixed(0)} µs`
              : `${(result.latencyUs / 1000).toFixed(2)} ms`}
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">
        Estimativa instantânea pelo modelo calibrado — ajuste os parâmetros.
      </p>

      <div className="mt-5">
        <p className="ledger-num text-3xl font-semibold tabular-nums text-[var(--primary)]">
          {error ? '—' : brl.format(value)}
        </p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          {result && !error ? (
            <>
              {brl.format(result.pricePerM2)}/m² ·{' '}
              <span
                className="cursor-help border-b border-dotted border-[var(--border)]"
                title={
                  result.engine === 'torch'
                    ? 'Refinador PyTorch treinado em 1.500 imóveis reais — corrige o prior em numpy'
                    : 'Prior calibrado em numpy — determinístico e sub-milissegundo'
                }
              >
                engine {result.engine}
              </span>
            </>
          ) : (
            'calculando…'
          )}
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
            <label htmlFor="rt-area">Área</label>
            <span className="ledger-num tabular-nums text-[var(--muted-foreground)]">{area} m²</span>
          </div>
          <input
            id="rt-area"
            type="range"
            min={50}
            max={5000}
            step={10}
            value={area}
            onChange={(e) => setArea(Number(e.target.value))}
            aria-label="Área em metros quadrados"
            className="mt-2 w-full accent-[var(--primary)]"
          />
        </div>

        <div role="group" aria-label="Tipo de imóvel" className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t.v}
              type="button"
              aria-pressed={type === t.v}
              onClick={() => setType(t.v)}
              className={`btn ${type === t.v ? 'btn-primary' : 'btn-ghost'} !px-3 !py-1 !text-xs`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
