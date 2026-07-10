# LandMap — Estratégia de Concorrência & Monetização (War Room #00)

> **Autor:** Chief Strategy Officer — LandMap War Room
> **Data:** 2026 · **Status:** Acionável
> **Princípio YC:** Tração > PowerPoint. Moat > Features. Velocidade > Perfeição.

## 0. TL;DR Executivo
O LandMap é a **única plataforma imobiliária BR open-source** com **IA 100% grátis** (MiniMax via Puter.js, client-side, custo marginal zero), **CRM Twenty nativo** e um **esquadrão de 6 agentes autônomos de vendas** (Off/Copilot/Autopilot). Enquanto QuintoAndar, Loft, Zap/VivaReal e os portais cobram comissões altas e trancam dados, o LandMap **inverte o modelo**: open data + IA gratuita + agentes que trabalham pelo usuário + **cashback no fechamento**. O *moat* é **comunidade open-source + automação de vendas + rede de cashback/referral**. Meta dos 90 dias: ser o marketplace com **menor CAC** e **maior % de fechamento assistido por IA** do Brasil.

## 1. Mapa de Concorrência BR (pesquisa web)

| Concorrente | Modelo de negócio | Fontes de receita | Pontos fracos | Onde o LandMap GANHA |
|---|---|---|---|---|
| **QuintoAndar** | Marketplace aluguel/venda com curadoria; gestão sem fiador (garantia própria); consórcio; crédito (Atta). ~70 cidades. | Comissão ~10% venda; taxa de garantia/aluguel; spread consórcio/crédito; gestão. | Comissão alta; lock-in do relacionamento; sem IA aberta p/ usuário; dados fechados; balanço preso à garantia. | IA 100% grátis; mapa/heatmap aberto; **CRM do próprio usuário** (Twenty); agentes que negociam por ele; **cashback no fechamento**. |
| **Loft** | iBuying (compra, reforma, revende) + gestão (Loft Smart) + crédito; pivotou p/ corretagem asset-light. | Spread compra-revenda; comissão corretagem; taxa gestão; spread crédito. | Modelo capital-intensivo (layoffs 2022-23); unit economics questionados; concentrado SP/RJ; risco de estoque. | **Asset-light**, sem estoque; open-source; IA grátis; agentes tiram o trabalho do corretor. |
| **Zap Imóveis / VivaReal** (Grupo OLX) | Portais de classificados; venda de destaque + leads p/ corretores/imobiliárias. | Planos de anúncio/destaque; pacotes de leads; assinaturas de corretores. | Paga-para-aparecer; leads caros/frios; sem IA real p/ comprador; não participa do fechamento. | IA gratuita p/ decidir; **participa do fechamento** via agentes; cashback devolve valor; CRM nativo. |
| **Imovelweb** (Navent/QuintoAndar) | Portal classificados; planos de anúncio. | Planos destaque/leads. | UX antiga; menos tech/dados; sem IA; depende de volume. | IA + mapa mundi + agentes autônomos. |
| **Chaves na Mão** | Classificados imóveis + veículos; planos de anúncio. | Planos de anúncios (imóvel/veículo). | Sem curadoria; sem IA; sem fechamento; lead variável. | Curadoria por IA; agentes qualificam; fechamento com cashback. |
| **Key** (crédito imobiliário) | Fintech de crédito com garantia de imóvel (home equity) / financiamento. | Spread de juros; taxa de abertura. | Só crédito — não cobre descoberta, comparação nem fechamento. | Cobre a **jornada inteira** (descoberta→IA→comparação→crédito→fechamento→cashback). |
| **EmCasa** | iBuying / oferta instantânea + corretagem; foco SP. | Comissão sobre venda; spread iBuying. | Capital intensivo; concentrado; pivôs; sem comunidade open. | Asset-light + open + IA grátis. |
| **Wimoveis** | Portal regional (DF/GO/MT/MS), 25 anos; planos de anúncio. | Planos/assinaturas de corretores. | Regional; sem IA; sem agentes; sem gamificação. | Nacional + internacional (en/es) + IA + mapa. |

**Síntese:** Todos monetizam **cobrando do meio da transação** (comissão, destaque, lead) e **trancam dados/relacionamento**. Nenhum oferece IA gratuita pro comprador, CRM próprio ou cashback. **Essa é a brecha.** O LandMap monetiza o *volume e a rede* (freemium + cashback que atrai demanda + take-rate baixo no fechamento), não o acesso à informação.

## 2. Proposta de Valor Única (Moat)

**UVP (uma frase):** *"O LandMap é o único lugar onde você descobre, negocia com IA grátis e fecha imóveis ganhando dinheiro de volta — sem comissão abusiva e com seus dados abertos."*

**Moats** (defensabilidade), em ordem de força:

1. **Open-source + open data** → comunidade forkável, sem lock-in, contribuições gratuitas (SEO, dados, agentes). Concorrente não copia facilmente o *ecossistema*.
2. **Custo marginal zero de IA** (MiniMax via Puter.js, client-side) → enquanto concorrentes pagam LLM caro, nosso chat é de graça. Permite dar IA "ilimitada" no Free sem quebrar o P&L.
3. **Esquadrão de 6 agentes autônomos de vendas** (`packages/sales`) → automação que substitui horas de corretor; melhora com o uso (dados de ciclos).
4. **CRM Twenty nativo** → o usuário *possui* seus leads/oportunidades; switching cost alto p/ quem adota.
5. **Rede de cashback/referral** → efeito de rede do lado da demanda: quanto mais gente fecha pelo LandMap, mais barato fica e mais indicações entram.
6. **Mapa mundi / heatmap / trends** (Leaflet + `/market/*`) → inteligência geográfica proprietária e maleável.
7. **Multi-idioma (pt/en/es)** → ponte p/ comprador internacional (nomad, expat, fundo), onde concorrente BR não joga.

## 3. Estrutura de Planos — Freemium → Premium → Pro/Enterprise

### 3.1 Visão geral dos tiers

| Tier | Preço sugerido | Público-alvo | Limites principais |
|---|---|---|---|
| **Free (Freemium)** | R$ 0 | Comprador casual, vendedor particular (1 imóvel) | 50 buscas/dia; 20 msg IA/dia; 1 agente Off; 1 anúncio ativo |
| **Premium** | R$ 29/mês · R$ 290/ano (-17%) | Comprador power-user, agente autônomo iniciante | Busca ilimitada; IA ilimitada; Copilot 1 ciclo/dia; 5 anúncios |
| **Pro** | R$ 149/mês · R$ 1.490/ano | Imobiliária pequena, vendedor pro, agente autônomo | Tudo do Premium + Autopilot ilimitado; CRM completo; anúncios ilimitados |
| **Enterprise** | R$ 799/mês · R$ 7.990/ano (ou custom) | Imobiliárias médias/grandes, redes de agentes | White-label, multi-seat, API, agentes custom, SLA |

### 3.2 Matriz de features (✓ = incluso)

| Feature | Free | Premium | Pro | Enterprise |
|---|---|---|---|---|
| Busca + Mapa + Heatmap | ✓ (50/dia) | ✓ ilimit. | ✓ ilimit. | ✓ ilimit. + API |
| Chat RAG IA (MiniMax) | ✓ (20/dia) | ✓ ilimit. | ✓ ilimit. + modelos top | ✓ tudo |
| Comparador de imóveis | ✓ (3) | ✓ avançado | ✓ avançado | ✓ + export |
| Favoritos / Alertas | ✓ local | ✓ nuvem + prior. | ✓ nuvem + prior. | ✓ + webhook |
| Agentes de vendas (6) | 1 Off | Copilot 1c/d | **Autopilot ilimit.** | Custom + próprios |
| CRM Twenty | — | sync básico | ✓ completo + scoring | ✓ multi-usuário |
| Analytics preço/trends/heatmap | básico | ✓ | ✓ avançado | ✓ API |
| Anúncios (vendedor) | 1 ativo | 5 | ilimit. + destaque | white-label |
| **Cashback no fechamento** | 0,5% | 1,0% | 1,5% | taxa 0 p/ parceiro |
| Referral / indicação | ✓ | ✓ | ✓ | ✓ |
| Suporte | Comunidade | E-mail | Prioritário | SLA + CSM |
| White-label / API | — | — | — | ✓ |

### 3.3 Recomendação por persona

- **Comprador** → começa no **Free** (IA grátis já vence portais) e sobe p/ **Premium** p/ IA ilimitada + cashback 1%.
- **Vendedor particular** → **Free** (1 anúncio) ou **Pro** se tiver carteira.
- **Imobiliária** → **Pro** (CRM + Autopilot + anúncios ilimitados) ou **Enterprise** (white-label).
- **Agente autônomo** → **Premium** (Copilot) e scale p/ **Pro** (Autopilot ilimitado = "emprega" 6 agentes 24/7).

## 4. Programa de Cashback (demanda + rede)

Princípio: o LandMap **devolve parte do valor** ao usuário no fechamento, financiado por um **take-rate baixo** sobre a transação e por parcerias (imobiliárias/agentes que usam o portal). Isso cria *lock-in positivo*: o usuário quer fechar pelo LandMap para ganhar o cashback.

### 4.1 Três fluxos

| Fluxo | Quem recebe | Gatilho | % sugerido | Teto | Forma de pagto |
|---|---|---|---|---|---|
| **Cashback Comprador** | Comprador que fecha pelo LandMap | Escritura/contrato registrado via portal | 0,5% Free · 1,0% Premium · 1,5% Pro | R$ 30.000 | Pix 30d ou crédito p/ taxas |
| **Cashback Vendedor** | Vendedor que usa agentes LandMap | Imóvel vendido com ajuda dos agentes | 1,0% sobre economia de comissão | R$ 20.000 | Crédito/Pix |
| **Referral / Indicação** | Quem indica e a indicação fecha | Indicado fecha pelo portal | R$ 250 fixo + 0,25% do valor | R$ 15.000 | Pix ou crédito |

### 4.2 Regras de integridade (anti-fraude)
- Cashback só libera após **confirmação de cartório** (webhook parceiro ou upload de contrato + OCR).
- 1 conta = 1 CPF/CNPJ; referral exige vínculo comprovado (link de compartilhamento).
- Fraude → ban + estorno; revisão manual acima de R$ 10k.
- **Take-rate do LandMap: 2% a 3%** sobre o fechamento (vs. 5%–10% dos concorrentes) — a diferença *é* o cashback.

### 4.3 Gamificação (integração c/ agente irmão de gamificação)
O cashback vira **XP + níveis** (ver spec do agente de gamificação). Aumenta retenção e UGC.

| Nível | Nome | Como chegar | Bônus |
|---|---|---|---|
| 1 | Bronze | cadastro | cashback base |
| 2 | Silver | 5 buscas qualificadas | +0,1% cashback |
| 3 | Gold | 1 fechamento ou 20 indicações | +0,25% + badge |
| 4 | **Sovereign** (gold `#d4af37`) | 3+ fechamentos ou 100 indicações | +0,5% + destaque + acesso beta |

Eventos que geram XP (emitidos pelos agentes de vendas e pela API): `search`, `save_favorite`, `compare`, `agent_cycle`, `referral_signup`, `closed_won`. O agente de gamificação consome `/events` e atualiza `/profile`.

## 5. Plano de 90 Dias — "Bater Toda Concorrência"

**North-Star Metric:** `GMV fechado via LandMap (R$)` — valor total de imóveis cujo fechamento foi originado/assistido pelo portal. *Counter-metric:* retenção de usuários ativos (D30 > 35%) e **CAC** (meta < R$ 15).

### 5.1 Marcos
- **Dias 0–30 — Fundação:** billing + cashback + referrals MVP; pricing page; hook CRM; agentes em Copilot.
- **Dias 31–60 — Tração:** lançar cashback público; 10 parcerias imobiliárias; Autopilot em beta fechada; SEO/AEO (schema + blog).
- **Dias 61–90 — Domínio:** escala referrals; tier Enterprise; heatmap viral; CAC abaixo dos concorrentes.

### 5.2 Ações por semana

| Semana | Foco | Ações prioritárias (top 3) |
|---|---|---|
| 1 | Billing core | Criar `packages/billing`; rotas `/billing/plans`, `/billing/checkout`; schema `subscription` |
| 2 | Cashback core | `packages/billing/cashback`; rotas `/cashback/*`; regras de take-rate |
| 3 | Referrals | `/referrals/*`; código + tracking + recompensa |
| 4 | Pricing UI | `apps/web/.../pricing` (Free/Premium/Pro/Enterprise) + paywall gating |
| 5 | CRM hook | Sincronizar `closed_won` → cashback; webhook Twenty |
| 6 | Lançar cashback | Campanha "Fecha pelo LandMap e ganha de volta"; badges |
| 7 | Parcerias | Fechar 10 imobiliárias (take-rate 2–3%); doc de onboarding |
| 8 | Agentes Autopilot | `POST /sales/cycle` em Autopilot p/ parceiros Pro/Enterprise |
| 9 | SEO/AEO | `packages/seo` + blog "melhor bairro p/ investir" + schema FAQ |
| 10 | Gamificação | Agente irmão: XP/níveis; tela `/cashback` com nível |
| 11 | Referrals scale | Viral loop: "indique e ganhe"; dashboard de indicações |
| 12 | Enterprise + heatmap | White-label; mapa heatmap compartilhável; revisão de CAC vs. concorr. |
| 13 | Polish | e2e billing/cashback; bundle budget; CI verde |
| 14 | Domínio | Relatório de GMV; ajuste de %; plano p/ 90–180 dias |

## 6. Recomendações de Nível de Código

> Regra: **não editar arquivos centrais**. Criar novos pacotes/rotas/telas.

### 6.1 Novo pacote `packages/billing`
- `src/schema.ts` — Zod: `Plan`, `Subscription`, `CashbackBalance`, `Referral`, `Invoice`, `Redemption`.
- `src/plans.ts` — catálogo de planos (preços em BRL, limites, features por tier).
- `src/gateway.ts` — adapter de pagamento (Mercado Pago / Stripe) com webhook.
- `src/cashback.ts` — cálculo de take-rate, liberação pós-cartório, conversão em XP.
- `src/referral.ts` — geração de código, atribuição, recompensa.

### 6.2 Rotas na API Hono (`packages/api/src/routes/`)
- `billing.ts` → `GET /billing/plans`, `POST /billing/checkout`, `POST /billing/webhook`, `GET /billing/subscription`.
- `cashback.ts` → `GET /cashback/balance`, `GET /cashback/history`, `POST /cashback/redeem`, `POST /cashback/confirm` (cartório).
- `referrals.ts` → `GET /referrals/code`, `GET /referrals/stats`, `POST /referrals/track`.

### 6.3 Campos no schema (`packages/db`)
```ts
// resumo — ver docs/war-room/00-billing-types.ts p/ tipos completos
User.plan: 'free' | 'premium' | 'pro' | 'enterprise'
User.cashbackBalanceCents: number
User.referralCode: string
User.xp: number
User.level: 'bronze' | 'silver' | 'gold' | 'sovereign'
Subscription.{ plan, status, currentPeriodEnd, gateway }
CashbackTxn.{ userId, amountCents, kind, status, releasedAt }
Referral.{ code, referrerId, referredId, status, rewardCents }
```

### 6.4 Telas (`apps/web/src/app/[locale]/`)
- `pricing/page.tsx` — tabela de planos + CTA checkout.
- `cashback/page.tsx` — saldo, nível (Sovereign gold), histórico, resgate.
- `referrals/page.tsx` — link de indicação, stats, ranking.
- `billing/page.tsx` — gerenciar assinatura/upgrade.
- Gating: middleware que lê `User.plan` p/ liberar IA ilimitada / Autopilot.

### 6.5 Integração com agentes de vendas (`packages/sales`)
- Ao `closed_won` no cockpit → emitir evento → `POST /cashback/confirm` + XP.
- Autopilot (Pro/Enterprise) pode disparar fluxo de cashback/referral automaticamente (human-in-the-loop no Copilot).

### 6.6 Integração gamificação (agente irmão)
- Eventos `search / save_favorite / compare / agent_cycle / referral_signup / closed_won` → `POST /events` → atualiza `xp / level` e badge Sovereign.

---
**Próximo passo imediato:** mande *"Implementar `packages/billing` + rotas `/billing/*` + tela `/pricing`"* que geramos o código no próximo turno.

<!--WARROOM_APPEND-->



