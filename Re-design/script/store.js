/* =====================================================================
   store.js  —  SMTOWN &STORE 공용 데이터 계층
   - 상품 카탈로그(단일 소스)
   - localStorage 기반 장바구니 API
   - 가격/포맷 유틸
   모든 페이지에서 가장 먼저 로드됩니다. (window.SMStore)
   ===================================================================== */
(function () {
  "use strict";

  /* ---------------------------------------------------------------
     상품 카탈로그
     cats: 필터 토큰(인덱스: music/concert/goods, product: music/photo/
           concert/living/beauty)을 모두 포함해 두 화면 필터를 함께 지원
     shortTitle: 카드/장바구니용 짧은 이름
     --------------------------------------------------------------- */
  var products = [
    {
      id: "product-01",
      artist: "SHINee",
      title: "2026 SHINee 6th Mini Album [Atmos] POP-UP 4X6 PHOTO SET",
      shortTitle: "POP-UP 4X6 PHOTO SET",
      price: 5000,
      image: "images/product-01.jpg",
      status: "SOLD OUT",
      cats: ["music", "photo"],
      desc: "Atmos 팝업 컬렉션의 4X6 포토 세트입니다. 공식 이미지와 컬렉션 무드를 담은 팬 소장용 MD입니다.",
      long: "본 상품은 SMTOWN &STORE 리디자인 상세페이지 프로토타입용 데이터입니다. 상품 이미지, 가격, 옵션, 구매 액션이 상세 화면 안에서 연결되도록 구성했습니다.",
      options: ["4X6 PHOTO SET"]
    },
    {
      id: "product-02",
      artist: "SHINee",
      title: "2026 SHINee 6th Mini Album [Atmos] RANDOM TRADING CARD",
      shortTitle: "RANDOM TRADING CARD",
      price: 6000,
      image: "images/product-02.jpg",
      status: "SOLD OUT",
      cats: ["music", "photo", "goods"],
      desc: "랜덤 트레이딩 카드 구성으로, 앨범 콘셉트의 다양한 컷을 만날 수 있습니다.",
      long: "랜덤 상품 특성상 구성품은 임의 발송됩니다. 상세페이지에서는 옵션 선택과 수량 변경, 장바구니 담기 흐름을 확인할 수 있습니다.",
      options: ["RANDOM 1EA", "RANDOM 3EA SET"]
    },
    {
      id: "product-03",
      artist: "SHINee",
      title: "2026 SHINee 6th Mini Album [Atmos] POP-UP T-SHIRT SET",
      shortTitle: "POP-UP T-SHIRT SET",
      price: 45000,
      image: "images/product-03.jpg",
      status: "PRE-ORDER",
      cats: ["concert", "goods"],
      desc: "팝업 MD 컬렉션의 티셔츠 세트입니다. 콘서트와 일상에서 모두 입기 좋은 구성입니다.",
      long: "예약 판매 상품은 입고 일정에 따라 순차 배송됩니다. 옵션을 선택한 뒤 바로 구매 또는 장바구니 담기 동작을 테스트할 수 있습니다.",
      options: ["S", "M", "L", "XL"]
    },
    {
      id: "product-04",
      artist: "SHINee",
      title: "2026 SHINee 6th Mini Album [Atmos] WIND BREAKER SET",
      shortTitle: "WIND BREAKER SET",
      price: 120000,
      image: "images/product-04.jpg",
      status: "PRE-ORDER",
      cats: ["concert", "goods"],
      desc: "가볍게 걸치기 좋은 윈드 브레이커 세트입니다. 공연장 밖에서도 컬렉션의 분위기를 이어갑니다.",
      long: "의류 상품은 상세 사이즈 확인 후 구매를 권장합니다. 프로토타입에서는 상품 상세 정보, 배송 안내, 공지 탭을 전환할 수 있습니다.",
      options: ["M", "L", "XL"]
    },
    {
      id: "product-05",
      artist: "SHINee",
      title: "2026 SHINee 6th Mini Album [Atmos] POP-UP CROSS BAG",
      shortTitle: "POP-UP CROSS BAG",
      price: 45000,
      image: "images/product-05.jpg",
      status: "SOLD OUT",
      cats: ["living", "goods"],
      desc: "팝업 컬렉션 그래픽이 적용된 크로스백입니다. 팬 굿즈와 데일리 아이템의 균형을 맞췄습니다.",
      long: "품절 상품은 재입고 알림 신청 흐름을 안내하도록 구성했습니다. 상세페이지 내 관련 상품 영역도 함께 활성화되어 있습니다.",
      options: ["BLACK", "WHITE"]
    },
    {
      id: "product-06",
      artist: "SMTOWN",
      title: "SMTOWN &STORE OFFICIAL GOODS PACKAGE",
      shortTitle: "OFFICIAL GOODS PACKAGE",
      price: 32000,
      image: "images/product-06.jpg",
      status: "NEW",
      cats: ["music", "living", "goods"],
      desc: "여러 아티스트의 공식 굿즈를 한 번에 즐길 수 있는 스토어 패키지입니다.",
      long: "패키지 구성 상품은 리디자인 프로토타입 데이터로, 상세/배송/공지 탭과 관련 상품 영역이 함께 렌더링됩니다.",
      options: ["기본 구성", "한정 구성"]
    },
    {
      id: "product-07",
      artist: "SMTOWN",
      title: "SMTOWN &STORE OFFICIAL LIP & CARE SET",
      shortTitle: "OFFICIAL LIP & CARE SET",
      price: 18000,
      image: "images/product-07.jpg",
      status: "NEW",
      cats: ["beauty", "goods"],
      desc: "팬 이벤트와 함께 준비한 뷰티 카테고리 데모 상품입니다.",
      long: "뷰티 카테고리 필터 동작을 확인하기 위한 프로토타입 데이터입니다. 옵션과 수량, 장바구니 흐름을 그대로 사용할 수 있습니다.",
      options: ["기본 구성"]
    }
  ];

  /* --------------------------- 유틸 --------------------------- */
  function formatPrice(value) {
    var n = Number(value) || 0;
    return "₩" + n.toLocaleString("ko-KR");
  }

  function findProduct(id) {
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) return products[i];
    }
    return null;
  }

  /* --------------------------- 장바구니 --------------------------- */
  var CART_KEY = "sm_cart";

  function safeParse(raw) {
    try {
      var data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function getCart() {
    if (!window.localStorage) return [];
    return safeParse(window.localStorage.getItem(CART_KEY));
  }

  function saveCart(items) {
    if (!window.localStorage) return;
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) { /* 저장 실패는 무시(프로토타입) */ }
    updateBadges();
  }

  function addItem(id, option, qty) {
    var amount = Math.max(1, parseInt(qty, 10) || 1);
    var items = getCart();
    var matched = false;
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id && items[i].option === option) {
        items[i].qty = Math.min(99, (parseInt(items[i].qty, 10) || 0) + amount);
        matched = true;
        break;
      }
    }
    if (!matched) items.push({ id: id, option: option || "", qty: amount });
    saveCart(items);
    return items;
  }

  function setQty(index, qty) {
    var items = getCart();
    if (!items[index]) return items;
    items[index].qty = Math.max(1, Math.min(99, parseInt(qty, 10) || 1));
    saveCart(items);
    return items;
  }

  function removeItem(index) {
    var items = getCart();
    if (index < 0 || index >= items.length) return items;
    items.splice(index, 1);
    saveCart(items);
    return items;
  }

  function clearCart() {
    saveCart([]);
  }

  function count() {
    return getCart().reduce(function (sum, item) {
      return sum + (parseInt(item.qty, 10) || 0);
    }, 0);
  }

  function subtotal() {
    return getCart().reduce(function (sum, item) {
      var product = findProduct(item.id);
      var price = product ? product.price : 0;
      return sum + price * (parseInt(item.qty, 10) || 0);
    }, 0);
  }

  /* 헤더 장바구니 숫자를 모든 페이지에서 동기화 */
  function updateBadges() {
    var total = count();
    var badges = document.querySelectorAll(".bag-button span");
    for (var i = 0; i < badges.length; i++) {
      badges[i].textContent = String(total);
    }
  }

  window.SMStore = {
    products: products,
    findProduct: findProduct,
    formatPrice: formatPrice,
    cart: {
      get: getCart,
      add: addItem,
      setQty: setQty,
      remove: removeItem,
      clear: clearCart,
      count: count,
      subtotal: subtotal
    },
    updateBadges: updateBadges
  };

  /* 로드 즉시 배지 동기화 (DOM 준비 시점 대응) */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateBadges);
  } else {
    updateBadges();
  }
})();
