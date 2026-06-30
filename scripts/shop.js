const productGrid = document.getElementById('productGrid');
const shopStatus = document.getElementById('shopStatus');

let productData = [];
const CART_KEY = 'lk_cart';

// read initial search query from URL (supports ?q= or ?search=)
const _urlParams = new URLSearchParams(window.location.search || '');
const initialSearchQuery = (_urlParams.get('q') || _urlParams.get('search') || '').trim().toLowerCase();

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const countEl = document.getElementById('cartCount');
  if (!countEl) return;
  const cart = getCart();
  const qty = cart.reduce((s, i) => s + (i.qty || 0), 0);
  countEl.textContent = qty > 0 ? qty : '';
}

function renderProducts(products) {
  productGrid.innerHTML = '';
  // apply search filter if present
  let display = products;
  if (initialSearchQuery) {
    display = (products || []).filter(p => {
      const name = (p.name || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const id = (p.id || '').toLowerCase();
      return name.includes(initialSearchQuery) || desc.includes(initialSearchQuery) || id.includes(initialSearchQuery);
    });
  }

  if (!display || display.length === 0) {
    productGrid.innerHTML = '<div class="product-empty">Upload a spreadsheet or load the sample products to begin.</div>';
    shopStatus.textContent = initialSearchQuery ? `No products match "${initialSearchQuery}".` : 'No products loaded yet.';
    return;
  }
  shopStatus.textContent = `${display.length} product${display.length === 1 ? '' : 's'} shown`;

  display.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';

    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'product-image';
    const img = document.createElement('img');
    const imgSrc = resolveImageSrc(product.image);
    img.src = imgSrc;
    img.alt = product.name || 'Product image';
    imageWrapper.appendChild(img);
    card.appendChild(imageWrapper);

    const title = document.createElement('h2');
    title.className = 'product-title';
    title.textContent = product.name || 'Unnamed Product';
    card.appendChild(title);

    if (product.description) {
      const desc = document.createElement('p');
      desc.className = 'product-description';
      desc.textContent = product.description;
      card.appendChild(desc);
    }

    const priceRow = document.createElement('div');
    priceRow.className = 'product-price';
    const price = document.createElement('strong');
    price.textContent = product.price ? `US$ ${parseFloat(product.price).toFixed(2)}` : 'Price unavailable';
    const sku = document.createElement('span');
    sku.textContent = product.id ? `SKU: ${product.id}` : '';
    priceRow.appendChild(price);
    if (product.id) priceRow.appendChild(sku);
    card.appendChild(priceRow);

    // Add to cart button
    const actionsRow = document.createElement('div');
    actionsRow.style.marginTop = '12px';
    const addBtn = document.createElement('button');
    addBtn.className = 'btn';
    addBtn.textContent = 'Add to cart';
    addBtn.addEventListener('click', () => {
      addToCart({ id: product.id || product.name, name: product.name, price: parseFloat(product.price) || 0, image: product.image });
    });
    actionsRow.appendChild(addBtn);
    card.appendChild(actionsRow);

    productGrid.appendChild(card);
  });
  updateCartCount();
}

function addToCart(item) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === item.id);
  if (idx >= 0) {
    cart[idx].qty = (cart[idx].qty || 1) + 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
}

function resolveImageSrc(filename) {
  if (!filename) {
    return 'https://via.placeholder.com/420x320/160b35/7a46ff?text=No+Image';
  }

  return filename;
}

renderProducts([]);
