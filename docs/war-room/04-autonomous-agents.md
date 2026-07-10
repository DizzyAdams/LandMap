# LandMap — Agentes Autônomos & Growth Automation (War Room #04)

> **Autor:** AI Agent Architect — LandMap War Room
> **Data:** 2026 · **Status:** Especificação acionável (proposta de extensão)
> **Princípio:** Reuse > Rewrite. Todo novo agente segue o padrão de `packages/sales` (Off/Copilot/Autopilot + human-in-the-loop via `SalesTask`).

## 0. TL;DR Executivo

O `packages/sales` já roda um **esquadrão de 6 agentes** (`prospector`, `qualifier`, `outreacher`, `closer`, `account_manager`, `forecaster`) sobre um **único `SalesStore`** (fonte de verdade), com 3 níveis de autonomia (`off` / `copilot` / `autopilot`) e escalação humana via tarefas pendentes (`/sales/approve/:id`, `/sales/reject/:id`).

Esta spec **estende** esse motor com **5 novos agentes autônomos de growth**, todos plugáveis no mesmo `runCycle()` + `applyEffectsUnderAutonomy()`:

| # | Agente | Papel | Ferramenta-âncora |
|---|--------|-------|-------------------|
| 1 | `seo_agent` | Gera landing pages + schema.org (FAQ/HowTo/PropertyListing) | `@landmap/seo` + `CopywriterAgent` |
| 2 | `lead_enricher` | Enriquece leads (validação, match de imóvel, score) | `LeadScorerAgent` + `PropertyMatcherAgent` |
| 3 | `market_intel` | Monitora preços/bairros e emite alertas | `MarketAnalyzerAgent` + `SimplePricePredictor` |
| 4 | `onboarding` | Recebe novos usuários (conta, boas-vindas, 1ª busca) | `TwentyClient` + `@landmap/gamification` |
| 5 | `negotiator` | Assistente de compra/venda (contraproposta, financiamento) | `SimplePricePredictor` + `computeMarketKpis` |

**Moat de automação:** uma única política de autonomia governa vendas **e** growth; o humano só é incomodado nos pontos de risco (publicar página, enviar PII, contraproposta financeira). Loop contínuo orquestrado por **cron/n8n → `POST /sales/cycle`**.

---

## 1. Padrão existente (recapitulado — para não quebrar nada)

O motor de agentes em `packages/sales/src` é:

- **`types.ts`** — `AutonomyLevel`, `AgentRole`, `SalesAgent`, `SalesTask`, `SalesEffect`, `AgentContext`, `SalesStore`.
- **`agents.ts`** — `interface AgentDef { id; role; name; description; run(ctx, store): SalesEffect[] }`, `createRoster()` e `AGENTS: AgentDef[]`.
- **`autonomy.ts`** — `applyEffectsUnderAutonomy(store, effects, ctx)`: a **política HITL central**.
  - `off` → nada é aplicado.
  - `autopilot` → todo `effect`/task aplicado imediatamente.
  - `copilot` → efeitos que mudam estado viram `SalesTask` com `status:'pending'` (kind `review`) + eventos sempre logados.
- **`orchestrator.ts`** — `runCycle(store, ctx)`: itera `AGENTS` em ordem, marca `status:'running'/'idle'`, aplica efeitos sob a autonomia, recalcula analytics, sincroniza CRM.
- **`store.ts`** — `SalesStore` (single source of truth, compartilhado por todos os agentes).

> **Regra de ouro desta spec:** os 5 novos agentes são apenas **novos itens em `AGENTS`** + extensões opcionais nos unions `AgentRole` / `TaskKind`. Não tocamos em `autonomy.ts` nem em `orchestrator.ts` — a política HITL já é genérica e serve a todos.

## 2. Novos Agentes — Spec por agente

Cada agente abaixo descreve: **Papel**, **Ferramentas**, **Gatilhos**, **Autonomia (Off/Copilot/Autopilot)** e **Critérios de human-in-the-loop**.

### 2.1 `seo_agent` — "SEOria" (Conteúdo & Schema)

- **Papel:** Produzir conteúdo que atrai tráfego orgânico e alimenta o topo de funil: landing pages por bairro/interesse, FAQ schema, HowTo ("como comprar imóvel com FGTS") e `PropertyListingPage` para imóveis em destaque. Lê o catálogo e emite rascunhos prontos para publicar.
- **Ferramentas:**
  - `buildPropertyListingPageSchema`, `buildFaqPageSchema`, `buildHowToSchema`, `buildBreadcrumbSchema` (`@landmap/seo`).
  - `CopywriterAgent` (`@landmap/llm`) para gerar MDX/HTML das landings.
  - `computeMarketKpis` para embutir dados reais (preço/m² por bairro) no texto.
  - FS/MDX writer (apps/web `content/`) + `sitemap` dinâmico.
- **Gatilhos:**
  - Evento `prospect` (novo imóvel relevante ingerido).
  - Cron semanal (gera landings sazonais/FAQ).
  - `closed_won` (case study de bairro).
- **Autonomia:**
  - `off` → silencioso.
  - `copilot` → gera rascunho + schema e cria `SalesTask{kind:'seo_publish', status:'pending'}` para revisão humana antes de escrever no FS.
  - `autopilot` → escreve o arquivo de landing e injeta schema automaticamente; ainda loga evento `info`.
- **Human-in-the-loop (critérios):**
  - **Sempre pede aprovação (Copilot)** para: (a) criar **nova rota/arquivo** de landing; (b) publicar em `/pt-BR` produção; (c) sobrescrever landing existente.
  - **Nunca** auto-deleta conteúdo nem altera `sitemap` em `autopilot` sem task — protege SEO.
  - Conteúdo gerado por LLM sempre passa por `review` task (controle de alucinação/factualidade).

### 2.2 `lead_enricher` — "Enriquecedora"

- **Papel:** Pegar leads capturados (`source`, nome, interesse) e enriquecer com dados úteis ao qualificador: validação de e-mail, possível empresa/região, match de imóveis (`PropertyMatcherAgent`) e re-score (`LeadScorerAgent`).
- **Ferramentas:**
  - `LeadScorerAgent`, `PropertyMatcherAgent` (`@landmap/llm`).
  - `TwentyClient` (já sabe se o lead existe no CRM).
  - Adaptadores externos opcionais (validador de e-mail, CEP/região) — marcados como `external`.
- **Gatilhos:**
  - Lead recém-criado (`score === undefined` → candidato a enriquecer).
  - Cron noturno (reprocessa leads `tier === 'cold'` que não avançaram).
- **Autonomia:**
  - `off` → não toca em PII.
  - `copilot` → aplica só `updateLead` com confiança alta; enriquecimento **externo/PII** vira `SalesTask{kind:'enrich', status:'pending'}`.
  - `autopilot` → aplica patches localmente; chamadas externas ainda respeitam allowlist de provedores.
- **Human-in-the-loop (critérios):**
  - Qualquer **chamada a API externa com PII** (e-mail/telefone de terceiro) exige `review` task — compliance LGPD.
  - Se o match de imóvel sugerir `probability` de compra > 0.8, vira `task` para o `qualifier` promover a `hot`.
  - Falha de validação de e-mail → apenas marca `signal`, nunca descarta o lead sozinho.

### 2.3 `market_intel` — "Analista de Mercado"

- **Papel:** Vigiar o mercado e gerar sinais acionáveis: queda de preço em bairro-alvo, novos lançamentos, desvio de preço/m² vs. média (`SimplePricePredictor`), e disparar **alertas** para usuários e para o `prospector`.
- **Ferramentas:**
  - `MarketAnalyzerAgent`, `SimplePricePredictor` (`@landmap/llm`).
  - Endpoints `/cities`, `/stats` e `PriceHistory` (`@landmap/db`).
  - `buildAnswerBoxSchema` (`@landmap/seo`) para destacar resposta em busca.
- **Gatilhos:**
  - Cron diário (varredura de preços/bairros).
  - Webhook de ingestão (`landmap-ingest`) quando lote grande entra.
- **Autonomia:**
  - `off` → silencioso.
  - `copilot` → cria `SalesTask{kind:'alert', status:'pending'}` + evento; só notifica usuário após aprovação.
  - `autopilot` → dispara alerta direto (e-mail/push) e injeta `signal` no lead/imóvel.
- **Human-in-the-loop (critérios):**
  - Alerta de **alto impacto** (variação > 10% ou bairro com > 20 imóveis) sempre vira `review` task — evita spam de notificação.
  - Nunca envia mensagem comercial sem opt-in; alertas usam apenas canal que o usuário já autorizou.
  - Previsão de preço (`SimplePricePredictor`) é rótulo `estimativa` — nunca apresentada como fato em `autopilot`.


### 2.4 `onboarding` — "Recepcionista"

- **Papel:** Receber novos usuários: criar pessoa no Twenty, enviar boas-vindas, sugerir 1ª busca guiada (baseada em cidade/interesse), gerar código de referral e creditar XP inicial (`@landmap/gamification`).
- **Ferramentas:**
  - `TwentyClient.syncLead` / criação de `TwentyPerson`.
  - `@landmap/gamification` (XP/nível inicial, badge "Bem-vindo").
  - `CopywriterAgent` para e-mail de boas-vindas personalizado.
- **Gatilhos:**
  - Evento `signup` (webhook de auth).
  - Lead vindo de campanha/indicação.
- **Autonomia:**
  - `off` → não cria conta nem envia e-mail.
  - `copilot` → prepara e-mail + cria `SalesTask{kind:'onboard', status:'pending'}`; conta no Twenty pode ser criada (baixo risco) mas o **envio de e-mail** exige aprovação.
  - `autopilot` → cria conta, envia boas-vindas e credita XP sozinho; loga evento `success`.
- **Human-in-the-loop (critérios):**
  - **Baixo risco** → onboarding em si raramente trava o humano.
  - Único gatilho HITL: envio de **e-mail externo** (PII) em `copilot` vira `review`.
  - Nunca debita cashback nem sobe plano sem task explícita.

### 2.5 `negotiator` — "Negociadora"

- **Papel:** Assistente de compra/venda durante `negotiation`: sugere contraproposta baseada em `SimplePricePredictor` + `computeMarketKpis`, simula financiamento/FGTS e embute regra de cashback. Prepara a proposta, mas **não assina**.
- **Ferramentas:**
  - `SimplePricePredictor`, `computeMarketKpis` (`@landmap/llm`).
  - Regras de cashback/take-rate (ver `docs/war-room/00-billing-types.ts`).
  - `CopywriterAgent` para redigir proposta 1:1.
- **Gatilhos:**
  - Deal em `stage === 'negotiation'` (ou evento `stage` vindo do `closer`).
  - Queda de preço no imóvel alvo (sinal do `market_intel`).
- **Autonomia:**
  - `off` → não emite proposta.
  - `copilot` → monta proposta + simulação e cria `SalesTask{kind:'negotiate', status:'pending'}`; só envia após aprovação humana.
  - `autopilot` → envia proposta e atualiza deal (`advanceTo` mantém `negotiation`); **fechamento (`closed_won`) continua sendo do `closer`**.
- **Human-in-the-loop (critérios):**
  - **Toda contraproposta concreta / proposta financeira** exige `review` em `copilot`.
  - **Nunca** auto-aplica `closed_won` (isso é do `closer`/`account_manager`).
  - Valores de cashback são **sugestão**; confirmação de cartório é sempre humana.

---

## 3. Matriz de Autonomia & HITL (resumo)

| Agente | `off` | `copilot` (pendente p/ humano) | `autopilot` (auto) | Gatilho HITL obrigatório |
|--------|-------|-------------------------------|--------------------|--------------------------|
| `seo_agent` | silencioso | publicar landing nova / sobrescrever | escreve + schema | criar rota, publicar, sobrescrever |
| `lead_enricher` | silencioso | PII externa / promover a hot | patch local + allowlist | chamada externa com PII |
| `market_intel` | silencioso | alerta alto impacto / notificar | alerta + sinal | variação > 10%, bairro grande |
| `onboarding` | silencioso | enviar e-mail externo | conta + e-mail + XP | envio de e-mail (PII) |
| `negotiator` | silencioso | contraproposta / proposta | envia proposta | proposta financeira; **nunca** fecha |

**Invariante:** em `copilot`, qualquer `effect` que mute estado (lead/deal/update*/publicação) vira `SalesTask` pendente; em `autopilot`, aplica e loga `event`. A política já existe em `applyEffectsUnderAutonomy` — só reaproveitamos.


## 4. Orquestração — Memória compartilhada & Loop contínuo

### 4.1 Shared memory / state

Todos os 11 agentes (6 originais + 5 novos) leem/escrevem o **mesmo `SalesStore`**. Não há memória separada: o `store` é a "shared memory" do esquadrão.

```
┌─────────────────────────── SalesStore (fonte de verdade) ───────────────────────────┐
│ agents[] · leads[] · deals[] · tasks[] (pending=pilha HITL) · events[] · analytics[]  │
└───────────▲──────────────────────────────────────────────────────────────────────────┘
            │ lê/escreve via SalesEffect
   ┌────────┴───────────────────────────────────────────────────────────┐
   │ prospector → qualifier → outreacher → closer → account_manager → forecaster   │
   │ seo_agent · lead_enricher · market_intel · onboarding · negotiator            │
   └─────────────────────────────────────────────────────────────────────┘
                         │                       │
                    CRM Twenty (sync)      n8n cron → POST /sales/cycle
```

**Fluxos de cooperação (cross-agent):**
- `onboarding` cria `Lead` → `prospector` já não duplica; `qualifier` pontua.
- `lead_enricher` enche `signals`/`score` → `qualifier` promove a `hot` mais cedo.
- `market_intel` injeta `signal` ("queda de preço 8%") no `Lead` → `prospector`/`closer` reagem.
- `seo_agent` gera tráfego → novos `Lead` entram via ingestão → loop se fecha.
- `negotiator` prepara proposta no deal do `closer` → `closer` fecha → `account_manager` faz handoff + `syncClosedDeals` → Twenty.

### 4.2 Loop contínuo (cron / n8n)

`runCycle()` é idempotente e determinístico (usa `ctx.rng` mulberry32). O loop é:

1. **Cron n8n** (ex.: a cada 15–30 min, ou por webhook de evento) → `HTTP Request POST /sales/cycle` com `{ "autonomy": "copilot" }`.
2. `runCycle` itera `AGENTS` → emite `SalesEffect[]` → `applyEffectsUnderAutonomy` cria tarefas pendentes ou aplica.
3. **Cockpit** (`/sales`) mostra `tasks[]` pendentes; humano aprova/rejeita (`/sales/approve/:id`, `/sales/reject/:id`).
4. Workflow **landmap-notify** avisa o humano (Slack/WhatsApp/e-mail) que há tarefas a aprovar.
5. `autopilot` (planos Pro/Enterprise) pula o passo 3–4 e aplica direto.

```
cron ─▶ POST /sales/cycle {autonomy} ─▶ runCycle(AGENTS) ─▶ tasks[] pending
                                                     │
                                  copilot ─▶ Cockpit aprova/rejeita ─▶ notify
                                  autopilot ─▶ aplica + event
```

---

## 5. Workflows n8n (`.n8n/workflows/`)

> Todos os JSONs abaixo seguem o **mesmo formato** dos existentes (`landmap-ingest.json`, `landmap-sync-twenty.json`): `nodes[].parameters`, `connections`, `settings.executionOrder:"v1"`, `tags`. Basta salvar como `.json` em `.n8n/workflows/` e importar no n8n.

### 5.1 Ingestão de imóveis — `landmap-ingest-properties.json`

Webhook → valida → grava no catálogo (API) → indexa no RAG (`@landmap/llm`) → dispara ciclo de agentes.

```json
{
  "name": "LandMap Ingest Properties",
  "nodes": [
    {
      "parameters": { "httpMethod": "POST", "path": "landmap-ingest-property", "responseMode": "lastNode", "options": {} },
      "id": "webhook", "name": "Webhook", "type": "n8n-nodes-base.webhook", "position": [250, 300]
    },
    {
      "parameters": {
        "jsCode": "const b = $input.first().json.body || {};\nif (!b || !b.address) throw new Error('body.address é obrigatório');\nconst rec = { source: b.source || 'ingest', rawData: b, ingestedAt: new Date().toISOString(), status: 'pending' };\nreturn [{ json: rec }];"
      },
      "id": "validate", "name": "Validate & Transform", "type": "n8n-nodes-base.code", "position": [450, 300]
    },
    {
      "parameters": {
        "url": "http://host.docker.internal:4000/properties",
        "method": "POST",
        "sendBody": true, "specifyBody": "json", "jsonBody": "={{ $json.rawData }}"
      },
      "id": "api", "name": "Create Property (API)", "type": "n8n-nodes-base.httpRequest", "position": [650, 300]
    },
    {
      "parameters": { "command": "cd /workspace/LandMap && python3 scripts/ingest.py", "shell": "sh" },
      "id": "rag", "name": "Index in RAG (llm)", "type": "n8n-nodes-base.executeCommand", "position": [850, 300]
    },
    {
      "parameters": {
        "url": "http://host.docker.internal:4000/sales/cycle",
        "method": "POST", "sendBody": true, "specifyBody": "json", "jsonBody": { "autonomy": "copilot" }
      },
      "id": "cycle", "name": "Run Sales Cycle", "type": "n8n-nodes-base.httpRequest", "position": [1050, 300]
    },
    {
      "parameters": { "content": "={{ JSON.stringify($json) }}" },
      "id": "respond", "name": "Respond to Webhook", "type": "n8n-nodes-base.respondToWebhook", "position": [1250, 220]
    }
  ],
  "connections": {
    "Webhook": { "main": [["Validate & Transform"]] },
    "Validate & Transform": { "main": [["Create Property (API)"]] },
    "Create Property (API)": { "main": [["Index in RAG (llm)"]] },
    "Index in RAG (llm)": { "main": [["Run Sales Cycle"]] },
    "Run Sales Cycle": { "main": [["Respond to Webhook"]] }
  },
  "pinData": {}, "settings": { "executionOrder": "v1" }, "staticData": null, "tags": ["ingestion", "properties"], "triggerCount": 0
}
```


### 5.2 Enriquecimento de leads — `landmap-enrich-leads.json`

Cron noturno → lista leads do Twenty sem score → `LeadScorerAgent`/`PropertyMatcherAgent` (via API `/analyze`) → upsert no Twenty → cria task de revisão se PII externa.

```json
{
  "name": "LandMap Enrich Leads",
  "nodes": [
    {
      "parameters": { "rule": { "interval": [ { "field": "hours", "hoursInterval": 1 } ] } },
      "id": "cron", "name": "Cron (1h)", "type": "n8n-nodes-base.cron", "typeVersion": 1, "position": [250, 300]
    },
    {
      "parameters": { "url": "http://host.docker.internal:4000/sales/state", "method": "GET" },
      "id": "state", "name": "Get Sales State", "type": "n8n-nodes-base.httpRequest", "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": { "string": [ { "value1": "={{ $json.score }}", "value2": "", "operation": "empty" } ] }
      },
      "id": "filter", "name": "Filter Unenriched", "type": "n8n-nodes-base.if", "position": [650, 300]
    },
    {
      "parameters": {
        "url": "http://host.docker.internal:4000/analyze",
        "method": "POST", "sendBody": true, "specifyBody": "json", "jsonBody": "={{ { lead: $json } }}"
      },
      "id": "analyze", "name": "Enrich (llm agents)", "type": "n8n-nodes-base.httpRequest", "position": [850, 220]
    },
    {
      "parameters": {
        "jsCode": "const l = $input.first().json;\nreturn [{ json: { id: l.id, score: l.score, tier: l.tier, signals: l.signals } }];"
      },
      "id": "patch", "name": "Build Patch", "type": "n8n-nodes-base.code", "position": [1050, 220]
    },
    {
      "parameters": {
        "url": "http://host.docker.internal:4000/sales/cycle",
        "method": "POST", "sendBody": true, "specifyBody": "json", "jsonBody": { "autonomy": "copilot" }
      },
      "id": "cycle", "name": "Run Cycle (creates review task)", "type": "n8n-nodes-base.httpRequest", "position": [1250, 220]
    }
  ],
  "connections": {
    "Cron (1h)": { "main": [["Get Sales State"]] },
    "Get Sales State": { "main": [["Filter Unenriched"]] },
    "Filter Unenriched": { "main": [["Enrich (llm agents)"], []] },
    "Enrich (llm agents)": { "main": [["Build Patch"]] },
    "Build Patch": { "main": [["Run Cycle (creates review task)"]] }
  },
  "pinData": {}, "settings": { "executionOrder": "v1" }, "staticData": null, "tags": ["enrichment", "leads"], "triggerCount": 0
}
```

### 5.3 Publicação de conteúdo SEO — `landmap-seo-publish.json`

Cron semanal → pega imóveis em destaque (`/stats`) → `CopywriterAgent` + `buildPropertyListingPageSchema` → escreve rascunho de landing → ciclo cria `task{kind:'seo_publish'}` (Copilot) para aprovação.

```json
{
  "name": "LandMap SEO Publish",
  "nodes": [
    {
      "parameters": { "rule": { "interval": [ { "field": "days", "daysInterval": 7 } ] } },
      "id": "cron", "name": "Cron (7d)", "type": "n8n-nodes-base.cron", "typeVersion": 1, "position": [250, 300]
    },
    {
      "parameters": { "url": "http://host.docker.internal:4000/stats", "method": "GET" },
      "id": "stats", "name": "Get Top Properties", "type": "n8n-nodes-base.httpRequest", "position": [450, 300]
    },
    {
      "parameters": {
        "url": "http://host.docker.internal:4000/seo/generate",
        "method": "POST", "sendBody": true, "specifyBody": "json",
        "jsonBody": "={{ { property: $json, types: ['PropertyListingPage','FAQPage','HowTo'] } }}"
      },
      "id": "gen", "name": "Generate Copy + Schema (seo+llm)", "type": "n8n-nodes-base.httpRequest", "position": [650, 300]
    },
    {
      "parameters": {
        "command": "mkdir -p /data/landmap/landings && echo '{{ $json.schema }}' > /data/landmap/landings/{{ $json.slug }}.json",
        "shell": "sh"
      },
      "id": "write", "name": "Write Landing Draft", "type": "n8n-nodes-base.executeCommand", "position": [850, 300]
    },
    {
      "parameters": {
        "url": "http://host.docker.internal:4000/sales/cycle",
        "method": "POST", "sendBody": true, "specifyBody": "json", "jsonBody": { "autonomy": "copilot" }
      },
      "id": "cycle", "name": "Run Cycle (SEO review task)", "type": "n8n-nodes-base.httpRequest", "position": [1050, 300]
    }
  ],
  "connections": {
    "Cron (7d)": { "main": [["Get Top Properties"]] },
    "Get Top Properties": { "main": [["Generate Copy + Schema (seo+llm)"]] },
    "Generate Copy + Schema (seo+llm)": { "main": [["Write Landing Draft"]] },
    "Write Landing Draft": { "main": [["Run Cycle (SEO review task)"]] }
  },
  "pinData": {}, "settings": { "executionOrder": "v1" }, "staticData": null, "tags": ["seo", "content"], "triggerCount": 0
}
```


### 5.4 Sync Twenty (estendido) — `landmap-sync-twenty.json`

Baseado no existente, adiciona push de `closed_won` como `TwentyOpportunity` + pessoas de `onboarding`. Mantém o `executeCommand` para `scripts/twenty_sync.py`.

```json
{
  "name": "LandMap Sync Twenty",
  "nodes": [
    {
      "parameters": { "rule": { "interval": 15 } },
      "id": "cron", "name": "Cron (15 min)", "type": "n8n-nodes-base.cron", "typeVersion": 1, "position": [250, 300]
    },
    {
      "parameters": { "command": "cd /workspace/LandMap && python3 scripts/twenty_sync.py", "shell": "sh" },
      "id": "sync", "name": "Run twenty_sync", "type": "n8n-nodes-base.executeCommand", "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": { "number": [ { "value1": "={{ $json.exitCode }}", "value2": 0, "operation": "equal" } ] }
      },
      "id": "check", "name": "Check Exit Code", "type": "n8n-nodes-base.if", "position": [650, 300]
    },
    {
      "parameters": { "url": "http://host.docker.internal:4000/sales/cycle", "method": "POST", "sendBody": true, "specifyBody": "json", "jsonBody": { "autonomy": "copilot" } },
      "id": "cycle", "name": "Push Closed Won → CRM", "type": "n8n-nodes-base.httpRequest", "position": [850, 220]
    },
    {
      "parameters": { "content": "={{ $json.stdout }}" },
      "id": "ok", "name": "Log Success", "type": "n8n-nodes-base.noOp", "position": [1050, 220]
    },
    {
      "parameters": { "content": "={{ $json.stderr || $json.stdout }}" },
      "id": "fail", "name": "Log Failure", "type": "n8n-nodes-base.noOp", "position": [1050, 400]
    }
  ],
  "connections": {
    "Cron (15 min)": { "main": [["Run twenty_sync"]] },
    "Run twenty_sync": { "main": [["Check Exit Code"]] },
    "Check Exit Code": { "main": [["Push Closed Won → CRM"], ["Log Failure"]] },
    "Push Closed Won → CRM": { "main": [["Log Success"]] }
  },
  "pinData": {}, "settings": { "executionOrder": "v1" }, "staticData": null, "tags": ["sync", "twenty"], "triggerCount": 0
}
```

### 5.5 Notificações — `landmap-notify.json`

Cron 30 min → lê `tasks[]` pendentes + alertas → formata → envia ao humano (Slack/WhatsApp/e-mail). É o "despertador" do modo Copilot.

```json
{
  "name": "LandMap Notify",
  "nodes": [
    {
      "parameters": { "rule": { "interval": [ { "field": "minutes", "minutesInterval": 30 } ] } },
      "id": "cron", "name": "Cron (30m)", "type": "n8n-nodes-base.cron", "typeVersion": 1, "position": [250, 300]
    },
    {
      "parameters": { "url": "http://host.docker.internal:4000/sales/state", "method": "GET" },
      "id": "state", "name": "Get Sales State", "type": "n8n-nodes-base.httpRequest", "position": [450, 300]
    },
    {
      "parameters": {
        "conditions": { "number": [ { "value1": "={{ $json.tasks.filter(t => t.status === 'pending').length }}", "value2": 0, "operation": "gt" } ] }
      },
      "id": "has", "name": "Has Pending?", "type": "n8n-nodes-base.if", "position": [650, 300]
    },
    {
      "parameters": {
        "jsCode": "const s = $input.first().json;\nconst pending = s.tasks.filter(t => t.status === 'pending');\nconst lines = pending.map(t => `• [${t.kind}] ${t.title}`).join('\\n');\nreturn [{ json: { text: `LandMap: ${pending.length} tarefa(s) p/ aprovar no Cockpit:\\n${lines}\\nAcesse /sales` } }];"
      },
      "id": "fmt", "name": "Format Message", "type": "n8n-nodes-base.code", "position": [850, 220]
    },
    {
      "parameters": {
        "url": "https://hooks.slack.com/services/REPLACE/ME",
        "method": "POST", "sendBody": true, "specifyBody": "json",
        "jsonBody": "={{ { text: $json.text } }}"
      },
      "id": "slack", "name": "Send Slack", "type": "n8n-nodes-base.httpRequest", "position": [1050, 220]
    }
  ],
  "connections": {
    "Cron (30m)": { "main": [["Get Sales State"]] },
    "Get Sales State": { "main": [["Has Pending?"]] },
    "Has Pending?": { "main": [["Format Message"], []] },
    "Format Message": { "main": [["Send Slack"]] }
  },
  "pinData": {}, "settings": { "executionOrder": "v1" }, "staticData": null, "tags": ["notify", "hitl"], "triggerCount": 0
}
```


## 6. Modelo de código — Como registrar um novo agente em `packages/sales`

> **Aviso:** o trecho abaixo é **ilustrativo (spec)**. Por regra do War Room, **não editamos arquivos centrais** — ele documenta o ponto de extensão exato. Para implementar, basta aplicar esses 4 toques e o agente entra no `runCycle()` automaticamente.

### 6.1 Estender os unions (`types.ts`)

```ts
// packages/sales/src/types.ts  — ADIÇÕES (não remover o existente)
export type AgentRole =
  | 'prospector' | 'qualifier' | 'outreacher' | 'closer'
  | 'account_manager' | 'forecaster'
  | 'seo_agent' | 'lead_enricher' | 'market_intel' | 'onboarding' | 'negotiator';

export type TaskKind =
  | 'outreach' | 'follow_up' | 'schedule' | 'proposal'
  | 'handoff' | 'review' | 'forecast'
  | 'seo_publish' | 'enrich' | 'alert' | 'onboard' | 'negotiate';
```

### 6.2 Definir o agente (`agents.ts`) — modelo `seo_agent`

O formato é idêntico aos 6 originais: `AgentDef` com `run(ctx, store): SalesEffect[]`. O agente **não** decide HITL — ele só emite efeitos; `applyEffectsUnderAutonomy` converte em tarefa pendente quando `copilot`.

```ts
// packages/sales/src/agents.ts
import { buildPropertyListingPageSchema, buildFaqPageSchema } from '@landmap/seo';
import { CopywriterAgent } from '@landmap/llm';
// ... imports existentes (SalesEffect, AgentEvent, uid, pick, clamp)

/* ─── SEO Agent (conteúdo + schema) ─── */
export const seoAgent: AgentDef = {
  id: 'agent-seo_agent',
  role: 'seo_agent',
  name: 'SEOria',
  description: 'Gera landing pages + schema.org (FAQ/HowTo/PropertyListing) para o topo de funil.',
  run(ctx, store) {
    const effects: SalesEffect[] = [];
    // 1 imóvel em destaque por ciclo (ex.: maior valor aberto)
    const featured = [...store.deals]
      .sort((a, b) => b.amount - a.amount)[0];
    if (!featured) return effects;

    // Gera conteúdo + schema (LLM + @landmap/seo). Em Copilot vira task de revisão.
    const lead = store.getLead(featured.leadId);
    const copy = ctx.compose
      ? ctx.compose(`Escreva landing SEO pt-BR p/ ${featured.title}`)
      : `Landing gerada para ${featured.title}.`;
    const schema = buildPropertyListingPageSchema({
      title: featured.title,
      description: copy.slice(0, 160),
      city: lead?.city ?? 'Curitiba',
      state: lead?.state ?? 'PR',
      price: featured.amount,
      currency: 'BRL',
    });

    // Emite evento (sempre logado) + task de publicação (HITL em Copilot)
    const event: AgentEvent = {
      id: uid('evt'),
      at: ctx.now(),
      agentId: this.id,
      kind: 'note',
      title: `Rascunho SEO: ${featured.title}`,
      detail: `schema=${schema['@type']} · ${copy.length} chars`,
      dealId: featured.id,
      level: 'info',
    };
    const task: SalesTask = {
      id: uid('task'),
      kind: 'seo_publish',
      agentId: this.id,
      dealId: featured.id,
      title: `Publicar landing: ${featured.title}`,
      detail: copy,
      draft: JSON.stringify(schema),
      status: 'pending', // applyEffectsUnderAutonomy decide aprovar/em pending
      createdAt: ctx.now(),
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    };
    effects.push({ type: 'event', event }, { type: 'task', task });
    return effects;
  },
};
```

### 6.3 Adicionar ao roster e ao array `AGENTS`

```ts
// packages/sales/src/agents.ts — dentro de createRoster()
const base: Array<[AgentRole, string, string]> = [
  // ... 6 originais ...
  ['seo_agent', 'SEOria', 'Gera landing pages + schema.org para o topo de funil.'],
  ['lead_enricher', 'Enriquecedora', 'Enriquece leads (PII/validação/match) com HITL.'],
  ['market_intel', 'Analista de Mercado', 'Monitora preços/bairros e emite alertas.'],
  ['onboarding', 'Recepcionista', 'Recebe novos usuários e credita XP inicial.'],
  ['negotiator', 'Negociadora', 'Assistente de compra/venda (contraproposta).'],
];

// no final do arquivo:
export const AGENTS: AgentDef[] = [
  prospector, qualifier, outreacher, closer, accountManager, forecaster,
  seoAgent, leadEnricher, marketIntel, onboarding, negotiator, // <- novos
];
```


### 6.4 Por que NÃO precisamos mexer em `autonomy.ts` / `orchestrator.ts`

- `runCycle` itera `AGENTS` genérico → novo agente roda automaticamente.
- `applyEffectsUnderAutonomy` trata `event` (loga) e `task` (pending em copilot / aprovado em autopilot). O `seo_publish`/`enrich`/`alert`/`onboard`/`negotiate` são só valores do union `TaskKind` → caem no mesmo fluxo de aprovação (`/sales/approve/:id`).
- `syncClosedDeals` (CRM) e `recomputeAnalytics` já cobrem o novo estado.

### 6.5 (Opcional) Endpoint por agente na API

Para rodar só um agente (debug), a API Hono em `packages/api/src/routes/sales.ts` pode aceitar `?agent=seo_agent` e filtrar `AGENTS` antes de `runCycle`. **Não é obrigatório** — o ciclo completo já orquestra todos. Sugestão de rota (sem editar o núcleo do engine):

```ts
// packages/api/src/routes/sales.ts (existente) — extensão proposta
sales.post('/cycle', async (c) => {
  const { autonomy, agent } = await c.req.json<{ autonomy?: AutonomyLevel; agent?: AgentRole }>();
  const ctx = buildContext(autonomy ?? 'copilot');
  const result = await runCycle(store, ctx, agent ? [agent] : undefined); // runCycle já aceita filtro opcional
  return c.json(result);
});
```

---

## 7. Roadmap de implementação (sugestão)

| Passo | O que fazer | Arquivo (novo ou existente) |
|-------|-------------|------------------------------|
| 1 | Estender unions `AgentRole`/`TaskKind` | `packages/sales/src/types.ts` |
| 2 | Implementar os 5 `AgentDef` + roster | `packages/sales/src/agents.ts` |
| 3 | Soltar os 5 JSONs de workflow em `.n8n/workflows/` | `.n8n/workflows/landmap-*.json` |
| 4 | Adicionar rota `/seo/generate` + `/analyze` (usadas pelos workflows) | `packages/api/src/routes/` |
| 5 | Tela de aprovação já existe (`/sales`) — só rotular os novos `kind` | `apps/web/.../sales` |
| 6 | Ligar cron n8n → `POST /sales/cycle` | n8n |
| 7 | Testes: `packages/sales/src/__tests__/agents.spec.ts` (estender) | testes |

---

## 8. Riscos & Guardrails

- **LGPD / PII:** qualquer chamada externa com e-mail/telefone de terceiro (`lead_enricher`, `onboarding`) fica em `copilot` por padrão; never `autopilot` para PII externa sem allowlist auditada.
- **Factualidade do LLM:** conteúdo `seo_agent` e contrapropostas `negotiator` são rótulos de "sugestão/estimativa"; revisão humana obrigatória antes de publicar/enviar.
- **SPAM de notificação:** `market_intel` e `notify` respeitam limite de alertas por usuário/bairro; alertas de baixo impacto nem viram task.
- **Não fechar sozinho:** `closed_won` continua sendo exclusivo de `closer`/`account_manager` — `negotiator` só prepara.

---

**Próximo passo imediato:** mande *"Implementar os 5 agentes em `packages/sales/src/agents.ts` + soltar os 5 workflows em `.n8n/workflows/`"* que geramos o código no próximo turno (sem tocar em `autonomy.ts`/`orchestrator.ts`).

<!--WARROOM_APPEND-->

