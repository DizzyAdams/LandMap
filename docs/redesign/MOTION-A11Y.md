# LandMap 2.0 — Motion & Accessibility Audit (WCAG AA)

> Entregável do **Agente 7**. Estado real verificado no código em 2026-07-10.
> Foco: garantir que o redesign "Sovereign Intelligence" respeite
> `prefers-reduced-motion`, mantenha anéis de foco visíveis e alcance
> contraste AA — sem alterar rotas, dados ou lógica.

## 1. Reduced-motion (✅ coberto no core)

Postura centralizada em dois pontos:

- **CSS global** — `apps/web/src/app/globals.css` ~L402 desliga animações
  perpétuas dentro de `@media (prefers-reduced-motion: reduce)`:
  ```css
  .marquee-track { animation: none; }
  .aurora        { animation: none; }
  ```
  `packages/ui/src/styles.css` ~L107 faz o mesmo no `.skeleton::after`.
- **Componentes** usam utilitários Tailwind `motion-reduce:*` para neutralizar
  transforms/transições não-essenciais: `Button`, `Card`, `Tabs`, `Stepper`,
  `Segmented`, `Input`, `Drawer`, `Accordion`, `MobileBottomNav`
  (`motion-reduce:transition-none`, `motion-reduce:hover:translate-y-0`,
  `motion-reduce:active:scale-100`).
- **JS guards** — `Motion.tsx` (`prefersReduced`), `ScrollToTop`
  (`behavior: reduce ? 'auto' : 'smooth'`), `Cursor.tsx` (`reduced`),
  `SkylineCanvas.tsx` (guard `motion-reduce` no call site) respeitam a preferência.

✅ **Veredito:** nova animação introduced no redesign (`SkylineCanvas`,
`shimmer`, `sheen`, `pulse-live`, `lift`, `link-underline`) segue o mesmo
padrão e é segura para usuários com `prefers-reduced-motion`.

## 2. Foco visível (🟡 maioria OK, 1 gap conhecido)

- `:focus-visible` global em `globals.css` ~L388 aplica anel emerald:
  ```css
  :focus-visible {
    outline: 2px solid color-mix(in srgb, var(--emerald) 70%, transparent);
    outline-offset: 2px;
  }
  ```
- Componentes interativos do DS já carregam `outline-none` + `transition`
  e herdam o anel global (ex.: `Tabs`, `Segmented`, `Input`, `Accordion`,
  `MobileBottomNav`, `NotificationCenter`, `Drawer`).

✅ **Gap A3 (P1) — RESOLVIDO:** o `Button` do DS aplica `focusBase` (anel emerald) **somente** quando `:focus-visible` (foco de teclado); clique de mouse não dispara o anel. `packages/ui/src/button.tsx:117`.


⚠️ **Gap A6 (P2, herdado):** `SpotlightCard` é `div` não focável; o `Link`
interno herda só o foco global. Recomendação: adicionar
`focus-visible:ring-2 focus-visible:ring-emerald-400/60` no `Link` ou wrap.

## 3. Contraste AA (🟡 tokens OK, drift pontual)

- **Tokens AA-safe** definidos em `TOKENS.md`: `--text-muted:#c9c9c9`,
  `--text-faint:#8a8a8a` (acima do limiar AA para texto com significado).
  `--text-faint` usado só em caption/semântica fraca.
- `PageHeader` já usa `!text-[var(--text-muted)]` na descrição.

✅ **Gap T1 (P1) — RESOLVIDO:** drift `emerald-500`→`emerald-400` corrigido em `BmapViewer.tsx` (2×), `InvestorPanel.tsx` (2×), `SkylineCanvas.tsx` (1×). `teal-*` já inexistente em código. Marca = `emerald-400` (#34d399) + `cyan` em todo o app e no DS.

⚠️ **Gap T2 (P2, herdado):** componentes do DS usam `white/5`, `white/10`,
`neutral-*` em vez de `--surface-1`/`--border`/`--muted`. Funciona, mas
dificulta temização. Migrar para tokens quando restylar o DS (Agente 2).

## 4. ARIA / Estrutura (✅ presente)

- `role="dialog"` + `aria-modal` + focus trap no `OnboardingTour`/`Drawer`;
  `aria-live`/`role="status"` em `Toast` e novidades; `aria-current="page"`
  na nav ativa; `listbox`/`option` no command palette; `role="list"` no
  comparador; `aria-label` nas notas A–F.
- Skip-link + `#main-content` mantidos no shell.

✅ **Gap A4 (P1) — RESOLVIDO:** `ToastProvider` já está montado em `apps/web/src/app/[locale]/layout.tsx:121` (envolve `ErrorBoundary` + `children`), então `Toast`/`useToast` funcionam de fato.
Montar `ToastProvider` no layout raiz.

## 5. Forms (✅ padrão do `Input`)

Todo `<input>`/`<select>`/`<range>` do DS usa `<label htmlFor>` ou
`aria-label`; erros via `aria-invalid` + `aria-describedby`. Manter esse
padrão nas páginas (`calculator`, `admin/settings`, `admin/webhooks`,
`admin/properties`).

## 6. Pendências (backlog)

| ID | Pri | Estado | Item | Ação |
|----|-----|--------|------|------|
| A3 | P1 | ✅ resolvido | Ring de foco em ponteiro no `Button` | `:focus-visible` gate no `button.tsx` |
| A4 | P1 | ✅ resolvido | `ToastProvider` não montado | Já montado no `[locale]/layout.tsx:121` |
| A6 | P2 | ⏳ aberto | `SpotlightCard` não focável | `focus-visible:ring` no `Link` envolvente (baixo risco; deixado pois o card é genérico) |
| T1 | P1 | ✅ resolvido | Drift `emerald-500`/`teal` | → `emerald-400`/`cyan` em todo o código |
| T2 | P2 | ⏳ aberto | DS usa `white/5`/`neutral-*` | Migrar p/ tokens (P2, baixo risco; adiado) |
| —  | —  | ✅ entregue | **Storybook** | `apps/web/stories/**` (Tokens + Components) + `.storybook/{main,preview}.ts`; roda com `pnpm install` + `pnpm docs` |

## 7. Como validar

```powershell
# Typecheck (não quebra build)
cd packages/ui && npx tsc --noEmit
cd apps/web    && npx tsc --noEmit -p tsconfig.json

# Reduced-motion: DevTools → Rendering → "Emulate prefers-reduced-motion:
# reduce" → navegar por home/marquee/SkylineCanvas → nenhuma animação perpetua.
# Contraste: axe DevTools / Lighthouse a11y em modo reduce e normal.
# Foco: navegar só com Tab → anel emerald visível em todo elemento interativo.
```
