/* =====================================================================
   화면 맞춤 스케일 — 1440px 디자인을 기준으로, 데스크탑/노트북에서
   화면의 '폭'과 '높이' 중 더 빡빡한 쪽에 맞춰 전체를 균일 확대/축소(zoom).
   → 27인치부터 노트북까지 '첫 화면(헤더+히어로+카드)'이 같은 비율로 한눈에 보임.
   (모바일 ≤820px은 스케일 없이 세로 스크롤 유지)
   ===================================================================== */
(function () {
  "use strict";
  var DESIGN_WIDTH = 1440;   // 기준 폭(가로는 1440 기준 균일 스케일)
  var MAX_ZOOM = 2.0;        // 과도한 확대 방지 상한
  var MOBILE_MAX = 820;      // 이 이하는 모바일(스크롤 유지)
  // 히어로가 남는 세로 공간을 채우도록: 카드가 첫 화면 하단에 오게 함
  var NONHERO = 210;         // 헤더(57) + 히어로 아래 카드 부분(125) + 카드를 살짝 위로 올릴 하단 여백(≈28)
  var HERO_MIN = 360, HERO_MAX = 920; // 히어로 높이 하한/상한(캔버스 px) — 하한 낮춰 짧은 세로(≈360px)에서도 카드까지 노출

  function applyScale() {
    var docEl = document.documentElement;
    docEl.style.zoom = "";                 // 정확 측정 위해 줌 초기화
    var hero = document.querySelector(".hero");
    if (hero) hero.style.minHeight = "";   // 히어로 높이 초기화(모바일/재측정)
    var w = docEl.clientWidth;             // 스크롤바 제외 실제 폭
    if (w <= MOBILE_MAX) return;           // 모바일: 스케일 없음(CSS 그대로)
    // 가로: 1440 초과에서만 확대(줌은 1.0 밑으로 내려가지 않음).
    // → 1440 이하는 줌 없이 CSS clamp 폰트가 모바일까지 연속 축소 → 820px 경계에서 텍스트 점프 없음
    var zoom = Math.min(Math.max(w / DESIGN_WIDTH, 1), MAX_ZOOM);
    docEl.style.zoom = zoom;
    // 세로: 히어로가 남는 공간을 채워 카드가 항상 첫 화면 하단에 오도록(화면비별 빈공간 제거)
    if (hero) {
      var canvasVH = window.innerHeight / zoom;   // 줌 보정한 캔버스 기준 뷰포트 높이
      var hh = Math.max(HERO_MIN, Math.min(canvasVH - NONHERO, HERO_MAX));
      hero.style.minHeight = hh + "px";
    }
  }

  applyScale();
  window.addEventListener("resize", applyScale);
  window.addEventListener("orientationchange", applyScale);
})();

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

    var isMobile = function () { return window.matchMedia("(max-width: 820px)").matches; };

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
    var nav = document.querySelector(".hero__nav");
    var dots = document.querySelectorAll(".hero__navdot");
    var i = 0, timer = null;
    function show(n) {
      slides[i].classList.remove("is-active");
      if (dots[i]) dots[i].classList.remove("is-active");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("is-active");
      if (dots[i]) dots[i].classList.add("is-active");
      if (nav) nav.setAttribute("data-active", String(i));
    }
    function play() { stop(); timer = setInterval(function () { show(i + 1); }, 5000); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    dots.forEach(function (d, n) {
      d.addEventListener("click", function () { show(n); play(); });
    });
    play();
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

  // 너겟 이미지 슬라이드쇼 — 여러 장을 순차 자동 전환(도트 클릭 지원)
  function initIceSlideshow() {
    document.querySelectorAll(".ice-slideshow").forEach(function (box) {
      var slides = box.querySelectorAll(".ice-slide");
      if (slides.length < 2) return;
      var dotsWrap = box.querySelector(".ice-slideshow__dots");
      var interval = parseInt(box.getAttribute("data-interval"), 10) || 3000;
      var i = 0, timer = null, dots = [];

      function show(n) {
        slides[i].classList.remove("is-active");
        if (dots[i]) dots[i].classList.remove("is-active");
        i = (n + slides.length) % slides.length;
        slides[i].classList.add("is-active");
        if (dots[i]) dots[i].classList.add("is-active");
      }
      function next() { show(i + 1); }
      function play() { stop(); timer = setInterval(next, interval); }
      function stop() { if (timer) { clearInterval(timer); timer = null; } }

      if (dotsWrap) {
        slides.forEach(function (_, n) {
          var b = document.createElement("button");
          b.type = "button";
          b.setAttribute("aria-label", (n + 1) + "번 사진");
          if (n === 0) b.classList.add("is-active");
          b.addEventListener("click", function () { show(n); play(); });
          dotsWrap.appendChild(b);
          dots.push(b);
        });
      }

      // 이전/다음 화살표
      var prev = box.querySelector(".ice-slideshow__arrow--prev");
      var nextBtn = box.querySelector(".ice-slideshow__arrow--next");
      if (prev) prev.addEventListener("click", function () { show(i - 1); play(); });
      if (nextBtn) nextBtn.addEventListener("click", function () { show(i + 1); play(); });

      // 마우스 올리면 일시정지
      box.addEventListener("mouseenter", stop);
      box.addEventListener("mouseleave", play);

      // 외부(탭 전환 등)에서 첫 장부터 다시 시작할 수 있도록 노출
      box.resetSlideshow = function () { show(0); play(); };

      // 섹션이 화면에 보일 때마다 첫 사진부터 시작, 벗어나면 정지
      if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { show(0); play(); }
            else { stop(); }
          });
        }, { threshold: 0.35 });
        io.observe(box);
      } else {
        play();
      }
    });
  }

  // 스크롤 진입 시 .reveal 요소를 나타나게(한 번만)
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach(function (e) { e.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    els.forEach(function (e) { io.observe(e); });
  }

  function start() { initNav(); initHeaderShadow(); initLangDropdown(); initPhotoToggle(); initHeroSlider(); initIceSlideshow(); initScrollFab(); initReveal(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
