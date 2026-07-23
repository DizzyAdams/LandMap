# Projeções Financeiras & Métricas — LandMap + TokenWise
**Data:** 2026-07-21 · **Moeda:** BRL (TokenWise em USD onde indicado) · **Cenários:** Conservador (P10) / Base (P50) / Otimista (P90)

> ⚠️ **Todas as premissas de tração são hipóteses** — os projetos são pré-receita. Os números de pricing e custo de infra vêm do repositório (`pricing/page.tsx`, `landmap-monetization-plan.py`); o resto é benchmark de mercado e deve ser validado mensalmente contra dados reais.

---

## PARTE 1 — LANDMAP

### 1.1 Modelo de negócio (extraído do repo)

| Fonte | Valor real no código |
|---|---|
| Access | R$ 69,90/mês |
| Plus (mais popular) | R$ 119,90/mês |
| Pro | R$ 249,90/mês |
| Business (API & webhooks) | R$ 699,90/mês |
| Receita extra | API de leads qualificados, relatórios, integração CRM, SEO/AEO schema |
| Infra mensal (MVP, 6 meses) | ~R$ 1.043/mês (R$ 6.260 total, `landmap-monetization-plan.py`) |
| Caixa inicial | R$ 6.000 (bootstrap) |

**Mix de planos assumido (base):** 50% Access, 30% Plus, 15% Pro, 5% Business → **ARPU ≈ R$ 148** (uso R$ 140 conservador).

### 1.2 Premissas de crescimento

| Premissa | Conservador | Base | Otimista |
|---|---|---|---|
| Beta gratuito | M1–M3 | M1–M3 | M1–M2 |
| Clientes pagantes no M4 | 12 | 20 | 30 |
| Crescimento MoM (Ano 1) | 12% | 18% | 25% |
| Crescimento MoM (Ano 2) | 5% | 8% | 12% |
| Churn mensal (B2C) | 6% | 4% | 3% |
| CAC | R$ 190 | R$ 150 | R$ 110 |
| Margem bruta | 75% | 80% | 83% |

### 1.3 Projeção de receita (base, cohort simplificado)

| Marco | Clientes | MRR | ARR run-rate |
|---|---|---|---|
| M6 | 30 | R$ 4.2k | R$ 50k |
| M12 (fim A1) | 75 | R$ 10.5k | **R$ 126k** |
| M24 (fim A2) | 189 | R$ 26k | **R$ 317k** |
| M36 (fim A3) | 339 | R$ 47k | **R$ 570k** |

| Cenário | ARR Ano 1 | ARR Ano 2 | ARR Ano 3 |
|---|---|---|---|
| Conservador | R$ 65k | R$ 145k | R$ 260k |
| **Base** | **R$ 126k** | **R$ 317k** | **R$ 570k** |
| Otimista | R$ 210k | R$ 590k | R$ 1.15M |

### 1.4 Estrutura de custos (base)

| Linha | Ano 1 | Ano 2 | Ano 3 | % receita A3 |
|---|---|---|---|---|
| COGS (infra, LLM, mapas, email) | R$ 18k | R$ 42k | R$ 85k | 15% |
| S&M | R$ 14k | R$ 45k | R$ 95k | 17% |
| R&D (founder + 1 dev a partir do A2) | R$ 6k | R$ 96k | R$ 180k | 32% |
| G&A (contador, legal, ferramentas) | R$ 8k | R$ 18k | R$ 30k | 5% |
| **Total** | **R$ 46k** | **R$ 201k** | **R$ 390k** | 68% |

### 1.5 Headcount

| Dept | Hoje | A1 | A2 | A3 |
|---|---|---|---|---|
| Engenharia/Produto | 1 (founder) | 1 | 2 | 3 |
| S&M/CS | 0 | 0 | 1 | 2 |
| G&A | 0 | 0 | 0 | 1 |

### 1.6 Cash flow e runway

- **Burn Ano 1:** ~R$ 2.5k/mês líquido → caixa R$ 6k cobre ~2–3 meses de gap; receita do M4+ estende para o ano todo. **Ponto de estrangulamento: M3–M5.**
- **Breakeven operacional (base):** ~M14–M16.
- **Necessidade de capital:** R$ 0 se bootstrap rigoroso; **R$ 80–150k** para acelerar S&M no A2 com segurança (18 meses de runway pós-raise).

### 1.7 Métricas-chave (base, Ano 1→3)

| Métrica | A1 | A2 | A3 | Benchmark |
|---|---|---|---|---|
| CAC | R$ 150 | R$ 160 | R$ 170 | — |
| LTV (ARPU×MG/churn) | R$ 2.800 | R$ 2.960 | R$ 3.100 | — |
| **LTV:CAC** | **18,7** | 18,5 | 18,2 | > 3,0 ✅ (otimista demais — indica CAC subestimado ou churn real maior; monitorar) |
| CAC payback | ~1,3 mês | ~1,5 mês | ~1,6 mês | < 12 ✅ |
| Burn multiple | 0,4 | 0,9 | 1,2 | < 2,0 ✅ |
| NDR (sem expansão modelada) | ~95% | ~100% | ~105% | > 100% (expansão via upgrade de plano é a alavanca) |
| Rule of 40 (A3) | — | — | ~80% growth + ~10% margin = 90 | > 40 ✅ |

---

## PARTE 2 — TOKENWISE (spin-off open-core)

### 2.1 Modelo proposto (hipótese — não há pricing no repo)

- **Grátis:** CLI router/logger (MIT) — motor de adoção, prova via dados públicos de economia.
- **Pago (Team):** dashboard compartilhado, budgets por equipe, auditoria central — **US$ 20/dev/mês**.
- **Enterprise:** SSO, políticas de routing custom, relatórios de compliance — US$ 40/dev/mês.

### 2.2 Projeção (altamente especulativa)

| Cenário | Ano 1 | Ano 2 | Ano 3 |
|---|---|---|---|
| Conservador | US$ 0 (só adoção OSS) | US$ 24k ARR (20 times × 5 devs) | US$ 96k |
| Base | US$ 6k ARR | US$ 60k ARR (50 times) | US$ 300k |
| Otimista | US$ 18k | US$ 150k | US$ 900k |

**Métricas:** CAC quase zero se aquisição for OSS/conteúdo (LTV:CAC distorcido para cima — o risco não é CAC, é **conversão free→paid**, historicamente 1–3% em dev tools open-core). NDR naturalmente > 110% (times crescem).

### 2.3 Risco estratégico
TokenWise depende da API/pricing da Anthropic (mudança de preço quebra o counterfactual) e de features nativas do Claude Code (a Anthropic pode embutir routing — *sherlocking*). Mitigação: cross-vendor (Task D) como hedge.

---

## PARTE 3 — SÍNTESE E DECISÃO

| | LandMap | TokenWise |
|---|---|---|
| Faturamento A3 (base) | R$ 570k | US$ 300k |
| Capital necessário | R$ 6k–150k | ~0 (custo = tempo) |
| Principal risco | Churn B2C + CAC real | Sherlocking + conversão |
| Simbiose | TokenWise reduz o maior COGS variável do LandMap (LLM) | LandMap é o case de estudo público do TokenWise |

### Próximas ações (em ordem)
1. **Validar churn e CAC reais nos 2–3 clientes beta** (semana 9–12 do plano) — todo o modelo desaba ou se confirma aí.
2. Instrumentar o funil: signup → ativação → pagante (sem isso, LTV:CAC é ficção).
3. Revisitar este modelo mensalmente (o próprio TokenWise pode medir o COGS de LLM via `track`).

---

## PARTE 4 — META R$1M EM 90 DIAS (modelo dual-track, revisão 2026-07-21)

> Premissa-chave: **caixa coletado ≠ MRR**. A meta só fecha com contratos B2B anuais pagos upfront + setups únicos. Self-service vira esteira, não motor.

### 4.1 Composição da meta (base)

| Trilha | Ticket | Volume 90d | Caixa |
|---|---|---|---|
| Contrato anual API white-label (upfront) | R$ 200k | 4 | R$ 800k |
| Setup + relatório territorial (único) | R$ 20k | 8 | R$ 160k |
| Self-service acumulado (MRR ~R$8k no M3) | — | — | R$ 15k |
| **Total** | | | **R$ 975k ≈ R$1M** |

| Cenário | Contratos upfront | Setups | Total 90d |
|---|---|---|---|
| Conservador | 2 × R$ 150k | 4 | R$ 390k |
| Base | 4 × R$ 200k | 8 | R$ 975k |
| Otimista | 6 × R$ 250k | 15 | R$ 1,87M |

### 4.2 Pipeline math (o que precisa acontecer por semana)

Funil B2B mid-market BR: contato → reunião 20% · reunião → proposta 40% · proposta → fechamento 30% · **contato → fechamento ≈ 2,4%**.

Para 4 contratos + 8 setups (12 fechamentos) em 90 dias:

```
12 fechamentos ÷ 2,4% = 500 contatos qualificados
500 ÷ 12 semanas ≈ 42 contatos/semana (≈ 8/dia útil)
→ ~10 reuniões/semana → ~4 propostas/semana → ~1 fechamento/semana
```

Ciclo de venda 30–45 dias ⇒ **os primeiros 30 dias são só pipeline**; fechamentos concentram-se nas semanas 5–13. Sem pipeline cheio na semana 2, a meta já está morta na semana 6 — esse é o leading indicator.

### 4.3 Condições de contorno (kill criteria)

1. **Rede/acesso** a imobiliárias e construtoras é obrigatório. Sem warm start, dobrar o ciclo e cortar a meta para R$ 250–400k/90d (R$1M em 6–9 meses).
2. Prova de valor demonstrável na semana 1: relatório de 1 região gerado pelo produto atual.
3. Churn de contrato anual não aparece em 90 dias — reservar 10% do upfront para obrigações de SLA (Business já promete SLA no pricing).

### 4.4 Métricas que passam a mandar (substituem as do modelo puro-SaaS por 90 dias)

| Métrica | Alvo semanal | Por quê |
|---|---|---|
| Contatos qualificados | ≥ 42 | leading indicator #1 |
| Reuniões realizadas | ≥ 10 | saúde do pitch |
| Propostas enviadas | ≥ 4 | meio de funil |
| Fechamentos | ≥ 1 | lagging |
| Caixa coletado acumulado | curva até R$ 975k | a meta em si |
| Pipeline coverage | ≥ 3× o restante da meta | regra clássica |

*Arquivo gerado por análise de repo + benchmarks. Não substitui revisão contábil/fiscal.*
