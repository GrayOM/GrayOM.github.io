// Renders the page from data/profile.json. Edit that file, not this one.
// Translatable values in the data are {"en": ..., "ko": ...}; plain values are shared by both languages.
(function () {
  const root = document.getElementById("app");
  const LANGS = ["en", "ko"];
  document.documentElement.classList.add("js");

  const UI = {
    en: {
      home: "Home", research: "Research", projects: "Projects", experience: "Experience", contact: "Contact",
      awards: "Awards", certs: "Certifications", education: "Education",
      short: { awards: "Awards", certs: "Certs", education: "Education" }, join: " & ",
      featured: "Featured", all: "All findings", target: "TARGET", vector: "VECTOR", impact: "IMPACT",
      credited: "Credited", writeup: "write-up", updated: "Last updated", scroll: "scroll ↓",
      stats: { cve: "CVEs", other: "GHSA & credits", pending: "Pending disclosure", projects: "Projects" },
      pending: (n) => `+ <b>${n}</b> more confirmed by vendors, pending publication.`,
      langLabel: "Language", navLabel: "Sections",
      error: "Could not load profile data. Check that data/profile.json exists and is valid JSON.",
    },
    ko: {
      home: "홈", research: "연구", projects: "프로젝트", experience: "경력", contact: "연락처",
      awards: "수상", certs: "자격증", education: "학력",
      short: { awards: "수상", certs: "자격", education: "학력" }, join: "·",
      featured: "대표 사례", all: "전체 목록", target: "TARGET", vector: "VECTOR", impact: "IMPACT",
      credited: "크레딧", writeup: "분석 글", updated: "최종 수정", scroll: "스크롤 ↓",
      stats: { cve: "CVE", other: "GHSA·크레딧", pending: "공개 대기", projects: "프로젝트" },
      pending: (n) => `+ 벤더 확인 후 공개 대기 중인 건 <b>${n}</b>건.`,
      langLabel: "언어", navLabel: "섹션",
      error: "프로필 데이터를 불러오지 못했다. data/profile.json 파일과 JSON 형식을 확인할 것.",
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
  const ext = (url, html, cls) =>
    url ? `<a href="${esc(url)}" target="_blank" rel="noopener"${cls ? ` class="${cls}"` : ""}>${html}</a>` : html;
  // Entries still marked [TODO ...] are not published.
  const ready = (s) => !/\[TODO/.test(t(s) || "");

  // Geometric G monogram: reticle ticks and corners in line, one emerald point where the bar ends.
  const MARK = `<svg class="mark" viewBox="0 0 200 200" role="img" aria-label="GrayOM">
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path class="t" stroke-width="2" d="M22 54V22h32M146 22h32v32M178 146v32h-32M54 178H22v-32"/>
      <path class="t" stroke-width="2" d="M100 6v22M100 172v22M6 100h22M172 100h22"/>
      <path class="s" stroke-width="11" d="M138.2 61.8A54 54 0 1 0 154 100h-42"/>
    </g>
    <circle class="dot" cx="112" cy="100" r="8"/>
  </svg>`;

  const ICONS = {
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></svg>',
    blog: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
  };

  const badges = (f) =>
    `<span class="badges">${f.severity ? `<span class="badge ${esc(f.severity.toLowerCase())}">${esc(f.severity)}</span>` : ""}${
      f.cvss ? `<span class="badge">${esc(f.cvss)}</span>` : ""
    }</span>`;

  const head = (n, id, title, desc) =>
    `<div class="reveal"><div class="label">${String(n).padStart(2, "0")} — ${esc(id)}</div><h2>${esc(title)}</h2>${
      desc ? `<p class="desc">${esc(desc)}</p>` : ""
    }</div>`;

  function render() {
    const d = data;
    const ui = UI[lang];
    const r = d.research || { groups: [] };
    const items = (r.groups || []).flatMap((g) => g.items || []);
    const projects = (d.projects || []).filter((p) => ready(p.summary));
    const secDesc = (k) => t((d.sections || {})[k]) || "";

    document.documentElement.lang = lang;
    document.title = `${t(d.name)} (${d.handle})`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && d.description) meta.setAttribute("content", t(d.description));

    // ── home
    const home = `<section class="home" id="home">
      <div class="inner">
        ${MARK}
        <div>
          <h1 class="name">${esc(d.handle)}</h1>
          ${lang === "ko" ? `<p class="kname">${esc(t(d.name))}</p>` : ""}
          <p class="line">${esc(t(d.tagline))}</p>
          ${d.copyright ? `<p class="copy">${esc(d.copyright)}</p>` : ""}
        </div>
      </div>
      <a class="scroll" href="#overview">${esc(ui.scroll)}</a>
    </section>`;

    // ── stats + lead
    const cves = items.filter((f) => /^CVE-/.test(f.id)).length;
    const stats = [
      [cves, ui.stats.cve, true],
      [items.length - cves, ui.stats.other],
      [r.pending || 0, ui.stats.pending],
      [projects.length, ui.stats.projects],
    ];
    const overview = `<div class="wrap" id="overview">
      <div class="stats reveal">${stats
        .map(([n, l, a]) => `<div><div class="n${a ? " accent" : ""}">${esc(n)}</div><div class="l">${esc(l)}</div></div>`)
        .join("")}</div>
      <div class="lead reveal">${(t(d.about) || []).map((p) => `<p>${esc(p)}</p>`).join("")}</div>
    </div>`;

    // ── research
    const feat = items.filter((f) => f.featured);
    const featHtml = feat.length
      ? `<div class="sub reveal">${esc(ui.featured)}</div><div class="feat">${feat
          .map(
            (f) => `<article class="card reveal">
              <div class="top">${ext(f.url, `${esc(f.id)} ↗`)}${badges(f)}</div>
              <dl>
                <div><dt>${ui.target}</dt><dd class="target">${esc(f.target)}</dd></div>
                <div><dt>${ui.vector}</dt><dd>${esc(t(f.featured.vector))}</dd></div>
                <div><dt>${ui.impact}</dt><dd>${esc(t(f.featured.impact))}</dd></div>
              </dl>
            </article>`
          )
          .join("")}</div>`
      : "";
    const table = `<div class="sub reveal">${esc(ui.all)}</div><div class="groups">${(r.groups || [])
      .map(
        (g) => `<div class="group reveal"><h3>${esc(t(g.title))}</h3>${(g.items || [])
          .map(
            (f) => `<div class="row">
              <div class="id">${ext(f.url, `${esc(f.id === "Credited" ? ui.credited : f.id)} ↗`)}</div>
              <div><span class="repo">${esc(f.target)}</span> <span class="what">· ${esc(t(f.summary))}</span>${
                f.writeup ? ` ${ext(f.writeup, esc(ui.writeup))}` : ""
              }</div>
              ${badges(f)}
            </div>`
          )
          .join("")}</div>`
      )
      .join("")}</div>${r.pending ? `<p class="pending reveal">${ui.pending(esc(r.pending))}</p>` : ""}`;

    // ── projects
    const projHtml = `<div class="grid">${projects
      .map(
        (p) => `<a class="card proj reveal" href="${esc(p.url)}" target="_blank" rel="noopener">
          <div class="h"><span>${esc(p.name)}</span><span class="arr">↗</span></div>
          <p>${esc(t(p.summary))}</p>
          ${p.tags && p.tags.length ? `<div class="tags">${p.tags.map((x) => `<span class="tag">${esc(x)}</span>`).join("")}</div>` : ""}
        </a>`
      )
      .join("")}</div>`;

    // ── experience
    const det = d.experience_detail;
    const expHtml = `<div class="tl reveal">${(d.experience || [])
      .map(
        (e) => `<div class="item"><div><span class="org">${esc(t(e.org))}</span> <span class="role">· ${esc(t(e.role))}</span></div><div class="period">${esc(
          t(e.period)
        )}</div></div>`
      )
      .join("")}</div>${
      det ? `<p class="note reveal">${det.url ? ext(det.url, esc(t(det.label))) : esc(t(det.label))}</p>` : ""
    }`;

    // ── credentials: each block appears only when it has entries; the title follows what is shown
    const clean = (arr) => (arr || []).filter((a) => a && t(a.title) && ready(a.title));
    const blocks = [
      ["awards", clean(d.awards)],
      ["certs", clean(d.certs)],
      ["education", clean(d.education)],
    ].filter(([, list]) => list.length);
    const shown = blocks.map(([k]) => k);
    const credKeys = shown.includes("awards") ? shown.filter((k) => k !== "education") : shown;
    const credTitle = credKeys.map((k) => ui.short[k]).join(ui.join);
    const credLabel = credKeys.map((k) => UI.en.short[k]).join(" & ");
    const credHtml = blocks.length
      ? `<div class="creds">${blocks
          .map(
            ([k, list]) => `<div class="card reveal"><h3>${esc(ui[k])}</h3><ul>${list
              .map((a) => `<li><span>${esc(t(a.title))}${a.detail ? ` <span class="yr">${esc(t(a.detail))}</span>` : ""}</span><span class="yr">${esc(a.year)}</span></li>`)
              .join("")}</ul></div>`
          )
          .join("")}</div>`
      : "";

    // ── contact
    const c = d.contact || {};
    const contactHtml = `<div class="contact">${
      c.email ? `<a class="card reveal" href="mailto:${esc(c.email)}">${ICONS.mail}${esc(c.email)}</a>` : ""
    }${(c.links || [])
      .map((l) => `<a class="card reveal" href="${esc(l.url)}" target="_blank" rel="noopener">${ICONS[l.icon] || ""}${esc(t(l.label))}</a>`)
      .join("")}</div>`;

    // Numbered sections; an empty one is skipped and the numbering closes up.
    const secs = [
      ["research", ui.research, featHtml + table, items.length],
      ["projects", ui.projects, projHtml, projects.length],
      ["experience", ui.experience, expHtml, (d.experience || []).length],
      ["credentials", credTitle, credHtml, blocks.length],
      ["contact", ui.contact, contactHtml, 1],
    ].filter((s) => s[3]);
    const body = secs
      .map(
        ([id, title, html], i) =>
          `<section class="sec" id="${id}">${head(i + 1, id === "credentials" ? credLabel : UI.en[id], title, secDesc(id))}<div class="body">${html}</div></section>`
      )
      .join("");

    const navIds = ["home", ...["research", "projects", "experience", "contact"].filter((id) => secs.some((s) => s[0] === id))];
    const nav = `<nav class="pill" aria-label="${esc(ui.navLabel)}">
      <div class="links">${navIds.map((id) => `<a href="#${id}" data-id="${id}">${esc(ui[id])}</a>`).join("")}</div>
      <div class="lang" role="group" aria-label="${esc(ui.langLabel)}">${LANGS.map(
        (l) => `<button type="button" data-lang="${l}" aria-pressed="${l === lang}"${l === lang ? ' class="on"' : ""}>${l.toUpperCase()}</button>`
      ).join('<span aria-hidden="true">/</span>')}</div>
    </nav>`;

    root.innerHTML = `${nav}${home}${overview}<main class="wrap">${body}
      <footer><span>${esc(d.copyright || "")}</span><span>${esc(ui.updated)} ${esc(d.updated)}</span></footer></main>`;
    markActive();
  }

  // ── active pill item follows the section under the upper third of the screen
  function markActive() {
    const links = [...root.querySelectorAll(".pill .links a")];
    let current = "home";
    for (const a of links) {
      const el = document.getElementById(a.dataset.id);
      if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.35) current = a.dataset.id;
    }
    // At the very bottom the last section wins even if it is short.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4 && links.length) current = links[links.length - 1].dataset.id;
    for (const a of links) {
      const on = a.dataset.id === current;
      a.classList.toggle("on", on);
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    }
  }
  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        markActive();
      });
    },
    { passive: true }
  );

  // ── fade-in on scroll; reduced motion is handled in CSS
  function reveal(animate) {
    const els = [...root.querySelectorAll(".reveal")];
    if (!animate || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px" }
    );
    els.forEach((el) => io.observe(el));
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
    reveal(false); // already-read content should not fade in again
    const btn = root.querySelector(`.pill .lang button[data-lang="${lang}"]`);
    if (btn) btn.focus();
  }

  root.addEventListener("click", (e) => {
    const btn = e.target.closest(".pill .lang button");
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
      reveal(true);
      // Arriving with #section in the URL: land there once content exists.
      if (location.hash) {
        const el = document.getElementById(location.hash.slice(1));
        if (el) el.scrollIntoView();
      }
    })
    .catch(() => {
      root.innerHTML = `<p style="padding:24px">${esc(UI[lang].error)}</p>`;
    });
})();
