import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r"d:\SOFTWARE\laragon\www\siBisaHadir.v2\script.js", "r", encoding="utf-8", errors="ignore") as f:
    js = f.read()

import re
matches = [l for l in js.split("\n") if "nav-group" in l or "sidebarToggle" in l or "userMenu" in l]
print(f"Total matching lines in script.js: {len(matches)}")
for m in matches[:30]:
    print(m)
