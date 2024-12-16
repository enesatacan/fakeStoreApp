// Element seçiciler
const container = document.querySelector(".container");
const cart = document.querySelector(".cart");
const cartInfo = document.querySelector(".cart-info");
const cards = document.querySelector(".container .cards");
const favoriteList = document.querySelector(".favoriteList");
const count = document.querySelector("#count");
const showFav = document.querySelector("#showFav");
const pageTitle = document.querySelector("#pageTitle");

let favoriteItems = []; // Favoriler dizisi
let cartItems = []; // Sepet dizisi
// Favoriler ve sepeti yerel depolamaya kaydetme/yükleme
const saveFavorites = () => {
  localStorage.setItem("favorites", JSON.stringify(favoriteItems));
};

const loadFavorites = () => {
  const storedFavorites = localStorage.getItem("favorites");
  favoriteItems = storedFavorites ? JSON.parse(storedFavorites) : [];
};

const saveCart = () => {
  localStorage.setItem("cart", JSON.stringify(cartItems));
};

const loadCart = () => {
  const storedCart = localStorage.getItem("cart");
  cartItems = storedCart ? JSON.parse(storedCart) : [];
};

// Kart HTML'ini oluştur
const createCartHtml = (product) => {
  return `
  <div class="cart-info ">
      <div class="card text-center">
        <div class="product d-flex flex-row gap-2 p-2 align-items-center">
          <div class="d-flex align-items-center">
            <button class="btn text-white">-</button>
            <span>1</span>
            <button class="btn text-white">+</button>
          </div>
          <img
            style="width: 50px; border-radius: 5px"
            src=${product.image}
            alt=${product.title}
          />
          <div class="d-flex flex-column text-center">
            <span>${product.title}</span>
            <span>${product.price}</span>
          </div>
          <span id="productDlt" class="btn text-danger">
            <i class="fa-solid fa-trash"></i>
          </span>
        </div>
      </div>
  `;
};
const createCardHtml = (product, isFavorite = false) => {
  return `
    <div class="card">
      <span id="favoriteBtn" class="btn">
        <i class="fa-solid fa-heart" style="color: ${
          isFavorite ? "red" : "#5f5f5f"
        }"></i>
      </span>
      <div class="card-body">
        <img
          id="card-img"
          class="img-fluid"
          src="${product.image}"
          alt="${product.title}"
        />
        <div class="card-title">
          <div class="desc mb-3">
            <span class="fw-bold">${product.title}</span>
          </div>
          <div class="info d-flex justify-content-between">
            <span>
              <i class="fa-solid fa-star me-1" style="color: #ffd700"></i>
              ${product.rating.rate}
            </span>
            <span><b>${product.price} $</b></span>
          </div>
        </div>
      </div>
      <div id="addCart" class="px-2 pb-2">
        <button class="btn btn-success w-100" data-title="${
          product.title
        }" data-price="${product.price}" data-image="${product.image}">
          Sepete Ekle
        </button>
      </div>
    </div>
  `;
};

// Sayfa yüklendiğinde ürünleri çek ve görüntüle
window.addEventListener("load", async () => {
  loadFavorites();
  loadCart();

  try {
    console.log("Sayfa Yüklendi!");
    const res = await fetch("https://fakestoreapi.com/products");
    const data = await res.json();

    data.forEach((product) => {
      const isFavorite = favoriteItems.some(
        (item) => item.title === product.title
      );
      const cardHtml = createCardHtml(product, isFavorite);
      cards.insertAdjacentHTML("beforeend", cardHtml);
    });
  } catch (error) {
    console.error("API çağrısı başarısız oldu:", error);
    alerting("Ürünler yüklenirken bir hata oluştu.", "danger");
  }
});

// Favoriler ve sepete ekleme işlemleri
cards.addEventListener("click", (e) => {
  // Sepete ekleme
  if (e.target && e.target.classList.contains("btn-success")) {
    const cardElement = e.target.closest(".card");
    const productTitle = cardElement.querySelector(".fw-bold").textContent;
    const productPrice = e.target.getAttribute("data-price");
    const productImage = e.target.getAttribute("data-image");

    const product = {
      title: productTitle,
      price: productPrice,
      image: productImage,
    };

    cartItems.push(product);
    saveCart();
    alerting("Ürün sepete eklendi.", "success");
    console.log("Sepet:", cartItems);
    count.innerText = cartItems.length;
  }

  // Favorilere ekleme/çıkarma
  if (e.target && e.target.classList.contains("fa-heart")) {
    const cardElement = e.target.closest(".card");
    const productTitle = cardElement.querySelector(".fw-bold").textContent;
    const productImage = cardElement.querySelector("#card-img").src;
    const productRating = cardElement
      .querySelector(".fa-star")
      .nextSibling.textContent.trim();
    const productPrice = cardElement.querySelector("b").textContent;

    const product = {
      title: productTitle,
      image: productImage,
      rating: { rate: productRating },
      price: productPrice,
    };

    const favoriteIndex = favoriteItems.findIndex(
      (item) => item.title === productTitle
    );

    if (favoriteIndex > -1) {
      favoriteItems.splice(favoriteIndex, 1);
      e.target.style.color = "#5f5f5f";
      alerting("Ürün favoriler listesinden çıkartıldı.", "warning");
    } else {
      favoriteItems.push(product);
      e.target.style.color = "red";
      alerting("Ürün favoriler listesine eklendi.", "success");
    }

    saveFavorites();
    console.log("Favoriler:", favoriteItems);
  }
});

cart.addEventListener("click", () => {
  cart.classList.toggle("click-cart");
  if (cartItems.length > 0) {
    cartItems.forEach((item) => {
      const cardHtml = createCartHtml(item, true);
      cart.insertAdjacentHTML("beforeend", cardHtml);
    });
  } else {
    cart.innerHTML = "<p>Sepetinizde Ürün Bulunmamaktadır.</p>";
  }
  if (!cart.classList.contains("click-cart")) {
    cart.innerHTML = `
    <span id="count">${cartItems.length}</span>
      <span><i class="fa-solid fa-basket-shopping"></i></span>
    `;
  }
});

showFav.addEventListener("click", () => {
  pageTitle.innerHTML = `<p> Favoriler </p> <a style="font-size: 16px; color:black" class="fw-bolder" href="index.html">
      Geri
    </a>`;
  cards.innerHTML = ""; // Kartları sıfırla
  favoriteItems.forEach((item) => {
    const cardHtml = createCardHtml(item, true);
    cards.insertAdjacentHTML("beforeend", cardHtml);
  });
});

// Alert mesajlarını oluştur
const alerting = function (message, type) {
  const alertHtml = `
    <div class="alert alert-${type}" role="alert">
      ${message}
    </div>
  `;
  const alertContainer = document.querySelector(".alert-container");
  if (alertContainer) {
    alertContainer.innerHTML = alertHtml;
    setTimeout(() => {
      alertContainer.innerHTML = "";
    }, 3000);
  } else {
    console.warn("Alert container bulunamadı.");
  }
};
