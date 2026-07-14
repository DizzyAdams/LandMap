'use client';

import { useState, useEffect } from 'react';
import { LANDMAP_API_BASE } from '../../../../lib/api';

type AiInsightsProps = {
  propertyId: string;
  propertyTitle: string;
};

type AnalysisData = {
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
};

export default function AiInsights({ propertyId, propertyTitle }: AiInsightsProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalysis() {
      try {
        const res = await fetch(`${LANDMAP_API_BASE}/analyze`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            prompt: `Analise este imóvel detalhadamente: "${propertyTitle}" (ID: ${propertyId}). 
Liste os pontos fortes, pontos fracos e dê uma recomendação geral para potenciais compradores/investidores.
Responda APENAS com JSON válido no formato: { "strengths": [], "weaknesses": [], "recommendation": "texto" }
Seja honesto e objetivo. Destaque aspectos como localização, potencial de valorização, e cuidados.`,
          }),
        });

        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = await res.json();

        if (!cancelled) {
          try {
            const parsed = JSON.parse(data.answer) as AnalysisData;
            setAnalysis(parsed);
          } catch {
            // Fallback: extract from raw text
            setAnalysis({
              strengths: ['Imóvel disponível para análise'],
              weaknesses: [],
              recommendation: data.answer,
            });
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar análise');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalysis();
    return () => { cancelled = true; };
  }, [propertyId, propertyTitle]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-5">
        <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Análise IA</h2>
        <div className="mt-3 space-y-2">
          <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--card)]" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--card)]" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--card)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-5">
        <h2 className="text-sm font-medium text-[var(--muted-foreground)]">Análise IA</h2>
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">Indisponível no momento.</p>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/40 p-5">
      <h2 className="text-sm font-medium text-[var(--muted-foreground)]">
        Análise por IA <span className="ml-1.5 text-[10px] text-[var(--muted-foreground)]">· gerado automaticamente</span>
      </h2>

      {analysis.strengths.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-[var(--primary)]">✅ Pontos fortes</p>
          <ul className="mt-1.5 space-y-1">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="text-xs text-[var(--muted-foreground)]">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.weaknesses.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-[var(--warning)]">⚠️ Pontos de atenção</p>
          <ul className="mt-1.5 space-y-1">
            {analysis.weaknesses.map((w, i) => (
              <li key={i} className="text-xs text-[var(--muted-foreground)]">
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 border-t border-[var(--border)] pt-3">
        <p className="text-xs font-medium text-[var(--muted-foreground)]">💡 Recomendação</p>
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted-foreground)]">
          {analysis.recommendation}
        </p>
      </div>
    </div>
  );
}
