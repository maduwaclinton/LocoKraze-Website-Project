const CART_KEY = 'lk_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch (e) { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  renderCart();
}

function renderCart() {
  const container = document.getElementById('cartContainer');
  const status = document.getElementById('cartStatus');
  if (!container) return;
  const cart = getCart();
  container.innerHTML = '';
  if (!cart.length) {
    container.innerHTML = '<div class="product-empty">Your cart is empty. Return to shop to add items.</div>';
    if (status) status.textContent = 'Cart is empty';
    return;
  }

  let total = 0;
  const list = document.createElement('div');
  list.className = 'cart-list';

  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'product-card';
    const imgWrap = document.createElement('div');
    imgWrap.className = 'product-image';
    const img = document.createElement('img');
    img.src = item.image || 'https://via.placeholder.com/420x320/160b35/7a46ff?text=No+Image';
    img.alt = item.name;
    imgWrap.appendChild(img);

    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = item.name;

    const qtyRow = document.createElement('div');
    qtyRow.style.display = 'flex';
    qtyRow.style.gap = '8px';
    qtyRow.style.alignItems = 'center';

    const dec = document.createElement('button');
    dec.className = 'btn btn-secondary';
    dec.textContent = '-';
    dec.addEventListener('click', () => { changeQty(item.id, -1); });

    const qty = document.createElement('span');
    qty.textContent = item.qty || 1;

    const inc = document.createElement('button');
    inc.className = 'btn';
    inc.textContent = '+';
    inc.addEventListener('click', () => { changeQty(item.id, 1); });

    const remove = document.createElement('button');
    remove.className = 'btn btn-secondary';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => { removeFromCart(item.id); });

    const price = document.createElement('strong');
    price.textContent = item.price ? `US$ ${parseFloat(item.price).toFixed(2)}` : 'Price N/A';

    qtyRow.appendChild(dec);
    qtyRow.appendChild(qty);
    qtyRow.appendChild(inc);
    qtyRow.appendChild(remove);

    const info = document.createElement('div');
    info.appendChild(title);
    info.appendChild(qtyRow);
    info.appendChild(price);

    row.appendChild(imgWrap);
    row.appendChild(info);
    list.appendChild(row);

    total += (parseFloat(item.price) || 0) * (item.qty || 1);
  });

  const totalRow = document.createElement('div');
  totalRow.style.display = 'flex';
  totalRow.style.justifyContent = 'space-between';
  totalRow.style.alignItems = 'center';
  totalRow.style.marginTop = '12px';
  totalRow.innerHTML = `<strong style="font-size:1.25rem;color:#ff6ae3;">Total: US$ ${total.toFixed(2)}</strong>`;

  const checkout = document.createElement('button');
  checkout.className = 'btn';
  checkout.textContent = 'Checkout';
  checkout.addEventListener('click', () => { doCheckout(); });

  container.appendChild(list);
  container.appendChild(totalRow);
  container.appendChild(checkout);
  if (status) status.textContent = `${cart.length} item${cart.length>1?'s':''} in cart`;
}

function changeQty(id, delta) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id);
  if (idx === -1) return;
  cart[idx].qty = Math.max(0, (cart[idx].qty || 1) + delta);
  if (cart[idx].qty === 0) cart.splice(idx, 1);
  saveCart(cart);
}

function removeFromCart(id) {
  const cart = getCart().filter(i => i.id !== id);
  saveCart(cart);
}

function doCheckout() {
  const cart = getCart();
  if (!cart.length) return alert('Cart is empty');
  const order = { items: cart, date: new Date().toISOString(), total: cart.reduce((s,i)=>s+((parseFloat(i.price)||0)*(i.qty||1)),0) };
  const blob = new Blob([JSON.stringify(order, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `order-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  localStorage.removeItem(CART_KEY);
  renderCart();
  alert('Order downloaded as JSON. Implement server checkout to process payments.');
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('cartContainer')) {
    renderCart();
  }
});
