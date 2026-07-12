#!/usr/bin/env python3
"""Conversao mecanica do estilo antigo (GlowPanel / neutral-* / emerald-* hardcoded)
-> design system Lovable (tokens --lovable-* / --card / --primary etc).
Conservador: so troca classes de cor; preserva TODA a logica e props.
NAO mexe em imports de icones.
Uso: python scripts_port/port_tokens.py <arquivo> [arquivo ...]
"""
import sys, re, os

# Ordem importa: do mais especifico para o mais generico.
SUBS = [
    # GlowPanel import
    (re.compile(r"import\s*\{\s*GlowPanel\s*\}\s*from\s*['\"][^'\"]*GlowPanel['\"]\s*;\n"), ''),
    # GlowPanel com props extras -> div (pega className + outros attrs num grupo tolerante)
    (re.compile(r'<GlowPanel\b[^>]*className="([^"]*)"[^>]*>'),
     lambda m: f'<div className="rounded-2xl border border-[var(--border-lovable)] bg-[var(--card)] p-4 {m.group(1)}"'.strip()),
    (re.compile(r'<GlowPanel\b[^>]*>'),
     '<div className="rounded-2xl border border-[var(--border-lovable)] bg-[var(--card)] p-4">'),
    (re.compile(r'</GlowPanel>'), '</div>'),

    # bg dark -> card
    (re.compile(r'\bbg-neutral-(700|800|900|950)(?:/\d+)?\b'), 'bg-[var(--card)]'),
    (re.compile(r'\bbg-\[#0a0a0a\]\b'), 'bg-[var(--card)]'),
    # border -> lovable border
    (re.compile(r'\bborder-neutral-(700|800|900)\b'), 'border-[var(--border-lovable)]'),
    (re.compile(r'\bborder-white/10\b'), 'border-[var(--border-lovable)]'),
    # text claro/escuro
    (re.compile(r'\btext-neutral-(300|400|500|600|700|800)\b'), 'text-[var(--muted-foreground-lovable)]'),
    (re.compile(r'\btext-neutral-(50|100|200|900)\b'), 'text-[var(--foreground)]'),
    (re.compile(r'\btext-white\b'), 'text-[var(--foreground)]'),
    # hover/focus border
    (re.compile(r'\bhover:border-neutral-(500|600|700|800)\b'), 'hover:border-[var(--border-lovable)]'),
    (re.compile(r'\bhover:bg-neutral-(200|400|500|600|700|800)\b'), 'hover:bg-[var(--muted-lovable)]'),
    (re.compile(r'\bfocus:border-neutral-\d+\b'), 'focus:border-[var(--border-lovable)]'),
    (re.compile(r'\bplaceholder-neutral-(500|600)\b'), 'placeholder-[var(--muted-foreground-lovable)]'),
    (re.compile(r'\bdivide-neutral-\d+\b'), 'divide-[var(--border-lovable)]'),
    (re.compile(r'\bring-neutral-\d+\b'), 'ring-[var(--ring-lovable)]'),
    # emerald accent -> primary
    (re.compile(r'\bbg-emerald-(400|500)/10\b'), 'bg-[var(--primary)]/10'),
    (re.compile(r'\btext-emerald-(200|300|400)\b'), 'text-[var(--primary)]'),
    (re.compile(r"shadow-\[inset_0_0_0_1px_rgba\(52,211,153,0\.35\)\]"),
     'shadow-[inset_0_0_0_1px_rgba(79,70,229,0.35)]'),
]

CLASSNAME_RE = re.compile(r'(className=)("(?:[^"\\]|\\.)*"|`[^`]*`)')

def conv_cls(s: str) -> str:
    for rx, rep in SUBS:
        if callable(rep):
            s = rx.sub(rep, s)
        else:
            s = rx.sub(rep, s)
    return s

def process(path: str):
    t = open(path, encoding='utf-8').read()
    orig = t
    t = CLASSNAME_RE.sub(lambda m: m.group(1) + conv_cls(m.group(2)), t)
    # tambem converte fora de className (ex: GlowPanel ja tratado acima via regex globais)
    if t != orig:
        open(path, 'w', encoding='utf-8').write(t)
        print(f"PORTED: {path}")
    else:
        print(f"no-change: {path}")

if __name__ == '__main__':
    for p in sys.argv[1:]:
        if os.path.exists(p):
            process(p)
        else:
            print("missing:", p)
