/* ---------------------------------------------------------------------------
   Renders the day schedules, master timetable, directory, cost table and map
   from js/itinerary.js, then wires up the interactions.
--------------------------------------------------------------------------- */
(function () {
  "use strict";

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const MAPS = (q) => "https://www.google.com/maps/search/?api=1&query=" + q;

  const ICON = {
    ext:  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M6 3H3v10h10v-3M9.5 2.5H13.5V6.5M13 3l-6 6"/></svg>',
    pin:  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M8 14s5-4.4 5-8A5 5 0 0 0 3 6c0 3.6 5 8 5 8Z"/><circle cx="8" cy="6" r="1.8"/></svg>',
    tel:  '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M3 3.5c0 5.2 4.3 9.5 9.5 9.5l1-2.2-2.9-1.4-1.3 1.4a9.6 9.6 0 0 1-4.1-4.1l1.4-1.3L5.2 2.5Z"/></svg>',
    ok:   '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 8.5 6.3 12 13 4.6"/></svg>',
    down: '<svg class="chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>',
  };

  /* ======================================================================
     DAYS
     ====================================================================== */

  function picture(slug, alt) {
    return (
      '<figure class="pic"><img src="assets/img/' + slug + '.webp" ' +
      'srcset="assets/img/' + slug + '@sm.webp 800w, assets/img/' + slug + '.webp 1600w" ' +
      'sizes="(max-width:860px) 92vw, 640px" ' +
      'alt="' + esc(alt) + '" loading="lazy" decoding="async" width="1600" height="1000"></figure>'
    );
  }

  function venueRow(e) {
    const pics = e.img2
      ? '<div class="pics two">' + picture(e.img, e.alt) + picture(e.img2, e.alt2 || e.alt) + "</div>"
      : '<div class="pics">' + picture(e.img, e.alt) + "</div>";

    let tags = "";
    if (e.web) tags += '<a class="tag" href="' + esc(e.web) + '" target="_blank" rel="noopener noreferrer">' +
      ICON.ext + "Website</a>";
    if (e.map) tags += '<a class="tag" href="' + esc(MAPS(e.map)) + '" target="_blank" rel="noopener noreferrer">' +
      ICON.pin + "Open in Maps</a>";
    if (e.tel) tags += '<a class="tag" href="tel:' + e.tel.replace(/\s/g, "") + '">' + ICON.tel + esc(e.tel) + "</a>";
    if (e.reserved) tags += '<span class="tag res">' + ICON.ok + esc(e.reserved) + "</span>";
    if (e.cost) tags += '<span class="tag cost">' + esc(e.cost) +
      (e.costNote ? ' <span style="color:var(--txt-3)">· ' + esc(e.costNote) + "</span>" : "") + "</span>";

    let detail = "";
    if (e.detail && e.detail.length) {
      const id = "d-" + Math.random().toString(36).slice(2, 8);
      tags += '<button class="tag more" type="button" aria-expanded="false" aria-controls="' + id + '">' +
        "Details" + ICON.down + "</button>";
      detail =
        '<div class="detail" id="' + id + '" data-open="false"><div><dl>' +
        e.detail.map((d) => "<dt>" + esc(d[0]) + "</dt><dd>" + esc(d[1]) + "</dd>").join("") +
        "</dl></div></div>";
    }

    return pics +
      "<h3>" + esc(e.title) + "</h3>" +
      (e.address ? '<p class="addr">' + esc(e.address) + "</p>" : "") +
      '<p class="copy">' + esc(e.body) + "</p>" +
      '<div class="tags">' + tags + "</div>" + detail;
  }

  function quietRow(e) {
    return '<p class="line"><strong>' + esc(e.title) + "</strong>" +
      (e.line ? " " + esc(e.line) : "") +
      (e.cost ? '<span class="cost">' + esc(e.cost) + "</span>" : "") + "</p>";
  }

  function renderDays() {
    const host = $("#days");
    host.innerHTML = DAYS.map((day) => {
      const events = day.events.map((e) => {
        const id = e.type === "venue" ? ' id="' + day.id + "-" + e.start.replace(":", "") + '"' : "";
        return (
          '<article class="ev ' + e.type + (e.highlight ? " highlight" : "") + '"' + id + ">" +
            '<div class="time">' +
              '<div class="t1 mono">' + esc(e.start) + "</div>" +
              '<div class="t2 mono">' + esc(e.end) + (e.endNote ? "<sup>" + esc(e.endNote) + "</sup>" : "") + "</div>" +
              '<div class="kind">' + esc(e.kind || "") + "</div>" +
            "</div>" +
            '<div class="body rv">' + (e.type === "venue" ? venueRow(e) : quietRow(e)) + "</div>" +
          "</article>"
        );
      }).join("");

      return (
        '<section id="' + day.id + '" class="day" aria-labelledby="h-' + day.id + '">' +
          '<div class="dayopen"><div class="wrap"><div class="row rv">' +
            '<div class="num">' + day.n + "</div>" +
            "<div>" +
              '<p class="when">' + esc(day.weekday) + " " + esc(day.date) +
                ' <span class="' + (day.anniversary ? "anniv" : "") + '">· ' + esc(day.tag) + "</span></p>" +
              '<h2 id="h-' + day.id + '">' + esc(day.title) + "</h2>" +
              '<p class="lede">' + esc(day.lede) + "</p>" +
              '<div class="stops">' + day.stops.map((s) => "<span>" + esc(s) + "</span>").join("") + "</div>" +
            "</div>" +
          "</div></div></div>" +
          '<div class="sched"><div class="wrap">' + events + "</div></div>" +
        "</section>"
      );
    }).join("");

    /* details toggles */
    host.addEventListener("click", (ev) => {
      const btn = ev.target.closest(".tag.more");
      if (!btn) return;
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.setAttribute("data-open", String(!open));
    });
  }

  /* ======================================================================
     SHAPE OF THE TRIP
     ====================================================================== */

  const SHAPE = [
    ["thu", ["Depart Delhi · 10:05", null], ["Arrive 15:20 · the suite", "thu-1715"], ["Dishoom Covent Garden", "thu-1930"]],
    ["fri", ["Bicester Village", "fri-1000"], ["Cecconi's, then Aman Spa", "fri-1330"], ["Hélène Darroze", "fri-1930"]],
    ["sat", ["Windsor Castle", "sat-1000"], ["The Ivy, then wine and cheese", "sat-1330"], ["Dinner cruise on the Thames", "sat-1930"]],
    ["sun", ["Tower of London", "sun-0900"], ["Rules, then Burlington Arcade", "sun-1230"], ["Car 16:00 · depart 20:35", null]],
  ];

  function renderShape() {
    const body = SHAPE.map(([id, ...cells]) => {
      const d = DAYS.find((x) => x.id === id);
      return "<tr>" +
        '<td class="dcell"><div class="num">' + d.n + "</div>" +
          '<div class="dt">' + esc(d.weekday.slice(0, 3)) + " " + esc(d.date.split(" ")[0]) + "</div>" +
          '<div class="tg' + (d.anniversary ? " anniv" : "") + '">' + esc(d.tag) + "</div></td>" +
        cells.map(([label, anchor]) =>
          "<td>" + (anchor
            ? '<a class="cell" href="#' + anchor + '">' + esc(label) + "</a>"
            : '<span class="cell">' + esc(label) + "</span>") + "</td>"
        ).join("") +
        "</tr>";
    }).join("");
    $("#shape tbody").innerHTML = body;
  }

  /* ======================================================================
     COSTS
     ====================================================================== */

  function renderCosts() {
    const money = (n) => "£" + n.toLocaleString("en-GB");

    $("#ctable").innerHTML = COSTS.map((c) =>
      '<tbody data-key="' + c.key + '">' +
        '<tr class="grp" tabindex="0" role="button" aria-expanded="false">' +
          '<td class="nm">' + esc(c.label) +
            '<span class="cnt">' + c.items.length + (c.items.length > 1 ? " items" : " item") + "</span></td>" +
          '<td class="amt">' + money(c.total) + "</td>" +
        "</tr>" +
        c.items.map((it) =>
          '<tr class="item"><td>' + esc(it[0]) + '</td><td class="amt">' + money(it[1]) + "</td></tr>"
        ).join("") +
      "</tbody>"
    ).join("") +
    '<tbody><tr class="tot"><td class="nm">Total<small>Four days, two guests</small></td>' +
      '<td class="amt">' + esc(TRIP.total) + "</td></tr></tbody>";

    $("#ctable").addEventListener("click", (e) => toggleGroup(e.target.closest("tr.grp")));
    $("#ctable").addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        const row = e.target.closest("tr.grp");
        if (row) { e.preventDefault(); toggleGroup(row); }
      }
    });
    function toggleGroup(row) {
      if (!row) return;
      const tb = row.parentNode;
      const open = tb.classList.toggle("open");
      row.setAttribute("aria-expanded", String(open));
    }

    /* donut */
    const R = 62, C = 2 * Math.PI * R;
    let offset = 0;
    const svg = $("#donut");
    COSTS.forEach((c) => {
      const len = (c.pct / 100) * C;
      const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      el.setAttribute("cx", 80); el.setAttribute("cy", 80); el.setAttribute("r", R);
      el.setAttribute("stroke", c.colour);
      el.setAttribute("stroke-dasharray", "0 " + C);
      el.setAttribute("transform", "rotate(-90 80 80)");
      el.dataset.len = len; el.dataset.off = -offset; el.dataset.key = c.key;
      svg.appendChild(el);
      offset += len;
    });

    $("#legend").innerHTML = COSTS.map((c) =>
      '<li data-key="' + c.key + '"><i style="background:' + c.colour + '"></i>' +
      esc(c.label) + '<span class="pc mono">' + c.pct.toFixed(1) + "%</span></li>"
    ).join("");

    let drawn = false;
    const draw = () => {
      if (drawn) return; drawn = true;
      const quick = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      $$("circle", svg).forEach((el, i) => {
        setTimeout(() => {
          el.style.transition = quick ? "none" : "stroke-dasharray 1s cubic-bezier(.3,.8,.3,1)";
          el.setAttribute("stroke-dasharray", el.dataset.len + " " + C);
          el.setAttribute("stroke-dashoffset", el.dataset.off);
        }, quick ? 0 : i * 130);
      });
    };
    new IntersectionObserver((es, o) => {
      es.forEach((en) => { if (en.isIntersecting) { draw(); o.disconnect(); } });
    }, { threshold: 0.35 }).observe(svg);

    /* hover link between legend and donut */
    const focus = (key) => {
      $$("circle", svg).forEach((el) => {
        el.classList.toggle("dim", key !== null && el.dataset.key !== key);
        el.classList.toggle("up", key !== null && el.dataset.key === key);
      });
    };
    $("#legend").addEventListener("mouseover", (e) => {
      const li = e.target.closest("li"); if (li) focus(li.dataset.key);
    });
    $("#legend").addEventListener("mouseleave", () => focus(null));
  }

  /* ======================================================================
     MASTER TIMETABLE
     ====================================================================== */

  function renderTimetable() {
    const strip = (t) => t.replace(/^(Lunch|Dinner|Breakfast) at /, "").replace(/^Check in · /, "");
    let rows = "";
    DAYS.forEach((d) => {
      rows += '<tr class="dayrow" data-day="' + d.id + '"><td colspan="5">' +
        esc(d.weekday) + " " + esc(d.date) + "</td></tr>";
      d.events.forEach((e) => {
        const kind = e.type === "venue" ? e.kind : (e.kind || "Travel");
        rows += '<tr data-day="' + d.id + '" data-kind="' + esc(kind.toLowerCase()) + '">' +
          '<td class="time">' + esc(e.start) + " to " + esc(e.end) + (e.endNote ? esc(e.endNote) : "") + "</td>" +
          "<td>" + esc(e.title) + "</td>" +
          '<td class="kind"><span>' + esc(kind) + "</span></td>" +
          '<td class="loc">' + esc(e.loc || strip(e.title)) + "</td>" +
          '<td class="cost">' + esc(e.cost || "") + "</td>" +
          "</tr>";
      });
    });
    rows += '<tr class="tot"><td colspan="4">Total, four days, two guests</td>' +
      '<td class="cost">' + esc(TRIP.total) + "</td></tr>";
    $("#tt tbody").innerHTML = rows;

    $("#tt-filters").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      $$("#tt-filters button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const day = b.dataset.day;
      $$("#tt tbody tr").forEach((tr) => {
        if (tr.classList.contains("tot")) return;
        tr.classList.toggle("hide", day !== "all" && tr.dataset.day !== day);
      });
    });
  }

  /* ======================================================================
     DIRECTORY
     ====================================================================== */

  function renderDirectory() {
    $("#directory").innerHTML = DIRECTORY.map((g) =>
      '<div class="dgroup"><h3>' + esc(g.group) + "</h3>" +
      '<div class="scroller"><table class="dt-table"><tbody>' +
      g.rows.map(([biz, site, url, tel, adr]) =>
        "<tr>" +
          '<td class="biz">' + esc(biz) + "</td>" +
          '<td class="web"><a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' +
            esc(site) + "</a></td>" +
          '<td class="tel">' + (/^\+/.test(tel)
              ? '<a href="tel:' + tel.replace(/\s/g, "") + '">' + esc(tel) + "</a>"
              : "<span>" + esc(tel) + "</span>") + "</td>" +
          '<td class="adr">' + esc(adr) + "</td>" +
        "</tr>"
      ).join("") +
      "</tbody></table></div></div>"
    ).join("") + '<p class="noresult" hidden>Nothing matches that. Try a shorter search.</p>';

    const input = $("#dsearch");
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      let hits = 0;
      $$("#directory .dgroup").forEach((g) => {
        let shown = 0;
        $$("tr", g).forEach((tr) => {
          const ok = !q || tr.textContent.toLowerCase().includes(q);
          tr.classList.toggle("hide", !ok);
          if (ok) shown++;
        });
        g.classList.toggle("hide", shown === 0);
        hits += shown;
      });
      $("#directory .noresult").hidden = hits > 0;
    });
  }

  /* ======================================================================
     MAP
     ====================================================================== */

  function initMap() {
    if (typeof L === "undefined") { $("#map").style.display = "none"; return; }
    const map = L.map("map", { scrollWheelZoom: false, attributionControl: true })
      .setView([51.505, -0.128], 12);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO', maxZoom: 19,
    }).addTo(map);

    const layer = L.layerGroup().addTo(map);
    const routeLayer = L.layerGroup().addTo(map);
    const home = PINS.find((p) => p.home);
    const note = $("#route-note");

    function marker(p, label, popup) {
      return L.marker([p.lat, p.lng], {
        title: p.name,
        icon: L.divIcon({
          className: "", iconSize: [26, 26], iconAnchor: [13, 13],
          html: '<span class="pin' + (p.home ? " home" : "") + '">' + label + "</span>",
        }),
      }).bindPopup(popup);
    }

    function paint(day) {
      layer.clearLayers();
      routeLayer.clearLayers();
      const all = day === "all";

      /* Stops in the order they are visited. On "all four days" the route is
         left off, because four overlapping loops read as a scribble. */
      const stops = all
        ? PINS.filter((p) => !p.home)
        : PINS.filter((p) => p.day === day && !p.home && !p.atHome);
      const inHouse = all ? [] : PINS.filter((p) => p.day === day && p.atHome);

      const homeSub = all
        ? home.sub
        : "Start and finish" + (inHouse.length
            ? ", and " + inHouse.map((s) => s.name).join(" and ") + " in the evening"
            : "");
      const shown = [marker(home, "★", "<b>" + esc(home.name) + "</b><small>" + esc(homeSub) + "</small>")];
      shown[0].addTo(layer);

      stops.forEach((p, i) => {
        const label = all ? String(i + 1) : String(i + 1);
        const m = marker(p, label,
          "<b>" + esc(p.name) + "</b><small>" + (all ? esc(p.sub) : "Stop " + (i + 1) + " · " + esc(p.sub)) + "</small>");
        m.addTo(layer);
        shown.push(m);
      });

      if (!all && stops.length) {
        const pts = [[home.lat, home.lng]]
          .concat(stops.map((s) => [s.lat, s.lng]))
          .concat([[home.lat, home.lng]]);
        L.polyline(pts, { color: "#D29C33", weight: 9, opacity: 0.1, lineJoin: "round" }).addTo(routeLayer);
        L.polyline(pts, {
          color: "#D29C33", weight: 2, opacity: 0.9, lineCap: "round",
          dashArray: "1 9", className: "route-line",
        }).addTo(routeLayer);
      }

      if (note) {
        if (all) {
          note.textContent = "Choose a single day to trace its route.";
        } else {
          const names = [home.name].concat(stops.map((s) => s.name)).concat([home.name]);
          note.textContent = names.join("  →  ");
        }
      }

      map.fitBounds(L.featureGroup(shown).getBounds(), { padding: [58, 58], maxZoom: 14 });
    }
    paint("all");

    $("#map-filters").addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      $$("#map-filters button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      paint(b.dataset.day);
    });
  }

  /* ======================================================================
     CREDITS
     ====================================================================== */

  function renderCredits() {
    fetch("assets/img/credits.json").then((r) => r.json()).then((c) => {
      const seen = new Set();
      const parts = Object.keys(c).map((k) => {
        const v = c[k];
        const who = v.by || v.source;
        const key = who + v.license;
        if (seen.has(key)) return null;
        seen.add(key);
        const label = esc(who) + (v.license && v.license !== "Courtesy of the venue" ? " (" + esc(v.license) + ")" : "");
        return v.url ? '<a href="' + esc(v.url) + '" target="_blank" rel="noopener noreferrer">' + label + "</a>" : label;
      }).filter(Boolean);
      $("#credit-list").innerHTML = "Photography: " + parts.join(" · ") + ".";
    }).catch(() => {});
  }

  /* ======================================================================
     NAV, SCROLLSPY, REVEAL
     ====================================================================== */

  function initChrome() {
    const nav = $(".nav"), bar = $("#progress");
    const links = $$(".nav a.lnk"), dayLinks = $$(".daybar a");
    const targets = links.map((a) => document.getElementById(a.getAttribute("href").slice(1)))
      .filter(Boolean);

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        nav.classList.toggle("solid", y > window.innerHeight * 0.7);
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";

        let active = null;
        targets.forEach((t) => { if (t.getBoundingClientRect().top <= 140) active = t.id; });
        links.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + active));
        dayLinks.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + active));
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* drawer */
    const drawer = $(".drawer");
    const setDrawer = (open) => {
      drawer.classList.toggle("open", open);
      drawer.setAttribute("aria-hidden", String(!open));
      $(".nav .burger").setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    $(".nav .burger").addEventListener("click", () => setDrawer(!drawer.classList.contains("open")));
    drawer.addEventListener("click", (e) => { if (e.target.closest("a, .close")) setDrawer(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setDrawer(false); });

    /* reveal */
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    $$(".rv").forEach((el) => io.observe(el));
  }

  /* ======================================================================
     GO
     ====================================================================== */

  document.addEventListener("DOMContentLoaded", () => {
    renderDays();
    renderShape();
    renderCosts();
    renderTimetable();
    renderDirectory();
    renderCredits();
    initChrome();
    if (document.readyState !== "loading") initMap(); else window.addEventListener("load", initMap);
  });
})();
