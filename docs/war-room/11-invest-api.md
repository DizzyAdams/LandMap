# Rotas de Investimento — `/invest/*` (pacote `packages/api`)

> Gerado para documentar `packages/api/src/routes/invest.ts` (agente I6). Engine de
> cálculo em `@landmap/invest` (`analyze`, `estimateMonthlyRent`, `scoreNeighborhood`,
> `rankOpportunities`). Todas as respostas em BRL.

## Mount

Já aplicado em `packages/api/src/index.ts`:

```ts
import { investApp } from './routes/invest.js';
// ...
app.route('/invest', investApp);
```

## `GET /invest/analyze`

Analisa um imóvel a partir de parâmetros de query (strings → números via `z.coerce`).

| Param | Obrigatório | Default | Descrição |
|---|---|---|---|
| `price` | sim | — | Preço de compra (BRL) |
| `monthlyRent` | sim | — | Aluguel mensal de mercado (BRL) |
| `downPaymentPct` | não | `0.2` | Entrada (0..1) |
| `interestRatePct` | não | `7` | Taxa anual do financiamento (%) |
| `loanTermYears` | não | `30` | Prazo (anos) |
| `annualExpensesPct` | não | `0.35` | Despesas operacionais (% renda) |
| `vacancyPct` | não | `0.08` | Vacância (0..1) |
| `annualAppreciationPct` | não | `0.05` | Valorização anual (%) |
| `holdingYears` | não | `5` | Horizonte (anos) |
| `taxRatePct` | não | — | IR sobre ganho de capital (%) |

Retorna `400` se `price`/`monthlyRent` ausentes ou inválidos; senão `analyze()` → `InvestmentResult`.

**Exemplo**
```
GET /invest/analyze?price=500000&monthlyRent=3000&downPaymentPct=0.2&interestRatePct=7&loanTermYears=30&annualExpensesPct=0.35&vacancyPct=0.08&annualAppreciationPct=0.05&holdingYears=5
```
```json
{
  "downPayment": 100000,
  "loanAmount": 400000,
  "monthlyMortgage": 2661.21,
  "grossAnnualRent": 36000,
  "effectiveGrossIncome": 33120,
  "operatingExpenses": 12600,
  "netOperatingIncome": 20520,
  "capRate": 0.04104,
  "cashOnCash": -0.11414,
  "priceToRent": 13.89,
  "grossRentMultiplier": 13.89,
  "monthlyCashflow": -951.21,
  "annualCashflow": -11414.52,
  "remainingLoanBalance": 338596.40,
  "totalEquityEnd": 331403.60,
  "totalReturnPct": 81.07,
  "irrPct": 0.1335,
  "score": 42.8,
  "grade": "D"
}
```

## `GET /invest/opportunities?city=X[&limit=N]`

Filtra `properties.json` por cidade, estima o aluguel (`estimateMonthlyRent(price)`),
roda `analyze()` e ranqueia por `score` desc. `limit` default `10`, máx `50`. `400` se
`city` ausente.

**Exemplo**
```
GET /invest/opportunities?city=Curitiba&limit=5
```
```json
[
  { "id": "12", "title": "...", "city": "Curitiba", "state": "PR", "price": 420000,
    "result": { "capRate": 0.052, "cashOnCash": 0.011, "score": 71.4, "grade": "B", "...": "..." } },
  "..."
]
```

## `POST /invest/score`

Corpo JSON = `InvestmentAssumptions` (ver `packages/invest/src/types.ts`). Retorna
`analyze(body)`. `400` se inválido.

```json
POST /invest/score
{ "price": 500000, "monthlyRent": 3000, "downPaymentPct": 0.2, "interestRatePct": 7,
  "loanTermYears": 30, "annualExpensesPct": 0.35, "vacancyPct": 0.08,
  "annualAppreciationPct": 0.05, "holdingYears": 5 }
```

## Validação

- `packages/api/__tests__/invest.spec.ts` (vitest, 6 testes) cobre 200/400 de cada rota.
- Dep `@landmap/invest` adicionada em `packages/api/package.json`.
- `pnpm --filter @landmap/api typecheck`, `pnpm -r lint` e `pnpm test` estão verdes.

## Próximos passos sugeridos

- Consumir `scoreNeighborhood`/`rankOpportunities` em `/invest/opportunities` para ranquear
  por bairro (ver `07-invest-opportunity.md`).
- Expor `/invest/opportunities` ao agente autônomo `investment_advisor` (ver `10-investment-agent.md`
  e workflow n8n `deal-spotting`).
- Front-end: tela `/investor` + `InvestmentCard`/`MetricStat` (ver `08-investor-features.md`) e
  overlay no mapa (ver `09-invest-map.md`).
