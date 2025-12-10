// =====================================================
// CONFIG
// =====================================================
const STORAGE_KEY = "joju_cart_v2";
const THEME_KEY = "joju_theme";

const products = [
  {
    id: "budget",
    title: "Template Budget Mahasiswa",
    desc: "Spreadsheet untuk mencatat pemasukan & pengeluaran harian/ bulanan.",
    price: 16500,
    image: "assets/budget.png"
  },
  {
    id: "kuliah",
    title: "Template Tracker Tugas Kuliah",
    desc: "Pantau deadline tugas, mata kuliah, status pengumpulan, dan progres.",
    price: 15000,
    image: "assets/kuliah.png"
  },
  {
    id: "habit",
    title: "Template Habit Tracker",
    desc: "Cocok untuk membangun konsistensi kebiasaan harian dan weekly goals.",
    price: 12000,
    image: "assets/habit.png"
  }
];


// =====================================================
// STATE
// =====================================================
let cart = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];


// =====================================================
// UTIL
// =====================================================
function formatRP(n){
  return "Rp " + Number(n).toLocaleString("id-ID");
}

function saveCart(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  updateNavCount();
  renderCartPopup();
}

function updateNavCount(){
  const cnt = cart.reduce((s,i)=>s + (i.qty||0), 0);
  const navCnt = document.getElementById("nav-cart-count");
  if (navCnt) navCnt.textContent = cnt;
}


// =====================================================
// RENDER PRODUCTS
// =====================================================
function renderProducts(){
  const grid = document.getElementById("product-grid");
  if (!grid) return;

  grid.innerHTML = products.map(p => `
    <article class="card" data-id="${p.id}">
      <img src="${p.image}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p class="desc">${p.desc}</p>

      <div class="meta">
        <div class="price">${formatRP(p.price)}</div>
        <button class="add-to-cart" data-id="${p.id}">Add to Cart +</button>
      </div>
    </article>
  `).join("");
}
renderProducts();


// =====================================================
// CART POPUP
// =====================================================
const cartPopup = document.getElementById("cart-popup");
const cartItemsWrap = document.getElementById("cart-items");
const cartSubtotalEl = document.getElementById("cart-subtotal");

function renderCartPopup(){
  if (!cartItemsWrap) return;

  if (cart.length === 0){
    cartItemsWrap.innerHTML = `<div class="muted">Keranjang kosong.</div>`;
    cartSubtotalEl.textContent = formatRP(0);
    return;
  }

  cartItemsWrap.innerHTML = cart.map(item => `
    <div class="cart-row" data-id="${item.id}">
      <div class="left">
        <img src="${item.image}" alt="${item.title}">
        <div>
          <div style="font-weight:700">${item.title}</div>
          <div class="muted">${formatRP(item.price)}</div>
        </div>
      </div>

      <div style="text-align:right">
        <div>${item.qty}x</div>
        <div style="margin-top:6px">${formatRP(item.qty * item.price)}</div>
        <button class="remove-item" data-id="${item.id}" style="margin-top:4px;font-size:12px;">Hapus</button>
      </div>
    </div>
  `).join("");

  const subtotal = cart.reduce((s,i)=>s + i.price * i.qty, 0);
  cartSubtotalEl.textContent = formatRP(subtotal);
}

renderCartPopup();
updateNavCount();


// =====================================================
// EVENT LISTENER
// =====================================================
document.addEventListener("click", e => {
  const addBtn = e.target.closest(".add-to-cart");
  if (addBtn){
    addToCart(addBtn.dataset.id);
    showCartPopup();
    return;
  }

  if (e.target.id === "cart-toggle" || e.target.closest("#cart-toggle")){
    toggleCartPopup();
    return;
  }

  if (e.target.id === "cart-close"){
    hideCartPopup();
    return;
  }

  if (e.target.id === "checkout-now"){
    window.location.href = "checkout.html";
    return;
  }

  const removeBtn = e.target.closest(".remove-item");
  if (removeBtn){
    removeFromCart(removeBtn.dataset.id);
    return;
  }
});

function addToCart(id){
  const p = products.find(x => x.id === id);
  if (!p) return;

  const index = cart.findIndex(x => x.id === id);
  if (index >= 0){
    cart[index].qty += 1;
  } else {
    cart.push({ id: p.id, title: p.title, price: p.price, image: p.image, qty: 1 });
  }

  saveCart();
}

function removeFromCart(id){
  cart = cart.filter(i => i.id !== id);
  saveCart();
}

function showCartPopup(){ cartPopup.classList.add("show"); }
function hideCartPopup(){ cartPopup.classList.remove("show"); }
function toggleCartPopup(){ cartPopup.classList.toggle("show"); }


// =====================================================
// DARK MODE
// =====================================================
const themeToggle = document.getElementById("theme-toggle");
const savedTheme = localStorage.getItem(THEME_KEY) || "light";
applyTheme(savedTheme);

function applyTheme(t){
  if (t === "dark"){
    document.documentElement.classList.add("dark");
    if (themeToggle) themeToggle.textContent = "☀️";
  } else {
    document.documentElement.classList.remove("dark");
    if (themeToggle) themeToggle.textContent = "🌙";
  }
}

if (themeToggle){
  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
}


// =====================================================
// 🔥 REALTIME STATS (MENUNGGU NETLIFY FUNCTION)
// =====================================================
async function loadStats(){
  const soldEl = document.getElementById("stat-sold");
  const ordersEl = document.getElementById("stat-orders");
  if (!soldEl || !ordersEl) return;

  try {
    const res = await fetch("/.netlify/functions/getStats");
    const data = await res.json();

    soldEl.textContent = data.totalSold;
    ordersEl.textContent = data.totalOrders;
  } catch (err){
    console.log("Stats error:", err);
  }
}

loadStats();
