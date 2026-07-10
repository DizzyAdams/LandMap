# 07 — Scoring de Oportunidade por Bairro (`@landmap/invest`)

Engine **PURA** e determinística (zero React/Next/IO) que ranqueia bairros por
oportunidade de investimento imobiliário. Camada aditiva sobre as métricas de
`metrics.ts` (`analyze` / `score` / `grade`).

> Pacote: `packages/invest`. Arquivos: `src/opportunity.ts` + `src/opportunity.spec.ts`.
> Exportado no barrel `src/index.ts` via `export * from './opportunity'`.

---

## 1. Entradas (espelho do `/market`)

Os tipos de entrada espelham exatamente os exportados por
`packages/api/src/routes/market.ts`, mas são **definidos localmente** em
`opportunity.ts` para manter o engine sem acoplamento ao pacote `@landmap/api`:

| Tipo | Origem na API | Uso no scoring |
| --- | --- | --- |
| `NeighborhoodStat` | `GET /market/neighborhoods` | `stat.avgPrice` → preço; `stat.count` → liquidez |
| `PriceTrendPoint[]` | `GET /market/price-trend` | deriva a valorização anual (slope) |
| `HeatmapPoint` | `GET /market/heatmap` | `weight` 0..1 → demanda |

---

## 2. Composição do `score` (0..100)

Cada bairro vira um `OpportunityScore` combinando **4 fatores**, cada um
normalizado para `0..1` e ponderado:

| Fator | Fórmula de normalização | Peso | Significado |
| --- | --- | --- | --- |
| **yield** | `capRate / 0.08` (trava 1) | **0.30** | Retorno operacional do ativo (cap rate de `analyze()`) |
| **appreciation** | `slope / 0.07` (trava 1) | **0.25** | Valorização anual esperada (derivada da tendência) |
| **liquidity** | `min(count / 50, 1)` | **0.25** | Volume de oferta/transações do bairro |
| **demand** | `heatmap.weight` (0..1) | **0.20** | Procura de mercado (peso do mapa de calor) |

```
score = 100 × ( 0.30·yieldN + 0.25·apprN + 0.25·liqN + 0.20·demN )
score = clamp(score, 0, 100)
grade = grade(score)   // A≥80 · B≥65 · C≥50 · D≥35 · F<35
```

`OPPORTUNITY_WEIGHTS` (exportado) documenta os pesos; eles **somam 1.0**.

### 2.1 Detalhe de cada fator

- **yield** — vem do `capRate` calculado por `analyze()` a partir de
  `toAssumptions(stat)`. O aluguel mensal estimado é
  `avgPrice × annualRentYieldPct / 12` (yield padrão **6%**).
- **appreciation** — `appreciationFromTrend(trend) = last/first − 1`.
  A janela do `/market/price-trend` é de ~12 meses, logo lê como valorização
  anual. Sem tendência (ou < 2 pontos) usa **default 5%**.
- **liquidity** — `count` de anúncios do bairro, normalizado por 50
  (satura em 1 acima disso). Bairro com 0 anúncios ⇒ liquidez 0.
- **demand** — `heat.weight` (0..1). Aceita `HeatmapPoint` ou um número direto;
  ausência ⇒ 0. Travado em 1.

---

## 3. API pública

```ts
estimateMonthlyRent(avgPrice, annualRentYieldPct = 0.06): number
appreciationFromTrend(trend?): number
toAssumptions(stat, opts?): InvestmentAssumptions
scoreNeighborhood(stat, trend?, heat?, opts?): OpportunityScore
rankOpportunities(list): { stat, score }[]   // ordem decrescente por score
```

`OpportunityScore`:
```ts
{
  score: number;          // 0..100
  grade: InvestmentGrade; // 'A'..'F'
  yieldPct: number;       // cap rate em %
  appreciationPct: number;// valorização anual em %
  liquidityPct: number;   // 0..100
  demandPct: number;      // 0..100
  reasons: string[];      // 4 strings explicando cada fator
}
```

---

## 4. Como os agentes consomem

### Agente de API (`packages/api`)
O endpoint `/market/neighborhoods` já devolve `NeighborhoodStat[]`. Para expor o
ranking, basta orquestrar:

```ts
import { rankOpportunities, scoreNeighborhood } from '@landmap/invest';
import type { NeighborhoodStat, PriceTrendPoint, HeatmapPoint } from '@landmap/invest';

// 1) buscar tendência + heatmap por bairro (já existem em /market/*)
const ranked = rankOpportunities(
  stats.map((stat) => ({
    stat,
    trend: trendsByNeighborhood.get(stat.name),
    heat: heatByNeighborhood.get(stat.name),
  })),
);
// ranked[0] é o bairro de maior oportunidade.
```

### Agente de Mapa (heatmap)
Para colorir o mapa por oportunidade (e não só por preço), use
`scoreNeighborhood` ponto a ponto e substitua/adicione o `score` ao `HeatmapPoint`:

```ts
const enriched = heatPoints.map((h) => {
  const stat: NeighborhoodStat = { name: h.neighborhood, city, state, count: h.count ?? 0, avgPriceM2: 0, avgPrice: h.avgPrice };
  const s = scoreNeighborhood(stat, trendByNeighborhood.get(h.neighborhood), h);
  return { ...h, opportunityScore: s.score, opportunityGrade: s.grade };
});
```

Assim o heatmap passa a refletir **oportunidade** (yield + valorização +
liquidez + demanda) e não apenas preço médio.

---

## 5. Garantias e testes

- 100% determinístico: não usa `Date.now()` / `Math.random()`.
- `score` sempre em `[0,100]`; `reasons` sempre não-vazio (4 fatores).
- Coberto por `opportunity.spec.ts` (vitest): rentabilidade, slope, defaults,
  liquidez zero, demanda ausente, clamping, monotonicidade dos fatores e
  ordenação do ranking. Rode:

```bash
pnpm --filter @landmap/invest test
pnpm --filter @landmap/invest typecheck
```
