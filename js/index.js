// Загружаем шапку и нижнюю панель
async function loadComponents() {
    const headerResp = await fetch('/components/header.html');
    const navResp = await fetch('/components/nav-bar.html');
    const mokoResp = await fetch('/components/moko-teaser.html');
    
    document.body.insertAdjacentHTML('afterbegin', await headerResp.text());
    document.getElementById('bottomNav').outerHTML = await navResp.text();
    document.querySelector('.container').insertAdjacentHTML('afterbegin', await mokoResp.text());
    
    // Активация активного пункта меню
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-item-glass').forEach(link => {
        const href = link.getAttribute('href');
        if (href === '/index.html' && (currentPath === '/' || currentPath.endsWith('index.html'))) {
            link.classList.add('active');
        } else if (href && currentPath.includes(href.replace('.html', ''))) {
            link.classList.add('active');
        }
    });
}

async function initIndex() {
    await loadComponents();
    
    // Аватарка из Telegram
    const user = getUser();
    const avatarImg = document.getElementById('avatar-img');
    if (user?.photo_url) avatarImg.src = user.photo_url;
    else avatarImg.src = 'https://cdn-icons-png.flaticon.com/512/847/847969.png';
    
    // Обработчики кликов
    document.getElementById('user-avatar').addEventListener('click', () => {
        window.location.href = '/account.html';
    });
    document.getElementById('mokoTeaser').addEventListener('click', () => {
        window.location.href = '/game.html?game=Moko';
    });
    document.getElementById('reviewsBtn').addEventListener('click', () => {
        window.open('https://t.me/akchotzivi', '_blank');
    });
    
    // Загрузка данных
    const [allOffers, games, collections] = await Promise.all([loadAllOffers(), loadGames(), loadCollections()]);
    
    // Рендер игр
    const gamesContainer = document.getElementById('gamesContainer');
    gamesContainer.innerHTML = '';
    games.slice(0, 8).forEach((game, idx) => {
        const card = document.createElement('div');
        card.className = `game-card fade-in delay-${(idx % 4) + 1}`;
        card.onclick = () => window.location.href = `/game.html?game=${encodeURIComponent(game.name)}`;
        card.innerHTML = `
            <div class="game-icon">
                <img src="${game.logo}" alt="${game.name}">
            </div>
            <div class="game-name">${escapeHtml(game.name)}</div>
        `;
        gamesContainer.appendChild(card);
    });
    
    // Словарь товаров по id
    const offersMap = Object.fromEntries(allOffers.map(o => [o.id, o]));
    
    // Рендер популярных (если есть)
    if (collections.popular && collections.popular.length) {
        const popularProducts = collections.popular.map(id => offersMap[id]).filter(Boolean);
        renderProductList(popularProducts, 'popularContainer');
    } else {
        document.getElementById('popularContainer').innerHTML = '<div style="color:#888; padding:24px;">Популярные товары появятся скоро</div>';
    }
    
    // Скидки
    if (collections.discount && collections.discount.length) {
        const discountProducts = collections.discount.map(id => offersMap[id]).filter(Boolean);
        if (discountProducts.length) {
            document.getElementById('discountSection').style.display = 'block';
            renderProductList(discountProducts, 'discountContainer');
        }
    }
    
    // Новинки
    if (collections.new && collections.new.length) {
        const newProducts = collections.new.map(id => offersMap[id]).filter(Boolean);
        if (newProducts.length) {
            document.getElementById('newSection').style.display = 'block';
            renderProductList(newProducts, 'newContainer');
        }
    }
}

initIndex();
