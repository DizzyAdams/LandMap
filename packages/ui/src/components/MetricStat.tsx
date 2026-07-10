import React from 'react';
import { cn } from '../lib/index';

export type MetricTone =
  | 'emerald'
  | 'cyan'
  | 'violet'
  | 'gold'
  | 'neutral'
  | 'danger';

/** A threshold bucket: the highest `min` <= `numeric` wins its `tone`. */
export interface MetricThreshold {
  min: number;
  tone: MetricTone;
}

export interface MetricStatProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Numeric value used to resolve `tone` via `thresholds`. */
  numeric?: number;
  /** Ordered buckets; the highest `min` <= numeric wins. */
  thresholds?: MetricThreshold[];
  /** Explicit tone; overrides threshold resolution. */
  tone?: MetricTone;
  hint?: React.ReactNode;
  icon?: React.ReactNode;
  /** Render the value larger / bolder (e.g. hero KPI). */
  emphasis?: boolean;
}

// Inline token-driven styles — render correctly even before the Tailwind v4
// pipeline is turned on. Colors reference the brand CSS vars (with rgba
// fallbacks) already defined in packages/ui/src/styles.css and globals.css.
const toneStyle: Record<MetricTone, React.CSSProperties> = {
  emerald: { color: 'var(--emerald-bright)', borderColor: 'rgba(52,211,153,0.35)', background: 'rgba(52,211,153,0.08)' },
  cyan: { color: 'var(--cyan)', borderColor: 'rgba(34,211,238,0.35)', background: 'rgba(34,211,238,0.08)' },
  violet: { color: 'var(--violet)', borderColor: 'rgba(167,139,250,0.35)', background: 'rgba(167,139,250,0.08)' },
  gold: { color: 'var(--gold-soft)', borderColor: 'rgba(212,175,55,0.35)', background: 'rgba(212,175,55,0.08)' },
  neutral: { color: 'var(--muted)', borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' },
  danger: { color: '#ff8a8a', borderColor: 'rgba(255,77,77,0.35)', background: 'rgba(255,77,77,0.08)' },
};

function resolveTone(props: Pick<MetricStatProps, 'tone' | 'thresholds' | 'numeric'>): MetricTone {
  if (props.tone) return props.tone;
  if (props.thresholds && props.numeric !== undefined) {
    const sorted = [...props.thresholds].sort((a, b) => a.min - b.min);
    let chosen: MetricTone = 'neutral';
    for (const t of sorted) {
      if (props.numeric >= t.min) chosen = t.tone;
    }
    return chosen;
  }
  return 'neutral';
}

/**
 * Compact KPI tile — label + value, colored by an explicit `tone` or resolved
 * from `thresholds` against a `numeric` value. Reuses the brand accent tokens
 * and the `.glass` surface so it stays on-system everywhere it is dropped in.
 */
export const MetricStat = React.forwardRef<HTMLDivElement, MetricStatProps>(
  (
    { label, value, numeric, thresholds, tone, hint, icon, emphasis, className, style, ...props },
    ref,
  ) => {
    const resolved = resolveTone({ tone, thresholds, numeric });
    const t = toneStyle[resolved];
    return (
      <div
        ref={ref}
        className={cn('glass', className)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          padding: '14px 16px',
          borderRadius: 'var(--radius-lg, 16px)',
          border: `1px solid ${t.borderColor}`,
          background: t.background,
          ...style,
        }}
        {...props}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--muted, #a3a3a3)',
          }}
        >
          {icon ? (
            <span aria-hidden style={{ display: 'inline-flex' }}>
              {icon}
            </span>
          ) : null}
          <span style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.02em' }}>{label}</span>
        </div>
        <div
          style={{
            color: t.color,
            fontSize: emphasis ? 26 : 18,
            fontWeight: 700,
            lineHeight: 1.1,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </div>
        {hint ? (
          <div style={{ fontSize: 12, color: 'var(--muted-2, #737373)', fontVariantNumeric: 'tabular-nums' }}>
            {hint}
          </div>
        ) : null}
      </div>
    );
  },
);

MetricStat.displayName = 'MetricStat';
