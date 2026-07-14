#!/usr/bin/env python3
"""Fix dead links to deleted (non-Lovable) routes in kept pages."""
import os

ROOT = r"C:\Users\forrydev\desktop\landmap\apps\web\src"

def fix(path, repls):
    with open(path, "r", encoding="utf-8") as f:
        s = f.read()
    for old, new in repls:
        if old not in s:
            print(f"  WARN not found in {path}: {old[:60]!r}")
        s = s.replace(old, new)
    with open(path, "w", encoding="utf-8") as f:
        f.write(s)
    print(f"fixed: {path}")

# Footer.tsx — remove /search + /chat links, add /plans
fix(
    os.path.join(ROOT, "components", "Footer.tsx"),
    [
        ('          <Link href={localeHref(\'/search\', locale)} className="transition hover:text-[var(--muted-foreground)]">Buscar</Link>\n',
         ""),
        ("href={localeHref('/chat', locale)}", "href={localeHref('/plans', locale)}"),
        (">Chat IA</Link>", ">Planos</Link>"),
    ],
)

# compare/error.tsx — /search -> /regions
fix(
    os.path.join(ROOT, "app", "[locale]", "compare", "error.tsx"),
    [
        ('href={`/${locale}/search`}', 'href={`/${locale}/regions`}'),
        (">Voltar para busca</Link>", ">Voltar para Regiões</Link>"),
    ],
)

# map/page.tsx — pin cards linked to deleted /property/[id] -> /regions
fix(
    os.path.join(ROOT, "app", "[locale]", "map", "page.tsx"),
    [
        ('href={`/${locale}/property/${item.id}`}', 'href={`/${locale}/regions`}'),
    ],
)

print("DONE")
