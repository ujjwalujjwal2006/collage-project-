// ====== CART MANAGEMENT ======
function getCart() {
  const stored = localStorage.getItem('canteen_cart');
  return stored ? JSON.parse(stored) : [];
}

function saveCart(cart) {
  localStorage.setItem('canteen_cart', JSON.stringify(cart));
}

function addToCart(itemId) {
  const items = getMenuItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return;

  const cart = getCart();
  const existing = cart.find(c => c.id === itemId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...item, qty: 1 });
  }
  saveCart(cart);
  updateCartUI();
  showToast(`"${item.name}" added to cart!`, 'success');
}

function removeFromCart(itemId) {
  let cart = getCart();
  cart = cart.filter(c => c.id !== itemId);
  saveCart(cart);
  updateCartUI();
  renderCartItems();
}

function updateQty(itemId, delta) {
  const cart = getCart();
  const item = cart.find(c => c.id === itemId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(itemId);
    return;
  }
  saveCart(cart);
  updateCartUI();
  renderCartItems();
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
  const badge = document.getElementById('cart-badge');
  const count = getCartCount();
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
}

function toggleCart() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  const isOpen = sidebar.classList.contains('active');

  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');

  if (!isOpen) {
    renderCartItems();
    hideCheckout();
  }
}

function renderCartItems() {
  const container = document.getElementById('cart-items');
  const footer = document.getElementById('cart-footer');
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = '<div class="cart-empty"><span>🛒</span><p>Your cart is empty</p></div>';
    footer.style.display = 'none';
    return;
  }

  footer.style.display = 'block';
  document.getElementById('cart-total').textContent = getCartTotal();

  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img class="cart-item-img" src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'">
      <div class="cart-item-info">
        <div class="cart-item-name">${escapeHtml(item.name)}</div>
        <div class="cart-item-price">₹${item.price * item.qty}</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="updateQty(${item.id}, -1)">−</button>
        <span>${item.qty}</span>
        <button class="qty-btn" onclick="updateQty(${item.id}, 1)">+</button>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">🗑️</button>
    </div>
  `).join('');
}

function showCheckout() {
  document.getElementById('cart-footer').style.display = 'none';
  document.getElementById('cart-items').style.display = 'none';
  document.getElementById('checkout-form').classList.remove('hidden');
}

function hideCheckout() {
  const cart = getCart();
  document.getElementById('cart-footer').style.display = cart.length > 0 ? 'block' : 'none';
  document.getElementById('cart-items').style.display = 'block';
  document.getElementById('checkout-form').classList.add('hidden');
}

function clearCart() {
  localStorage.removeItem('canteen_cart');
  updateCartUI();
}
