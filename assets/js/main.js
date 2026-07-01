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

    var isMobile = function () { return window.matchMedia("(max-width: 1000px)").matches; };

    // 상위 메뉴(하위메뉴 보유): 모바일에선 탭 시 하위메뉴 펼침/접기
    menu.querySelectorAll(".nav__item.has-sub > .nav__link").forEach(function (link) {
      link.addEventListener("click", function (e) {
        if (!isMobile()) return; // 데스크톱은 hover로 노출 + 링크 이동
        e.preventDefault();
        var item = link.parentElement;
        var wasOpen = item.classList.contains("is-open");
        menu.querySelectorAll(".nav__item.is-open").forEach(function (o) { o.classList.remove("is-open"); });
        if (!wasOpen) item.classList.add("is-open");
      });
    });

    // 하위메뉴 링크 클릭 시 모바일 메뉴 닫기
    menu.querySelectorAll(".nav__sub a").forEach(function (a) {
      a.addEventListener("click", function () {
        menu.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
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

  // 전역 고정 스크롤 인디케이터 — 클릭 시 한 화면 이동, 배경 밝기에 따라 색 자동 전환
  function initScrollFab() {
    var fab = document.querySelector(".scroll-fab");
    if (!fab) return;

    fab.addEventListener("click", function (e) {
      e.preventDefault();
      var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.scrollBy({ top: Math.round(window.innerHeight * 0.9), behavior: "smooth" });
      }
    });

    // rgb(a) 문자열 → 상대 밝기(0~1).
    function luminance(str) {
      var m = str && str.match(/[\d.]+/g);
      if (!m) return 1;
      return (0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2]) / 255;
    }

    var DARK_SEL = ".hero, .page-hero, .contact-band, .site-footer";

    // 인디케이터 뒤(아래) 요소가 어두운 배경인지 판별
    function isDarkBehind(x, y) {
      fab.style.pointerEvents = "none";
      var el = document.elementFromPoint(x, y);
      fab.style.pointerEvents = "";
      while (el && el !== document.documentElement) {
        // 어두운 배경 섹션(히어로·컨택트·푸터 등)
        if (el.matches && el.matches(DARK_SEL)) return true;
        var cs = getComputedStyle(el);
        // 배경 이미지(사진/그라데이션) → 어둡게 간주
        if (cs.backgroundImage && cs.backgroundImage !== "none") return true;
        var bg = cs.backgroundColor;
        var m = bg && bg.match(/[\d.]+/g);
        // 불투명한 배경색을 만나면 그 밝기로 판정하고 종료
        if (m && !(m[3] !== undefined && +m[3] === 0)) return luminance(bg) < 0.5;
        el = el.parentElement;
      }
      return false; // 기본 흰색 배경
    }

    function update() {
      var r = fab.getBoundingClientRect();
      var dark = isDarkBehind(r.left + r.width / 2, r.top + r.height / 2);
      fab.classList.toggle("is-dark", !dark); // 밝은 배경 → 어두운(브랜드) 색
      var nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 140;
      fab.classList.toggle("is-hidden", nearBottom);
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function start() { initNav(); initHeaderShadow(); initLangDropdown(); initPhotoToggle(); initHeroSlider(); initScrollFab(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
