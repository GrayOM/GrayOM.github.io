# GrayOM.github.io

Personal page. Content lives in `data/profile.json`; edit that file and push.

English and Korean share the one file: a translatable value is `{"en": "...", "ko": "..."}`, a plain value (IDs, URLs, repo names, stacks) is shown as-is in both. Interface labels are in `UI` at the top of `assets/app.js`. Language comes from `?lang=ko|en`, then the saved choice, then the browser language.

- Add a CVE: append an item to a group in `research.groups`.
- Add a write-up link: fill `writeup` on the item.
- Entries containing `[TODO` are not shown. Empty lists (e.g. `awards: []`) hide their block, and the section title follows what is shown.
- Career details are not published here. Put the private Notion link in `experience_detail.url` only if you want it visible.

Local preview: `python3 -m http.server` then open http://localhost:8000
