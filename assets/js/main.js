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

  // 사진 토글 카드 — 클릭 시 텍스트 숨기고 사진을 가득 채움
  function initPhotoToggle() {
    document.querySelectorAll(".feature--toggle").forEach(function (card) {
      function toggle() {
        var on = card.classList.toggle("is-photo");
        card.setAttribute("aria-pressed", on ? "true" : "false");
      }
      card.addEventListener("click", toggle);
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    });
  }

  // 히어로 배경 슬라이드 자동 전환(3장, 페이드)
  function initHeroSlider() {
    var slides = document.querySelectorAll(".hero__slide");
    if (slides.length < 2) return;
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    }, 5000);
  }

  function start() { initNav(); initHeaderShadow(); initLangDropdown(); initPhotoToggle(); initHeroSlider(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
