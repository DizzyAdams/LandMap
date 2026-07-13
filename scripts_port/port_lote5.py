"""
Portagem em lote do design antigo (Sovereign/dark) -> design system Lovable (claro/indigo)
para todas as telas de apps/web/src/app/[locale] que ainda contenham artefatos visuais antigos.

Regras (base: docs/lovable-port-pattern.md + telas ja portadas regions/favorites/dashboard/insights):
- Remove classes decorativas: grid-bg, glow-*, cta-glow, aurora, font-display, pulse-*, mesh-bg,
  bloom, magnetic, text-surreal, panel, bg-[#050505], bg-[#0a0a0a], shadow-glow-*,
  font-[var(--font-display)], bg-[var(--primary-bright)], text-white
- text-gradient -> text-[var(--foreground)]
- kicker (span) -> p com eyebrow lovable
- surface (com/sem glow) -> card lovable (border + bg-[var(--card)])
- badge (classe CSS) -> span estilizado lovable  (NAO mexe em <Badge> componente)
- btn btn-primary / btn btn-ghost (e variacoes em aspas simples / template literal) -> botoes lovable

So o VISUAL: nao altera imports, fetch/API, nem componentes <Badge>/<Card>/<Surface> do @landmap/ui.
Preserva verde semantico (emerald/success) para revisao manual.
A limpeza de espacos duplos ocorre APENAS dentro de atributos className (nao re-indenta o arquivo).
"""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGET_DIR = os.path.join(ROOT, "apps", "web", "src", "app", "[locale]")


def read_text(path):
    with open(path, "r", encoding="utf-8", newline="") as f:
        return f.read()


def write_text(path, text):
    with open(path, "w", encoding="utf-8", newline="") as f:
        f.write(text)


# Classe isolada em uma lista de className (cercada por espaco, aspas duplas/simples,
# chave de expressao JSX ou backtick de template literal)
BOUND = r"[\s\"'{`]"
def isolated(name):
    return rf"(?<={BOUND}){re.escape(name)}(?={BOUND})"


REMOVALS = [
    "grid-bg", "glow-dual", "glow-primary", "glow-emerald", "glow-sovereign",
    "glow-gold", "cta-glow", "aurora", "font-display", "pulse-live",
    "pulse-primary", "mesh-bg", "bloom", "magnetic", "text-surreal",
    "bg-[#050505]", "bg-[#0a0a0a]", "panel",
]

# surface especificos (antes do generico)
SURFACE_SPECIFIC = [
    ("surface glow-dual rounded-xl p-6", "rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"),
    ("surface glow-primary rounded-xl p-5 panel", "rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"),
    ("surface glow-primary rounded-xl p-5", "rounded-xl border border-[var(--border)] bg-[var(--card)] p-5"),
    ("surface rounded-xl p-6", "rounded-xl border border-[var(--border)] bg-[var(--card)] p-6"),
]

BTN_PRIMARY = "inline-flex items-center justify-center rounded-lg bg-[var(--primary)] px-5 text-sm font-medium text-[var(--primary-foreground)] transition hover:bg-[color:color-mix(in_srgb,var(--primary)_90%,transparent)]"
BTN_GHOST = "inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 text-sm font-medium text-[var(--foreground)] transition hover:bg-[var(--muted)]"


def clean_classnames(content):
    """Colapsa espacos duplos e remove bordas vazias APENAS dentro de className="...".
    Nao toca na indentacao do arquivo nem em outros atributos."""
    def repl(m):
        inner = m.group(1)
        inner = re.sub(r"\s+", " ", inner).strip()
        return f'className="{inner}"'
    return re.sub(r'className="([^"]*)"', repl, content)


def port_content(content):
    # 0) remocoes/mapeamentos de substring (nao isoladas)
    content = content.replace("font-[var(--font-display)]", "")
    content = content.replace("bg-[var(--primary-bright)]", "bg-[var(--primary)]")
    content = content.replace("text-white", "text-[var(--primary-foreground)]")
    content = re.sub(r"(hover:)?shadow-glow-\w+", "", content)

    # 0b) fundos brancos/transparentes do tema dark -> tokens claros
    content = content.replace("bg-white/[0.03]", "bg-[var(--muted)]")
    content = content.replace("bg-white/[0.04]", "bg-[var(--muted)]")
    content = content.replace("bg-white/10", "bg-[var(--muted)]")
    content = content.replace("bg-emerald-950/40", "bg-[var(--muted)]")
    content = content.replace("bg-emerald-950/20", "bg-[var(--muted)]")
    content = content.replace("bg-white", "bg-[var(--card)] border border-[var(--border)]")

    # 0c) bugs de migracao: border-[var(--primary)]800/900 -> border-[var(--primary)]
    content = content.replace("border-[var(--primary)]800", "border-[var(--border)]")
    content = content.replace("border-[var(--primary)]900", "border-[var(--border)]")

    # 0d) tipografia de dados e texto neutro que somem no claro
    content = content.replace("ledger-num", "tabular-nums")
    content = content.replace("text-neutral-50", "text-[var(--muted-foreground)]")

    # 0e) highlight de pricing (marca cyan/verde -> azul primario)
    content = content.replace("to-cyan-400", "to-[var(--primary)]")
    content = content.replace("text-[#050505]", "text-[var(--primary-foreground)]")
    content = content.replace("text-emerald-200", "text-[var(--primary-foreground)]")
    content = content.replace("text-emerald-100", "text-[var(--primary-foreground)]")
    content = content.replace("rgba(52,211,153", "rgba(0,53,148")
    content = content.replace("rgba(34,211,238", "rgba(0,53,148")

    # 0f) chip do design antigo -> chip lovable (consome o atributo ate a aspa de fechamento)
    content = re.sub(
        r'className="chip[^"]*"',
        'className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-xs font-medium text-[var(--muted-foreground)]"',
        content,
    )

    # 1) surface especificos
    for old, new in SURFACE_SPECIFIC:
        content = content.replace(old, new)

    # 2) removals de classes isoladas
    for name in REMOVALS:
        content = re.sub(isolated(name), "", content)

    # 3) text-gradient -> foreground
    content = re.sub(isolated("text-gradient"), "text-[var(--foreground)]", content)

    # 4) surface generico (isolado)
    content = re.sub(isolated("surface"), "border border-[var(--border)] bg-[var(--card)]", content)

    # 5) kicker span -> p eyebrow
    content = re.sub(
        r'<span className="kicker">(.*?)</span>',
        r'<p className="text-sm font-medium text-[var(--primary)]">\1</p>',
        content, flags=re.S,
    )

    # 6) badge (classe CSS) -> span lovable  (nao afeta <Badge> componente)
    content = re.sub(
        r'className="badge[^"]*"',
        'className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]"',
        content,
    )

    # 7) btn btn-primary / btn btn-ghost (aspas duplas ou simples, isolados)
    content = re.sub(isolated("btn btn-primary"), BTN_PRIMARY, content)
    content = re.sub(isolated("btn btn-ghost"), BTN_GHOST, content)

    # 8) template literal: `btn ${cond ? 'btn-primary' : 'btn-ghost'} cta-glow`
    content = re.sub(
        r"`btn \$\{([^}]*?)\? 'btn-primary' : 'btn-ghost'\} cta-glow`",
        r"`inline-flex items-center justify-center rounded-lg ${%s ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]'} transition hover:opacity-90`" % r"\1",
        content,
    )

    # 9) limpar espacos duplos/restantes DENTRO de className (nao re-indenta)
    content = clean_classnames(content)
    return content


def main():
    changed = []
    for dirpath, _, files in os.walk(TARGET_DIR):
        for fn in files:
            if not fn.endswith(".tsx"):
                continue
            path = os.path.join(dirpath, fn)
            before = read_text(path)
            after = port_content(before)
            if after != before:
                write_text(path, after)
                rel = os.path.relpath(path, ROOT).replace("\\", "/")
                changed.append(rel)
    print(f"Alterados: {len(changed)} arquivo(s)")
    for c in sorted(changed):
        print("  +", c)


if __name__ == "__main__":
    main()
