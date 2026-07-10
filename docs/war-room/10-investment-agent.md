# 10 — Agente Autônomo `investment_advisor` (War Room)

> **Autor:** AI Agent Architect — LandMap War Room
> **Data:** 2026 · **Status:** Especificação acionável (agente irmão de I6)
> **Princípio:** Reuse > Rewrite. Segue 100% o padrão de `packages/sales` (Off/Copilot/Autopilot + human-in-the-loop via `SalesTask`). Não edita pacotes centrais.

## 0. TL;DR Executivo

O `investment_advisor` é um agente que **monitora oportunidades de investimento imobiliário** (score de bairro via `@landmap/invest`) e **emite alertas/deals** no mesmo `SalesStore` dos agentes de vendas. Ele:

- Reusa o motor de autonomia existente — `off` / `copilot` / `autopilot` + HITL via `SalesTask`.
- É **apenas mais um item em `AGENTS[]`** — não mexe em `autonomy.ts` nem em `orchestrator.ts`.
- É orquestrado por um **loop contínuo cron/n8n → `POST /sales/cycle`**.
- Coopera com `prospector`/`qualifier`/`closer`/`account_manager` no mesmo store, sem duplicar função.

## 1. Papel

Monitorar oportunidades de investimento (score composto de bairro) e transformá-las em **alertas e deals** acionáveis para o time de vendas / captadores de investidores. O agente "desperta" oportunidades; o funil de vendas existente (qualifier → closer → account_manager) conduz o fechamento e a sincronização com o CRM.

## 2. Ferramentas

| Ferramenta | Origem | Uso no agente |
| --- | --- | --- |
| `analyze()` | `@landmap/invest` | Métricas puras (cap rate, cash-on-cash, etc.) |
| `scoreNeighborhood()` | `@landmap/invest` | `OpportunityScore` (0..100 + nota A..F) por bairro |
| `rankOpportunities()` | `@landmap/invest` | Ranqueia a watchlist por score (decrescente) |
| `estimateMonthlyRent()` | `@landmap/invest` | Aluguel estimado a partir de `avgPrice` (yield 6% padrão) |
| `GET /market/neighborhoods` | `packages/api/.../market.ts` | `NeighborhoodStat` (preço, count → liquidez) |
| `GET /market/price-trend` | `packages/api/.../market.ts` | `PriceTrendPoint[]` → valorização anual |
| `GET /market/heatmap` | `packages/api/.../market.ts` | `HeatmapPoint` → demanda (weight 0..1) |
| Cliente **Twenty** | `@landmap/twenty` | CRM de saída (cria oportunidade/lead quando autorizado) |

> As rotas `/market/*` e o engine `@landmap/invest` compartilham exatamente os mesmos tipos (`NeighborhoodStat`, `PriceTrendPoint`, `HeatmapPoint`) — ver `docs/war-room/07-invest-opportunity.md`.

## 3. Gatilhos

Avaliados **a cada ciclo** (`runCycle`) sobre a watchlist de bairros:

- **Novo imóvel / novo bairro** na watchlist → aumento de `count` (liquidez).
- **Queda de preço** relevante (`avgPrice` abaixo de um piso) → sinal de entrada.
- **Score alto em bairro** → `OpportunityScore.score >= OPPORTUNITY_THRESHOLD` (default **65** = nota B+).

O loop **externo** (cron/n8n) é quem dispara o ciclo; o agente em si só "percebe" o store e a watchlist. O workflow `deal-spotting` (seção 9) funciona como o gatilho de "novo imóvel / score alto" Consumindo `GET /invest/opportunities` (rota criada pelo agente irmão **I6**).

## 4. Níveis de Autonomia (Off / Copilot / Autopilot)

- **Off** — `runCycle` retorna vazio (`autonomy === 'off'` short-circuit). Agente pausado; nada acontece.
- **Copilot** (padrão) — efeitos que mudam estado (`deal`/`task`) viram `SalesTask` **pendente** no Sales Cockpit; o humano aprova/rejeita em `/sales`.
- **Autopilot** — o `deal` é aplicado na hora **e** (opcional) há push direto ao Twenty via `ctx.crm`.

## 5. Critérios de Human-in-the-loop

> **Regra de ouro:** qualquer efeito que muda estado vira `SalesTask` pendente em `copilot`.

- O `kind: 'deal_alert'` carrega `effect: { type: 'deal', deal }`. Em **copilot** a tarefa fica `pending` (não altera o store até aprovação); em **autopilot** é aprovada e aplicada por `applyTaskMutation`.
- `event` (log de transparência) é **sempre** registrado, em qualquer nível de autonomia.
- Push para o Twenty **só em autopilot**; em copilot a sincronização ocorre naturalmente quando o deal atinge `closed_won` (`syncClosedDeals`), ou seja, **após** a aprovação humana de todo o funil.

## 6. Orquestração

- O agente é **apenas mais um item em `AGENTS[]`**, no mesmo `SalesStore` compartilhado por todos.
- **Loop contínuo:** `cron`/`n8n` → `POST /sales/cycle` (rota já existente em `packages/api/src/routes/sales.ts`) → `runCycle` itera `AGENTS` incluindo `investment_advisor`.
- **Cooperação:** o `deal` em `captured` criado pelo advisor entra no funil; `qualifier`/`closer` tratam normalmente; `account_manager` sincroniza com o Twenty no fechamento.
- O workflow n8n **`deal-spotting`** (seção 9) é o disparador externo que consome `GET /invest/opportunities` e notifica via `/sales` ou Twenty — funcionando como gatilho de "novo imóvel / score alto".

## 7. Matriz de Autonomia & HITL (resumida)

| Ação do agente | `off` | `copilot` (padrão) | `autopilot` |
| --- | --- | --- | --- |
| Emitir `event` (log de transparência) | não roda | **logado** | **logado** |
| Criar `deal` de investimento | não roda | `SalesTask` **pendente** (`/sales/approve/:id`) | aplicado na hora |
| Notificar Twenty | não roda | no fechamento (`closed_won` → `syncClosedDeals`) | push direto (`ctx.crm`) |
| Alertar no Cockpit | não roda | `task` `deal_alert` pendente | auto-aprovado |

**Resumo HITL:** todo efeito de mudança de estado é interceptado por `applyEffectsUnderAutonomy` → em `copilot` vira `SalesTask` pendente; o humano decide. Em `autopilot`, o agente atua sozinho (usado só em ambiente controlado/allowlist).

## 8. Registro do agente (padrão exato)

Modelo de código completo em **`docs/war-room/10-investment-agent.snippet.ts`**. Os 3 passos:

1. **Estender o union `AgentRole`** (`packages/sales/src/types.ts`) → adicionar `'investment_advisor'`.
2. **(Opcional) Estender o union `TaskKind`** → adicionar `'deal_alert'` (rótulo da tarefa no cockpit).
3. **Definir** `const investmentAdvisor: AgentDef = { ... }` e adicioná-lo a `AGENTS[]` (e à lista `base` de `createRoster()`).

> Prova de que **não** se mexe em `autonomy.ts`/`orchestrator.ts`: `runCycle` itera o array `AGENTS` genérico e `applyEffectsUnderAutonomy` já trata `event`/`task`/estado para qualquer `AgentDef`. Basta estar no array.

## 9. Workflow n8n — `deal-spotting`

Arquivo: **`docs/war-room/10-investment-agent.n8n.json`**.

**Contrato assumido de `GET /invest/opportunities`** (rota que o agente irmão **I6** criará, espelhando `rankOpportunities`):

```jsonc
GET /invest/opportunities?city=Curitiba
→ {
  "city": "Curitiba",
  "total": 12,
  "items": [
    {
      "stat": { "name": "Batel", "city": "Curitiba", "state": "PR",
                "count": 42, "avgPriceM2": 9100, "avgPrice": 1250000 },
      "score": { "score": 82, "grade": "A", "yieldPct": 6.84,
                 "appreciationPct": 10.2, "liquidityPct": 84,
                 "demandPct": 70, "reasons": ["..."] }
    }
  ]
}
```

**Fluxo do workflow:**
1. `Schedule Trigger` — a cada 30 min.
2. `Buscar Oportunidades` — `HTTP GET /invest/opportunities?city=…`.
3. `Split Out` — um item por oportunidade.
4. `Filtrar Score Alto` — mantém só `score.score >= 65` (nota B+).
5. `Decidir Canal` (`IF`) — `notifyViaTwenty`?
   - **true →** `Criar Oportunidade Twenty` (`HTTP POST /opportunities`) — notifica o CRM.
   - **false →** `Notificar Sales Cockpit` (`HTTP POST /sales/cycle`) — roda o `investment_advisor` no cockpit.
6. `Resumo` — consolidada a saída.

## 10. Riscos & Guardrails

- **LGPD / PII:** os alerts não expõem PII de terceiros; em `copilot` nenhum dado vai ao Twenty sem aprovação humana.
- **Conservadorismo:** `OPPORTUNITY_THRESHOLD = 65`; oportunidades abaixo disso nem viram `task` (reduz ruído de notificação).
- **Determinismo:** usa o engine puro de `@landmap/invest`; não há rede dentro de `run()` (exceto o `ctx.crm` opcional em `autopilot`).
- **Idempotência:** `dealId` estável por `cidade-bairro` → não duplica alerta a cada ciclo.
- **Não fecha sozinho:** o advisor só cria o deal em `captured`; o fechamento (`closed_won`) continua sendo exclusivo de `closer`/`account_manager`.

---

**Próximo passo:** copiar `10-investment-agent.snippet.ts` para `packages/sales/src/agents.ts` + estender os unions em `types.ts`, e importar o JSON em `deal-spotting` no n8n. Sem tocar em `autonomy.ts`/`orchestrator.ts`.

<!--WARROOM_APPEND-->

