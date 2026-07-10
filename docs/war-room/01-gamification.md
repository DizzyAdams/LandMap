# LandMap — Gamificação & Retenção (War Room #01)

> **Autor:** Engenheiro de Produto / Game Designer Sênior — LandMap War Room
> **Data:** 2026 · **Status:** Acionável (pacote isolado criado)
> **Princípio YC:** Tração > PowerPoint · Moat > Features · Velocidade > Perfeição

## 0. TL;DR Executivo
Camada de gamificação **isolada** (`packages/gamification`) que aumenta
**retenção (D1/D7/D30)**, **engajamento** e **indicações** sem travar o
build. Entrega: (1) XP + níveis + economia virtual **LandCoins**; (2) badges,
streaks e quests; (3) leaderboards (global/cidade) e desafios sociais; (4)
**modelo de dados** tipado; (5) **engine pura** e testável (`awardXp`,
`checkBadges`, `applyStreak`, `redeemCashback` + `applyEvent`/`buildLeaderboard`);
(6) **componentes de UI** que reaproveitam `@landmap/ui` e os tokens dark-premium.
As LandCoins **se conectam ao cashback do agente irmão** (`packages/billing`)
via um *port* `CashbackProvider` — nada de arquivos centrais editados.

## 1. Princípios de Design
- **Recompensa > punição.** Streak quebrada reseta para 1 (nunca para 0
  negativo) e há item *freeze* para 1 dia perdido. LandCoins só somam.
- **Progresso sempre visível.** `XpBar` onipresente na navbar/perfil.
- **Loop curto (diário) + longo (semanal/mensal).** Quests repetíveis + tiers.
- **Social proof & status.** Leaderboards e badges Sovereign geram status e
  prova social (gatilho de indicação).
- **Moat de comunidade.** LandCoins viram cashback real no fechamento →
  alavanca o diferencial do LandMap vs. QuintoAndar/Loft/Zap.
- **Pure-first.** Toda a lógica de estado vive em funções puras e testáveis;
  IO (DB, billing) fica fora da engine.

## 2. Objetivos & Métricas (guardrails)
| Objetivo | Métrica | Meta 90d |
|---|---|---|
| Retenção | D1 / D7 / D30 | +15pp / +10pp / +8pp |
| Engajamento | eventos/user/semana | ≥ 12 |
| Indicação | coef. viral **K** = convites×taxa_conv | K ≥ 0,4 |
| Conversão | % users que resgatam LandCoins→cashback | ≥ 25% |
| Status | % users com badge Sovereign/Gold | ≥ 5% |

> K = (convites enviados × taxa de signup) por usuário. Acima de ~0,3 o
> crescimento vira viral sem spend em aquisição.

## 3. Visão Geral da Economia
```
 busca/fav/compare/agente/indicação/fechar
            │  GamificationEvent
            ▼
   ┌──────────────────────────────┐
   │  applyEvent()  [engine pura]  │
   └──────────────────────────────┘
        │  ├─ awardXp()      → XP + nível + LandCoins (milestone 500)
        │  ├─ evaluateQuest() → quests (compare 3, fav 5, indica 1…)
        │  └─ checkBadges()  → Caçador de Ofertas, Mestre do Bairro,
        │                        Investidor Sovereign…
        ▼
   UserProgress (packages/db)  +  CoinLedger (LandCoins)
        │
        ├─ buildLeaderboard() → Leaderboard global/cidade
        └─ redeemCashback() ──┐
                                ▼
                  CashbackProvider (agente irmão /billing)
                  → CashbackBalance.cents (real, BRL)
```
**Níveis/Tiers** (sincronizados com `GamificationLevel` do billing):
`bronze` (1–4) → `silver` (5–9) → `gold` (10–14) → `sovereign` (15+).
A curva de XP é `cumulativeXpForLevel(L) = 50·L·(L-1)` (nível 1 = 0 XP;
sobe 100 XP p/ nível 2, 200 p/ nível 3, …). LandCoins: **+5 LC a cada
500 XP cruzados** + bônus direto por evento (ex.: indicação +20 LC, fechamento +50 LC).

## 4. Modelo de Dados (Tipos)
Todos em `packages/gamification/src/types.ts` (e `engine.ts`). **Alinhados 1:1
com `docs/war-room/00-billing-types.ts`** do agente irmão:

| Tipo LandMap | Mapeia p/ billing (irmão) | Papel |
|---|---|---|
| `GamificationTier` | `GamificationLevel` | bronze/silver/gold/sovereign |
| `GamificationEvent` | `XpEvent` | busca, fav, compare, agent, indicação, fechamento |
| `UserProgress.xp / .tier` | `GamificationProfile.xp / .level` | estado persistido |
| `CoinLedger.landcoins` | (virtual, pré-cashback) | saldo de LandCoins |
| `redeemCashback()` | `CashbackBalance` / `CashbackTxn` | resgate → centavos BRL |
| `LANDMAP_TAKE_RATE` (irmão, 0.02) | take-rate do fechamento | financia o cashback |

Principais interfaces (resumo):
```ts
interface UserProgress {
  userId: string; xp: number; level: number; tier: GamificationTier;
  landcoins: number; metrics: ProgressMetrics; streak: StreakState;
  badges: string[]; quests: Record<string, QuestProgress>; updatedAt: string;
}
interface CoinLedger { userId: string; landcoins: number; entries: LedgerEntry[] }
interface CashbackProvider {            // ← PORT implementado pelo billing
  getBalance(userId): Promise<{cents; pendingCents}>;
  redeem(userId, amountCents, meta: PendingCashbackRedemption): Promise<{id; status}>;
}
```
Badges e quests são **data-driven** (`BadgeDef`, `QuestDef`) — critérios
serializáveis avaliados por `evaluateCriterion`/`evaluateQuest`.

## 5. Tabelas de Balanceamento
**XP por evento** (`XP_TABLE`):
| evento | XP | LandCoins diretos |
|---|---|---|
| `search` | 5 | 0 |
| `save_favorite` | 10 | 1 |
| `compare` | 15 | 2 |
| `view_neighborhood` | 8 | 1 |
| `agent_cycle` | 20 | 3 |
| `referral_signup` | 50 | 20 |
| `closed_won` | 200 | 50 |
| `daily_login` | 3 | 0 |

**Níveis → Tiers:** nível 1–4 `bronze` · 5–9 `silver` · 10–14 `gold` · 15+ `sovereign`.
XP cumulativo p/ nível L = `50·L·(L-1)` (nív.2=100, nív.3=300, nív.10=4500).

**Badges padrão** (`DEFAULT_BADGES`):
| id | nome | critério | LC |
|---|---|---|---|
| `first_search` | Primeira Busca | XP≥5 | 2 |
| `compare_3` | Viciado em Comparar | compare≥3 | 8 |
| `deal_hunter` | Caçador de Ofertas | favoritos≥10 | 10 |
| `neighborhood_master` | Mestre do Bairro | bairros≥3 | 15 |
| `streak_7` | Streak de Ferro | streak≥7 | 20 |
| `referrer` | Embaixador | indicações≥1 | 25 |
| `gold_tier` | Sovereign Gold | tier≥gold | 50 |
| `investor_sovereign` | Investidor Sovereign | tier≥sovereign | 100 |

**Quests padrão** (`DEFAULT_QUESTS`): `q_compare3` (compare 3 → +45 XP/+10 LC),
`q_fav5` (fav 5 → +30/+8), `q_refer1` (indicar 1 → +60/+25),
`q_explore` (explorar 3 bairros → +40/+12). `q_compare3`/`q_fav5`/`q_explore`
são `repeatable` (diárias).


## 6. Engine Pura (`src/engine.ts`)
Zero dependências de React/Next/IO. Cada função recebe `Clock`
(`{ now, today? }`) e devolve o **novo estado** (nunca `Date.now()`/
`Math.random()`), logo é 100% testável. As 4 funções exigidas:

```ts
awardXp(progress, xpDelta, clock)            // XP + nível + LandCoins (milestone 500)
checkBadges(progress, catalog)              // desbloqueia badges elegíveis (+LC)
applyStreak(progress, clock, {allowFreeze})// streak diária (freeze p/ 1 dia)
redeemCashback(ledger, {landcoinsToSpend, rateCentsPerCoin}, clock)
```

Auxiliares: `levelFromXp`, `tierFromLevel`, `cumulativeXpForLevel`,
`evaluateCriterion`, `awardLandcoins`, `quoteRedemption`, `evaluateQuest`,
`applyEvent` (reducer central) e `buildLeaderboard` (ranking denso, filtro
por cidade, marca `isCurrentUser`).

**Exemplo de uso (o fluxo `POST /events`):**
```ts
import { applyEvent, DEFAULT_BADGES, DEFAULT_QUESTS, createInitialProgress } from '@landmap/gamification';

const clock = { now: '2026-07-09T12:00:00.000Z', today: '2026-07-09' };
let p = createInitialProgress('u1', clock);

// usuário comparou 3 imóveis
const r = applyEvent(
  p,
  { userId: 'u1', type: 'compare', amount: 3, createdAt: clock.now },
  DEFAULT_BADGES, DEFAULT_QUESTS, clock,
);
p = r.progress;
// r.progress.xp === 45; badges inclui 'compare_3';
// quests['q_compare3'].status === 'completed'
```

## 7. Integração com Cashback / Planos (agente irmão)
O pacote billing (`docs/war-room/00-billing-types.ts`) implementa o *port*
`CashbackProvider`. A engine só produz o `PendingCashbackRedemption`;
a IO (chamar o provider, persistir `CashbackTxn`) fica na camada de
serviço/rota. **LandCoins são a moeda virtual; ao resgatar, viram
cashback real (centavos BRL) no fechamento** — financiado pelo
`LANDMAP_TAKE_RATE` (2%) do irmão.

```ts
import { redeemCashback } from '@landmap/gamification';
import type { CashbackProvider } from '@landmap/gamification';

const billing: CashbackProvider = /* implementado pelo pacote billing */;
const rate = 10; // 1 LandCoin = R$ 0,10 (DEFAULT_REDEEM_RATE_CENTS)

function handleRedeem(ledger: CoinLedger, landcoinsToSpend: number) {
  const { ledger: next, pending, ok } = redeemCashback(
    ledger, { landcoinsToSpend, rateCentsPerCoin: rate }, clock,
  );
  if (!ok || !pending) return { ok: false };
  await billing.redeem(pending.userId, pending.cashbackCents, pending);
  return { ok: true, cashbackCents: pending.cashbackCents };
}
```
> Tela `/cashback` (do irmão) mostra saldo + nível Sovereign + histórico +
> botão de resgate que chama `handleRedeem`.

## 8. Rotas Hono sugeridas (`packages/api/src/routes/gamification.ts`)
```ts
import { Hono } from 'hono';
import { applyEvent, buildLeaderboard, DEFAULT_BADGES, DEFAULT_QUESTS } from '@landmap/gamification';

export function createGamificationRouter() {
  const app = new Hono();
  // Reuso do contrato XpEvent do billing: search/save_favorite/compare/...
  app.post('/events', async (c) => {
    const ev = await c.req.json();           // GamificationEvent
    const progress = loadProgress(ev.userId);   // packages/db
    const r = applyEvent(progress, ev, DEFAULT_BADGES, DEFAULT_QUESTS, { now: new Date().toISOString() });
    saveProgress(r.progress);
    return c.json(r);                         // xp/badges/quests/streak
  });
  app.get('/leaderboard', (c) => {
    const all = loadAllProgress();
    const ranked = buildLeaderboard(all, c.req.query('userId') ?? '', {
      scope: (c.req.query('scope') as any) ?? 'global',
      city: c.req.query('city') ?? undefined,
      limit: Number(c.req.query('limit') ?? 50),
    });
    return c.json({ entries: ranked });
  });
  return app;
}
// Em index.ts: app.route('/gamification', createGamificationRouter());
```


## 9. Componentes de UI (`src/components/`)
Todos em `.tsx`, **reaproveitam `@landmap/ui`** (`Card`, `Badge`,
`Progress`, `StatPill`, `Avatar`, `Tooltip`) e os **tokens dark-premium**
(`--emerald #34d399`, `--cyan #22d3ee`, `--violet #a78bfa`,
`--gold #d4af37`, glows `--glow-gold`/`--glow-sovereign`).

| Componente | Props-chave | Reuso |
|---|---|---|
| `BadgeShelf` | `badges: BadgeView[]` (`{def, unlocked}`), `columns?` | `Card`+`Badge`+`Tooltip`; gold/sovereign glow |
| `XpBar` | `xp`, `level`, `tier?`, `landcoins?` | `Progress` (gradiente por tier) + `StatPill` |
| `StreakFlame` | `streak`, `best?`, `frozen?` | glow gold/sovereign por intensidade |
| `Leaderboard` | `entries: RankedLeaderboardEntry[]`, `scope?` | `Card`+`Avatar`+`StatPill`; destaque `isCurrentUser` |

Exemplo de composição (navbar/perfil):
```tsx
import { XpBar, StreakFlame, BadgeShelf, Leaderboard } from '@landmap/gamification/components';

<XpBar xp={p.xp} level={p.level} tier={p.tier} landcoins={p.landcoins} />
<StreakFlame streak={p.streak.current} best={p.streak.best} />
<BadgeShelf badges={catalog.map(def => ({ def, unlocked: p.badges.includes(def.id) }))} />
<Leaderboard entries={ranked} scope="city" />
```

## 10. Anti-Cheat & Segurança
- **Idempotência:** `checkBadges` só desbloqueia uma vez (`badges.includes`).
- **Clamp sempre:** `quoteRedemption` limita ao saldo; `awardXp`/`redeemCashback`
  usam `Math.max(0, …)`. LandCoins **nunca** ficam negativos.
- **Server-authoritative:** a engine roda no servidor (`POST /events`); o
  cliente só renderiza. Eventos devem vir de ações reais (não de calls diretos).
- **Rate-limit** por `userId`/`event.type` na rota; `daily_login` 1×/dia
  (a própria `applyStreak` já ignora dias repetidos).
- **Audit ledger:** toda LandCoin tem `LedgerEntry` (ganho/resgate) — auditoria
  trivial para o billing.

## 11. Roadmap de Implementação (fases)
1. **Pacote & engine** ✅ — `packages/gamification` (puro + 24 testes verdes).
2. **Persistência** — campos `xp/tier/landcoins/badges/streak` em `packages/db`.
3. **Rotas** — `createGamificationRouter()` em `packages/api/src/routes/gamification.ts` (+ `/events` reusando XpEvent).
4. **UI** — montar `XpBar` na navbar, `BadgeShelf`/`Leaderboard` na tela `/insights` ou `/favorites`, `StreakFlame` no perfil.
5. **Cashback** (irmão) — `billing` implementa `CashbackProvider`; tela `/cashback` chama `handleRedeem`.
6. **Indicações** — link `?ref=CODE` → evento `referral_signup` → badge `referrer` + K viral.
7. **Desafios sociais** — leaderboards sazonais (semana/mês) + notificações.

## 12. Como rodar (testes)
```bash
pnpm install                              # linka o novo pacote (react/@types/react/vitest)
pnpm --filter @landmap/gamification test    # 24 testes da engine (vitest)
pnpm --filter @landmap/gamification typecheck
# ou, do raiz (usa vitest.config.ts raiz):
pnpm exec vitest run packages/gamification/src/engine.spec.ts
```

## 13. Arquivos criados (isolados — nenhum arquivo central editado)
```
packages/gamification/
├─ package.json            # @landmap/ui (workspace:*), react peer, vitest
├─ tsconfig.json          # moduleResolution Bundler + paths → ../ui/src
├─ vitest.config.ts       # config local (env node) p/ `pnpm --filter … test`
└─ src/
   ├─ global.d.ts        # declare module '*.css'
   ├─ types.ts           # domínio (UserProgress, CoinLedger, CashbackProvider…)
   ├─ engine.ts          # engine PURA: awardXp/checkBadges/applyStreak/redeemCashback/applyEvent/buildLeaderboard + catálogos
   ├─ engine.spec.ts     # 24 testes (vitest)
   ├─ index.ts           # barrel público
   └─ components/
      ├─ BadgeShelf.tsx  ├─ XpBar.tsx  ├─ StreakFlame.tsx  ├─ Leaderboard.tsx
      └─ index.ts
docs/war-room/01-gamification.md   # este documento
```

