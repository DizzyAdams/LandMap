#!/usr/bin/env python3
"""2a passada: converte esmeralda de MARCA (focus/accent/spinner/ativo) -> azul #003594.
Mantem verde semantico (valorizacao/live/sucesso/delta)."""
import sys, re, os
SUBS = [
    (re.compile(r'focus:border-emerald-400/50'), 'focus:border-[var(--primary)]/50'),
    (re.compile(r'focus:border-emerald-400\b'), 'focus:border-[var(--primary)]'),
    (re.compile(r'accent-emerald-400\b'), 'accent-[var(--primary)]'),
    (re.compile(r'border-t-emerald-400\b'), 'border-t-[var(--primary)]'),
    (re.compile(r'bg-emerald-400/10 text-emerald-200 shadow-\[inset_0_0_0_1px_rgba\(52,211,153,0\.35\)\]'),
        'bg-[var(--primary)]/10 text-[var(--primary-bright)] shadow-[inset_0_0_0_1px_rgba(0,53,148,0.35)]'),
    (re.compile(r'bg-emerald-400/20\b'), 'bg-[var(--primary)]/20'),
    (re.compile(r'hover:border-emerald-400/40\b'), 'hover:border-[var(--primary)]/40'),
    (re.compile(r'bg-emerald-400/\[0\.08\]'), 'bg-[var(--primary)]/[0.08]'),
    (re.compile(r'border-emerald-400/30\b'), 'border-[var(--primary)]/30'),
    (re.compile(r'border-emerald-400/25\b'), 'border-[var(--primary)]/25'),
    (re.compile(r'via-emerald-400/40\b'), 'via-[var(--primary)]/40'),
    (re.compile(r'border-emerald-400/40\b'), 'border-[var(--primary)]/40'),
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
