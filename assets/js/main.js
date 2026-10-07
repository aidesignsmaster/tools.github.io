(function () {
  "use strict";
  if (window.__wtbShared) return;
  window.__wtbShared = true;

  // Reserve space so the page does not jump when the header loads.
  var s = document.createElement("style");
  s.textContent = "#site-header{min-height:84px}#site-footer{min-height:200px}";
  document.head.appendChild(s);

  function load(id, url, done) {
    var target = document.getElementById(id);
    if (!target) return;
    fetch(url, { cache: "no-cache", credentials: "same-origin" })
      .then(function (r) { if (!r.ok) throw new Error("Failed to load " + url); return r.text(); })
      .then(function (html) { target.innerHTML = html; target.style.minHeight = "0"; if (done) done(target); })
      .catch(function (e) { console.error("Working Tools Box shared component error:", e); });
  }

  function setYear(root) {
    var y = new Date().getFullYear();
    root.querySelectorAll("[data-wtb-year],[data-current-year]").forEach(function (n) { n.textContent = y; });
  }

  function markActive(root) {
    var path = location.pathname.replace(/index\.html$/, "");
    if (path === "/" || path === "") {
      var home = root.querySelector("[data-wtb-home]");
      if (home) home.setAttribute("aria-current", "page");
    }
  }

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
      if (t) { t.setAttribute("aria-expanded", "false"); t.focus(); }
    }
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
