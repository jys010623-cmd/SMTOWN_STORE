/* =====================================================================
   action.js  —  페이지별 기능 컨트롤러
   body[data-page] 값으로 각 페이지 초기화 함수를 분기합니다.
   - home    : 신상품 필터 탭 / 카운트다운 / 카드 → 상세 이동
   - product : 카테고리 필터 / 카드 → 상세 이동 (그리드 렌더링)
   - detail  : ?id 로 상품 렌더 / 수량 / 옵션 / 탭 / 장바구니 / 관련상품
   - cart    : 장바구니 렌더 / 수량·삭제 / 합계 / 빈 상태
   - login   : 로그인 목업 검증
   - join    : 회원가입 목업 검증
   - pick    : 드롭 카운트다운
   - event   : 이벤트 카드 상태 필터
   store.js, common.js 다음에 로드됩니다.
   ===================================================================== */
(function () {
  "use strict";

  var Store = window.SMStore;

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeAttr(str) {
    return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* 가벼운 토스트 알림 (장바구니 담기 등 피드백) */
  function toast(message) {
    var el = document.querySelector("[data-toast]");
    if (!el) {
      el = document.createElement("div");
      el.className = "sm-toast";
      el.setAttribute("data-toast", "");
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("is-visible");
    clearTimeout(el.__timer);
    el.__timer = setTimeout(function () {
      el.classList.remove("is-visible");
    }, 2200);
  }

  function goToDetail(id) {
    location.href = "detail.html?id=" + encodeURIComponent(id);
  }

  /* ==================================================================
     HOME (index.html)
     ================================================================== */
  function initHome() {
    /* 신상품 필터 탭 */
    var filterButtons = document.querySelectorAll("[data-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-product-card]"));

    function applyFilter(filter) {
      cards.forEach(function (card) {
        var cats = card.getAttribute("data-category") || "";
        card.hidden = !(filter === "all" || cats.indexOf(filter) !== -1);
      });
    }

    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
        applyFilter(btn.getAttribute("data-filter"));
      });
    });

    /* 카드 클릭 → 상세페이지 이동 */
    document.querySelectorAll("[data-open-detail]").forEach(function (trigger) {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        goToDetail(trigger.getAttribute("data-open-detail"));
      });
    });

    /* CELEB PICK 컬렉션 카드 클릭 → 지정된 목록으로 이동 */
    document.querySelectorAll(".feature-cards article").forEach(function (card) {
      if (!card.getAttribute("role")) card.setAttribute("role", "link");
      if (!card.hasAttribute("tabindex")) card.setAttribute("tabindex", "0");
      var dest = card.getAttribute("data-href") || "product.html";
      card.addEventListener("click", function () { location.href = dest; });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); location.href = dest; }
      });
    });

    initCountdown(true);
  }

  /* ==================================================================
     PRODUCT (product.html)
     ================================================================== */
  function initProduct() {
    var grid = document.querySelector(".catalog-grid");
    if (grid && Store) {
      grid.innerHTML = Store.products.map(function (p) {
        var statusClass = p.status === "SOLD OUT" ? "status" : "status pink";
        return '<article class="product-card" data-category="' + p.cats.join(" ") +
          '" data-product-card="' + p.id + '">' +
          '<button type="button" data-open-detail="' + p.id + '">' +
          '<span class="' + statusClass + '">' + escapeAttr(p.status) + '</span>' +
          '<img src="' + p.image + '" alt="' + escapeAttr(p.shortTitle) + '">' +
          '<span class="artist">' + escapeAttr(p.artist) + '</span>' +
          '<strong>' + escapeAttr(p.shortTitle) + '</strong>' +
          '<span class="price">' + Store.formatPrice(p.price) + '</span>' +
          '</button></article>';
      }).join("");

      grid.querySelectorAll("[data-open-detail]").forEach(function (trigger) {
        trigger.addEventListener("click", function (e) {
          e.preventDefault();
          goToDetail(trigger.getAttribute("data-open-detail"));
        });
      });
    }

    /* 사이드바 카테고리 필터 */
    var filterLinks = Array.prototype.slice.call(document.querySelectorAll(".filter-list a"));
    var cards = Array.prototype.slice.call(document.querySelectorAll(".catalog-grid [data-product-card]"));

    function tokenOf(link) {
      var t = (link.textContent || "").trim().toLowerCase();
      return t === "all" ? "all" : t;
    }

    function applyCat(token) {
      filterLinks.forEach(function (l) { l.classList.toggle("is-current", tokenOf(l) === token); });
      cards.forEach(function (card) {
        var cats = card.getAttribute("data-category") || "";
        card.hidden = !(token === "all" || cats.indexOf(token) !== -1);
      });
    }

    filterLinks.forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        applyCat(tokenOf(link));
      });
    });

    /* 홈 PRODUCT 카테고리에서 ?cat=... 로 진입 시 해당 필터 적용 + 목록 위치로 이동 */
    var qCat = (new URLSearchParams(location.search).get("cat") || "").trim().toLowerCase();
    if (qCat && qCat !== "all" && filterLinks.some(function (l) { return tokenOf(l) === qCat; })) {
      applyCat(qCat);
      scrollToCatalog();
    }

    function scrollToCatalog() {
      /* 새로고침(F5)이면 스크롤 위치 복원이 처리하므로 건너뜀 */
      try {
        var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
        if (nav && nav.type === "reload") return;
        if (!nav && performance.navigation && performance.navigation.type === 1) return;
      } catch (e) {}
      var section = document.querySelector(".page-section");
      if (!section) return;
      function go() {
        var header = document.querySelector(".site-header");
        var offset = header ? header.offsetHeight : 0;
        var top = section.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0) - offset - 8;
        var html = document.documentElement;
        var prev = html.style.scrollBehavior;
        html.style.scrollBehavior = "auto";        /* 애니메이션 없이 즉시 이동 */
        window.scrollTo(0, Math.max(0, top));
        html.style.scrollBehavior = prev;
      }
      go();
      if (window.requestAnimationFrame) requestAnimationFrame(go);
      window.addEventListener("load", go);   /* 이미지 로드 후 위치 보정 */
      setTimeout(go, 150);                    /* 레이아웃 확정 뒤 재보정 */
    }
  }

  /* ==================================================================
     DETAIL (detail.html)
     ================================================================== */
  function initDetail() {
    if (!Store) return;
    var params = new URLSearchParams(location.search);
    var id = params.get("id");
    var product = Store.findProduct(id) || Store.products[0];

    var state = { qty: 1 };

    function setText(sel, value) {
      var node = document.querySelector(sel);
      if (node) node.textContent = value;
    }

    /* 기본 정보 렌더 */
    document.title = product.title + " | SMTOWN &STORE";
    var image = document.querySelector("[data-detail-image]");
    if (image) { image.src = product.image; image.alt = product.title; }
    setText("[data-detail-breadcrumb]", product.artist);
    setText("[data-detail-artist]", product.artist);
    setText("[data-detail-title]", product.title);
    setText("[data-detail-desc]", product.desc);
    setText("[data-detail-price]", Store.formatPrice(product.price));
    setText("[data-detail-long]", product.long);
    setText("[data-detail-status]", product.status === "SOLD OUT"
      ? "품절 상품입니다. 재입고 알림 신청 흐름을 확인할 수 있습니다."
      : "예약/판매 상품입니다. 옵션 선택 후 구매 흐름을 확인할 수 있습니다.");

    /* 옵션 채우기 */
    var select = document.querySelector("[data-detail-option]");
    if (select) {
      select.innerHTML = "";
      product.options.forEach(function (opt) {
        var o = document.createElement("option");
        o.textContent = opt;
        select.appendChild(o);
      });
    }

    /* 수량 */
    function setQty(v) {
      state.qty = Math.max(1, Math.min(99, v));
      setText("[data-qty]", String(state.qty));
    }
    setQty(1);
    var minus = document.querySelector("[data-qty-minus]");
    var plus = document.querySelector("[data-qty-plus]");
    if (minus) minus.addEventListener("click", function () { setQty(state.qty - 1); });
    if (plus) plus.addEventListener("click", function () { setQty(state.qty + 1); });

    /* 탭 전환 */
    var tabButtons = document.querySelectorAll("[data-tab]");
    tabButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tab = btn.getAttribute("data-tab");
        tabButtons.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-selected", active ? "true" : "false");
        });
        document.querySelectorAll("[data-tab-panel]").forEach(function (panel) {
          panel.hidden = panel.getAttribute("data-tab-panel") !== tab;
        });
      });
    });

    /* 장바구니 / 바로구매 */
    var addBtn = document.querySelector("[data-add-cart]");
    var buyBtn = document.querySelector("[data-buy-now]");
    function currentOption() { return select ? select.value : (product.options[0] || ""); }

    if (addBtn) addBtn.addEventListener("click", function () {
      Store.cart.add(product.id, currentOption(), state.qty);
      toast("장바구니에 " + state.qty + "개 담았습니다.");
      setText("[data-detail-status]", "장바구니에 담았습니다. 헤더의 장바구니에서 확인하세요.");
    });
    if (buyBtn) buyBtn.addEventListener("click", function () {
      Store.cart.add(product.id, currentOption(), state.qty);
      location.href = "cart.html";
    });

    /* 관련 상품 */
    var related = document.querySelector("[data-related-grid]");
    if (related) {
      related.innerHTML = Store.products.filter(function (p) {
        return p.id !== product.id;
      }).slice(0, 4).map(function (p) {
        return '<article class="related-card">' +
          '<button type="button" data-open-detail="' + p.id + '">' +
          '<img src="' + p.image + '" alt="' + escapeAttr(p.shortTitle) + '">' +
          '<strong>' + escapeAttr(p.shortTitle) + '</strong>' +
          '<span>' + Store.formatPrice(p.price) + '</span>' +
          '</button></article>';
      }).join("");
      related.querySelectorAll("[data-open-detail]").forEach(function (trigger) {
        trigger.addEventListener("click", function (e) {
          e.preventDefault();
          goToDetail(trigger.getAttribute("data-open-detail"));
        });
      });
    }
  }

  /* ==================================================================
     CART (cart.html)
     ================================================================== */
  function initCart() {
    if (!Store) return;
    var board = document.querySelector("[data-cart-board]") || document.querySelector(".cart-board");
    if (!board) return;

    function render() {
      var items = Store.cart.get();

      if (!items.length) {
        board.innerHTML =
          '<div class="cart-empty">' +
          '<strong>장바구니가 비어 있습니다.</strong>' +
          '<p>마음에 드는 공식 굿즈를 담아보세요.</p>' +
          '<a class="button button-primary" href="product.html">상품 보러가기</a>' +
          '</div>';
        Store.updateBadges();
        return;
      }

      var rowsHtml = items.map(function (item, index) {
        var p = Store.findProduct(item.id);
        if (!p) return "";
        var lineTotal = p.price * item.qty;
        return '<article class="cart-line" data-cart-line="' + index + '">' +
          '<img src="' + p.image + '" alt="' + escapeAttr(p.shortTitle) + '">' +
          '<div class="cart-line-info">' +
          '<strong>' + escapeAttr(p.shortTitle) + '</strong>' +
          '<span>Option: ' + escapeAttr(item.option || "기본 구성") + '</span>' +
          '<div class="cart-qty" aria-label="수량 변경">' +
          '<button type="button" data-cart-minus="' + index + '" aria-label="수량 감소">-</button>' +
          '<output>' + item.qty + '</output>' +
          '<button type="button" data-cart-plus="' + index + '" aria-label="수량 증가">+</button>' +
          '</div>' +
          '</div>' +
          '<div class="cart-line-side">' +
          '<b>' + Store.formatPrice(lineTotal) + '</b>' +
          '<button type="button" class="cart-remove" data-cart-remove="' + index + '">삭제</button>' +
          '</div>' +
          '</article>';
      }).join("");

      var subtotal = Store.cart.subtotal();
      var shipping = subtotal >= 50000 || subtotal === 0 ? 0 : 3000;
      var total = subtotal + shipping;

      var summaryHtml =
        '<div class="order-summary">' +
        '<dl>' +
        '<div><dt>상품금액</dt><dd>' + Store.formatPrice(subtotal) + '</dd></div>' +
        '<div><dt>배송비</dt><dd>' + (shipping === 0 ? "무료" : Store.formatPrice(shipping)) + '</dd></div>' +
        '<div class="total"><dt>결제예정금액</dt><dd>' + Store.formatPrice(total) + '</dd></div>' +
        '</dl>' +
        '<button class="button button-dark" type="button" data-cart-order>주문서 화면 확인</button>' +
        '</div>';

      board.innerHTML = rowsHtml + summaryHtml;
      Store.updateBadges();
    }

    board.addEventListener("click", function (e) {
      var target = e.target.closest ? e.target.closest("button") : e.target;
      if (!target) return;
      var idx;
      if (target.hasAttribute("data-cart-minus")) {
        idx = parseInt(target.getAttribute("data-cart-minus"), 10);
        var itemsA = Store.cart.get();
        Store.cart.setQty(idx, (itemsA[idx] ? itemsA[idx].qty : 1) - 1);
        render();
      } else if (target.hasAttribute("data-cart-plus")) {
        idx = parseInt(target.getAttribute("data-cart-plus"), 10);
        var itemsB = Store.cart.get();
        Store.cart.setQty(idx, (itemsB[idx] ? itemsB[idx].qty : 1) + 1);
        render();
      } else if (target.hasAttribute("data-cart-remove")) {
        idx = parseInt(target.getAttribute("data-cart-remove"), 10);
        Store.cart.remove(idx);
        render();
      } else if (target.hasAttribute("data-cart-order")) {
        toast("주문서 화면은 준비 중입니다.");
      }
    });

    render();
  }

  /* ==================================================================
     LOGIN (login.html)
     ================================================================== */
  function initLogin() {
    var btn = document.querySelector("[data-login-submit]");
    var id = document.getElementById("login-id");
    var pw = document.getElementById("login-pw");
    if (!btn) return;
    var status = ensureStatus(btn);

    btn.addEventListener("click", function () {
      var idVal = id ? id.value.trim() : "";
      var pwVal = pw ? pw.value.trim() : "";
      if (!idVal || !pwVal) {
        setStatus(status, "아이디와 비밀번호를 모두 입력해 주세요.", "error");
        return;
      }
      setStatus(status, "로그인 기능은 준비 중입니다. (입력값 확인 완료)", "info");
    });
  }

  /* ==================================================================
     JOIN (join.html)
     ================================================================== */
  function initJoin() {
    var btn = document.querySelector("[data-join-submit]");
    if (!btn) return;
    var checkboxes = document.querySelectorAll(".consent-list input[type='checkbox']");
    var status = ensureStatus(btn);

    /* 관심 아티스트 칩 선택(다중 선택 토글) */
    var chips = document.querySelectorAll(".artist-choice-grid span");
    chips.forEach(function (chip) {
      chip.setAttribute("role", "button");
      chip.setAttribute("tabindex", "0");
      chip.setAttribute("aria-pressed", "false");
      function toggle() {
        var on = chip.classList.toggle("is-selected");
        chip.setAttribute("aria-pressed", on ? "true" : "false");
      }
      chip.addEventListener("click", toggle);
      chip.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") { e.preventDefault(); toggle(); }
      });
    });

    btn.addEventListener("click", function () {
      /* 첫 두 개(만 14세 이상 / 약관 동의)를 필수로 검증 */
      var required = [checkboxes[0], checkboxes[1]];
      var missing = required.some(function (c) { return c && !c.checked; });
      if (missing) {
        setStatus(status, "필수 약관(만 14세 이상, 이용약관·개인정보 동의)에 체크해 주세요.", "error");
        return;
      }
      setStatus(status, "가입 정보 확인 완료! 회원가입 기능은 준비 중입니다.", "info");
    });
  }

  function ensureStatus(afterEl) {
    var status = document.querySelector("[data-auth-status]");
    if (!status) {
      status = document.createElement("p");
      status.className = "auth-status";
      status.setAttribute("data-auth-status", "");
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      afterEl.parentNode.insertBefore(status, afterEl.nextSibling);
    }
    return status;
  }

  function setStatus(node, message, type) {
    node.textContent = message;
    node.classList.remove("is-error", "is-info");
    node.classList.add(type === "error" ? "is-error" : "is-info");
  }

  /* ==================================================================
     PICK (pick.html) — 드롭 카운트다운
     ================================================================== */
  function initPick() {
    var host = document.querySelector(".pick-hero-content");
    if (host && !host.querySelector(".countdown")) {
      var cd = document.createElement("div");
      cd.className = "countdown";
      cd.setAttribute("aria-label", "다음 드롭까지 남은 시간");
      cd.innerHTML =
        '<span><b data-days>00</b>Days</span>' +
        '<span><b data-hours>00</b>Hours</span>' +
        '<span><b data-minutes>00</b>Min</span>' +
        '<span><b data-seconds>00</b>Sec</span>';
      var meter = host.querySelector(".drop-meter");
      if (meter) meter.parentNode.insertBefore(cd, meter.nextSibling);
      else host.appendChild(cd);
    }
    initCountdown(true);
  }

  /* ==================================================================
     EVENT (event.html) — 상태 필터
     ================================================================== */
  function initEvent() {
    var list = document.querySelector(".event-list");
    if (!list) return;
    var cards = Array.prototype.slice.call(list.querySelectorAll(".event-card"));

    /* 각 카드의 상태 라벨을 data-status 로 표준화 */
    cards.forEach(function (card) {
      var badge = card.querySelector("span");
      var label = badge ? badge.textContent.trim() : "";
      card.setAttribute("data-status", label);
    });

    var filters = [["all", "전체"], ["진행중", "진행중"], ["공지", "공지"], ["예정", "예정"]];
    var bar = document.createElement("div");
    bar.className = "filter-tabs event-filter";
    bar.setAttribute("role", "tablist");
    bar.setAttribute("aria-label", "이벤트 상태 필터");
    bar.innerHTML = filters.map(function (f, i) {
      return '<button type="button" class="' + (i === 0 ? "is-active" : "") +
        '" data-event-filter="' + f[0] + '">' + f[1] + '</button>';
    }).join("");
    /* .wrap 안에 넣어 콘텐츠 영역 밖으로 벗어나지 않도록 함 */
    var barWrap = document.createElement("div");
    barWrap.className = "wrap";
    barWrap.appendChild(bar);
    list.parentNode.insertBefore(barWrap, list);

    bar.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("[data-event-filter]") : null;
      if (!btn) return;
      var val = btn.getAttribute("data-event-filter");
      bar.querySelectorAll("button").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
      cards.forEach(function (card) {
        card.hidden = !(val === "all" || card.getAttribute("data-status") === val);
      });
    });
  }

  /* ==================================================================
     CELEB (celeb.html) — 그룹 → 유닛/솔로 드릴다운
     상위: 그룹 카드 / 그룹 클릭 시 해당 그룹의 유닛·솔로로 진입
     (SM 공식/위키 로스터 기준, 현재 활동 라인업)
     ================================================================== */
  /* color: 그룹 대표색 / year: 데뷔 연도
     그룹·유닛·솔로 모두 데뷔순(오래된 순)으로 배치. 유닛/솔로는 {n:이름, y:데뷔연도}
     (SM 공식/위키 및 각 멤버 솔로 데뷔일 기준, 2026.07.10 시점) */
  var CELEB_GROUPS = [
    { name: "BoA", label: "ICON", year: 2000, color: "#6A5ACD", desc: "솔로 아카이브와 기념 굿즈 라인.", units: [], solos: [] },
    { name: "KANGTA", label: "ICON", year: 2001, color: "#4A6FA5", desc: "솔로 아카이브와 기념 상품 라인.", units: [], solos: [] },
    { name: "TVXQ!", label: "STORE", year: 2003, color: "#CE0E2D", desc: "음반과 공식 굿즈를 함께 탐색.",
      units: [], solos: [{ n: "U-KNOW", y: 2019 }, { n: "MAX", y: 2020 }] },
    { name: "Super Junior", label: "CLASSIC", year: 2005, color: "#0F52BA", desc: "콘서트 MD와 응원봉 아카이브.",
      units: [{ n: "SUPER JUNIOR-D&E", y: 2011 }],
      solos: [{ n: "KYUHYUN", y: 2014 }, { n: "YESUNG", y: 2016 }, { n: "RYEOWOOK", y: 2016 }, { n: "DONGHAE", y: 2021 }] },
    { name: "Girls' Generation", label: "CLASSIC", year: 2007, color: "#F4699C", desc: "기념 앨범과 공식 굿즈 라인.",
      units: [{ n: "Oh!GG", y: 2018 }],
      solos: [{ n: "TAEYEON", y: 2015 }, { n: "TIFFANY", y: 2016 }, { n: "HYOYEON", y: 2016 }, { n: "SEOHYUN", y: 2017 }, { n: "YURI", y: 2018 }, { n: "YOONA", y: 2022 }] },
    { name: "SHINee", label: "BEST", year: 2008, color: "#1EC9C9", desc: "Atmos 팝업 MD와 포토 상품.",
      units: [],
      solos: [{ n: "TAEMIN", y: 2014 }, { n: "JONGHYUN", y: 2015 }, { n: "KEY", y: 2018 }, { n: "ONEW", y: 2018 }, { n: "MINHO", y: 2022 }] },
    { name: "EXO", label: "MD", year: 2012, color: "#C0002F", desc: "콘서트 MD와 시즌 상품 모음.",
      units: [{ n: "EXO-SC", y: 2019 }],
      solos: [{ n: "LAY", y: 2016 }, { n: "CHEN", y: 2019 }, { n: "BAEKHYUN", y: 2019 }, { n: "SUHO", y: 2020 }, { n: "KAI", y: 2020 }, { n: "D.O.", y: 2021 }, { n: "XIUMIN", y: 2022 }, { n: "CHANYEOL", y: 2024 }] },
    { name: "Red Velvet", label: "BEST", year: 2014, color: "#E4002B", desc: "스테디셀러와 포토 카테고리 연결.",
      units: [{ n: "Red Velvet - IRENE & SEULGI", y: 2020 }],
      solos: [{ n: "WENDY", y: 2021 }, { n: "JOY", y: 2021 }, { n: "SEULGI", y: 2022 }] },
    { name: "NCT", label: "HOT", year: 2016, color: "#86C232", desc: "유닛과 솔로가 가장 많은 대형 프로젝트.",
      units: [{ n: "NCT U", y: 2016 }, { n: "NCT 127", y: 2016 }, { n: "NCT DREAM", y: 2016 }, { n: "WayV", y: 2019 }, { n: "NCT DoJaeJung", y: 2023 }, { n: "NCT WISH", y: 2024 }, { n: "NCT JNJM", y: 2026 }],
      solos: [{ n: "TAEYONG", y: 2023 }, { n: "TEN", y: 2024 }, { n: "DOYOUNG", y: 2024 }, { n: "JAEHYUN", y: 2024 }, { n: "YUTA", y: 2024 }, { n: "MARK", y: 2025 }, { n: "HAECHAN", y: 2025 }] },
    { name: "aespa", label: "PICK", year: 2020, color: "#C724B1", desc: "컴백 시즌과 이벤트 상품을 강조하는 그룹.", units: [], solos: [] },
    { name: "RIIZE", label: "DROP", year: 2023, color: "#1E5AE9", desc: "신규 발매와 예약 판매 진입 그룹.", units: [], solos: [] },
    { name: "NAEVIS", label: "aeVERSE", year: 2024, color: "#00C2D1", desc: "2024년 데뷔한 버추얼 아티스트.", units: [], solos: [] },
    { name: "Hearts2Hearts", label: "NEW", year: 2025, color: "#FF4D8D", desc: "2025년 데뷔한 신인 그룹.", units: [], solos: [] }
  ];

  function initCeleb() {
    var grid = document.querySelector("[data-artist-grid]");
    var detail = document.querySelector("[data-artist-detail]");
    if (!grid) return;
    var hint = document.querySelector("[data-artist-hint]");

    function setHint(text) { if (hint) hint.textContent = text; }

    function cardHtml(name, label, year, extra, color) {
      return '<article class="artist-card' + (extra || "") + '" data-artist="' + escapeAttr(name) +
        '"' + (color ? ' style="--gc:' + color + '"' : '') +
        ' role="button" tabindex="0" aria-pressed="false">' +
        '<span>' + escapeAttr(label) + '</span>' +
        '<strong>' + escapeAttr(name) + '</strong>' +
        (year ? '<small class="artist-year">DEBUT ' + year + '</small>' : '') +
        '</article>';
    }

    /* ---- 상위: 그룹 목록 ---- */
    function renderGroups() {
      grid.innerHTML = CELEB_GROUPS.map(function (g) {
        var has = g.units.length + g.solos.length > 0;
        return '<article class="artist-card" data-group="' + escapeAttr(g.name) +
          '" style="--gc:' + g.color + '" role="button" tabindex="0" aria-expanded="false">' +
          '<span>' + escapeAttr(g.label) + '</span>' +
          '<strong>' + escapeAttr(g.name) + '</strong>' +
          '<small class="artist-year">DEBUT ' + g.year + '</small>' +
          '<p>' + escapeAttr(g.desc) + '</p>' +
          '<em class="artist-more">' + (has ? "유닛·솔로 보기 →" : "단독 아티스트") + '</em>' +
          '</article>';
      }).join("");
      grid.hidden = false;
      if (detail) { detail.hidden = true; detail.innerHTML = ""; }
      setHint("그룹을 선택하면 유닛과 솔로로 들어갑니다.");
    }

    /* ---- 하위: 특정 그룹의 유닛/솔로 ---- */
    function openGroup(group) {
      if (!detail) return;
      var sections = "";
      if (group.units.length) {
        sections += '<p class="eyebrow artist-subhead">UNIT</p><div class="artist-grid">' +
          group.units.map(function (u) { return cardHtml(u.n, "UNIT", u.y, " is-leaf", group.color); }).join("") + '</div>';
      }
      if (group.solos.length) {
        sections += '<p class="eyebrow artist-subhead">SOLO</p><div class="artist-grid">' +
          group.solos.map(function (s) { return cardHtml(s.n, "SOLO", s.y, " is-leaf", group.color); }).join("") + '</div>';
      }
      if (!sections) {
        sections = '<p class="artist-empty">그룹 활동 중심 아티스트로, 현재 별도 유닛/솔로 라인업이 없습니다.</p>';
      }
      detail.innerHTML =
        '<div class="artist-detail-head">' +
        '<button type="button" class="back-link" data-artist-back>← 전체 아티스트</button>' +
        '<h3>' + escapeAttr(group.name) + '</h3>' +
        '</div>' + sections;

      grid.hidden = true;
      detail.hidden = false;
      setHint(group.name + " · 유닛/솔로를 선택하세요.");
      /* 클릭한 자리에서 그대로 펼쳐지도록 페이지 상단 스크롤은 하지 않음 */
    }

    function findGroup(name) {
      for (var i = 0; i < CELEB_GROUPS.length; i++) {
        if (CELEB_GROUPS[i].name === name) return CELEB_GROUPS[i];
      }
      return null;
    }

    /* 리프(유닛/솔로/단독) 카드 단일 선택 하이라이트 */
    function selectLeaf(card, scope) {
      var siblings = scope.querySelectorAll(".artist-card.is-leaf, .artist-card[data-group]");
      var already = card.classList.contains("is-selected");
      Array.prototype.forEach.call(siblings, function (c) {
        c.classList.remove("is-selected"); c.setAttribute("aria-pressed", "false");
      });
      if (already) { setHint("그룹을 선택하면 유닛과 솔로로 들어갑니다."); return; }
      card.classList.add("is-selected");
      card.setAttribute("aria-pressed", "true");
      setHint(card.getAttribute("data-artist") + " 컬렉션을 선택했습니다.");
    }

    /* 이벤트 위임 */
    function handleActivate(target, scope) {
      var groupCard = target.closest ? target.closest("[data-group]") : null;
      var leafCard = target.closest ? target.closest(".artist-card.is-leaf") : null;
      var backBtn = target.closest ? target.closest("[data-artist-back]") : null;

      if (backBtn) { renderGroups(); return; }
      if (leafCard) { selectLeaf(leafCard, scope); return; }
      if (groupCard) {
        var group = findGroup(groupCard.getAttribute("data-group"));
        if (!group) return;
        if (group.units.length + group.solos.length > 0) openGroup(group);
        else selectLeaf(groupCard, scope); /* 단독 아티스트는 선택만 */
      }
    }

    document.addEventListener("click", function (e) {
      if (!e.target.closest) return;
      if (e.target.closest("[data-artist-grid]")) handleActivate(e.target, grid);
      else if (detail && e.target.closest("[data-artist-detail]")) handleActivate(e.target, detail);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      var t = e.target;
      if (!t || !t.closest) return;
      if (t.closest("[data-artist-grid]") || (detail && t.closest("[data-artist-detail]"))) {
        if (t.matches(".artist-card, [data-artist-back]")) {
          e.preventDefault();
          handleActivate(t, t.closest("[data-artist-detail]") ? detail : grid);
        }
      }
    });

    renderGroups();

    /* 홈 등에서 ?group=이름 으로 진입하면 해당 그룹으로 바로 이동/강조 */
    var qGroup = new URLSearchParams(location.search).get("group");
    if (qGroup) {
      var match = null;
      for (var gi = 0; gi < CELEB_GROUPS.length; gi++) {
        if (CELEB_GROUPS[gi].name.toLowerCase() === qGroup.trim().toLowerCase()) { match = CELEB_GROUPS[gi]; break; }
      }
      if (match) {
        if (match.units.length + match.solos.length > 0) {
          openGroup(match);
        } else {
          var card = grid.querySelector('[data-group="' + match.name + '"]');
          if (card) {
            card.classList.add("is-selected");
            card.setAttribute("aria-pressed", "true");
            setHint(match.name + " 컬렉션을 선택했습니다.");
            card.scrollIntoView({ block: "center" });
          }
        }
      }
    }
  }

  /* ==================================================================
     카운트다운 (금요일 17:00 KST 기준)
     withSeconds=true 이면 1초 단위, 아니면 1분 단위 갱신
     ================================================================== */
  function initCountdown(withSeconds) {
    if (!document.querySelector("[data-days]")) return;

    function setText(sel, value) {
      document.querySelectorAll(sel).forEach(function (n) { n.textContent = value; });
    }
    function pad(n) { return String(n).padStart(2, "0"); }

    function tick() {
      var now = new Date();
      var target = new Date(now);
      var friday = 5;
      var diffDay = (friday - now.getDay() + 7) % 7;
      target.setDate(now.getDate() + diffDay);
      target.setHours(17, 0, 0, 0);
      if (target <= now) target.setDate(target.getDate() + 7);

      var diff = target - now;
      setText("[data-days]", pad(Math.floor(diff / 86400000)));
      setText("[data-hours]", pad(Math.floor((diff % 86400000) / 3600000)));
      setText("[data-minutes]", pad(Math.floor((diff % 3600000) / 60000)));
      setText("[data-seconds]", pad(Math.floor((diff % 60000) / 1000)));
    }

    tick();
    setInterval(tick, withSeconds ? 1000 : 60000);
  }

  /* ==================================================================
     라우팅
     ================================================================== */
  var routes = {
    home: initHome,
    product: initProduct,
    detail: initDetail,
    cart: initCart,
    login: initLogin,
    join: initJoin,
    pick: initPick,
    event: initEvent,
    celeb: initCeleb
  };

  ready(function () {
    var page = document.body.getAttribute("data-page");
    var handler = routes[page];
    if (handler) {
      try { handler(); }
      catch (err) { if (window.console) console.error("[action.js] " + page + " 초기화 오류:", err); }
    }
  });
})();
