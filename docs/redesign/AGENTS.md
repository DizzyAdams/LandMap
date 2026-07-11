# LandMap 2.0 — Briefs dos 7 Agentes UX/UI

> Execute após reautenticar a conta Cline (o runtime de sub-agentes está bloqueado
> por `Unauthorized` até lá). Cada agente tem fatia de arquivos **dona e disjunta**
> → roda em paralelo sem conflito. Brief compartilhado no topo de cada agente.

## Brief compartilhado (colar em todos)
Repo `C:\Users\forrydev\Desktop\LandMap`. Overhaul visual do LandMap (Next.js 14 +
React 18 + next-intl pt-BR/en-US/es-ES + Tailwind v4 ativo + `@landmap/ui`).
**Preservar 100% features/rotas/dados/comportamento** — só apresentação.
Direção **"Sovereign Intelligence"**: calmo, confiante, editorial-meets-data;
superfícies dark em camadas, hairlines, glow contido; emerald `#34d399`
(emerald-400, NÃO 500)/cyan/violet + Sovereign gold como acentos; mono p/ dados;
motion proposital com `prefers-reduced-motion`; WCAG AA.
Contrato de tokens: `docs/redesign/TOKENS.md`.
**Restrições:** Tailwind v4 → nunca `@apply` de classe custom; emerald=#34d399;
não mudar rotas/API/lógica; i18n em `apps/web/messages/*.json` (não criar
`src/messages/`); validar `cd packages/ui && npx tsc --noEmit` (ou web equivalente).

---

## Agente 1 — Foundation & Tokens  (✅ já feito manualmente)
Arquivos: `packages/ui/src/tokens.ts`, `packages/ui/src/styles.css`,
`apps/web/src/app/globals.css`.
Expandiu token scale (surface-4, surface-inset, border-subtle, text-muted/faint,
type scale, spacing, container, elevation, tints) + utilitários `.container-x`,
`.section`, `.page-header`, `.divider`, `.surface-raised`, `.surface-inset`,
`.text-display..text-caption`. **Concluído.**

## Agente 2 — Core Component Library
Arquivos: `packages/ui/src/components/*` (24) + `packages/ui/src/button.tsx` +
`packages/ui/src/index.ts` (só adicionar exports).
Restyle todos os componentes à nova linguagem; manter APIs de props/types estáveis.
Consolidar o `components/Button.tsx` legado (não-exportado) no `button.tsx` exportado.

## Agente 3 — App Shell / Nav / Layout
Arquivos: `apps/web/src/app/layout.tsx`, `apps/web/src/app/[locale]/layout.tsx`,
`apps/web/src/components/Navbar.tsx`, `Footer.tsx`, `Logo.tsx` + novos
`Container.tsx`/`Section.tsx`/`PageHeader.tsx` (🟡 já criados).
Restyle chrome; manter skip-link + focus-ring + `#main-content`; consumir primitivos.

## Agente 4 — Home & Marketing
Arquivos: `page.tsx`, `pricing`, `insights`, `studio`, `docs`, `docs/embedding`,
`status`, `offline` + `SpotlightCard`, `SocialProof`, `Marquee`, `HeroTerritory`,
`PriceAnchoring`, `SkylineCanvas`(🟡 criado), `SurrealBackground`, `UrgencyTimer`,
`WhatsNewBanner`, `FreeAIBadge`, `StatusBadge`.
Home (🟡 já tem SkylineCanvas) + páginas de marketing em linguagem editorial premium.

## Agente 5 — Discovery (search/map/property)
Arquivos: `search`, `map`, `property/[id]`, `compare`, `favorites`, `alerts` +
`InvestmentCard`, `InvestmentLegend`, `PropertyThumb`, `SearchKeyboardShortcuts`,
`ShareMenu`. Não editar `BmapViewer.tsx` (Agente 6).

## Agente 6 — Dashboards / Admin / 3D / Chat
Arquivos: `calculator`, `live`, `world`, `sales`, `chat`, `admin/*` (7 páginas) +
`BmapViewer`, `InvestorPanel`, `EnergyPanel`, `LiveDashboard`, `LivePulse`,
`AdminSidebar`, `ContactForm`.

## Agente 7 — Motion / A11y / Storybook
Arquivos: `Motion`, `Cursor`, `ShortcutsHelp`, `ScrollToTop`, `CommandPaletteHost`,
`ErrorBoundary` (web) + `apps/docs/**` (Storybook) + `docs/redesign/MOTION-A11Y.md`.
Auditoria WCAG AA + reduced-motion; não editar componentes de `@landmap/ui`.

---

## Como disparar (exemplo)
```powershell
# team_spawn_teammate para ux-components..ux-motion (ids únicos)
# team_run_task -agentId <id> -runMode async -task "<brief do agente acima>"
# team_await_runs
```
