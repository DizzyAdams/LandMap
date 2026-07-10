# LandMap — Engine de Métricas de Investimento Imobiliário (War Room #06)

> **Autor:** Engenheiro Financeiro / Quant Sênior — LandMap War Room
> **Data:** 2026 · **Status:** Acionável (pacote isolado `@landmap/invest` criado)
> **Princípio YC:** Tração > PowerPoint · Moat > Features · Velocidade > Perfeição

## 0. TL;DR Executivo

Engine **pura, determinística e testável** (`packages/invest`) que calcula todas as
métricas de investimento imobiliário de um imóvel a partir de **pressupostos
simples** (preço, aluguel, entrada, taxa, prazo, despesas, vacância, valorização e
horizonte). Entrega numa única chamada `analyze()`:

- **Cap rate**, **cash-on-cash**, **price-to-rent**, **GRM**, **NOI**, fluxo de caixa
  mensal/anual;
- **Saldo devedor** (amortização francesa), **patrimônio projetado** e **retorno total (ROI)**;
- **IRR** resolvido por busca binária;
- **Score 0–100** + **nota A–F** para ranqueamento.

Zero dependência de React/Next/IO: usa apenas `Math`, nunca `Date.now()`/`Math.random()`.
100% coberto por testes (`pnpm --filter @landmap/invest test` → 38 verdes). Os próximos
agentes (oportunidade, API de mercado, mapa de calor) consomem `analyze()` diretamente.

## 1. Por que isso importa para o investidor BR

No Brasil, a maioria compara imóveis só pelo **preço do m²** ou pelo **valor do
aluguel** — e esquece juros, IPTU, condomínio, vacância e o peso do financiamento.
Essa engine traduz tudo isso em **números comparáveis** (cap rate, cash-on-cash, IRR)
para o usuário decidir se vale mais **comprar para morar**, **comprar para alugar** ou
**continuar alugando**. É o diferencial de inteligência do LandMap vs. portais tradicionais.

## 2. Tabela de Fórmulas

Notação: `P` = preço · `R` = aluguel mensal · `d` = entrada (fração) ·
`i` = taxa anual (%/100) · `n` = prazo (anos) · `e` = despesas (% renda) ·
`v` = vacância (fração) · `g` = valorização anual (fração) · `h` = horizonte (anos).

| Métrica | Fórmula | Significado para o investidor |
|---|---|---|
| Entrada | `P · d` | Dinheiro que sai do bolso hoje. |
| Financiamento | `P · (1 − d)` | Saldo tomado emprestado. |
| Prestação (PMT) | `S · (i/12)·(1+i/12)^(12n) / ((1+i/12)^(12n) − 1)` (sistema francês; se `i=0`: `S/(12n)`) | Prestação mensal fixa. Base do fluxo de caixa. |
| Renda bruta anual | `R · 12` | Receita de aluguel em 1 ano. |
| Renda efetiva (EGI) | `R·12·(1 − v)` | Receita real descontando meses vazios. |
| Despesas operacionais | `R·12 · e` | IPTU + condomínio + manutenção + seguro + administração. |
| NOI | `EGI − Despesas` | Resultado operacional do imóvel, **antes** do financiamento. |
| Cap rate | `NOI / P` | Retorno operacional sobre o **valor total** do imóvel (indep. de financiamento). |
| Cash-on-cash | `FluxoAnual / Entrada` | Retorno sobre o **dinheiro que você realmente investiu**. |
| Price-to-rent | `P / (R·12)` | Quantos anos de aluguel pagam o imóvel. Menor = melhor eficiência. |
| GRM | `P / (R·12)` | Igual ao price-to-rent (atalho de triagem). |
| Fluxo mensal | `NOI/12 − Prestação` | Sobra (ou furo) de caixa por mês. Negativo = você complementa. |
| Fluxo anual | `Fluxo mensal · 12` | Sobra (ou furo) de caixa por ano. |
| Saldo devedor (após m meses) | `S·[(1+r)^N − (1+r)^m] / [(1+r)^N − 1]`, `r=i/12, N=12n` | O que ainda se deve ao banco no fim do horizonte. |
| Patrimônio final | `P·(1+g)^h − SaldoDevedor` | Seu equity ao vender no ano `h`. |
| Retorno total (ROI %) | `(Fluxo·h + GanhoCapital·(1−IR)) / Entrada · 100` | Rentabilidade total considerando aluguel + valorização líquida de IR. |
| IRR | raiz de `NPV = Σ CF_t/(1+r)^t = 0` via busca binária `[-0.99, 1.0]` | Taxa de retorno anualizada (desconta o tempo do dinheiro). |
| Score (0–100) | `100 · (0.35·cap + 0.30·coc + 0.20·p2r + 0.15·g)`, normalizado e travado | Nota composta para ranqueamento. |
| Nota | `A≥80 · B≥65 · C≥50 · D≥35 · F<35` | Faixa qualitativa do investimento. |

**Pesos do score** (documentados em `metrics.ts`): cap rate 35% · cash-on-cash 30% ·
inverso do price-to-rent 20% · valorização 15%. Benchmarks de normalização ajustados
## 3. Exemplo de uso (TypeScript)

```ts
import { analyze } from '@landmap/invest';

const resultado = analyze({
  price: 500_000,
  monthlyRent: 3_000,
  downPaymentPct: 0.20,        // entrada de R$ 100k
  interestRatePct: 7.0,        // taxa do financiamento
  loanTermYears: 30,
  annualExpensesPct: 0.35,     // IPTU+condomínio+manut+seguro
  vacancyPct: 0.08,            // 8% do tempo vago
  annualAppreciationPct: 0.05, // +5% a.a.
  holdingYears: 5,
});

// => capRate 4,10% | cashOnCash −11,4% | priceToRent 13,9
//    fluxo mensal ≈ −R$ 951 | IRR ≈ 13,35% | ROI ≈ 81% | score 42,8 | nota D
```

> O caso-âncora acima tem **fluxo de caixa negativo** (a prestação engole o aluguel):
> por isso a nota é **D**. É o comportamento esperado — a engine não "maquila" o número.

## 4. Como os próximos agentes consomem `analyze()`

- **Agente de Oportunidade** (`packages/...`): recebe `(price, monthlyRent)` de uma
  listagem e roda `analyze()` com pressupostos padrão do usuário (entrada, taxa, prazo,
  despesas, vacância, valorização, horizonte). Usa `score`/`grade` para **ranquear**
  imóveis e destacar os **A/B**; usa `cashOnCash` e `irrPct` para explicar viabilidade.
- **API de Mercado** (`packages/api/src/routes/market.ts`): expõe `/neighborhoods`,
  `/price-trend` e `/heatmap` (preço médio e aluguel por cidade/bairro). O handler
  faz o join `preço × aluguel` e chama `analyze()` para enriquecer cada ponto do mapa
  com `capRate`, `priceToRent`, `score` e `grade` — sem acoplar lógica financeira na rota.
- **Mapa de Calor**: colore os bairros por `score`/`capRate` (vermelho = nota F, verde =
  nota A), usando exatamente os campos de `InvestmentResult`. Toda a matemática já vem
  pronta e testada do pacote, então a UI só consome o objeto.

```ts
// Exemplo de handler (pseudocódigo, fora deste pacote):
const { avgPrice, avgRent } = await marketRepo.byNeighborhood(city, bairro);
const m = analyze({ ...DEFAULT_ASSUMPTIONS, price: avgPrice, monthlyRent: avgRent });
return { bairro, capRate: m.capRate, score: m.score, grade: m.grade };
```

## 5. Garantias de engenharia

- **Puro & determinístico:** nenhuma chamada a `Date.now()`/`Math.random()`; mesmos
  inputs → mesmos outputs. Reprodutível em testes.
- **Seguro contra divisão por zero:** `capRate`/`priceToRent`/`cashOnCash` retornam `0`
  quando o denominador é `0`.
- **IRR robusto:** busca binária entre `−0.99` e `1.0`, tolerância `1e-6`, máx 200
  iterações; retorna `0` se não houver raiz no intervalo (fluxos todos do mesmo sinal).
- **Score travado em `[0, 100]`** e nota sempre em `A|B|C|D|F`.
- **Cobertura:** 38 testes vitest (caso-âncora + extremos: entrada 100%, taxa 0%,
  horizonte 1 ano, P/R alto/baixo, IRR conhecido, notas A/F). `typecheck` e `test` limpos.

## 6. Scripts

```bash
pnpm --filter @landmap/invest typecheck   # tsc --noEmit (0 erros)
pnpm --filter @landmap/invest test        # vitest run (38 verdes)
```

Pacote isolado: `package.json` (sem runtime deps), `tsconfig.json` (strict, ES2020,
Bundler), `vitest.config.ts` (env node) e `src/{types,metrics,index}.ts` + `metrics.spec.ts`.
Nada de arquivos centrais do repo foi editado.

ao mercado BR: cap rate ~7%, cash-on-cash mapeado de −10%…+12%, price-to-rent ótimo 8
(pior 22), valorização ~7%.
