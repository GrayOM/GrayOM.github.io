#!/usr/bin/env python3
"""Check the site against its sources before and after every update.

1. The profile README (GrayOM/GrayOM): the four badge numbers must match what the site shows.
2. Every project's `repo` in data/profile.json must still exist under that exact name.
   GitHub redirects a renamed repository silently, so a changed full_name or a failed lookup
   means the project was renamed or removed and the site's name and links need updating.

Needs the `gh` CLI with read access. Exits 1 when anything differs.
Usage: python3 scripts/check_sync.py
"""
import base64
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def gh(path):
    out = subprocess.run(["gh", "api", path], capture_output=True, text=True)
    if out.returncode != 0:
        return None
    return json.loads(out.stdout)


def site_stats(d):
    items = [x for g in d["research"]["groups"] for x in g["items"]]
    bounties = d.get("bounties", [])
    return {
        "Published_CVEs": sum(1 for x in items + bounties if x["id"].startswith("CVE-")),
        "Credited_findings": len(items),
        "Bug_bounties": len(bounties) + d["research"].get("pending_rewarded", 0),
        "In_coordinated_disclosure": d["research"].get("pending", 0),
    }


def main():
    d = json.loads((ROOT / "data" / "profile.json").read_text(encoding="utf-8"))
    problems = []

    readme = gh("repos/GrayOM/GrayOM/readme")
    if readme is None:
        problems.append("README: could not read GrayOM/GrayOM (not measured)")
    else:
        text = base64.b64decode(readme["content"]).decode("utf-8")
        for key, value in site_stats(d).items():
            m = re.search(rf"badge/{key}-(\d+)-", text)
            if not m:
                problems.append(f"README: badge {key} not found")
            elif int(m.group(1)) != value:
                problems.append(f"README: {key} is {m.group(1)}, site shows {value}")

    for pr in d["projects"]:
        repo = pr.get("repo")
        if not repo:
            problems.append(f"project {pr['slug']}: no repo field")
            continue
        info = gh(f"repos/{repo}")
        if info is None:
            problems.append(f"project {pr['slug']}: {repo} not found (renamed, removed, or no access)")
        elif info["full_name"] != repo:
            problems.append(f"project {pr['slug']}: renamed {repo} -> {info['full_name']}")

    for line in problems:
        print("DIFF", line)
    print("OK, site matches README and project names" if not problems else f"{len(problems)} difference(s)")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
