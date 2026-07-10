'use client';

import { cn } from '@landmap/ui';

/**
 * NOTA DE TIPO — `InvestmentGrade` é um espelho local de
 * `packages/invest/src/types.ts`. `apps/web` AINDA NÃO declara
 * `@landmap/invest` como dependência (ver o header de
 * `apps/web/src/components/InvestmentCard.tsx`), então importar o tipo real
 * quebraria o `pnpm -r typecheck`. Este componente é auto-contido e
 * type-safe. Quando o pacote entrar nas deps do apps/web, basta trocar por:
 *   import type { InvestmentGrade } from '@landmap/invest';
 */
export type InvestmentGrade = 'A' | 'B' | 'C' | 'D' | 'F';

/**
 * Paleta canônica grade -> cor, herdada de
 * `apps/web/src/components/InvestmentCard.tsx` (que espelha o design system
 * bioluminescente/soberano de `globals.css`). Usa tokens CSS COM fallback
 * hex para renderizar mesmo antes do Tailwind v4 gerar as classes utilitárias.
 *
 * Exportada para que o pintor de pins do mapa reaproveite exatamente as
 * mesmas cores da legenda (sem divergência visual).
 */
export const INVESTMENT_GRADE_COLORS: Record<InvestmentGrade, string> = {
  A: 'var(--emerald-bright, #34d399)',
  B: 'var(--cyan, #22d3ee)',
  C: 'var(--violet, #a78bfa)',
  D: 'var(--gold-soft, #e8c873)',
  F: 'var(--danger, #ff4d4d)',
};

export const INVESTMENT_GRADES: InvestmentGrade[] = ['A', 'B', 'C', 'D', 'F'];

interface GradeMeta {
  /** Faixa qualitativa do score 0..100 (ver `grade()` em packages/invest). */
  range: string;
  hint: string;
}

const GRADE_META: Record<InvestmentGrade, GradeMeta> = {
  A: { range: '80–100', hint: 'Excelente — alto yield + valorização' },
  B: { range: '65–79', hint: 'Bom — retorno sólido' },
  C: { range: '50–64', hint: 'Razoável — equilibrado' },
  D: { range: '35–49', hint: 'Limitado — cautela' },
  F: { range: '0–34', hint: 'Fraco — evitar / red flag' },
};

export interface InvestmentLegendProps {
  title?: string;
  /** Restringe quais grades exibir (ex.: só as presentes no mapa). */
  grades?: InvestmentGrade[];
  /** Exibe o hint qualitativo sob cada cor. */
  showHints?: boolean;
  /** Fila horizontal compacta em vez da pilha vertical padrão. */
  compact?: boolean;
  className?: string;
}

/**
 * Legenda isolada de cores por `InvestmentGrade` (A–F) para a camada de
 * investimento do mapa. Componente puramente apresentacional: não busca
 * dados, não depende de Leaflet/mapa e NÃO altera `map/page.tsx`.
 */
export function InvestmentLegend({
  title = 'Nota de investimento',
  grades = INVESTMENT_GRADES,
  showHints = false,
  compact = false,
  className,
}: InvestmentLegendProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-neutral-800 bg-neutral-900/40 p-3 text-xs text-neutral-300',
        className,
      )}
      aria-label={title}
    >
      <p className="mb-2 font-medium text-neutral-200">{title}</p>
      <ul
        className={cn('flex gap-3', compact ? 'flex-row flex-wrap' : 'flex-col')}
        role="list"
      >
        {grades.map((g) => (
          <li key={g} className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-3 w-3 shrink-0 rounded-full ring-1 ring-white/20"
              style={{ backgroundColor: INVESTMENT_GRADE_COLORS[g] }}
            />
            <span className="font-mono font-semibold text-neutral-100">{g}</span>
            <span className="text-neutral-500">
              {GRADE_META[g].range}
              {showHints ? ` · ${GRADE_META[g].hint}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InvestmentLegend;
