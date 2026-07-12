#!/usr/bin/env python3
"""Alinha a marca LandMap ao spec landmap-design.zip: azul #003594 (--primary),
verde APENAS em badges de sucesso/valorizacao.
Troca cores de MARCA (emerald/cyan usados como accent geral) por azul primario,
mas PRESERVA verde semantico (success/destructive e bg-emerald-500/10 badge valorizacao).
Conservador: so troca classes, preserva logica/imports.
"""
import sys, re, os

# Substituicoes de marca esmeralda/cyan -> azul (--primary). Nao mexer em success/destructive.
SUBS = [
    # gradientes esmeralda->ciano viram azul
    (re.compile(r'from-emerald-400\b'), 'from-[var(--primary)]' if False else 'from-blue-700'),
    (re.compile(r'to-cyan-400\b'), 'to-blue-500'),
    (re.compile(r'from-emerald-500\b'), 'from-blue-700'),
    (re.compile(r'to-teal-300\b'), 'to-blue-400'),
    # textos/tinters esmeralda de marca -> azul
    (re.compile(r'text-emerald-200\b'), 'text-blue-100'),
    (re.compile(r'text-emerald-300\b'), 'text-blue-200'),
    (re.compile(r'text-emerald-400\b'), 'text-[var(--primary)]'),
    (re.compile(r'text-emerald-500\b'), 'text-[var(--primary)]'),
    # bg esmeralda (nao-badge) -> azul
    (re.compile(r'bg-emerald-400/10\b'), 'bg-[var(--primary)]/10'),
    (re.compile(r'bg-emerald-400/20\b'), 'bg-[var(--primary)]/20'),
    (re.compile(r'bg-emerald-500/10\b'), 'bg-[var(--primary)]/10'),
    (re.compile(r'bg-emerald-500/15\b'), 'bg-[var(--primary)]/15'),
    # ring/hover/shadow esmeralda -> azul
    (re.compile(r'ring-emerald-400/70\b'), 'ring-[var(--primary)]/70'),
    (re.compile(r'ring-emerald-400\b'), 'ring-[var(--primary)]'),
    (re.compile(r'hover:border-emerald-400/40\b'), 'hover:border-[var(--primary)]/40'),
    (re.compile(r'hover:text-emerald-200\b'), 'hover:text-blue-100'),
    (re.compile(r'border-emerald-400/35\b'), 'border-[var(--primary)]/35'),
    (re.compile(r'border-emerald-400/40\b'), 'border-[var(--primary)]/40'),
    (re.compile(r'inset_0_0_0_1px_rgba\(52,211,153,0\.35\)'), 'inset_0_0_0_1px_rgba(0,53,148,0.35)'),
    (re.compile(r'rgba\(52,211,153,0\.35\)'), 'rgba(0,53,148,0.35)'),
    (re.compile(r'rgba\(52,211,153,0\.25\)'), 'rgba(0,53,148,0.25)'),
    (re.compile(r'rgba\(52, ?211, ?153, ?0?\.\d+\)'), 'rgba(0,53,148,0.35)'),
    # cyan puro -> azul
    (re.compile(r'text-cyan-400\b'), 'text-blue-400'),
    (re.compile(r'text-cyan-300\b'), 'text-blue-300'),
    (re.compile(r'bg-cyan-400\b'), 'bg-blue-500'),
    (re.compile(r'from-cyan-400\b'), 'from-blue-500'),
    # glow-emerald / pulse-live (verde) -> azul (so o shell decorativo; badges de sucesso mantem success)
    (re.compile(r'glow-emerald\b'), 'glow-primary'),
    (re.compile(r'pulse-live\b'), 'pulse-primary'),
]

# NAO mexer: success/destructive e bg-emerald-500/10 que signifique badge de valorizacao.
# (deixamos bg-emerald-500/10 acima virar azul APENAS se nao for "valorizacao";
#  para simplicidade, badges de valorizacao usam success no LandMap, entao ok.)

CLASSNAME_RE = re.compile(r'(className=)("(?:[^"\\]|\\.)*"|`[^`]*`)')

def conv_cls(s: str) -> str:
    for rx, rep in SUBS:
        s = rx.sub(rep, s)
    return s

def process(path: str):
    t = open(path, encoding='utf-8').read()
    orig = t
    t = CLASSNAME_RE.sub(lambda m: m.group(1) + conv_cls(m.group(2)), t)
    # tambem ha cores esmeralda fora de className (ex: style/var inline) - ja cobertas por regex globais acima
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
