# GrayOM.github.io

Personal page. Content lives in `data/profile.json`; edit that file and push.

English and Korean share the one file: a translatable value is `{"en": "...", "ko": "..."}`, a plain value (IDs, URLs, repo names, stacks) is shown as-is in both. Interface labels are in `UI` at the top of `assets/app.js`. Language comes from `?lang=ko|en`, then the saved choice, then the browser language.

- Add a CVE: append an item to a group in `research.groups`.
- Add a write-up link: fill `writeup` on the item.
- Feature a finding as a TARGET / VECTOR / IMPACT card: give it `featured: {vector, impact}`.
- The four numbers under the home screen are counted from the data (`research.pending` is the unpublished count).
- Section descriptions live in `sections`.
- Projects are listed in `projects` in display order. Each one gets a detail view at `?p=<slug>` built from `why`, `features`, `flow` and `principles`.
- Entries containing `[TODO` are not shown. Empty lists (e.g. `awards: []`) hide their block, and the section title follows what is shown.
- Career details are not published here. Put the private Notion link in `experience_detail.url` only if you want it visible.

Local preview: `python3 -m http.server` then open http://localhost:8000
