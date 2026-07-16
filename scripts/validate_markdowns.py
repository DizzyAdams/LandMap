#!/usr/bin/env python3
"""Validate LandMap markdown corpus (count, frontmatter, terreno ratio, grades)."""

from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path

OUTPUT_DIR = Path("data/markdowns")
EXPECTED = 3000
MIN_TERRENO = 0.53


def main() -> int:
    files = list(OUTPUT_DIR.glob("*.md"))
    n = len(files)
    print(f"markdown files: {n}")
    if n != EXPECTED:
        print(f"[FAIL] expected {EXPECTED}, got {n}")
        return 1

    types: Counter[str] = Counter()
    grades: Counter[str] = Counter()
    kinds: Counter[str] = Counter()
    missing_invest = 0

    for path in files:
        text = path.read_text(encoding="utf-8")
        if not text.startswith("---"):
            print(f"[FAIL] no frontmatter: {path.name}")
            return 1
        m = re.search(r"^type:\s*\"?(\w+)\"?", text, re.M)
        g = re.search(r"^grade:\s*\"?([A-F])\"?", text, re.M)
        k = re.search(r"^kind:\s*\"?(\w+)\"?", text, re.M)
        if m:
            types[m.group(1)] += 1
        if g:
            grades[g.group(1)] += 1
        if k:
            kinds[k.group(1)] += 1
        if "capRate:" not in text or "Tese de investimento" not in text:
            missing_invest += 1

    terreno_ratio = types.get("terreno", 0) / n
    print(f"types: {dict(types)}")
    print(f"grades: {dict(grades)}")
    print(f"kinds: {dict(kinds)}")
    print(f"terreno ratio: {terreno_ratio:.3f}")
    print(f"missing invest sections: {missing_invest}")

    ok = True
    if terreno_ratio < MIN_TERRENO:
        print(f"[FAIL] terreno ratio {terreno_ratio:.3f} < {MIN_TERRENO}")
        ok = False
    if missing_invest > 0:
        print("[FAIL] some files lack invest thesis/capRate")
        ok = False
    if sum(grades.values()) < n * 0.99:
        print("[FAIL] grades missing on many files")
        ok = False
    if ok:
        print("[OK] validate_markdowns passed")
        return 0
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
