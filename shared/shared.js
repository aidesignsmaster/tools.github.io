(function () {
  "use strict";
  if (window.__wtbShared) return;
  window.__wtbShared = true;

  // Reserve space so the page does not jump when the header loads.
  var s = document.createElement("style");
  s.textContent = "#site-header{min-height:84px}#site-footer{min-height:200px}";
  document.head.appendChild(s);

  // ---- tiny session cache: header/footer appear instantly on the next page ----
  var KEY = "wtb-shared-v2:";
  function read(k) { try { return sessionStorage.getItem(KEY + k); } catch (e) { return null; } }
  function write(k, v) { try { sessionStorage.setItem(KEY + k, v); } catch (e) {} }

  // ---- safety net: if the shared files cannot load, the visitor still gets working links ----
  var LINK = "color:#5b4fa3;text-decoration:none;font-weight:600;font-size:14px";
  var FALLBACK = {
    "site-header": '<nav aria-label="Main navigation" style="display:flex;flex-wrap:wrap;gap:6px 18px;padding:14px 16px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif">' +
      '<a style="' + LINK + '" href="/">Home</a><a style="' + LINK + '" href="/#tools">Tools</a><a style="' + LINK + '" href="/games/">Games</a></nav>',
    "site-footer": '<nav aria-label="Site pages" style="display:flex;flex-wrap:wrap;gap:6px 18px;padding:20px 16px;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif">' +
      '<a style="' + LINK + '" href="/about/">About Us</a><a style="' + LINK + '" href="/contact/">Contact Us</a><a style="' + LINK + '" href="/privacy-policy/">Privacy Policy</a>' +
      '<a style="' + LINK + '" href="/terms/">Terms of Use</a><a style="' + LINK + '" href="/disclaimer/">Disclaimer</a><a style="' + LINK + '" href="/cookie-policy/">Cookie Policy</a></nav>'
  };

  function put(target, html, done) {
    target.innerHTML = html;
    target.style.minHeight = "0";
    if (done) done(target);
  }

  function load(id, url, done) {
    var target = document.getElementById(id);
    if (!target) return;
    var cached = read(id);
    var shown = false;
    if (cached) { put(target, cached, done); shown = true; }
    fetch(url, { cache: "no-cache", credentials: "same-origin" })
      .then(function (r) { if (!r.ok) throw new Error("Failed to load " + url); return r.text(); })
      .then(function (html) {
        if (!html || html === cached) return;
        write(id, html);
        put(target, html, done);
      })
      .catch(function (e) {
        console.error("Working Tools Box shared component error:", e);
        if (!shown) put(target, FALLBACK[id] || "", done);
      });
  }

  function setYear(root) {
    var y = new Date().getFullYear();
    root.querySelectorAll("[data-wtb-year],[data-current-year]").forEach(function (n) { n.textContent = y; });
  }

  // Highlight the menu item for the section the visitor is in.
  function markActive(root) {
    var path = location.pathname.replace(/index\.html$/, "");
    var sel = null, page = "true";
    if (path === "/" || path === "") { sel = "[data-wtb-home]"; page = "page"; }
    else if (path.indexOf("/games") === 0) sel = 'a[href="/games/"]';
    else if (/^\/tools\/(pdf-|image-to-pdf|image-to-text|qr-|fancy-|text-)/.test(path)) sel = 'a[href="/#utility-tools"]';
    else if (/^\/tools\/video-/.test(path)) sel = 'a[href="/#video-tools"]';
    else if (/^\/tools\/(image-|photo-|favicon|color-|meme)/.test(path)) sel = 'a[href="/#image-tools"]';
    else if (path.indexOf("/tools/") === 0) sel = 'a[href="/#utility-tools"]';
    if (!sel) return;
    var el = root.querySelector(sel);
    if (el) el.setAttribute("aria-current", page);
  }

  // Pause decorative animations while the window is being zoomed/resized,
  // so browser zoom stays smooth.
  var rzTimer = 0;
  window.addEventListener("resize", function () {
    var d = document.documentElement;
    d.classList.add("wtb-resizing");
    clearTimeout(rzTimer);
    rzTimer = setTimeout(function () { d.classList.remove("wtb-resizing"); }, 350);
  }, { passive: true });

  function init() {
    load("site-header", "/shared/header.html", markActive);
    load("site-footer", "/shared/footer.html", setYear);
  }

  // Mobile menu: works even though header HTML is injected later.
  document.addEventListener("click", function (e) {
    var bar = document.getElementById("wtbh");
    if (!bar) return;
    var btn = e.target.closest ? e.target.closest(".wtbh-toggle") : null;
    if (btn) {
      var open = bar.classList.toggle("wtbh-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      return;
    }
    if (bar.classList.contains("wtbh-open") && (!bar.contains(e.target) || (e.target.closest && e.target.closest("a")))) {
      bar.classList.remove("wtbh-open");
      var t = bar.querySelector(".wtbh-toggle");
      if (t) { t.setAttribute("aria-expanded", "false"); t.setAttribute("aria-label", "Open menu"); }
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var bar = document.getElementById("wtbh");
    if (bar && bar.classList.contains("wtbh-open")) {
      bar.classList.remove("wtbh-open");
      var t = bar.querySelector(".wtbh-toggle");
      if (t) { t.setAttribute("aria-expanded", "false"); t.setAttribute("aria-label", "Open menu"); t.focus(); }
    }
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
