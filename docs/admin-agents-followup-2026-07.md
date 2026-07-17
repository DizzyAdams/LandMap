# Admin — time de agentes & follow-ups (2026-07)

**Rota:** `/[locale]/admin/agents` (somente admin; sidebar Admin).

## Time (14 agentes em standby)

| Role | Nome | Papel |
|---|---|---|
| prospector | Caçadora | Novos leads |
| qualifier | Qualificadora | Score / tier |
| outreacher | Outbound | 1º contato |
| **followup** | **Follow-up** | **Cadência D+1 / D+3 / D+7** |
| **cold_recovery** | **Resgate frio** | **Leads cold sem engajamento** |
| **waba_followup** | **WhatsApp WABA** | **Templates curtos só WhatsApp** |
| closer | Fechadora | Visita → proposta |
| account_manager | Sucesso | Pós-venda |
| forecaster | Previsora | Pipeline |
| seo_agent | SEOria | Topo de funil |
| lead_enricher | Enriquecedora | Enrich HITL |
| market_intel | Analista | Alertas mercado |
| onboarding | Recepcionista | Novos users |
| negotiator | Negociadora | Contraproposta |

**Squad FU** (tick / auto-loop): `followup` + `cold_recovery` + `waba_followup`.

Status: `idle` = **em espera na fila** · `running` · `paused` (autonomia off).

## Auto-loop (admin UI)

- Toggle **Auto-loop ON** na página (persiste `localStorage`)
- Intervalo 20–120s → `POST /sales/tick` (`mode: followup`)
- Countdown “próximo tick em Xs”; time fica **em espera** entre ticks
- Autonomia `off` bloqueia ticks

## Autonomia

- **off** — time inteiro standby, ciclos no-op  
- **copilot** — gera tasks; admin aprova/rejeita  
- **autopilot** — aplica efeitos no ciclo  

## API (via `/api/sales/*`)

| Method | Path | Uso |
|---|---|---|
| GET | `/sales/state` | Estado + meta (standby, follow-ups) |
| GET | `/sales/agents` | Roster |
| GET | `/sales/followups` | Fila follow-up enriquecida |
| POST | `/sales/cycle` | Ciclo do time inteiro |
| POST | `/sales/followups/run` | Squad follow-up (3 agentes) |
| POST | `/sales/tick` | Heartbeat auto-loop (`mode: followup\|full`) |
| POST | `/sales/autonomy` | `{ level }` |
| POST | `/sales/approve/:id` | Aprovar task |
| POST | `/sales/reject/:id` | Rejeitar |
| POST | `/sales/approve-all-followups` | Bulk approve |

Motor: `@landmap/sales` · proxy Next: `@landmap/api/platform`.

## Alertas de due

- `GET /sales/alerts/due` — follow-ups **overdue** e **due_soon** (&lt;24h)
- Seed inclui 1 overdue + 1 due soon para demo
- Overdue emite `alert.fired` (webhook) uma vez por task
- UI: painel “Alertas de due” no cockpit admin

## CRM real

- **Ledger LandMap** (sempre): leads/deals/syncs em memória de processo
- **Twenty** (live) se `TWENTY_BASE_URL` + `TWENTY_API_KEY`
- `GET /sales/crm` · `POST /sales/crm/sync`
- Aprovar follow-up sincroniza lead/deal no CRM
- Modo exposto em `meta.crm.mode`: `live` | `ledger`
