// Общие настройки и утилиты для всех страниц
const DATA_BASE = 'https://raw.githubusercontent.com/squad-life/squad-life.github.io/main/data/';

let tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();
tg.setHeaderColor('#0c0c0e');
tg.setBackgroundColor('#0c0c0e');

// Получение пользователя
function getUser() {
    return tg.initDataUnsafe.user;
}

// Загрузка all_offers.json
async function loadAllOffers() {
    const res = await fetch(`${DATA_BASE}all_offers.json`);
    const data = await res.json();
    return data.offers || [];
}

// Загрузка games.json
async function loadGames() {
    const res = await fetch(`${DATA_BASE}games.json`);
    return await res.json();
}

// Загрузка collections.json
async function loadCollections() {
    const res = await fetch(`${DATA_BASE}collections.json`);
    return await res.json();
}

// Рассчёт финальной цены со скидкой
function getFinalPrice(product, variantPrice = null) {
    let base = variantPrice || (product.variants?.length ? product.variants[0].price : product.price);
    if (product.discount && product.discount > 0) {
        return Math.round(base * (1 - product.discount / 100));
    }
    return base;
}

// Ротация баннеров
function startBannerRotation(productId) {
    const bannerDiv = document.getElementById(`banner-${productId}`);
    if (!bannerDiv) return;
    const imgs = bannerDiv.querySelectorAll('img');
    if (imgs.length < 2) return;
    let current = 0;
    setInterval(() => {
        imgs[current].classList.remove('active');
        current = (current + 1) % imgs.length;
        imgs[current].classList.add('active');
    }, 5000);
}

// Экранирование HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

// Рендер списка товаров в контейнер
function renderProductList(products, containerId) {
    const container = document.getElementById(containerId);
    if (!products.length) {
        container.innerHTML = '<div style="color:#888; padding:24px;">Нет товаров</div>';
        return;
    }
    container.innerHTML = '';
    products.forEach((product, idx) => {
        const variantPrice = product.variants?.length ? product.variants[0].price : product.price;
        const finalPrice = getFinalPrice(product, variantPrice);
        const hasDiscount = product.discount > 0;
        
        let priceHtml = `<div class="product-price">${finalPrice} ₽</div>`;
        let discountHtml = '';
        if (hasDiscount) {
            priceHtml = `<div class="price-row"><div class="product-price">${finalPrice} ₽</div><div class="old-price">${variantPrice} ₽</div></div>`;
            discountHtml = `<div class="discount-badge">-${product.discount}%</div>`;
        }
        
        const card = document.createElement('div');
        card.className = `product-card fade-in delay-${(idx % 4) + 1}`;
        card.onclick = () => window.location.href = `/offer.html?id=${product.id}`;
        card.innerHTML = `
            <div class="product-banner" id="banner-${product.id}">
                <img src="${product.banner1}" class="active" alt="">
                <img src="${product.banner2}" alt="">
            </div>
            <div class="product-info">
                <div class="product-name">${escapeHtml(product.name)}</div>
                ${priceHtml}
                ${discountHtml}
            </div>
        `;
        container.appendChild(card);
        startBannerRotation(product.id);
    });
}
