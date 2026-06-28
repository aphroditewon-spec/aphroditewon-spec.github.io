/* =====================================================================
   i18n 엔진 — data-i18n 속성을 사전 값으로 치환
   - data-i18n        : textContent 치환
   - data-i18n-html   : innerHTML 치환(줄바꿈·강조 태그 포함)
   - data-i18n-attr   : "attr:key" 형태로 속성 치환 (예: aria-label)
   ===================================================================== */
(function () {
  "use strict";

  var STORAGE_KEY = "ktcc-lang";
  var DEFAULT_LANG = "ko";
  var SUPPORTED = ["ko", "en", "ja"];
  var LABELS = { ko: "한국어", en: "English", ja: "日本語" };

  function dict(lang) {
    return (window.I18N && window.I18N[lang]) || {};
  }

  function applyLang(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT_LANG;
    var table = dict(lang);
    document.documentElement.lang = lang;

    // textContent 치환
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (table[key] != null) el.textContent = table[key];
    });

    // innerHTML 치환
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-html");
      if (table[key] != null) el.innerHTML = table[key];
    });

    // 속성 치환 (예: data-i18n-attr="aria-label:nav.cta")
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
        var parts = pair.split(":");
        var attr = parts[0].trim();
        var key = parts[1] && parts[1].trim();
        if (key && table[key] != null) el.setAttribute(attr, table[key]);
      });
    });

    // 활성 언어 표시(드롭다운 항목 + 현재 라벨)
    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });
    document.querySelectorAll(".lang-current").forEach(function (el) {
      el.textContent = LABELS[lang] || lang.toUpperCase();
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
  }

  function init() {
    var saved;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    applyLang(saved || DEFAULT_LANG);

    document.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        applyLang(btn.getAttribute("data-lang"));
      });
    });
  }

  // 외부에서도 호출 가능하도록 노출
  window.KLCC_I18N = { apply: applyLang };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
