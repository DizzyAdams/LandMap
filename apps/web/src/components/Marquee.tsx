'use client';

const ITEMS = [
  '1.500+ imóveis',
  '10 cidades',
  'Venda',
  'Aluguel',
  'Lançamento',
  'RAG local',
  'IA 100% grátis',
  'Open data',
  'schema.org',
  'CRM Twenty',
];

/**
 * Perpetual market ticker — a "living data" strip that reinforces the
 * open-data identity. Pauses under prefers-reduced-motion (see globals.css).
 */
export function Marquee() {
  return (
    <div className="relative overflow-hidden border-y hairline py-3" aria-hidden>
      <div className="marquee-track flex w-max gap-10 whitespace-nowrap text-[11px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 gap-10">
            {ITEMS.map((t, i) => (
              <span key={i} className="flex items-center gap-10">
                <span>{t}</span>
                <span className="h-1 w-1 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-glow)]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
