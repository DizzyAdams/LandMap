# Auditoria de Design & Plano de Refatoração — LandMap

## Padrão Silicon Valley · Real Estate Experience Studio (x-ui × teachleads)

**Estúdio:** *Atlas & Co. — Real Estate Experience Studio*. Especialistas em **x-ui**
(interface de altíssima densidade e polimento, padrão de proptechs de Product-Led
Growth do Vale) e **teachleads** (design orientado a conversão e qualificação de
leads imobiliários).

**Cliente-persona:** LandMap posicionado como uma *real-estate data intelligence*
de nível Silicon Valley (não um portal de classificados).

**Objetivo:** elevar o LandMap de "app ok" para **produto vencedor** de uma proptech
do Vale — fluidez sem atrito, marca 100% consistente, WCAG AA e encantamento nas
micro-interações. Esta auditoria reavalia o estado **após** a war-room #02 e propõe
uma refatoração completa executada via **agent-swarm** (componentes novos em
paralelo + integração curada).

---

## 0. TL;DR Executivo

O design system base (*"fora do comum"*, bioluminescente) é **sólido e bonito**:
tokens coesos, glass, glows, `cn()`, `SpotlightCard`, `Drawer` com focus-trap,
`Toast` acessível, `CommandPalette` + `OnboardingTour`. Mas há atrito e
inconsistências que separam o LandMap de um produto SaaS de referência.

> Estado atual do repo: commits pós-war-room **já plugaram** `ToastProvider` e
> `CommandPaletteHost` no layout. Esta auditoria foca no que **ainda está em aberto**.

### Scorecard (0–10, barra SV)

| Dimensão | Nota | Comentário |
|---|---|---|
| Tokens & marca | 8.5 | Bioluminescente coeso; resta erradicar drift `emerald-500`/`teal` |
| Consistência de componentes | 7.0 | 2 `Button` duplicados; foco misto gold/emerald |
| Acessibilidade (WCAG AA) | 6.5 | Contraste resolvido na app, restam resquícios no DS |
| Motion & micro-interações | 7.5 | `Reveal`/`Stagger`/`Cursor` bons; faltam loading states |
| Mobile & responsivo | 6.0 | Sem bottom-nav; sem `Skeleton` nas telas de dados |
| Conversão / teachleads | 5.5 | Sem `NotificationCenter`, sem `Stepper`, CTAs sem urgência consistente |

---

## 1. Metodologia

Leitura de código + mapa *token-em-uso* vs *fonte-da-verdade*
(`globals.css` / `tokens.ts` / `styles.css`) + checagem de contraste WCAG (razão
relativa) + inspeção ARIA/teclado/foco + varredura mobile + revisão de motion.
Revalidado contra o estado atual do repo (grep em `apps/web/src` e `packages/ui/src`).

---

## 2. Achados (atualizados)

| ID | Sev | Achado | Onde |
|---|---|---|---|
| **A1** | P0 | Contraste residual: `text-neutral-600`/`text-neutral-500` em texto secundário do DS (falha AA < 4.5:1). | `Stat.tsx:37,24`, `EmptyState.tsx:21`, `Tabs.tsx:75`, `Toast.tsx:77`, `CommandPalette.tsx:171,187,203,209,243`, `OnboardingTour.tsx:214`, `Accordion.tsx:97` |
| **T1** | P1 | Drift de cor: `emerald-500`/`teal-300` fora da paleta de marca (marca = `emerald-400` #34d399 + `cyan`). | `sales/page.tsx:365`, `LiveDashboard.tsx:206`, `pricing`, `calculator`, `studio`, `docs`, `SpotlightCard`, `SocialProof`, `share-button`, `admin` |
| **M1** | P1 | Sem **MobileBottomNav** (thumb-zone): Buscar, Mapa, Favoritos, Comparar, Chat. | `Navbar.tsx` |
| **L1** | P1 | `Skeleton` existe no DS mas **não é usado** nas telas de dados. | `favorites`, `alerts`, `insights`, `chat` |
| **F9** | P2 | Dois `Button`: exportado (`default/outline/ghost/hero`) × legado `components/Button.tsx` (`gold` não exportado). | `packages/ui/src/button.tsx` |
| **T3** | P2 | Foco inconsistente: global `:focus-visible` é **gold**; componentes usam **emerald**. | `globals.css:282`, componentes |
| **S1** | P2 | Sem `Stepper` (funil de vendas / onboarding). | `sales/page.tsx` |
| **N1** | P2 | Sem `NotificationCenter` (inbox de "novos matches" a partir de alertas/favoritos). | — |
| **A2** | P2 | `EmptyState` mínimo (ícone string, sem slot de ação rico / ReactNode). | `EmptyState.tsx` |

---

## 3. Plano de Refatoração (agent-swarm)

### Swarm A — Componentes novos (paralelo, 1 arquivo isolado cada)
- **`MobileBottomNav`** — nav fixa mobile (`md:hidden`), ≥56px, `aria-current`, foco emerald.
- **`Stepper`** — `role=list`, estados done/active/upcoming, conector gradiente emerald→cyan, teclado.
- **`NotificationCenter`** — sino + badge + popover (matches de `alerts`/`favorites` no localStorage), acessível (dialog, ESC, click-outside).
- **`AnimatedNumber`** — count-up no in-view (framer-motion `useInView`), `.ledger-num`, respeita reduced-motion.

### Integração curada (editor principal)
- Exportar os 4 no `packages/ui/src/index.ts`.
- Plugar `MobileBottomNav` no layout (fixo, `md:hidden`) + compensar `pb` no main.
- Plugar `NotificationCenter` na `Navbar` (desktop).
- Adicionar variante `gold` (tokens `--gold`) ao `Button` exportado; consolidar o legado.
- Realçar `EmptyState` (ícone `ReactNode` + `actionHref`).

### Limpeza de marca (codemod + edição direta)
- `emerald-500` → `emerald-400`; `teal-300` → `cyan-400` (app + DS).
- `text-neutral-500/600` → `text-neutral-400` / `var(--muted)` nos componentes do DS (A1).
- Unificar foco em **emerald** (global + layout) — resolve T3.

### Motion & teachleads
- `AnimatedNumber` nos stats do `live`/dashboard.
- `Skeleton` nas telas de dados (`L1`).
- 1 ação primária por viewport (gradiente emerald→cyan); feedback via `toast` em ações assíncronas/destrutivas.
- `NotificationCenter` re-engaja leads; `Stepper` dá progresso visual ao funil (reduz abandono).

---

## 4. Princípios teachleads (conversão)

1. **Uma ação primária** por viewport, sempre com o gradiente emerald→cyan.
2. **Feedback imediato**: toda ação assíncrona/destrutiva dispara `toast` (nunca texto solto).
3. **Thumb-zone**: `MobileBottomNav` expõe Buscar / Mapa / Favoritos / Comparar / Chat.
4. **Re-engajamento**: `NotificationCenter` transforma alertas salvos em "novos matches".
5. **Funil visível**: `Stepper` reduz abandono mostrando progresso de etapas.
6. **Densidade SV**: números em `.ledger-num` (mono, tabular), `eyebrow` + `rule-gold` para editoriais.

---

## 5. Validação (gate obrigatório)

`pnpm -r typecheck` → `pnpm lint` → `pnpm build` → `pnpm test` — tudo verde antes do
merge. Nenhum item acima pode quebrar o pipeline Tailwind v4 (nunca `@apply <classe-custom>`).

*Auditoria: Atlas & Co. · Real Estate Experience Studio · x-ui × teachleads.*
