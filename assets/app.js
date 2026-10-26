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
      stats: { cve: "CVEs", credited: "Credited findings", bounty: "Bug bounties", pending: "Pending disclosure" },
      bounties: "Bug Bounty",
      bounty: "Bounty",
      pending: (n, b) => `+ <b>${n}</b> more confirmed by vendors, pending publication${b ? ` (${b} of them rewarded)` : ""}.`,
      back: "← All projects", why: "Why I built it", features: "Features", flow: "How it works", principles: "Principles",
      prev: "Previous", next: "Next", open: "Details",
      langLabel: "Language", navLabel: "Sections",
      error: "Could not load profile data. Check that data/profile.json exists and is valid JSON.",
    },
    ko: {
      home: "홈", research: "연구", projects: "프로젝트", experience: "경력", contact: "연락처",
      awards: "수상", certs: "자격증", education: "학력",
      short: { awards: "수상", certs: "자격", education: "학력" }, join: "·",
      featured: "대표 사례", all: "전체 목록", target: "TARGET", vector: "VECTOR", impact: "IMPACT",
      credited: "크레딧", writeup: "분석 글", updated: "최종 수정", scroll: "스크롤 ↓",
      stats: { cve: "CVE", credited: "크레딧", bounty: "버그바운티", pending: "공개 대기" },
      bounties: "버그바운티",
      bounty: "바운티",
      pending: (n, b) => `+ 벤더 확인을 마치고 공개를 기다리는 건이 <b>${n}</b>건 더 있다${b ? ` (그중 바운티 ${b}건)` : ""}.`,
      back: "← 프로젝트 목록", why: "만든 이유", features: "주요 기능", flow: "동작 흐름", principles: "원칙",
      prev: "이전", next: "다음", open: "자세히",
      langLabel: "언어", navLabel: "섹션",
      error: "프로필 데이터를 불러오지 못했다. data/profile.json 파일이 있는지, JSON 형식이 맞는지 확인할 것.",
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

  // Logo artwork lives in assets/logo.png (transparent PNG).
  const MARK = `<img class="mark" src="assets/logo.png" width="391" height="640" alt="GrayOM logo">`;

  const ICONS = {
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>',
    github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/></svg>',
    blog: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
  };

  const badges = (f) =>
    `<span class="badges">${f.severity ? `<span class="badge ${esc(f.severity.toLowerCase())}">${esc(f.severity)}</span>` : ""}${
      f.cvss ? `<span class="badge">${esc(f.cvss)}</span>` : ""
    }${f.bounty ? `<span class="badge bounty">${esc(UI[lang].bounty)}</span>` : ""}</span>`;

  const head = (n, id, title, desc) =>
    `<div class="reveal"><div class="label">${String(n).padStart(2, "0")} — ${esc(id)}</div><h2>${esc(title)}</h2>${
      desc ? `<p class="desc">${esc(desc)}</p>` : ""
    }</div>`;

  // ?p=<slug> opens a project's detail view; everything else is the one-page index.
  const currentSlug = () => new URLSearchParams(location.search).get("p");
  const pageUrl = (slug, hash) => `./?${slug ? `p=${encodeURIComponent(slug)}&` : ""}lang=${lang}${hash ? `#${hash}` : ""}`;

  function navHtml(ids, detail) {
    const ui = UI[lang];
    return `<nav class="pill" aria-label="${esc(ui.navLabel)}">
      <div class="links">${ids
        .map((id) => `<a href="${detail ? pageUrl("", id) : `#${id}`}" data-id="${id}">${esc(ui[id])}</a>`)
        .join("")}</div>
      <div class="lang" role="group" aria-label="${esc(ui.langLabel)}">${LANGS.map(
        (l) => `<button type="button" data-lang="${l}" aria-pressed="${l === lang}"${l === lang ? ' class="on"' : ""}>${l.toUpperCase()}</button>`
      ).join('<span aria-hidden="true">/</span>')}</div>
    </nav>`;
  }

  function renderProject(d, list, i) {
    const ui = UI[lang];
    const p = list[i];
    const pad = (n) => String(n).padStart(2, "0");
    document.documentElement.lang = lang;
    document.title = `${p.name} · ${d.handle}`;
    const links = (p.links || []).map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(t(l.label))} ↗</a>`).join("");
    const block = (label, html) => (html ? `<section class="dsec reveal"><h2 class="sub">${esc(label)}</h2>${html}</section>` : "");
    const why = (t(p.why) || []).map((x) => `<p>${esc(x)}</p>`).join("");
    const feats = (p.features || []).length
      ? `<div class="fgrid">${p.features
          .map((f) => `<div class="card feat-item"><h3>${esc(t(f.title))}</h3><p>${esc(t(f.text))}</p></div>`)
          .join("")}</div>`
      : "";
    const flow = (t(p.flow) || []).length
      ? `<ol class="flow">${t(p.flow).map((x, k) => `<li><span class="k">${pad(k + 1)}</span><span>${esc(x)}</span></li>`).join("")}</ol>`
      : "";
    const principles = (t(p.principles) || []).length ? `<ul class="principles">${t(p.principles).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
    const prev = list[i - 1], next = list[i + 1];
    const pager = `<div class="pager">${
      prev ? `<a class="card" href="${pageUrl(prev.slug)}"><span class="l">← ${esc(ui.prev)}</span>${esc(prev.name)}</a>` : "<span></span>"
    }${next ? `<a class="card next" href="${pageUrl(next.slug)}"><span class="l">${esc(ui.next)} →</span>${esc(next.name)}</a>` : "<span></span>"}</div>`;

    root.innerHTML = `${navHtml(["home", "research", "projects", "experience", "contact"], true)}
      <main class="wrap detail">
        <a class="back" href="${pageUrl("", "projects")}">${esc(ui.back)}</a>
        <header class="dhead reveal">
          <div class="label">PROJECT ${pad(i + 1)} / ${pad(list.length)}</div>
          <h1>${esc(p.name)}</h1>
          <p class="lede">${esc(t(p.summary))}</p>
          ${p.tags && p.tags.length ? `<div class="tags">${p.tags.map((x) => `<span class="tag">${esc(x)}</span>`).join("")}</div>` : ""}
          ${links ? `<div class="btns">${links}</div>` : ""}
        </header>
        ${block(ui.why, why)}
        ${block(ui.features, feats)}
        ${block(ui.flow, flow)}
        ${block(ui.principles, principles)}
        ${pager}
        <footer><span>${esc(d.copyright || "")}</span><span>${esc(ui.updated)} ${esc(d.updated)}</span></footer>
      </main>`;
    for (const a of root.querySelectorAll(".pill .links a")) a.classList.toggle("on", a.dataset.id === "projects");
  }

  function render() {
    const d = data;
    {
      const list = (d.projects || []).filter((p) => ready(p.summary));
      const i = list.findIndex((p) => p.slug && p.slug === currentSlug());
      if (i >= 0) return renderProject(d, list, i);
    }
    const ui = UI[lang];
    const r = d.research || { groups: [] };
    const items = (r.groups || []).flatMap((g) => g.items || []);
    const projects = (d.projects || []).filter((p) => ready(p.summary));
    const secDesc = (k) => t((d.sections || {})[k]) || "";

    document.documentElement.lang = lang;
    document.title = d.handle;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && d.description) meta.setAttribute("content", t(d.description));

    // ── home
    const home = `<section class="home" id="home">
      <div class="inner">
        ${MARK}
        <div>
          <h1 class="name">${esc(d.handle)}</h1>
          <p class="kname">${esc(t(d.name))}</p>
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
      [items.length, ui.stats.credited],
      [(d.bounties || []).length + (r.pending_rewarded || 0), ui.stats.bounty],
      [r.pending || 0, ui.stats.pending],
    ];
    const overview = `<div class="wrap" id="overview">
      <div class="stats reveal">${stats
        .map(([n, l, a]) => `<div><div class="n${a ? " accent" : ""}">${esc(n)}</div><div class="l">${esc(l)}</div></div>`)
        .join("")}</div>
      ${(t(d.about) || []).length ? `<div class="lead reveal">${t(d.about).map((p) => `<p>${esc(p)}</p>`).join("")}</div>` : ""}
    </div>`;

    // ── research
    const feat = items.filter((f) => f.featured).sort((a, b) => (a.featured.order ?? 99) - (b.featured.order ?? 99));
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
    const row = (f) => `<div class="row">
              <div class="id">${ext(f.url, `${esc(f.id === "Credited" ? ui.credited : f.id)} ↗`)}</div>
              <div><span class="repo">${esc(f.target)}</span> <span class="what">· ${esc(t(f.summary))}</span>${
                (f.refs || []).map((x) => ` ${ext(x.url, `${esc(t(x.label))} ↗`)}`).join("")}${f.writeup ? ` ${ext(f.writeup, esc(ui.writeup))}` : ""
              }</div>
              ${badges(f)}
            </div>`;
    const bountyHtml = (d.bounties || []).length ? `<div class="group reveal">${d.bounties.map(row).join("")}</div>` : "";
    const table = `<div class="sub reveal">${esc(ui.all)}</div><div class="groups">${(r.groups || [])
      .map(
        (g) => `<div class="group reveal"><h3>${esc(t(g.title))}</h3>${(g.items || [])
          .map(
            row
          )
          .join("")}</div>`
      )
      .join("")}</div>`;

    // ── projects
    const projHtml = `<div class="grid">${projects
      .map(
        (p, k) => `<a class="card proj reveal" href="${pageUrl(p.slug)}">
          <div class="num">${String(k + 1).padStart(2, "0")}</div>
          <div class="h"><span>${esc(p.name)}</span><span class="arr">→</span></div>
          <p>${esc(t(p.summary))}</p>
          ${p.tags && p.tags.length ? `<div class="tags">${p.tags.map((x) => `<span class="tag">${esc(x)}</span>`).join("")}</div>` : ""}
        </a>`
      )
      .join("")}</div>`;

    // ── experience
    const det = d.experience_detail;
    const expHtml = `<div class="tl reveal">${(d.experience || [])
      .map(
        (e) => `<div class="item"><div><span class="org">${esc(t(e.org))}</span>${t(e.role) ? ` <span class="role">${esc(t(e.role))}</span>` : ""}</div><div class="period">${esc(
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
      ["bounties", ui.bounties, bountyHtml, (d.bounties || []).length],
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
    const nav = navHtml(navIds, false);

    root.innerHTML = `${nav}${home}${overview}<main class="wrap">${body}
      <footer><span>${esc(d.copyright || "")}</span><span>${esc(ui.updated)} ${esc(d.updated)}</span></footer></main>`;
    markActive();
  }

  // ── active pill item follows the section under the upper third of the screen
  function markActive() {
    if (root.querySelector(".detail")) return;
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
