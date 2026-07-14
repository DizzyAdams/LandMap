import subprocess, sys, time

LOG = r"C:\Users\forrydev\Desktop\LandMap\build_log.txt"
proc = subprocess.Popen(
    ["pnpm", "build"],
    cwd=r"C:\Users\forrydev\Desktop\LandMap",
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    encoding="utf-8",
    errors="replace",
    bufsize=1,
)
with open(LOG, "w", encoding="utf-8") as lf:
    for line in proc.stdout:
        lf.write(line)
        lf.flush()
    rc = proc.wait()
    lf.write(f"\n\nBUILD_EXIT_CODE={rc}\n")
    lf.flush()
