# 08 — Features "Modo Investidor" (`/investor`) + Componentes Isolados

Especificação de UX do **Modo Investidor** do LandMap: um dashboard hipotético
onde o usuário compara imóveis como ativos financeiros (não apenas como
lugares para morar). Tudo é alimentado pela engine pura `@landmap/invest`
(`analyze` / `InvestmentResult` / `InvestmentGrade` / `rankOpportunities`).

> Autor: Lead Product Designer / Frontend Engineer — LandMap War Room
> Pacotes envolvidos: `@landmap/invest` (engine), `@landmap/ui` (design system),
> `@landmap/web` (rota `/investor`).
> Princípio YC: Tração > PowerPoint · Moat > Features · Velocidade > Perfeição
> Status: **Especificação + componentes isolados criados.** Nenhuma página
> existente foi reescrita; apenas docs + componentes novos aditivos.

---

## 0. Cenário & Persona

- **Persona "Sovereign"**: investidor (PE/VC, family office, comprador de
  alto ticket) que quer *yield* (cap rate), *cashflow* mensal e *ROI* — não
  "tamanho da sala".
- **Tom visual**: a camada **Sovereign gold** (`--gold` / `--gold-soft`) é o
  acento de capital/investidor; o bioluminescente (emerald→cyan) continua para
  ações primárias. Grade A–F colorida vira linguagem de "nota de crédito".
- **Dado**: hipotético/local (sem conta ainda). O usuário monta um "portfólio"
  em `localStorage` (padrão do repo: favoritos/alertas já vivem lá).

---

## 1. Rota `/investor` (Dashboard)

`apps/web/src/app/[locale]/investor/page.tsx` (CLIENT component — consome
`localStorage` + `analyze()` sob demanda).

### 1.1 Layout (desktop)
```
┌──────────────────────────────────────────────────────────────┐
│  Investor · <Gold pill "Modo Investidor">                     │
│  Subtotal: patrimônio hipotético · cap rate médio · ROI médio │
├───────────────────────────────┬──────────────────────────────┤
│  Top Oportunidades            │  Alertas de Subvalorização    │
│  [InvestmentCard] [Card] ...  │  [UnderValuedAlerts]          │
│  (grade A–F + cap rate)       │  (bairros score↑ preço↓)      │
├───────────────────────────────┴──────────────────────────────┤
│  Comparador de Investimento                                   │
│  [InvestCompare]  imóvel A ↔ imóvel B ↔ imóvel C             │
├──────────────────────────────────────────────────────────────┤
│  Alugar vs Comprar                                            │
│  [RentVsBuyCalculator]                                       │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Estado (hooks)
- `usePortfolio()` → lê/grava `localStorage['landmap.investor.portfolio']`
  (array de `{ id, assumptions: InvestmentAssumptions, label }`).
- `results = portfolio.map(p => ({ ...p, r: analyze(p.assumptions) }))`.
- `ranked = rankOpportunities(neighborhoodStats)` para Top Oportunidades e
  UnderValuedAlerts (via `@landmap/api` `/market/neighborhoods` +
  `/market/price-trend` + `/market/heatmap`, já existentes).

### 1.3 KPIs do cabeçalho (usam `MetricStat`)
| KPI | Fonte | Tom |
| --- | --- | --- |
| Patrimônio hipotético | `Σ totalEquityEnd` | `gold` |
| Cap rate médio | `Σ capRate / n` | `emerald` (thresholds) |
| Cashflow mensal | `Σ monthlyCashflow` | `emerald`/`danger` por sinal |
| ROI médio (holding) | `Σ totalReturnPct / n` | `emerald`/`danger` |

---

## 2. `InvestmentCard` (badges: cap rate, cashflow, grade A–F, ROI)

> Componente isolado **já criado**: `apps/web/src/components/InvestmentCard.tsx`.
> Tipa o resultado via `InvestmentResultLike` — um **mirror local** de
> `InvestmentResult` (`@landmap/invest`), porque `@landmap/web` ainda não
> declara `@landmap/invest` como dependência (e o wildcard `@landmap/*` do
> tsconfig aponta para o lugar errado). Ao wirear o pacote, troque o mirror pelo
> `import type { InvestmentResult }` real — os nomes de campo batem 1:1.
> Renderiza o chip de nota A–F colorido + 3 tiles (Cap rate / Cashflow mês /
> ROI). Estilo: `.glass` + tokens inline (funciona sem Tailwind v4 compilando).

### 2.1 API
```tsx
import { InvestmentCard } from '@landmap/web/components/InvestmentCard'; // ou relative
import { analyze, type InvestmentAssumptions, type InvestmentResult } from '@landmap/invest';

const assumptions: InvestmentAssumptions = {
  price: 850_000, monthlyRent: 4_200, downPaymentPct: 0.20,
  interestRatePct: 7.0, loanTermYears: 30, annualExpensesPct: 0.35,
  vacancyPct: 0.08, annualAppreciationPct: 0.05, holdingYears: 5,
};
const result: InvestmentResult = analyze(assumptions);

<InvestmentCard
  title="Cobertura Centro"
  subtitle="Curitiba / PR"
  price={assumptions.price}
  result={result}
  href={`/${locale}/property/abc123`}
/>
```

### 2.2 Mapa de cor da nota (A–F)
| Nota | Tom | Significado |
| --- | --- | --- |
| **A** | emerald | score ≥ 80 |
| **B** | cyan | ≥ 65 |
| **C** | violet | ≥ 50 |
| **D** | gold | ≥ 35 |
| **F** | danger (red) | < 35 |

> `result.grade` vem de `grade(score)` em `metrics.ts` — não recomputamos na UI.

---

## 3. `InvestCompare` (diff de 2+ imóveis por métricas)

Matriz de comparação lado-a-lado com **destaque da melhor métrica por linha**
(borda gold) e delta relativo.

### 3.1 Colunas (cada imóvel = um `InvestmentResult`)
`Cap rate`, `Cash-on-cash`, `Cashflow mensal`, `ROI`, `IRR`, `Price-to-rent`,
`Gross Rent Multiplier`, `Entrada`, `Prestação`, `Score`.

### 3.2 Comportamento
- Recebe `items: { id, label, result: InvestmentResult }[]` (mín. 2).
- Para cada linha numérica, o maior valor ganha `className="hairline-gold"`
  (ou `borderColor: rgba(212,175,55,.5)`) e um `▲` gold; o menor ganha `▼`
  vermelho. Para `monthlyMortgage`/`priceToRent`/`grossRentMultiplier`
  **menor é melhor** (inverter o highlight).
- Reusa `MetricStat` para o cabeçalho de cada coluna (cap rate, etc.).

```tsx
<InvestCompare
  items={results.map(r => ({ id: r.id, label: r.title, result: r.r }))}
  metricOrder={['capRate','cashOnCash','monthlyCashflow','totalReturnPct','irrPct','priceToRent','grossRentMultiplier']}
/>
```
> Sugestão de implementação: componente isolado em
> `apps/web/src/components/InvestCompare.tsx` (não criado nesta entrega —
> fica como P0 do backlog, reusando `MetricStat` + `InvestmentCard`).

---

## 4. `UnderValuedAlerts` (bairros: score alto + preço estável/baixo)

Lista de bairros onde a **oportunidade é alta** (`rankOpportunities`) **E** o
preço está **estável ou abaixo da mediana da cidade** (trend de
`/market/price-trend` com slope ≈ 0 ou negativo).

### 4.1 Regra de "subvalorizado"
```ts
// score alto (opportunity) + preço não inflacionado
const isUnderValued = (o: OpportunityScore, trend?: PriceTrendPoint[]) =>
  o.score >= 65 &&                       // grade B+ de oportunidade
  appreciationFromTrend(trend) <= 0.02;  // valorização ≤ 2% a.a. (estável/baixa)
```
`OpportunityScore` e `rankOpportunities` já existem em `opportunity.ts`
(doc `07-invest-opportunity.md`). A UI apenas filtra + ordena.

### 4.2 Item da lista
```
[pin] Bairro X            score 82 · B
     cap rate 7.4% · preço estável (0.4% a.a.)   [ver imóveis →]
```
Tom: `emerald` para score alto, `gold` no rótulo "subvalorizado".

```tsx
<UnderValuedAlerts
  ranked={rankOpportunities(statsWithTrendAndHeat)}
  onSelect={(name) => router.push(`/${locale}/map?neighborhood=${name}`)}
/>
```

---

## 5. `RentVsBuyCalculator` (alugar vs comprar+financiar)

Usa `analyze()` para o lado **comprar** e um cálculo de fluxo para o lado
**alugar**. Saída: diferença de patrimônio líquido ao fim de `holdingYears`.

### 5.1 Lado COMPRAR (via `analyze`)
```ts
const buy = analyze({
  price, monthlyRent: 0, downPaymentPct, interestRatePct, loanTermYears,
  annualExpensesPct: 0, vacancyPct: 0, annualAppreciationPct, holdingYears,
  taxRatePct: 15, // IR sobre ganho de capital na venda
});
// Patrimônio líq. do comprador = buy.totalEquityEnd − custos de venda (~6%)
const buyerEquity = buy.totalEquityEnd * 0.94;
```

### 5.2 Lado ALUGAR (fluxo acumulado + rendimento da entrada poupada)
```ts
const monthlySpent = rent * Math.pow(1 + rentInflationPct, year); // aluguel sobe
const savedPerMonth = buy.monthlyMortgage + buy.operatingExpenses - monthlySpent;
// a diferença é investida a `investmentReturnPct` (ex.: 0.10)
const renterEquity = futureValueOfAnnuity(savedPerMonth, investmentReturnPct, holdingYears)
                   + downPaymentInvested; // a entrada também rende
```

### 5.3 Saída
`Δ = buyerEquity − renterEquity` → "Comprar vale R$ X a mais no horizonte"
ou "Alugar + investir ganha por R$ Y". Reusa `MetricStat` para os 3 números:
`Patrimônio ao comprar`, `Patrimônio ao alugar`, `Diferença (Δ)`.

```tsx
<RentVsBuyCalculator
  defaults={{ price: 700_000, rent: 3_200, downPaymentPct: 0.20,
              interestRatePct: 7.0, loanTermYears: 30,
              annualAppreciationPct: 0.05, holdingYears: 5,
              rentInflationPct: 0.06, investmentReturnPct: 0.10 }}
/>
```


---

## 6. Design System & Tokens (como estilizar)

Todos os componentes desta spec seguem o padrão de `Button.tsx`/`StatPill.tsx`:
- `cn()` (clsx + tailwind-merge) de `@landmap/ui` para merge de classes.
- Tokens via **CSS vars** (`--emerald`, `--cyan`, `--violet`, `--gold`,
  `--gold-soft`, `--muted`, `--radius-lg`, glows `--glow-*`).
- **NÃO** depender de utilitários Tailwind que ainda não compilam (v4 pendente):
  usar `.glass`, `.glow-emerald`, `.glow-gold`, `.glow-sovereign`,
  `.hairline-gold` (raw CSS em `globals.css`) **ou** `style={...}` inline com as
  vars acima.
- `motion-reduce:transition-none` e `:focus-visible` com anel gold (já global).
- `aria-*`: `role="list"`/`option` no comparador, `aria-label` na nota A–F,
  `aria-live="polite"` nos KPIs que mudam.

### 6.1 Componente novo reutilizável já entregue
`MetricStat` (`packages/ui/src/components/MetricStat.tsx`, exportado no barrel
`packages/ui/src/index.ts`):
```tsx
<MetricStat
  label="Cap rate"
  value="7.4%"
  numeric={0.074}
  thresholds={[ { min: 0.06, tone: 'emerald' }, { min: 0.04, tone: 'cyan' }, { min: 0, tone: 'neutral' } ]}
  hint="acima da meta 6%"
/>
```
Tom resolvido por `thresholds` contra `numeric`, ou `tone` explícito. Cores
inline por token → renderiza sem Tailwind.

---

## 7. Backlog Priorizado

### P0 — Core do dashboard (tração imediata)
- [ ] `investor/page.tsx` + `usePortfolio()` (localStorage).
- [ ] `InvestmentCard` já existe — plugar no grid de Top Oportunidades.
- [ ] `MetricStat` já existe — KPIs do header.
- [ ] `UnderValuedAlerts` (filtro de `rankOpportunities` + trend).

### P1 — Diferenciação / Moat
- [ ] `InvestCompare` (diff 2+ imóveis, highlight gold da melhor métrica).
- [ ] `RentVsBuyCalculator` (alugar vs comprar usando `analyze()`).
- [ ] Persistência de "cenários" (salvar assumptions por imóvel) + export CSV.

### P2 — Polimento & Growth
- [ ] Toast de "novo alerta de subvalorização" (`useToast` do `@landmap/ui`).
- [ ] Tooltip explicando cada métrica (por que cap rate importa).
- [ ] Badge "Sovereign" para portfólios acima de R$ X.
- [ ] Deep-link `/investor?compare=idA,idB` (compartilhável).

---

## 8. Garantias & Testes

- `analyze()` é **pura e determinística** (doc `06`/`07`) — a UI só consome o
  objeto; zero lógica financeira duplicada na camada de apresentação.
- `InvestmentCard` e `MetricStat` são **presentacionais** (sem estado, sem
  `Date.now`/`Math.random`) → fáceis de testar e de usar em Server ou Client
  components.
- Typecheck: `InvestmentCard` tipa o resultado via `InvestmentResultLike`
  (mirror local de `InvestmentResult` de `@landmap/invest`) — **sem** import do
  pacote, porque `@landmap/web` ainda não o declara como dependência e o
  wildcard `@landmap/*` do tsconfig não o resolve. Ao adicionar `@landmap/invest`
  a `@landmap/web`, basta trocar o mirror pelo `import type` real. `MetricStat`
  é autocontido em `@landmap/ui`.
- Acessibilidade: foco visível (anel gold global), `aria-live` nos KPIs,
  `role=list/option` no comparador, contraste ≥ 4.5:1 nos rótulos.
- Rodar:
  ```bash
  pnpm --filter @landmap/ui typecheck
  pnpm --filter @landmap/web typecheck
  ```

---

## 9. Arquivos Criados (isolados — nenhum existente editado)

| Arquivo | Papel |
| --- | --- |
| `packages/ui/src/components/MetricStat.tsx` | KPI tile com tom por threshold/token |
| `packages/ui/src/index.ts` | + export de `MetricStat` (adiciónico ao barrel) |
| `apps/web/src/components/InvestmentCard.tsx` | Card A–F + cap rate/cashflow/ROI (tipa `InvestmentResult`) |
| `docs/war-room/08-investor-features.md` | Esta spec |

