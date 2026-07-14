import re, glob, os

ROOT = "apps/web/public"
for f in sorted(glob.glob(os.path.join(ROOT, "lovable_chunk_*.js"))):
    try:
        t = open(f, encoding="utf-8", errors="ignore").read()
    except Exception:
        continue
    tbls = sorted(set(re.findall(r"from\(['`\"]([a-z_]+)['`\"]\)", t)))
    rpcs = sorted(set(re.findall(r"rpc\(['`\"]([a-z_]+)['`\"]\)", t)))
    if tbls or rpcs:
        print(os.path.basename(f), "| TABLES:", ",".join(tbls), "| RPCS:", ",".join(rpcs))
