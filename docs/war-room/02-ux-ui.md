# LandMap — UX/UI & Design System Upgrade (War Room #02)

> **Autor:** Lead Product Designer / UX Engineer — LandMap War Room
> **Data:** 2026 · **Status:** Acionável (2 componentes isolados criados em `@landmap/ui`)
> **Princípio:** Produto vencedor = clareza + consistência de marca + acessibilidade WCAG AA + fluidez sem atrito.
> **Regra:** Nenhum componente existente foi editado; estendeu-se o barrel `index.ts` (via de extensão prevista) e criaram-se arquivos isolados em `packages/ui/src/components/`.

## 0. TL;DR Executivo

A base de design system do LandMap é **sólida e bonita** (tokens bioluminescentes, glass, glows, `cn()`, `SpotlightCard`, `Drawer` com focus-trap, `Toast` acessível, `Accordion`/`Tabs`/`Segmented` com teclado). Mas o **produto ainda tem atrito** em pontos que separam um "app ok" de um "produto vencedor":

- **P0 — O sistema de Toast NUNCA foi montado no layout.** `ToastProvider` só é usado nos testes do pacote. Qualquer feedback de ação cai em texto inline. (Componente pronto, só falta Plug.)
- **P0 — Contraste falha WCAG AA.** `text-neutral-500` (~4.28:1) e `text-neutral-600` (~2.65:1) são usados em texto secundário por toda a app. Precisam migrar para `--muted` (#a3a3a3, ~8:1).
- **P1 — Sem `CommandPalette` global** (⌘K) apesar do `ShortcutsHelp` anunciar o atalho; **loading states fracos** (o `Skeleton` existe no DS mas não é usado); **mobile sem bottom-nav**; **`emerald-500`/`teal` drift** em várias páginas.
- **P2 — Componentes novos desenhados e 2 implementados** (`CommandPalette`, `OnboardingTour`), mais specs de `Stepper`, `EmptyState` aprimorado, `MobileBottomNav`, `NotificationCenter`.

Entregues nesta sessão: `packages/ui/src/components/CommandPalette.tsx` + `OnboardingTour.tsx` (tipados, acessíveis, no padrão `Button.tsx`/`cn()`/tokens) e seus exports no `index.ts`.

## 1. Escopo da Auditoria

**Lido e avaliado:**
- Design system: `packages/ui/src/{index.ts,button.tsx,components/*,tokens.ts,styles.css,cn.ts,lib/*}`.
- Páginas: `[locale]/{page,layout}`, `search`, `property/[id]`, `map`, `compare`, `favorites`, `alerts`, `chat`, `sales`, `insights`.
- Componentes de app: `Navbar`, `Footer`, `SpotlightCard`, `Cursor`, `ShortcutsHelp`, `WhatsNewBanner`, `Motion`.
- Referências de token: `CLAUDE.md`, `docs/design-system-audit.md`, `apps/web/src/app/globals.css`.

**Metodologia:** leitura de código + mapeamento de tokens em uso vs. fonte da verdade + checagem de contraste (razão relativa WCAG) + inspeção de ARIA/teclado/foco + varredura mobile/responsivo. Não foram feitas alterações em archivos centrais além do barrel.

## 2. Achados

### 2.1 Atrito (Friction)

| ID | Sev | Achado | Onde |
|---|---|---|---|
| **F1** | P0 | `ToastProvider` não está montado no `[locale]/layout.tsx`. O DS tem um Toast acessível (`role="status"`, `aria-live`, variants) mas ele é **morto no app** — páginas mostram erros como texto inline. | `apps/web/src/app/[locale]/layout.tsx` (sem import de `ToastProvider`) |
| **F2** | P1 | Estados de carregamento fracos. `favorites`/`alerts` renderizam um shell com **apenas o `<h1>`** até hidratar (`if (!mounted) return <h1>…`); `insights`/`chat` usam "Carregando…" textual. O componente `Skeleton` **existe no DS mas não é usado em nenhuma página**. | `favorites/page.tsx:43`, `alerts/page.tsx:93`, `insights/page.tsx:138` |
| **F3** | P1 | Sem `CommandPalette` global. `ShortcutsHelp` anuncia `⌘K` / `/` / `?`, mas **só a search page tem `#search-input`**; não há paleta de comandos. O atalho ⌘K não está implementado em lugar nenhum (grep: única ref é `SearchKeyboardShortcuts` focando `#search-input`). | `components/ShortcutsHelp.tsx`, `SearchKeyboardShortcuts.tsx` |
| **F4** | P1 | `EmptyState` é mínimo (sem ícone, sem slot de ação consistente). O empty de `compare` instrui *"Adicione IDs na URL para comparar, por exemplo ?ids=1,2,3"* — não amigável (exige manipular query string). | `compare/page.tsx:63`, `components/EmptyState.tsx` |
| **F5** | P1 | Mobile nav é um dropdown no topo; não há **bottom-nav** para ações primárias no thumb-zone (Buscar, Mapa, Favoritos, Comparar, Chat). Em telas pequenas o usuário precisa abrir o menu para tudo. | `Navbar.tsx:133` |
| **F6** | P2 | Sem onboarding/first-run guiado. `WhatsNewBanner` é um bom padrão localDismissível reutilizável, mas não há tour dos recursos para novos usuários. | `components/WhatsNewBanner.tsx` |
| **F7** | P2 | Sem `NotificationCenter`. `alerts` são filtros salvos em `localStorage`; não há inbox de "novos matches" / novidades com badge de não-lidas. | `alerts/page.tsx` |
| **F8** | P2 | Sem `Stepper`. O pipeline de vendas (`sales`) renderiza estágios como lista; falta progresso visual de etapas (útil também p/ onboarding e checkout). | `sales/page.tsx` |
| **F9** | P2 | Variante `gold` (Sovereign) **não está exportada** pelo DS. O `Button` exportado (`packages/ui/src/button.tsx`) tem `default|outline|ghost|hero`; o `gold` existe só no `components/Button.tsx` legado (não exportado). A ação premium de investidor não é reutilizável via DS. | `packages/ui/src/button.tsx` vs `components/Button.tsx` |


### 2.2 Inconsistências de Tokens / Marca

| ID | Sev | Achado | Onde |
|---|---|---|---|
| **T1** | P1 | **Drift `emerald-500` / `teal`** fora da paleta de marca. A marca exige `emerald-400` (#34d399) e `cyan` (não `teal`). Encontrado em gradientes e bordas de ação. | `sales/page.tsx:360` (`from-emerald-500 to-teal-300`), `pricing/page.tsx:83,105,129`, `map/page.tsx`, `property/[id]/share-button.tsx:18`, `SpotlightCard.tsx` (`hover:border-emerald-500/40`) |
| **T2** | P2 | Componentes do DS usam `white/5`, `white/10`, `neutral-*` em vez dos tokens `--surface-1`/`--border`/`--muted`. Funciona, mas dificulta temização e gera divergência do CSS. | `Card`, `Badge`, `Input`, `Stat`, `Toast`, `Skeleton` |
| **T3** | P2 | **Anel de foco inconsistente.** O global `:focus-visible` (globals.css) é **gold**; os componentes (`Card`, `Tabs`, `Tooltip`, `Input`, `Accordion`, `Toast`) usam **emerald** (`ring-emerald-400/60`). Decida 1 acento e exponha como `--focus-ring`. | `globals.css:278`, `Card.tsx:22`, etc. |
| **T4** | P2 | Tom de `trend` diverge: `Stat` usa `emerald-400`/`red-400`; `StatPill` usa `emerald-300`/`red-300`. Unificar (sugerido `emerald-300`/`red-300` para pill, `emerald-400`/`red-400` para Stat). | `Stat.tsx:30`, `StatPill.tsx:44` |
| **T5** | P2 | **Dois `Button`** (`button.tsx` exportado × `components/Button.tsx` legado `primary|gold|…` não exportado). Confusão de variantes. Consolidar o `gold` no exportado (ver spec F9). | `packages/ui/src/button.tsx`, `components/Button.tsx` |

### 2.3 Acessibilidade (WCAG AA)

| ID | Sev | Achado | Detalhe / Correção |
|---|---|---|---|
| **A1** | P0 | **Contraste abaixo de AA.** `text-neutral-500` ≈ **4.28:1** (falha p/ texto < 18px, limite 4.5:1); `text-neutral-600` ≈ **2.65:1** (falha grave). Usados em `Stat` label, `EmptyState` desc, `hint`, tabelas, `labels`, `Footer`. | Use `--muted` (#a3a3a3 ≈ **8.07:1**) p/ texto secundário; `neutral-500` só p/ texto ≥18px ou decorativo; **elimine `neutral-600` para texto** (reserve p/ hairlines/bordas). |
| **A2** | P1 | **Sliders/inputs do mapa sem associação label↔input.** `<label>` sem `htmlFor`; range/heatmap sem `id`/`aria-label`. Leitor de tela não anuncia o controle. | Adicionar `id` + `htmlFor` ou `aria-label` em `map/page.tsx:238,255,276,320`. |
| **A3** | P1 | `Button` do DS mostra focus-ring **no clique do mouse** (`onFocus` state, não `:focus-visible`). Anel desnecessário em ponteiro. | Trocar `onFocus/onBlur` + `focusBase` por `focus-visible:` CSS (ou manter `:focus-visible` no `cn`). |
| **A4** | P1 | Sem canal acessível de feedback por falta do `ToastProvider` (ver F1). O componente já tem `role="status"`/`aria-live`, mas inútil sem provider. | Montar `ToastProvider` no layout (snippet §5). |
| **A5** | P2 | `Cursor` custom está **correto** (gateado `(hover:hover) and (pointer:fine)`, `prefers-reduced-motion`, `aria-hidden`, cursor nativo preservado). Manter + garantir `forced-colors: none`. Skip-link existe (bom). | Sem ação além de `forced-colors`. |
| **A6** | P2 | Cards de imóvel (`SpotlightCard`) são `div` não focáveis; o `Link` interno herda só o focus global. Sem ring próprio além do outline global. | Adicionar `focus-visible:ring-2 focus-visible:ring-emerald-400/60` no `Link` ou no card (`tabIndex`/wrapping `Link`). |

**Razões de contraste (WCAG 2.1, fundo `#050505`):**
- `neutral-600` #525252 → L≈0.087 → **2.65:1** ❌
- `neutral-500` #737373 → L≈0.171 → **4.28:1** ⚠️ (só AA p/ grande)
- `neutral-400` #a3a3a3 → L≈0.367 → **8.07:1** ✅
- `--muted` #a3a3a3 → idem ✅ (use este p/ texto secundário)

### 2.4 Mobile / Responsivo

| ID | Sev | Achado | Correção |
|---|---|---|---|
| **M1** | P1 | Sem bottom-nav; ações primárias exigem abrir menu no topo; footer distante no scroll. | `MobileBottomNav` fixo (spec §4). |
| **M2** | P1 | Grids viram 1 coluna cedo; tabela `compare` tem `overflow-x` mas **sem sticky na 1ª coluna** em mobile (rótulo de atributo some). | `sm:grid-cols-2` antes; `position: sticky; left:0` na `<th scope="row">`. |
| **M3** | P2 | Hero decorations escondidos no mobile (bom). Garantir **touch targets ≥ 44px** (navbar toggle 40px ok; alguns botões 36px). | Subir para `h-11`/`min-h-[44px]` em CTAs principais. |
| **M4** | P2 | `CommandPalette`/`OnboardingTour` devem ser mobile-friendly (paleta ocupa tela; tour cai no card central quando sem `target`). | Já tratado nos componentes (§4). |



## 3. Backlog Priorizado (P0 / P1 / P2)

| # | Prioridade | Item | Tipo | Esforço | Impacto |
|---|---|---|---|---|---|
| 1 | **P0** | Montar `ToastProvider` no layout + usar `useToast` nas ações | Plug (app) | S | Alto |
| 2 | **P0** | Corrigir contraste (migrar `neutral-500/600` → `--muted`/`neutral-400`) | Tokens/app | M | Alto (A11y/AA) |
| 3 | **P1** | `CommandPalette` global (⌘K) + handler | **Feito (DS)** + Plug app | S | Alto |
| 4 | **P1** | Adotar `Skeleton` em loading (search/map/favorites/insights) | App | M | Alto |
| 5 | **P1** | `MobileBottomNav` fixo | Novo (app) + spec | S | Alto (mobile) |
| 6 | **P1** | Corrigir drift `emerald-500`/`teal` → `emerald-400`/`cyan-400` | App | S | Médio (marca) |
| 7 | **P1** | Associar `label`↔`input` no mapa (sliders/heatmap) | App (a11y) | S | Médio (A11y) |
| 8 | **P1** | `EmptyState` aprimorado (ícone + ação + tom on-brand) | **Spec** (estender DS) | S | Médio |
| 9 | **P2** | `OnboardingTour` first-run | **Feito (DS)** + Plug app | S | Médio (ativção) |
| 10 | **P2** | `NotificationCenter` (drawer + badge) | **Spec** (DS) | M | Médio |
| 11 | **P2** | `Stepper` (pipeline/onboarding/checkout) | **Spec** (DS) | S | Médio |
| 12 | **P2** | Unificar anel de foco via `--focus-ring` (gold×emerald) | Tokens | S | Baixo/Médio |
| 13 | **P2** | Variante `gold` no `Button` exportado + consumir tokens nos componentes | DS | M | Baixo (marca) |
| 14 | **P2** | `:focus-visible` no `Button`; sticky 1ª coluna na tabela compare | DS/App | S | Baixo (A11y) |

**Sequência sugerida:** P0 (1→2) → P1 (3→4→5→6→7→8) → P2 (9→10→11→12→13→14).

## 4. Specs de Componentes

Padrão comum (segue `Button.tsx`): `cn()` de `../lib/index`, tokens via CSS vars (`--emerald`, `--cyan`, `--gold`, `--surface-1`, `--glow-emerald`, `--glow-dual`), `motion-reduce:transition-none`, `focus-visible:ring-2 ring-emerald-400/60`, `aria-*` corretos.

### 4.1 `CommandPalette` ✅ IMPLEMENTADO (`packages/ui/src/components/CommandPalette.tsx`)

**Props**
```ts
interface CommandItem { id: string; label: string; hint?: ReactNode; icon?: ReactNode;
  keywords?: string[]; tone?: 'emerald'|'cyan'|'violet'|'gold'|'neutral'; onSelect: () => void; }
interface CommandGroup { heading: string; items: CommandItem[]; }
interface CommandPaletteProps { open: boolean; onClose: () => void; groups: CommandGroup[];
  placeholder?: string; label?: string; }
```
**Comportamento**
- `role="dialog"` + `aria-modal`; overlay com `bg-black/70 backdrop-blur`; clique fora = `onClose`.
- Input `role="combobox"` com `aria-expanded`/`aria-controls`/`aria-activedescendant`/`aria-autocomplete="list"`.
- Lista `role="listbox"`, itens `role="option"` + `aria-selected`. Navegação: ↑/↓ (circular), Home/End, Enter (seleciona), Esc (fecha). `scrollIntoView` no ativo.
- Filtro acento-insensível (NFD) sobre `label`+`keywords`. Auto-foco no input ao abrir.
- Tokens: `.surface` + `shadow-[var(--glow-dual)]`; hint em `.font-mono text-neutral-500`; active `bg-white/[0.07]`.

**Uso (app)**
```tsx
import { CommandPalette, type CommandGroup } from '@landmap/ui';

const groups: CommandGroup[] = [
  { heading: 'Navegar', items: [
    { id: 'search', label: 'Buscar imóveis', hint: '/', tone: 'emerald',
      keywords: ['procurar', 'filtro'], onSelect: () => router.push(`/${locale}/search`) },
    { id: 'map', label: 'Mapa interativo', tone: 'cyan', onSelect: () => router.push(`/${locale}/map`) },
  ]},
  { heading: 'Ações', items: [
    { id: 'fav', label: 'Ver favoritos', tone: 'violet', onSelect: () => router.push(`/${locale}/favorites`) },
  ]},
];

<CommandPalette open={open} onClose={() => setOpen(false)} groups={groups} />
```

### 4.2 `OnboardingTour` ✅ IMPLEMENTADO (`packages/ui/src/components/OnboardingTour.tsx`)

**Props**
```ts
interface TourStep { target?: string; title: string; description: ReactNode;
  placement?: 'top'|'bottom'|'left'|'right'|'center'; }
interface OnboardingTourProps { open: boolean; steps: TourStep[]; onFinish: () => void;
  onSkip?: () => void; storageKey?: string; label?: string; }
```
**Comportamento**
- `role="dialog"` + `aria-modal`; foco movido para o card; **Esc = skip**; `aria-live` anuncia "Passo X de Y".
- Spotlight via `box-shadow: 0 0 0 9999px rgba(0,0,0,.65)` sobre um anel `ring-emerald-400/70` no `target` (selector CSS, ex. `[data-tour="search"]`).
- Recalcula o retângulo do alvo em `scroll`/`resize`; se o alvo sair da tela ou não existir, **card centralizado**.
- `placement` auto (top se alvo na metade inferior); clamp ao viewport. `prefers-reduced-motion` respeitado.
- `storageKey` persiste conclusão em `localStorage` e auto-skippa em visitas seguintes.

**Uso (app)**
```tsx
import { OnboardingTour, type TourStep } from '@landmap/ui';

const steps: TourStep[] = [
  { target: '[data-tour="search"]', title: 'Busque com filtros', description: 'Combine cidade, tipo e preço.' },
  { target: '[data-tour="map"]',    title: 'Veja o heatmap',    description: 'Preço por bairro no mapa.' },
  { title: 'Pronto!', description: 'Explore à vontade. Você pode reabrir pelo "?".', placement: 'center' },
];

<OnboardingTour open={showTour} steps={steps} storageKey="landmap:tour:v1"
  onFinish={() => setShowTour(false)} onSkip={() => setShowTour(false)} />
```



### 4.3 `Stepper` (spec — recomendado, não implementado)

**Props**
```ts
interface Step { id: string; label: string; description?: string; icon?: ReactNode; }
interface StepperProps { steps: Step[]; current: number;        // índice do passo ativo
  orientation?: 'horizontal'|'vertical'; onStepClick?: (i: number) => void;
  className?: string; }
```
**Comportamento**
- `role="list"` de passos; cada item `aria-current="step"` no ativo; concluídos com check (✓) e linha conectando preenchida com gradiente `emerald→cyan`.
- Horizontal: círculos + rótulo abaixo; Vertical: trilha à esquerda. Estados: `done` (emerald), `active` (glow-emerald + ring), `upcoming` (neutral).
- `onStepClick` só em passos já visitados/concluídos (não pula à frente). Foco/teclado: Tab nos clicáveis, Enter/Space aciona.
- Tokens: círculo `bg-white/5 border-white/10`; ativo `bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#050505] shadow-[var(--glow-emerald)]`.

**Snippet**
```tsx
<div role="list" className="flex items-center gap-2">
  {steps.map((s, i) => {
    const state = i < current ? 'done' : i === current ? 'active' : 'upcoming';
    return (
      <div key={s.id} role="listitem" aria-current={state === 'active' ? 'step' : undefined}
        className={cn('flex items-center gap-2', i < steps.length - 1 && 'flex-1')}>
        <span className={cn('grid h-8 w-8 place-items-center rounded-full border text-xs font-semibold',
          state === 'active' && 'border-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 text-[#050505] shadow-[var(--glow-emerald)]',
          state === 'done'  && 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
          state === 'upcoming' && 'border-white/10 bg-white/5 text-neutral-500')}>
          {state === 'done' ? '✓' : i + 1}
        </span>
        <span className="text-xs text-neutral-400">{s.label}</span>
        {i < steps.length - 1 && <span className="h-px flex-1 bg-white/10" />}
      </div>
    );
  })}
</div>
```

### 4.4 `EmptyState` aprimorado (spec — estender o existente)

O atual (`components/EmptyState.tsx`) é só texto. Proposta de extensão (mantém API atual + campos opcionais):
```ts
interface EmptyStateProps {
  title: string; description?: string; icon?: ReactNode;   // novo: ilustração/ícone
  action?: ReactNode;                                       // novo: slot de CTA (substitui children soltos)
  tone?: 'emerald'|'cyan'|'violet'|'gold'|'neutral';        // novo
  className?: string;
}
```
**Comportamento**
- Ícone central num disco `bg-white/[0.04] border-white/10` com tom da marca; `title` em `text-neutral-100`, `description` em `--muted` (não `neutral-500` — corrige A1).
- `action` renderizado com margem e estilo de CTA consistente. Mantém `children` p/ compatibilidade.
- Substitui o empty de `compare` por um com `action` = botão "Buscar imóveis" (sem instruir query string).

**Snippet**
```tsx
<div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
  <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-emerald-300">{icon}</div>
  <p className="mt-4 text-sm font-medium text-neutral-100">{title}</p>
  {description && <p className="mx-auto mt-1 max-w-sm text-xs text-[var(--muted)]">{description}</p>}
  {action && <div className="mt-4 flex justify-center">{action}</div>}
</div>
```



### 4.5 `MobileBottomNav` (spec — recomendado, não implementado)

**Props**
```ts
interface NavItem { href: string; label: string; icon: ReactNode; badge?: number; tourId?: string; }
interface MobileBottomNavProps { items: NavItem[]; locale: string; }
```
**Comportamento**
- Fixo `bottom-0 inset-x-0 z-40` com `.glass` + `border-t border-white/10`; visível **só em `md:hidden`** (desktop fica com a navbar).
- 5 itens (Buscar, Mapa, Favoritos, Comparar, Chat) com ícone + rótulo `text-[10px]`; `aria-current="page"` no ativo; `touch target ≥ 44px` (`min-h-[56px]`).
- `badge` opcional (ex.: alertas não lidos) com pill `bg-emerald-400 text-[#050505]`. `tourId` espelha `data-tour` p/ o `OnboardingTour`.
- `aria-label="Navegação principal (mobile)"`.

**Snippet**
```tsx
<nav aria-label="Navegação principal (mobile)"
  className="glass fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 md:hidden">
  {items.map((it) => (
    <Link key={it.href} href={`/${locale}${it.href}`} data-tour={it.tourId}
      aria-current={isActive(it.href) ? 'page' : undefined}
      className="relative flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 text-[10px] text-neutral-400 focus-visible:ring-2 focus-visible:ring-emerald-400/60">
      {it.icon}
      <span>{it.label}</span>
      {it.badge ? <span className="absolute right-1 top-1 rounded-full bg-emerald-400 px-1 text-[9px] font-bold text-[#050505]">{it.badge}</span> : null}
    </Link>
  ))}
</nav>
```

### 4.6 `NotificationCenter` (spec — recomendado, não implementado)

**Props**
```ts
interface Notification { id: string; title: string; body?: string; time: string;
  tone?: 'emerald'|'cyan'|'violet'|'gold'|'neutral'; read?: boolean; href?: string; }
interface NotificationCenterProps { open: boolean; onClose: () => void;
  items: Notification[]; onMarkAllRead?: () => void; }
```
**Comportamento**
- **Reaproveita `Drawer`** (`side="right"`) — já tem focus-trap + ESC + `role="dialog"`.
- Lista `role="list"`; cada item `role="listitem"` com dot tonal; não-lidas com `bg-emerald-400/10` + ring sutil.
- Header com título + "Marcar todas como lidas"; botão sino na navbar com `badge` de não-lidas e `aria-label`.
- `aria-live="polite"` anuncia novas; fecha com ESC/backdrop.

**Snippet**
```tsx
// Sino na navbar (substitui/complementa o toggle de idioma)
<button aria-label={`Notificações${unread ? `, ${unread} não lidas` : ''}`}
  className="relative rounded-lg border border-white/10 p-2 text-neutral-300 focus-visible:ring-2 focus-visible:ring-emerald-400/60">
  <BellIcon />
  {unread > 0 && <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />}
</button>

// Painel (Drawer existente)
<Drawer open={open} onClose={onClose} title="Novidades" description={`${unread} não lidas`}>
  <ul role="list" className="space-y-2">
    {items.map((n) => (
      <li key={n.id} className={cn('rounded-lg border p-3', n.read ? 'border-white/10' : 'border-emerald-400/30 bg-emerald-400/5')}>
        <p className="text-sm text-neutral-100">{n.title}</p>
        {n.body && <p className="mt-0.5 text-xs text-[var(--muted)]">{n.body}</p>}
      </li>
    ))}
  </ul>
</Drawer>
```



## 5. Snippets de Integração (App)

### 5.1 Montar `ToastProvider` no layout (resolve F1/A4)
Em `apps/web/src/app/[locale]/layout.tsx`, adicionar o provider (não altera componentes do DS):
```tsx
import { ToastProvider } from '@landmap/ui';
// ...dentro do return, envolver o shell:
<NextIntlClientProvider messages={messages} locale={resolvedLocale}>
  <a href="#main-content" className="sr-only focus:not-sr-only …">Pular para o conteúdo</a>
  <WhatsNewBanner />
  <style dangerouslySetInnerHTML={{ __html: '…' }} />
  <div className="relative min-h-[100dvh] …">
    <Cursor />
    <Navbar />
    <ToastProvider>                       {/* ← novo */}
      <div id="main-content" tabIndex={-1}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
      <CommandPaletteHost locale={resolvedLocale} />  {/* ← novo (⌘K) */}
    </ToastProvider>
    <Footer />
    <ScrollToTop />
    <ShortcutsHelp />
  </div>
</NextIntlClientProvider>
```

### 5.2 Handler global ⌘K (resolve F3)
```tsx
'use client';
import { useEffect, useState } from 'react';
import { CommandPalette, type CommandGroup } from '@landmap/ui';

export function CommandPaletteHost({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing = ['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement)?.tagName);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(true); }
      else if (e.key === '/' && !typing) { e.preventDefault(); setOpen(true); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const groups: CommandGroup[] = [ /* …ver §4.1… */ ];
  return <CommandPalette open={open} onClose={() => setOpen(false)} groups={groups} />;
}
```

### 5.3 `Skeleton` em loading de lista (resolve F2)
```tsx
{loading ? (
  <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-hidden>
    {Array.from({ length: 6 }).map((_, i) => (
      <li key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
        <Skeleton variant="text" className="w-2/3" />
        <Skeleton variant="text" className="mt-2 w-1/3" />
        <Skeleton variant="rect" className="mt-4 h-6 w-24" />
      </li>
    ))}
  </ul>
) : ( /* lista real */ )}
```

### 5.4 `useToast` numa ação (ex.: favoritar)
```tsx
import { useToast } from '@landmap/ui';
const { toast } = useToast();
// após salvar favorito:
toast({ variant: 'success', title: 'Salvo', description: 'Imóvel adicionado aos favoritos.' });
```



## 6. Plano de Acessibilidade (WCAG AA)

1. **Contraste (A1):** substituir `text-neutral-500`→`text-neutral-400` (ou `text-[var(--muted)]`) em texto ≤18px; **banir `text-neutral-600` para texto** (manter p/ hairlines). Alvo: ≥ 4.5:1 corpo, ≥ 3:1 grande.
2. **Foco (T3/A3):** unificar em `--focus-ring: 0 0 0 2px var(--emerald), 0 0 0 4px rgba(52,211,153,.25)`; usar `:focus-visible` (não `:focus`) no `Button`; manter skip-link.
3. **Teclado:** todos os componentes novos já são operáveis por teclado (⌘K, ↑/↓/Enter/Esc no palette; ↑/↓/Enter/Esc no tour; Tab no Stepper/bottom-nav). Garantir `Drawer`/`Toast` consistentes.
4. **ARIA:** `role=dialog/aria-modal` + foco no abrir; `aria-live`/`role=status` p/ toasts e novidades; `aria-current="page"` na nav ativa; `listbox/option` no palette.
5. **Forms (A2):** todo `<input>`/`<select>`/`<range>` com `<label htmlFor>` ou `aria-label`; erros via `aria-invalid`+`aria-describedby` (padrão do `Input`).
6. **Reduced motion:** manter `motion-reduce:transition-none` e os `@media (prefers-reduced-motion)` já presentes; `Cursor` já respeita.
7. **Forced colors:** adicionar `@media (forced-colors: active){ .cursor-aura,.cursor-dot{display:none} }` e garantir foco visível via `outline`.

## 7. Plano de Design Responsivo

- **Breakpoints:** mobile `<640px` (bottom-nav), `sm` 2 colunas, `lg` 3 colunas (grids de imóveis/cards). Evitar 1 coluna precoce.
- **Bottom-nav (M1):** `MobileBottomNav` fixo `md:hidden`; navbar desktop inalterada. Compensar `pb-[72px]` no main em mobile.
- **Tabelas (M2):** `compare` com `th[scope=row]` `sticky left-0 bg-[var(--surface-1)]` em mobile; `min-w` no container.
- **Touch (M3):** alvos ≥ 44px (`min-h-[44px]`/`min-h-[56px]`); evitar hover-only em mobile.
- **Mapa:** manter toggle de sidebar (já existe); garantir `<button>` de toggle com rótulo e foco.

## 8. Micro-interações & Motion

- **Reuse:** `SpotlightCard` (ponto que segue o cursor), `Reveal`/`Stagger` (framer-motion), `Cursor` (gateado), `Toast` (spring), `Skeleton` (shimmer).
- **Palette:** entrada com `scale/opacity` suave; item ativo com `bg-white/[0.07]`; sem layout shift.
- **Tour:** cutout por `box-shadow` (sem repaint pesado); card com leve `translate-y` no aparecer; respeita `prefers-reduced-motion`.
- **Feedback:** toda ação destrutiva/assíncrona → `toast` (success/error/info) em vez de texto solto.
- **Consistência de tom:** gradientes de ação sempre `emerald-400→cyan-400`; ouro (`--gold`) só p/ acentos Sovereign/investidor.

## 9. Arquivos Criados (isolados — nenhum componente existente editado)

```text
packages/ui/src/components/
├─ CommandPalette.tsx     # ✅ novo (⌘K, acessível: combobox+listbox, focus trap, ESC)
├─ OnboardingTour.tsx     # ✅ novo (spotlight first-run, aria-live, reduced-motion)
packages/ui/src/index.ts   # ➕ apenas ADICIONADOS 4 exports (barrel de extensão prevista)
docs/war-room/02-ux-ui.md  # este documento
```
> O `Button` exportado, os componentes existentes e `globals.css`/`styles.css`/`tokens.ts` **não foram modificados**. A única edição em arquivo central foi a adição de exports ao `index.ts` (via de extensão do DS, conforme solicitado).

## 10. Próximos Passos (do P0 ao P2)
1. Plugar `ToastProvider` + `CommandPaletteHost` no layout (P0/P1).
2. Varredura de contraste (`neutral-500/600`→`muted`/`neutral-400`) via codemod/local (P0).
3. `Skeleton` nas telas de dados; `MobileBottomNav`; correção de drift `emerald-500`/`teal` (P1).
4. `EmptyState` aprimorado, `OnboardingTour` no first-run, `NotificationCenter`, `Stepper`, unificar `--focus-ring` e variante `gold` (P2).

**Objetivo de qualidade:** LandMap percebido como "produto vencedor" — fluidez sem atrito, marca 100% consistente, WCAG AA, e encantamento nas micro-interações.

