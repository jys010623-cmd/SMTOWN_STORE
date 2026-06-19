(function () {
  "use strict";

  var products = [
    {
      id: "product-01",
      artist: "SHINee",
      title: "2026 SHINee 6th Mini Album [Atmos] POP-UP 4X6 PHOTO SET",
      price: "₩5,000",
      image: "images/smtown/product-01.jpg",
      category: "music",
      status: "SOLD OUT",
      desc: "Atmos 팝업 컬렉션의 4X6 포토 세트입니다. 공식 이미지와 컬렉션 무드를 담은 팬 소장용 MD입니다.",
      long: "본 상품은 SMTOWN &STORE 리디자인 상세페이지 프로토타입용 데이터입니다. 상품 이미지, 가격, 옵션, 구매 액션이 상세 화면 안에서 연결되도록 구성했습니다.",
      options: ["4X6 PHOTO SET"]
    },
    {
      id: "product-02",
      artist: "SHINee",
      title: "2026 SHINee 6th Mini Album [Atmos] RANDOM TRADING CARD",
      price: "₩6,000",
      image: "images/smtown/product-02.jpg",
      category: "music goods",
      status: "SOLD OUT",
      desc: "랜덤 트레이딩 카드 구성으로, 앨범 콘셉트의 다양한 컷을 만날 수 있습니다.",
      long: "랜덤 상품 특성상 구성품은 임의 발송됩니다. 상세페이지에서는 옵션 선택과 수량 변경, 장바구니 담기 흐름을 확인할 수 있습니다.",
      options: ["RANDOM 1EA", "RANDOM 3EA SET"]
    },
    {
      id: "product-03",
      artist: "SHINee",
      title: "2026 SHINee 6th Mini Album [Atmos] POP-UP T-SHIRT SET",
      price: "₩45,000",
      image: "images/smtown/product-03.jpg",
      category: "concert goods",
      status: "PRE-ORDER",
      desc: "팝업 MD 컬렉션의 티셔츠 세트입니다. 콘서트와 일상에서 모두 입기 좋은 구성입니다.",
      long: "예약 판매 상품은 입고 일정에 따라 순차 배송됩니다. 옵션을 선택한 뒤 바로 구매 또는 장바구니 담기 동작을 테스트할 수 있습니다.",
      options: ["S", "M", "L", "XL"]
    },
    {
      id: "product-04",
      artist: "SHINee",
      title: "2026 SHINee 6th Mini Album [Atmos] WIND BREAKER SET",
      price: "₩120,000",
      image: "images/smtown/product-04.jpg",
      category: "concert goods",
      status: "PRE-ORDER",
      desc: "가볍게 걸치기 좋은 윈드 브레이커 세트입니다. 공연장 밖에서도 컬렉션의 분위기를 이어갑니다.",
      long: "의류 상품은 상세 사이즈 확인 후 구매를 권장합니다. 프로토타입에서는 상품 상세 정보, 배송 안내, 공지 탭을 전환할 수 있습니다.",
      options: ["M", "L", "XL"]
    },
    {
      id: "product-05",
      artist: "SHINee",
      title: "2026 SHINee 6th Mini Album [Atmos] POP-UP CROSS BAG",
      price: "₩45,000",
      image: "images/smtown/product-05.jpg",
      category: "goods",
      status: "SOLD OUT",
      desc: "팝업 컬렉션 그래픽이 적용된 크로스백입니다. 팬 굿즈와 데일리 아이템의 균형을 맞췄습니다.",
      long: "품절 상품은 재입고 알림 신청 흐름을 안내하도록 구성했습니다. 상세페이지 내 관련 상품 영역도 함께 활성화되어 있습니다.",
      options: ["BLACK", "WHITE"]
    }
  ];

  var state = {
    currentId: null,
    qty: 1,
    cartCount: 0,
    filter: "all",
    search: ""
  };

  var homePage = document.querySelector('[data-page="home"]');
  var detailPage = document.querySelector('[data-page="detail"]');
  var productCards = Array.prototype.slice.call(document.querySelectorAll('[data-product-card]'));
  var bagCount = document.querySelector('.bag-button span');
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobilePanel = document.getElementById('mobile-menu');
  var searchPanel = document.querySelector('[data-search-panel]');
  var searchInput = document.querySelector('[data-search-input]');

  function findProduct(id) {
    return products.filter(function (item) { return item.id === id; })[0] || products[0];
  }

  function setText(selector, value) {
    var node = document.querySelector(selector);
    if (node) node.textContent = value;
  }

  function updateBag() {
    if (bagCount) bagCount.textContent = String(state.cartCount);
  }

  function updateQuantity(value) {
    state.qty = Math.max(1, Math.min(99, value));
    setText('[data-qty]', String(state.qty));
  }

  function fillOptions(product) {
    var select = document.querySelector('[data-detail-option]');
    if (!select) return;
    select.innerHTML = '';
    product.options.forEach(function (option) {
      var node = document.createElement('option');
      node.textContent = option;
      select.appendChild(node);
    });
  }

  function renderRelated(activeId) {
    var grid = document.querySelector('[data-related-grid]');
    if (!grid) return;
    grid.innerHTML = '';
    products.filter(function (item) { return item.id !== activeId; }).slice(0, 4).forEach(function (item) {
      var card = document.createElement('article');
      card.className = 'related-card';
      card.innerHTML = '<button type="button" data-open-detail="' + item.id + '">' +
        '<img src="' + item.image + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
        '<strong>' + item.title + '</strong>' +
        '<span>' + item.price + '</span>' +
        '</button>';
      grid.appendChild(card);
    });
    bindDetailOpeners(grid);
  }

  function resetTabs() {
    document.querySelectorAll('[data-tab]').forEach(function (button, index) {
      var active = index === 0;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('[data-tab-panel]').forEach(function (panel, index) {
      panel.hidden = index !== 0;
    });
  }

  function openDetail(id, shouldPushHash) {
    var product = findProduct(id);
    state.currentId = product.id;
    updateQuantity(1);

    homePage.hidden = true;
    detailPage.hidden = false;
    document.body.classList.add('is-detail');
    document.title = product.title + ' | SMTOWN &STORE';

    var image = document.querySelector('[data-detail-image]');
    if (image) {
      image.src = product.image;
      image.alt = product.title;
    }

    setText('[data-detail-breadcrumb]', product.artist);
    setText('[data-detail-artist]', product.artist);
    setText('[data-detail-title]', product.title);
    setText('[data-detail-desc]', product.desc);
    setText('[data-detail-price]', product.price);
    setText('[data-detail-long]', product.long);
    setText('[data-detail-status]', product.status === 'SOLD OUT' ? '품절 상품입니다. 재입고 알림 신청 흐름을 확인할 수 있습니다.' : '예약 판매 상품입니다. 옵션 선택 후 구매 흐름을 확인할 수 있습니다.');

    fillOptions(product);
    renderRelated(product.id);
    resetTabs();

    if (shouldPushHash && location.hash !== '#detail-' + product.id) {
      location.hash = 'detail-' + product.id;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showHome() {
    homePage.hidden = false;
    detailPage.hidden = true;
    document.body.classList.remove('is-detail');
    state.currentId = null;
    document.title = 'SMTOWN &STORE';
  }

  function closeDetail() {
    if (location.hash.indexOf('#detail-') === 0) {
      history.pushState('', document.title, location.pathname + location.search);
    }
    showHome();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function syncRoute() {
    var match = location.hash.match(/^#detail-(product-\d+)/);
    if (match) {
      openDetail(match[1], false);
    } else {
      showHome();
    }
  }

  function bindDetailOpeners(root) {
    Array.prototype.slice.call(root.querySelectorAll('[data-open-detail]')).forEach(function (trigger) {
      if (trigger.dataset.boundDetail === 'true') return;
      trigger.dataset.boundDetail = 'true';
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        openDetail(trigger.getAttribute('data-open-detail'), true);
        closeMobileMenu();
      });
    });
  }

  function applyProductFilters() {
    var query = state.search.trim().toLowerCase();
    productCards.forEach(function (card) {
      var categories = card.getAttribute('data-category') || '';
      var text = card.textContent.toLowerCase();
      var matchFilter = state.filter === 'all' || categories.indexOf(state.filter) !== -1;
      var matchSearch = !query || text.indexOf(query) !== -1;
      card.hidden = !(matchFilter && matchSearch);
    });
  }

  function closeMobileMenu() {
    if (!menuToggle || !mobilePanel) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', '메뉴 열기');
    mobilePanel.hidden = true;
    document.body.classList.remove('is-menu-open');
  }

  function openSearch() {
    if (!searchPanel) return;
    searchPanel.hidden = false;
    if (searchInput) searchInput.focus();
  }

  function closeSearch() {
    if (!searchPanel) return;
    searchPanel.hidden = true;
  }

  function updateCountdown() {
    var now = new Date();
    var target = new Date(now);
    var friday = 5;
    var diffDay = (friday - now.getDay() + 7) % 7;
    target.setDate(now.getDate() + diffDay);
    target.setHours(17, 0, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 7);

    var diff = target - now;
    var days = Math.floor(diff / 86400000);
    var hours = Math.floor((diff % 86400000) / 3600000);
    var minutes = Math.floor((diff % 3600000) / 60000);

    setText('[data-days]', String(days).padStart(2, '0'));
    setText('[data-hours]', String(hours).padStart(2, '0'));
    setText('[data-minutes]', String(minutes).padStart(2, '0'));
  }

  function initHeader() {
    if (menuToggle && mobilePanel) {
      menuToggle.addEventListener('click', function () {
        var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        menuToggle.setAttribute('aria-label', expanded ? '메뉴 열기' : '메뉴 닫기');
        mobilePanel.hidden = expanded;
        document.body.classList.toggle('is-menu-open', !expanded);
      });
      mobilePanel.addEventListener('click', function (event) {
        if (event.target.tagName === 'A') closeMobileMenu();
      });
    }

    var openButton = document.querySelector('[data-search-open]');
    var closeButton = document.querySelector('[data-search-close]');
    if (openButton) openButton.addEventListener('click', openSearch);
    if (closeButton) closeButton.addEventListener('click', closeSearch);
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.search = searchInput.value;
        applyProductFilters();
      });
    }
  }

  function initFilters() {
    document.querySelectorAll('[data-filter]').forEach(function (button) {
      button.addEventListener('click', function () {
        state.filter = button.getAttribute('data-filter');
        document.querySelectorAll('[data-filter]').forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        applyProductFilters();
      });
    });
  }

  function initDetailControls() {
    document.querySelectorAll('[data-close-detail]').forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        closeDetail();
      });
    });

    var minus = document.querySelector('[data-qty-minus]');
    var plus = document.querySelector('[data-qty-plus]');
    if (minus) minus.addEventListener('click', function () { updateQuantity(state.qty - 1); });
    if (plus) plus.addEventListener('click', function () { updateQuantity(state.qty + 1); });

    var addCart = document.querySelector('[data-add-cart]');
    var buyNow = document.querySelector('[data-buy-now]');
    if (addCart) {
      addCart.addEventListener('click', function () {
        state.cartCount += state.qty;
        updateBag();
        setText('[data-detail-status]', '장바구니에 ' + state.qty + '개 담았습니다.');
      });
    }
    if (buyNow) {
      buyNow.addEventListener('click', function () {
        setText('[data-detail-status]', '구매 단계로 이동할 수 있는 상세페이지 흐름이 활성화되었습니다.');
      });
    }

    document.querySelectorAll('[data-tab]').forEach(function (button) {
      button.addEventListener('click', function () {
        var tab = button.getAttribute('data-tab');
        document.querySelectorAll('[data-tab]').forEach(function (item) {
          var active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        document.querySelectorAll('[data-tab-panel]').forEach(function (panel) {
          panel.hidden = panel.getAttribute('data-tab-panel') !== tab;
        });
      });
    });
  }

  bindDetailOpeners(document);
  initHeader();
  initFilters();
  initDetailControls();
  updateBag();
  updateCountdown();
  setInterval(updateCountdown, 60000);
  window.addEventListener('hashchange', syncRoute);
  window.addEventListener('popstate', syncRoute);
  syncRoute();
})();