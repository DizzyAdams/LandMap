# System Design — LandMap (fonte única de verdade)

> Documento-âncora do design system do `apps/web`. Toda página nova ou alteração
> de UI **deve** obedecer a este arquivo. Gerado em 2026-07-14 a partir de
> `src/app/globals.css`, `@landmap/ui`, dos componentes em `src/components`, das
> páginas em `src/app/[locale]` e do snapshot de referência Lovable
> (`apps/web/public/lovable_*.html`).

---

## 0. Status de paridade (auditoria em tempo real)

| Rota | LandMap (local) | Lovable (referência) | Divergência | Estado |
|------|-----------------|----------------------|-------------|--------|
| `/` | Home pública, navbar completa (Mapa/Comparar/Favoritos/Planos) | Hero "Conheça o LandMap" + badge "Edit with" + só links `/plans` `/auth` | Lovable tem badge "Edit with" e navbar mínima; LandMap expõe todas as rotas | ⚠️ estilo alinhado / gating diverg. |
| `/auth` | Login + signup + "Entrar sem cadastro" | Igual + "Entrar com Google" (mockado, novo) | Visual igual; adicionamos Google mock | ✅ |
| `/plans` | 4 planos (Access/Plus/Pro/Business) | 4 planos idênticos | Igual | ✅ |
| `/onboarding` | Hero + 4 passos | Hero + 4 passos | Igual | ✅ |
| `/regions` | **Pública**, conteúdo real | **Gate de auth** | Lovable redireciona p/ `/auth` | ⚠️ decisão: manter pública |
| `/favorites` | **Pública** | **Gate de auth** | idem | ⚠️ decisão: manter pública |
| `/compare` | **Pública** | **Gate de auth** | idem | ⚠️ decisão: manter pública |
| `/dashboard` | **Pública** | **Gate de auth** | idem | ⚠️ decisão: manter pública |
| `/map` | **Pública** + KPIs | **Gate de auth** | idem + KPIs novos | ⚠️ decisão: manter pública |
| `/admin` | **Pública** | **Gate de auth** | idem | ⚠️ decisão: manter pública |

**Veredito:** a camada visual (tokens, tipografia, componentes, gradientes,

---

## 1. Design tokens (1:1 com `lovable_styles.css`)

Definidos em `src/app/globals.css` (`:root` light / `.dark`). Expostos ao Tailwind
via `@theme inline` → utilitários nativos (`bg-background`, `text-foreground/60`,
`border-border`, `bg-primary`, …).

### Cores semânticas (dark)
| Token | valor (oklch) | uso |
|-------|---------------|-----|
| `--background` | `14% .05 265` | canvas |
| `--foreground` | `96% .01 250` | texto |
| `--card` / `--card-foreground` | `19% .07 265` | superfícies |
| `--primary` | `62% .2 265` | ação principal (índigo) |
| `--primary-foreground` | `99% .005 250` | texto sobre primary |
| `--primary-glow` | `75% .17 250` | glow de hover |
| `--muted` / `--muted-foreground` | `22% .06 265` / `72% .03 250` | fundo/suporte |
| `--accent` | `55% .18 265` | hover/selo |
| `--border` | `100% 0 0 / .1` | linhas |
| `--success` | `72% .15 148` | positivo |
| `--warning` | `82% .15 78` | alerta |
| `--destructive` | `65% .22 27` | erro |
| `--ring` | `62% .2 265` | focus ring |

### Raios, sombras, gradientes
- Raios: `--radius .625rem` · `sm/md/lg/xl` derivados.
- Sombras: `--shadow-card`, `--shadow-elegant`, `--shadow-glow`.
- Gradientes: `--gradient-brand`, `--gradient-hero`, `--gradient-accent`.

---

## 2. Tipografia & assets

- **Sans (UI):** `DM Sans` → `--font-sans`.
- **Display (títulos/marcas):** `Space Grotesk` → `--font-display` (`font-display`).
- **Mono (dados/numéricos):** `JetBrains Mono` → `--font-mono`, sempre com
  `tabular-nums` (`.ledger-num`) em preços/KPIs para legibilidade financeira.
- Fontes carregadas via `<link>` Google Fonts no `<head>` (ver `layout.tsx`).

---

## 3. Paleta de KPI & "cores que combinam" (regra de ouro)

Os KPIs e camadas do mapa **sempre** usam esta paleta coesa, derivada do heatmap

---

## 4. Biblioteca de componentes

- **Button:** `.btn` / `.btn-primary` / `.btn-ghost` (raw CSS). `Button` do
  `@landmap/ui` para variantes `default`/`ghost`.
- **Card / Surface:** `.surface`, `SpotlightCard` (spotlight radial que segue o
  ponteiro), `GlowPanel` (glow de borda).
- **Chip / Kicker:** `.chip`, `.kicker` (label de seção em `--primary`).
- **Texto de marca:** `.text-gradient` (gradiente de marca), `LandMapWordmark`.
- **Badges:** `StatusBadge`, `FreeAIBadge`, `BadgeShelf` (`destructive`→`destructive`).
- **Navbar:** sticky, glass (`backdrop-blur-xl`), agrupa Mercado (Regiões/Favoritos/
  Comparar/Dashboard/Mapa) num dropdown; locale switch PT/EN/ES; "Entrar" → avatar
  quando logado (mock). `aria-current`, `focus-visible` ring gold, `Escape` fecha
  mobile sheet.
- **Footer / Banner / Widgets:** removidos das rotas públicas (commit `564340c`)
  para igualar Lovable.

---

## 5. Auditoria de animação (motion)

| Animação | Onde | Mecanismo | Reduced-motion |
|----------|------|-----------|----------------|
| `Reveal` (fade + rise) | `components/Motion.tsx` | GSAP `gsap.from` | `prefers-reduced-motion` → skip |
| `Stagger` (filhos) | `components/Motion.tsx` | GSAP + `ScrollTrigger` | skip |
| `ScrollProgress` (barra topo) | `components/Motion.tsx` | GSAP `scrub` | skip |
| Keyframes `enter`/`exit` | `globals.css` | `@utility animate-in` (port tailwindcss-animate) | respeita via uso |
| `marquee-scroll` | `globals.css` | `@keyframes` (Marquee.tsx) | deve ser neutralizado |
| `animate-spin`/`animate-ping` | spinners/loading | Tailwind nativo | leve; ok |
| `mesh-bg`/`orbs`/`bloom`/`aurora`/`text-surreal` | globals/css | CSS ambiente | neutralizados em reduced-motion |

**Achado:** `framer-motion@11` está em `dependencies` mas **não é usado** no app
(atualmente só GSAP + tailwindcss-animate). Recomendo remover o dep ou adotar
framer-motion conscientemente para evitar 2 motores de animação. GSAP é o padrão
atual — manter.

---

## 6. Padrão de Auth (email + Google mockado)

- `src/lib/mockAuth.ts` → `useMockUser()` (sessão em `localStorage`,
  chave `landmap_mock_user`). `signInWithGoogleMock()` simula OAuth (~600ms) sem
  rede. `signOutMock()` limpa.
- `/auth` (`auth/page.tsx`): tabs Login/Signup + "Entrar com Google" (botão social,
  ícone `GoogleG`) + "Entrar sem cadastro". Login → `/onboarding`.
- Navbar: quando `user` existe, mostra avatar circular (iniciais) no lugar de
  "Entrar"; clique = `signOut()`.
- **Trocar por OAuth real:** substituir `signInWithGoogleMock` pela lib do
  provedor; o resto (hook, navbar, redirect) não muda.

---

## 7. Padrão de Mapa (`/map`)

- Leaflet via API imperativa (evita SSR). `heatRef`/`investRef` limpos a cada
  render (sem vazamento).
- Markers por tipo (`MARKER_COLORS`) + heatmap de preço (`weightColor`).
- **KPIs do mapa** (novo, `mapKpis`): 4 cards brand-colored — Preço médio /m²
  (emerald), Imóveis no mapa (cyan), Valorização YoY (violet), Confiança dos dados
  (gold). `aria-live="polite"` nos contadores.
- `prefers-reduced-motion`: círculos Leaflet são estáticos (sem animação extra).

---

## 8. Governança para PRÓXIMAS páginas

Toda nova rota em `src/app/[locale]/...` deve:
1. Usar `globals.css` tokens (nunca hex solto, exceto a paleta KPI do §3).
2. Seguir navbar/footer existentes (`AppShell`).
3. Usar `Reveal`/`Stagger` p/ entrada e respeitar reduced-motion.
4. KPIs/markers → paleta §3.
5. Manter pública (decisão de paridade) salvo pedido explícito de gate.
6. Rodar `pnpm -F @landmap/web typecheck` + `next build` antes do deploy.

gradiente `emerald → cyan → violet` + o acento *sovereign gold*:

| Papel | Hex | Token de referência | Onde |
|-------|-----|---------------------|------|
| Emerald (entry do heatmap) | `#34d399` | `weightColor` emerald | Preço médio /m², "Em alta" |
| Cyan (meio do heatmap) | `#22d3ee` | `weightColor` cyan | Imóveis ativos, volume |
| Violet (topo do heatmap) | `#a78bfa` | `weightColor` violet | Valorização YoY, ranking |
| Gold sovereign | `#e3b341` | acento `text-[var(--gold-soft)]` | Confiança dos dados, selo "MAIS POPULAR" |

> **Regra:** nunca inventar uma cor fora desta paleta para KPI/marker. Para o
> heatmap, interpolar `emerald→cyan→violet` por peso (0–1) — ver `weightColor()`
> em `map/page.tsx`. Markers por tipo usam azul/verde/laranja/roxo fixos
> (`MARKER_COLORS`), documentados na legenda da página.

animações) está **fiel** à referência Lovable. A única diferença estrutural real
é o **auth-gating**: o Lovable protege `regions/favorites/compare/dashboard/map/admin`
atrás de `/auth`, enquanto o LandMap os mantém públicos (decisão dos commits
`a27e4ec` / `72dc9c8`: "clone total do Lovable" + "home fiel"). Essa divergência é
**intencional e documentada** — não é um bug de paridade visual.
