# Padrão de Port do Design System do Lovable → LandMap

Este arquivo é a referência OBRIGATÓRIA para portar telas do Lovable (landmap-insight.lovable.app)
para o LandMap. O objetivo é substituir o estilo antigo (`GlowPanel` + `neutral-*`) pelo
design system do Lovable (claro/indigo, tokens `--lovable-*`), já aplicado em
`apps/web/src/app/[locale]/{regions,favorites,auth,intro,plans}/page.tsx`.

## Tokens (definidos em apps/web/src/app/globals.css :root)
- `--card` / `--background` / `--foreground` / `--muted` / `--muted-foreground`
- `--primary` / `--primary-foreground`
- `--border-lovable`  (bordas suaves claras)
- `--muted-lovable`   (hover de linhas/cards)
- `--ring-lovable`    (foco)
- Todos consumidos via `bg-[var(--card)]`, `border-[var(--border-lovable)]`,
  `text-[var(--muted-foreground-lovable)]`, `text-[var(--primary)]`, etc.

## Regras
1. REMOVA `<GlowPanel>` — substitua por `<div className="rounded-2xl border border-[var(--border-lovable)] bg-[var(--card)] p-4">`.
2. REMOVA cores `neutral-*` e `emerald-*` hardcoded — use tokens `var(--...)`.
   - Texto secundário: `text-[var(--muted-foreground-lovable)]`
   - Texto forte: `text-[var(--foreground)]`
   - Destaque/CTA primário: `bg-[var(--primary)] text-[var(--primary-foreground)]`
   - Hover de card/linha: `hover:bg-[var(--muted-lovable)]`
3. Ícones: importe de `../../../components/lovable/icons` (não de `lucide-react`).
   Ícones disponíveis: MapPinned, Sparkles, ArrowLeft, Check, Mail, Lock, User, Eye,
   EyeOff, ArrowRight, TrendingUp, BellRing, ShieldCheck, Star, Building2, MapPin, X,
   Search, GitCompare, Plus, Filter, ChevronDown, ChevronRight, SlidersHorizontal,
   LineChart, BarChart, ArrowUpDown, Layers, Activity, Trash2, LandMapWordmark.
4. Mantenha a estrutura de dados/localização existente (useLocale, Link com `/${locale}`).
5. NÃO altere a lógica de fetch/API existente — só o visual.
6. Telas que são Server Components (`export const dynamic = 'force-dynamic'` + fetch) mantenham
   o 'use client' apenas se usarem hooks. Se a tela original não tem 'use client', não adicione.

## Modelo mínimo (copiado de regions/page.tsx)
```tsx
'use client';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Star, MapPin } from '../../../components/lovable/icons';

export default function XPage() {
  const locale = useLocale();
  const lh = (p: string) => `/${locale}${p}`;
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header>
        <p className="text-sm font-medium text-[var(--primary)]">Eyebrow</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Título</h1>
        <p className="mt-1 text-[var(--muted-foreground-lovable)]">Subtítulo</p>
      </header>
      <div className="bg-[var(--card)] border border-[var(--border-lovable)] rounded-lg">
        {/* conteúdo */}
      </div>
    </div>
  );
}
```

## Telas JÁ portadas (não mexer)
regions, favorites, auth, intro, plans

## Telas PENDENTES (portar)
admin/* (page + analytics/audit/exports/leads/properties/settings/webhooks),
terrenos, sales, insights, property/[id], search, calculator, alerts, pricing,
studio, map, chat, docs, compare, status, offline, world
