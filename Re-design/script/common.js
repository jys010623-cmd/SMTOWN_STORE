/* =====================================================================
   common.js  —  모든 페이지 공용 헤더 기능
   - 모바일 메뉴 토글
   - 검색 패널 열기/닫기 + 검색 결과(상품명/아티스트) UI
   - 현재 페이지 메뉴 active 표시(자동)
   - 헤더 장바구니 배지 동기화
   서브페이지에 헤더 컨트롤(햄버거/검색/모바일 패널/검색 패널)이
   없으면 자동으로 주입해 어느 페이지에서든 동일하게 동작합니다.
   ===================================================================== */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function currentFile() {
    var path = location.pathname.split("/").pop();
    return path === "" ? "index.html" : path;
  }

  /* ------------------------------------------------------------------
     새로고침(F5) 시 스크롤 위치 유지
     - 링크로 이동한 경우는 최상단, 새로고침일 때만 위치 복원
     ------------------------------------------------------------------ */
  (function initScrollRestore() {
    if (!("scrollRestoration" in history)) return;
    history.scrollRestoration = "manual";
    var KEY = "sm_scroll_" + location.pathname;

    function save() {
      try { sessionStorage.setItem(KEY, String(window.scrollY || window.pageYOffset || 0)); } catch (e) {}
    }
    function isReload() {
      try {
        var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
        if (nav) return nav.type === "reload";
        return performance.navigation && performance.navigation.type === 1;
      } catch (e) { return false; }
    }
    function restore() {
      if (!isReload()) return;
      var y = 0;
      try { y = parseInt(sessionStorage.getItem(KEY) || "0", 10); } catch (e) {}
      if (!y) return;
      var html = document.documentElement;
      var prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";      /* 부드러운 스크롤 애니메이션 방지 */
      window.scrollTo(0, y);
      html.style.scrollBehavior = prev;
    }

    var t;
    window.addEventListener("scroll", function () {
      clearTimeout(t); t = setTimeout(save, 150);
    }, { passive: true });
    window.addEventListener("beforeunload", save);
    window.addEventListener("pagehide", save);
    window.addEventListener("load", function () {
      restore();
      if (window.requestAnimationFrame) requestAnimationFrame(restore);
      setTimeout(restore, 80);   /* JS 렌더 이후 레이아웃 확정 뒤 재복원 */
    });
  })();

  /* ------------------------------------------------------------------
     1. 필요한 헤더 컨트롤 주입 (서브페이지 대응)
     ------------------------------------------------------------------ */
  function ensureHeaderControls() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var headerMain = header.querySelector(".header-main");

    /* 햄버거 버튼 */
    if (headerMain && !header.querySelector("[data-menu-toggle]")) {
      var toggle = document.createElement("button");
      toggle.className = "menu-toggle";
      toggle.type = "button";
      toggle.setAttribute("aria-label", "메뉴 열기");
      toggle.setAttribute("aria-controls", "mobile-menu");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("data-menu-toggle", "");
      toggle.innerHTML = "<span></span><span></span><span></span>";
      headerMain.insertBefore(toggle, headerMain.firstChild);
    }

    /* 검색 아이콘 버튼 */
    var utility = header.querySelector(".utility-actions");
    if (utility && !header.querySelector("[data-search-open]")) {
      var searchBtn = document.createElement("button");
      searchBtn.className = "icon-button";
      searchBtn.type = "button";
      searchBtn.setAttribute("aria-label", "검색 열기");
      searchBtn.setAttribute("data-search-open", "");
      searchBtn.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<circle cx="11" cy="11" r="7"></circle>' +
        '<path d="m16.5 16.5 4 4"></path></svg>';
      utility.insertBefore(searchBtn, utility.firstChild);
    }

    /* 장바구니 아이콘 (서브페이지 헤더에 SVG가 없으면 주입) */
    var bag = header.querySelector(".bag-button");
    if (bag && !bag.querySelector("svg")) {
      if (!bag.getAttribute("aria-label")) bag.setAttribute("aria-label", "장바구니");
      bag.insertAdjacentHTML("afterbegin",
        '<svg viewBox="0 0 24 24" aria-hidden="true">' +
        '<path d="M6 7h12l-1 13H7L6 7Z"></path>' +
        '<path d="M9 7a3 3 0 0 1 6 0"></path></svg>');
    }

    /* 모바일 메뉴 패널 */
    if (!document.getElementById("mobile-menu")) {
      var panel = document.createElement("div");
      panel.className = "mobile-panel";
      panel.id = "mobile-menu";
      panel.hidden = true;
      var nav = document.createElement("nav");
      nav.setAttribute("aria-label", "모바일 메뉴");
      var links = [
        ["celeb.html", "CELEB"], ["product.html", "PRODUCT"],
        ["pick.html", "&P!CK"], ["event.html", "EVENT"],
        ["login.html", "LOGIN"], ["join.html", "JOIN"], ["cart.html", "CART"]
      ];
      links.forEach(function (item) {
        var a = document.createElement("a");
        a.href = item[0];
        a.textContent = item[1];
        nav.appendChild(a);
      });
      panel.appendChild(nav);
      header.appendChild(panel);
    }

    /* 검색 패널 */
    if (!header.querySelector("[data-search-panel]")) {
      var sp = document.createElement("div");
      sp.className = "search-panel";
      sp.hidden = true;
      sp.setAttribute("data-search-panel", "");
      sp.innerHTML =
        '<div class="wrap search-shell">' +
        '<label for="store-search">Search</label>' +
        '<input id="store-search" type="search" placeholder="아티스트, 앨범, 굿즈 검색" autocomplete="off" data-search-input>' +
        '<button type="button" data-search-close>닫기</button>' +
        '</div>' +
        '<div class="wrap search-results" data-search-results hidden></div>';
      header.appendChild(sp);
    } else if (!header.querySelector("[data-search-results]")) {
      /* index.html 처럼 패널은 있으나 결과 컨테이너가 없는 경우 추가 */
      var existingPanel = header.querySelector("[data-search-panel]");
      var results = document.createElement("div");
      results.className = "wrap search-results";
      results.setAttribute("data-search-results", "");
      results.hidden = true;
      existingPanel.appendChild(results);
    }
  }

  /* ------------------------------------------------------------------
     2. 모바일 메뉴 토글
     ------------------------------------------------------------------ */
  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.getElementById("mobile-menu");
    if (!toggle || !panel) return;

    function close() {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "메뉴 열기");
      panel.hidden = true;
      document.body.classList.remove("is-menu-open");
    }

    toggle.addEventListener("click", function () {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
      toggle.setAttribute("aria-label", expanded ? "메뉴 열기" : "메뉴 닫기");
      panel.hidden = expanded;
      document.body.classList.toggle("is-menu-open", !expanded);
    });

    panel.addEventListener("click", function (event) {
      if (event.target.tagName === "A") close();
    });

    window.__smCloseMobileMenu = close;
  }

  /* ------------------------------------------------------------------
     3. 검색 패널 + 검색 결과
     ------------------------------------------------------------------ */
  function initSearch() {
    var panel = document.querySelector("[data-search-panel]");
    if (!panel) return;
    var openBtn = document.querySelector("[data-search-open]");
    var closeBtn = panel.querySelector("[data-search-close]");
    var input = panel.querySelector("[data-search-input]");
    var results = panel.querySelector("[data-search-results]");

    function open() {
      panel.hidden = false;
      if (input) { input.focus(); render(input.value); }
    }
    function close() { panel.hidden = true; }

    function render(query) {
      if (!results) return;
      var q = (query || "").trim().toLowerCase();
      if (!q) {
        results.hidden = true;
        results.innerHTML = "";
        return;
      }
      var products = (window.SMStore && window.SMStore.products) || [];
      var matches = products.filter(function (p) {
        return (p.title + " " + p.artist + " " + p.shortTitle).toLowerCase().indexOf(q) !== -1;
      }).slice(0, 8);

      results.hidden = false;
      if (!matches.length) {
        results.innerHTML = '<p class="search-empty">‘' +
          escapeHtml(query) + '’ 에 대한 검색 결과가 없습니다.</p>';
        return;
      }
      var html = matches.map(function (p) {
        return '<a class="search-result" href="detail.html?id=' + p.id + '">' +
          '<img src="' + p.image + '" alt="">' +
          '<span class="search-result-body">' +
          '<b class="search-result-artist">' + escapeHtml(p.artist) + '</b>' +
          '<span class="search-result-title">' + escapeHtml(p.shortTitle) + '</span>' +
          '</span>' +
          '<span class="search-result-price">' +
          (window.SMStore ? window.SMStore.formatPrice(p.price) : "") + '</span>' +
          '</a>';
      }).join("");
      results.innerHTML = html;
    }

    if (openBtn) openBtn.addEventListener("click", function () {
      if (panel.hidden) open(); else close();
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (input) input.addEventListener("input", function () { render(input.value); });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !panel.hidden) close();
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  /* ------------------------------------------------------------------
     4. 현재 페이지 메뉴 active 표시
     ------------------------------------------------------------------ */
  function initActiveNav() {
    var file = currentFile();
    var navLinks = document.querySelectorAll(".primary-nav a");
    for (var i = 0; i < navLinks.length; i++) {
      var href = (navLinks[i].getAttribute("href") || "").split("/").pop();
      navLinks[i].classList.toggle("is-current", href === file);
    }
  }

  /* ------------------------------------------------------------------
     init
     ------------------------------------------------------------------ */
  ready(function () {
    ensureHeaderControls();
    initMobileMenu();
    initSearch();
    initActiveNav();
    if (window.SMStore) window.SMStore.updateBadges();
  });
})();
