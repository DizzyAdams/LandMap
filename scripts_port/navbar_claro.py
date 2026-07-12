#!/usr/bin/env python3
"""Navbar -> tema claro/azul do spec landmap-design.zip.
Troca fundo escuro, verde de ativo e textos claros por tokens azuis/claros."""
import sys, re, os
SUBS = [
    # header dark -> claro
    (re.compile(r'bg-\[#0a0a0a\]/70'), 'bg-[var(--card)]/85'),
    (re.compile(r'bg-\[#0a0a0a\]/95'), 'bg-[var(--card)]/95'),
    (re.compile(r'shadow-\[0_8px_40px_-12px_rgba\(0,0,0,0\.85\)\]'), 'shadow-[0_8px_40px_-12px_rgba(0,53,148,0.18)]'),
    (re.compile(r'shadow-\[0_24px_60px_-24px_rgba\(0,0,0,0\.9\)\]'), 'shadow-[0_24px_60px_-24px_rgba(0,53,148,0.22)]'),
    # verde de ativo -> azul (badge de ativo nao e verde, e azul primario)
    (re.compile(r'text-emerald-200 shadow-\[inset_0_0_0_1px_rgba\(52,211,153,0\.35\)\]'), 'text-[var(--primary)] shadow-[inset_0_0_0_1px_rgba(0,53,148,0.35)]'),
    (re.compile(r'bg-\[var\(--primary\)\]/10 text-emerald-200'), 'bg-[var(--primary)]/10 text-[var(--primary)]'),
    (re.compile(r'text-emerald-200'), 'text-[var(--primary)]'),
    # textos claros -> tokens
    (re.compile(r'text-neutral-300\b'), 'text-[var(--muted-foreground-lovable)]'),
    (re.compile(r'text-neutral-400\b'), 'text-[var(--muted-foreground-lovable)]'),
    (re.compile(r'hover:bg-white/5 hover:text-white'), 'hover:bg-[var(--muted)] hover:text-[var(--foreground)]'),
    (re.compile(r'border-white/10 bg-white/5'), 'border-[var(--border-lovable)] bg-[var(--muted)]'),
]
CLASSNAME_RE = re.compile(r'(className=)("(?:[^"\\]|\\.)*"|`[^`]*`)')
def conv(s):
    for rx, rep in SUBS:
        s = rx.sub(rep, s)
    return s
def process(p):
    t = open(p, encoding='utf-8').read(); o=t
    t = CLASSNAME_RE.sub(lambda m: m.group(1)+conv(m.group(2)), t)
    if t!=o:
        open(p,'w',encoding='utf-8').write(t); print("PORTED:",p)
    else: print("no-change:",p)
for p in sys.argv[1:]:
    if os.path.exists(p): process(p)
    else: print("missing:",p)
