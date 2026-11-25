# CLAUDE.md

Static site for https://grayom.github.io, rendered by `assets/app.js` from `data/profile.json`.

## Every update ("최신화")

1. Run `python3 scripts/check_sync.py` first and again after editing. It compares the site
   against the profile README (GrayOM/GrayOM) badges and checks that every project's `repo`
   still exists under the same name.
2. **Project names (owner request 2026-11-25): check for renamed projects on every update.**
   A rename shows up as `renamed` or `not found` in the script. Then update that project's
   `name`, `slug`, `repo`, `url` and every mention in its text. Example: OM_Agent_web_version
   (OMtest Agent) became GrayOM/Valefor.
3. Show only findings GrayOM is credited on. CVE record links go only on GrayOM's own CVEs.
4. Featured cards (`featured.order`) are chosen from CVE findings by GitHub stars and CVSS
   score together (rank by each, add the ranks, take the top 3).
5. No client names or work details on the public site.
6. Bump `?v=N` in `index.html` when `assets/` changes. Push to `main`.
