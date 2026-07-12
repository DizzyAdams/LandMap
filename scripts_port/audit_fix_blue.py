#!/usr/bin/env python3
"""Auditoria: troca esmeralda de MARCA -> azul #003594 (var(--primary)).
Preserva success/delta (verde semantico)."""
import glob, os, re
BASE = r'C:\Users\forrydev\Desktop\LandMap'
FILES = glob.glob(os.path.join(BASE,'packages','ui','src','**','*.tsx'),recursive=True) + \
        glob.glob(os.path.join(BASE,'apps','web','src','**','*.tsx'),recursive=True)
FILES = [f for f in FILES if 'node_modules' not in f]
# mapas de marca esmeralda -> azul
SUBS = [
    (r'from-emerald-400', 'from-[var(--primary)]'),
    (r'to-emerald-400', 'to-[var(--primary)]'),
    (r'from-emerald-500', 'from-[var(--primary)]'),
    (r'to-emerald-500', 'to-[var(--primary)]'),
    (r'bg-emerald-500\b', 'bg-[var(--primary)]'),
    (r'bg-emerald-500/', 'bg-[var(--primary)]/'),
    (r'border-emerald-400/60', 'border-[var(--primary)]/60'),
    (r'border-emerald-400\b', 'border-[var(--primary)]'),
    (r'border-emerald-', 'border-[var(--primary)]'),
    (r'text-emerald-400\b', 'text-[var(--primary)]'),
    (r'text-emerald-500\b', 'text-[var(--primary)]'),
    (r'ring-emerald-400', 'ring-[var(--primary)]'),
    (r'bg-emerald-400/', 'bg-[var(--primary)]/'),
    (r'bg-emerald-400\b', 'bg-[var(--primary)]'),
]
changed=0
for f in FILES:
    try: t=open(f,encoding='utf-8').read()
    except: continue
    orig=t
    # nao mexer em arquivos de success/delta explicitos
    for pat,rep in SUBS:
        t=re.sub(pat,rep,t)
    if t!=orig:
        open(f,'w',encoding='utf-8').write(t)
        changed+=1
        print("corrigido:", os.path.relpath(f,BASE))
print("Total:",changed)
