/* =====================================================================
   공통 인터랙션 — 모바일 네비 토글 · 헤더 스크롤 그림자
   ===================================================================== */
(function () {
  "use strict";

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav__menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { menu.classList.remove("is-open"); });
    });
  }

  function initHeaderShadow() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function initLangDropdown() {
    var dd = document.querySelector(".lang-dropdown");
    if (!dd) return;
    var toggle = dd.querySelector(".lang-dropdown__toggle");

    function close() { dd.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); }
    function open() { dd.classList.add("is-open"); toggle.setAttribute("aria-expanded", "true"); }

    toggle.addEventListener("click", function (e) {
      e.stopPropagation();
      dd.classList.contains("is-open") ? close() : open();
    });
    // 항목 선택 시 닫기
    dd.querySelectorAll("[data-lang]").forEach(function (b) {
      b.addEventListener("click", close);
    });
    // 바깥 클릭/ESC 닫기
    document.addEventListener("click", function (e) { if (!dd.contains(e.target)) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  }

  function start() { initNav(); initHeaderShadow(); initLangDropdown(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
