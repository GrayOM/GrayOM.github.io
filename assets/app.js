// Renders the page from data/profile.json. Edit that file, not this one.
(function () {
  const root = document.getElementById("app");

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const link = (url, text) => (url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}</a>` : esc(text));
  // Entries still marked [TODO ...] are not published.
  const ready = (s) => !/\[TODO/.test(s || "");
  const todo = (s) => esc(s);
  const section = (id, title, html) => (html ? `<section id="${id}"><h2>${esc(title)}</h2>${html}</section>` : "");

  function render(d) {
    document.title = `${d.name} (${d.handle})`;

    const about = (d.about || []).map((p) => `<p>${esc(p)}</p>`).join("");

    const research = d.research
      ? (d.research.intro ? `<p class="muted">${esc(d.research.intro)}</p>` : "") +
        (d.research.groups || [])
          .map(
            (g) => `<div class="group"><h3>${esc(g.title)}</h3>${(g.items || [])
              .map(
                (f) => `<div class="finding">
                  <div class="id">${link(f.url, f.id)}</div>
                  <div class="body">
                    <div><span class="target">${esc(f.target)}</span> &middot; <span class="sum">${esc(f.summary)}</span></div>
                    <div class="meta">${f.severity ? `<span class="sev sev-${esc(f.severity.toLowerCase())}">${esc(f.severity)}</span>` : ""}${f.cvss ? `<span>${esc(f.cvss)}</span>` : ""}${f.writeup ? link(f.writeup, "write-up") : ""}</div>
                  </div>
                </div>`
              )
              .join("")}</div>`
          )
          .join("") +
        (d.research.pending_note ? `<p class="muted" style="margin-top:16px">${esc(d.research.pending_note)}</p>` : "")
      : "";

    const projects = (d.projects || [])
      .filter((p) => ready(p.summary))
      .map(
        (p) => `<div class="project">
          <div class="name">${link(p.url, p.name)}</div>
          <div>${todo(p.summary)}</div>
          ${p.tags && p.tags.length ? `<div class="tags">${p.tags.map(esc).join(" · ")}</div>` : ""}
        </div>`
      )
      .join("");

    const exp =
      (d.experience || [])
        .map((e) => `<div class="exp"><div><strong>${esc(e.org)}</strong> &middot; ${esc(e.role)}</div><div class="period">${esc(e.period)}</div></div>`)
        .join("") +
      (d.experience_detail
        ? `<p class="muted" style="margin-top:10px">${d.experience_detail.url ? link(d.experience_detail.url, d.experience_detail.label) : esc(d.experience_detail.label)}</p>`
        : "");

    const clean = (arr) => (arr || []).filter((a) => a && a.title && ready(a.title));
    const list = (arr) =>
      arr && arr.length
        ? `<ul class="plain">${arr.map((a) => `<li><span>${todo(a.title)}${a.detail ? ` <span class="muted">${esc(a.detail)}</span>` : ""}</span><span class="yr">${esc(a.year)}</span></li>`).join("")}</ul>`
        : "";
    // Each block appears only when it has entries; the section title follows what is shown.
    const blocks = [
      ["Awards", clean(d.awards)],
      ["Certifications", clean(d.certs)],
      ["Education", clean(d.education)],
    ].filter(([, items]) => items.length);
    const awards = blocks
      .map(([t, items], i) => `<h3 class="sub"${i ? ' style="margin-top:20px"' : ""}>${esc(t)}</h3>${list(items)}`)
      .join("");
    const awardsTitle = blocks.map(([t]) => t).filter((t) => t !== "Education").join(" & ") || "Education";

    const c = d.contact || {};
    const contact =
      (c.email ? `<p><span class="muted">email</span> <span style="font-family:var(--mono)">${esc(c.email)}</span></p>` : "") +
      ((c.links || []).length ? `<p>${c.links.map((l) => link(l.url, l.label)).join(" &nbsp;·&nbsp; ")}</p>` : "");

    const sections = [
      ["about", "About", about],
      ["research", "Research", research],
      ["projects", "Projects", projects],
      ["experience", "Experience", exp],
      ["credentials", awardsTitle, awards],
      ["contact", "Contact", contact],
    ].filter(([, , html]) => html);
    const nav = sections
      .filter(([id]) => id !== "about")
      .map(([id, title]) => `<a href="#${id}">${esc(title.toLowerCase())}</a>`)
      .join("");

    root.innerHTML = `
      <header>
        <h1>${esc(d.name)}</h1>
        <div class="handle">@${esc(d.handle)}</div>
        <p class="tagline">${esc(d.tagline)}</p>
        <nav aria-label="Sections">${nav}</nav>
      </header>
      ${sections.map(([id, title, html]) => section(id, title, html)).join("")}
      <footer>Last updated ${esc(d.updated)}</footer>`;
  }

  fetch("data/profile.json", { cache: "no-cache" })
    .then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    })
    .then(render)
    .catch(() => {
      const sections = [
      ["about", "About", about],
      ["research", "Research", research],
      ["projects", "Projects", projects],
      ["experience", "Experience", exp],
      ["credentials", awardsTitle, awards],
      ["contact", "Contact", contact],
    ].filter(([, , html]) => html);
    const nav = sections
      .filter(([id]) => id !== "about")
      .map(([id, title]) => `<a href="#${id}">${esc(title.toLowerCase())}</a>`)
      .join("");

    root.innerHTML = `<p>Could not load profile data. Check that <code>data/profile.json</code> exists and is valid JSON.</p>`;
    });
})();
