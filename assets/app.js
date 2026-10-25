// Renders the page from data/profile.json. Edit that file, not this one.
// Translatable values in the data are {"en": ..., "ko": ...}; plain values are shared by both languages.
(function () {
  const root = document.getElementById("app");
  const LANGS = ["en", "ko"];

  const UI = {
    en: {
      about: "About", research: "Research", projects: "Projects", experience: "Experience", contact: "Contact",
      awards: "Awards", certs: "Certifications", education: "Education",
      credited: "Credited", writeup: "write-up", email: "email", updated: "Last updated",
      short: { awards: "Awards", certs: "Certs", education: "Education" }, join: " & ",
      langLabel: "Language", error: "Could not load profile data. Check that data/profile.json exists and is valid JSON.",
    },
    ko: {
      about: "소개", research: "연구", projects: "프로젝트", experience: "경력", contact: "연락처",
      awards: "수상", certs: "자격증", education: "학력",
      credited: "크레딧", writeup: "분석 글", email: "이메일", updated: "최종 수정",
      short: { awards: "수상", certs: "자격", education: "학력" }, join: "·",
      langLabel: "언어", error: "프로필 데이터를 불러오지 못했다. data/profile.json 파일과 JSON 형식을 확인할 것.",
    },
  };

  // Choice order: ?lang= in the URL, then the saved choice, then the browser language.
  function initialLang() {
    const q = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(q)) return q;
    try {
      const saved = localStorage.getItem("lang");
      if (LANGS.includes(saved)) return saved;
    } catch (e) {}
    return /^ko\b/i.test(navigator.language || "") ? "ko" : "en";
  }

  let lang = initialLang();
  let data = null;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const t = (v) => (v && typeof v === "object" && !Array.isArray(v) && ("en" in v || "ko" in v) ? v[lang] ?? v.en : v);
  const link = (url, text) => (url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}</a>` : esc(text));
  // Entries still marked [TODO ...] are not published.
  const ready = (s) => !/\[TODO/.test(t(s) || "");
  const section = (id, title, html) => (html ? `<section id="${id}"><h2>${esc(title)}</h2>${html}</section>` : "");

  function render() {
    const d = data;
    const ui = UI[lang];
    const name = t(d.name);

    document.documentElement.lang = lang;
    document.title = `${name} (${d.handle})`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc && d.description) desc.setAttribute("content", t(d.description));

    const about = (t(d.about) || []).map((p) => `<p>${esc(p)}</p>`).join("");

    const r = d.research;
    const research = r
      ? (r.intro ? `<p class="muted">${esc(t(r.intro))}</p>` : "") +
        (r.groups || [])
          .map(
            (g) => `<div class="group"><h3>${esc(t(g.title))}</h3>${(g.items || [])
              .map(
                (f) => `<div class="finding">
                  <div class="id">${link(f.url, f.id === "Credited" ? ui.credited : f.id)}</div>
                  <div class="body">
                    <div><span class="target">${esc(f.target)}</span> &middot; <span class="sum">${esc(t(f.summary))}</span></div>
                    <div class="meta">${f.severity ? `<span class="sev sev-${esc(f.severity.toLowerCase())}">${esc(f.severity)}</span>` : ""}${f.cvss ? `<span>${esc(f.cvss)}</span>` : ""}${f.writeup ? link(f.writeup, ui.writeup) : ""}</div>
                  </div>
                </div>`
              )
              .join("")}</div>`
          )
          .join("") +
        (r.pending_note ? `<p class="muted" style="margin-top:16px">${esc(t(r.pending_note))}</p>` : "")
      : "";

    const projects = (d.projects || [])
      .filter((p) => ready(p.summary))
      .map(
        (p) => `<div class="project">
          <div class="name">${link(p.url, p.name)}</div>
          <div>${esc(t(p.summary))}</div>
          ${p.tags && p.tags.length ? `<div class="tags">${p.tags.map(esc).join(" · ")}</div>` : ""}
        </div>`
      )
      .join("");

    const det = d.experience_detail;
    const exp =
      (d.experience || [])
        .map((e) => `<div class="exp"><div><strong>${esc(t(e.org))}</strong> &middot; ${esc(t(e.role))}</div><div class="period">${esc(t(e.period))}</div></div>`)
        .join("") +
      (det ? `<p class="muted" style="margin-top:10px">${det.url ? link(det.url, t(det.label)) : esc(t(det.label))}</p>` : "");

    const clean = (arr) => (arr || []).filter((a) => a && t(a.title) && ready(a.title));
    const list = (arr) =>
      `<ul class="plain">${arr
        .map((a) => `<li><span>${esc(t(a.title))}${a.detail ? ` <span class="muted">${esc(t(a.detail))}</span>` : ""}</span><span class="yr">${esc(a.year)}</span></li>`)
        .join("")}</ul>`;
    // Each block appears only when it has entries; the section title follows what is shown.
    const blocks = [
      ["awards", clean(d.awards)],
      ["certs", clean(d.certs)],
      ["education", clean(d.education)],
    ].filter(([, items]) => items.length);
    const credentials = blocks
      .map(([k, items], i) => `<h3 class="sub"${i ? ' style="margin-top:20px"' : ""}>${esc(ui[k])}</h3>${list(items)}`)
      .join("");
    // Section title names what is shown, e.g. "Certs & Education"; once awards exist it becomes "Awards & Certs".
    const shown = blocks.map(([k]) => k);
    const credTitle = (shown.includes("awards") ? shown.filter((k) => k !== "education") : shown).map((k) => ui.short[k]).join(ui.join);

    const c = d.contact || {};
    const contact =
      (c.email ? `<p><span class="muted">${esc(ui.email)}</span> <span style="font-family:var(--mono)">${esc(c.email)}</span></p>` : "") +
      ((c.links || []).length ? `<p>${c.links.map((l) => link(l.url, t(l.label))).join(" &nbsp;·&nbsp; ")}</p>` : "");

    const sections = [
      ["about", ui.about, about],
      ["research", ui.research, research],
      ["projects", ui.projects, projects],
      ["experience", ui.experience, exp],
      ["credentials", credTitle, credentials],
      ["contact", ui.contact, contact],
    ].filter(([, , html]) => html);
    const nav = sections
      .filter(([id]) => id !== "about")
      .map(([id, title]) => `<a href="#${id}">${esc(title.toLowerCase())}</a>`)
      .join("");
    const toggle = LANGS.map(
      (l) => `<button type="button" data-lang="${l}" aria-pressed="${l === lang}"${l === lang ? ' class="on"' : ""}>${l.toUpperCase()}</button>`
    ).join('<span aria-hidden="true">/</span>');

    root.innerHTML = `
      <header>
        <h1>${esc(name)}</h1>
        <div class="handle">@${esc(d.handle)}</div>
        <p class="tagline">${esc(t(d.tagline))}</p>
        <div class="bar">
          <nav aria-label="Sections">${nav}</nav>
          <div class="lang" role="group" aria-label="${esc(ui.langLabel)}">${toggle}</div>
        </div>
      </header>
      ${sections.map(([id, title, html]) => section(id, title, html)).join("")}
      <footer>${esc(ui.updated)} ${esc(d.updated)}</footer>`;
  }

  function setLang(next) {
    if (!LANGS.includes(next) || next === lang) return;
    lang = next;
    try {
      localStorage.setItem("lang", lang);
    } catch (e) {}
    const url = new URL(location.href);
    url.searchParams.set("lang", lang);
    history.replaceState(null, "", url);
    render();
    const btn = root.querySelector(`.lang button[data-lang="${lang}"]`);
    if (btn) btn.focus();
  }

  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".lang button");
    if (btn) setLang(btn.dataset.lang);
  });

  document.documentElement.lang = lang;
  fetch("data/profile.json", { cache: "no-cache" })
    .then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then((d) => {
      data = d;
      render();
    })
    .catch(() => {
      root.innerHTML = `<p>${esc(UI[lang].error)}</p>`;
    });
})();
