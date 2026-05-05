// ====== ORDER MANAGEMENT ======
function getOrders() {
  const stored = localStorage.getItem('canteen_orders');
  return stored ? JSON.parse(stored) : [];
}

function saveOrders(orders) {
  localStorage.setItem('canteen_orders', JSON.stringify(orders));
}

function generateOrderId() {
  return 'ORD-' + Date.now().toString(36).toUpperCase();
}

function placeOrder() {
  const name = document.getElementById('cust-name').value.trim();
  const roll = document.getElementById('cust-roll').value.trim();

  if (!name || !roll) {
    showToast('Please enter your name and roll number.', 'error');
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }

  const order = {
    id: generateOrderId(),
    customer: name,
    roll: roll,
    items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price })),
    total: getCartTotal(),
    status: 'pending',
    time: new Date().toISOString()
  };

  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);

  // Save student info for order tracking
  localStorage.setItem('canteen_student_roll', roll);
  localStorage.setItem('canteen_student_name', name);

  // Clear cart and form
  clearCart();
  document.getElementById('cust-name').value = '';
  document.getElementById('cust-roll').value = '';

  // Close cart sidebar
  document.getElementById('cart-sidebar').classList.remove('active');
  document.getElementById('cart-overlay').classList.remove('active');

  // Show success
  document.getElementById('success-order-id').textContent = `Order ID: ${order.id}`;
  showView('order-success');
  showToast('Order placed successfully!', 'success');
}

function updateOrderStatus(orderId) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;

  const flow = ['pending', 'ready', 'picked'];
  const currentIdx = flow.indexOf(order.status);
  if (currentIdx < flow.length - 1) {
    order.status = flow[currentIdx + 1];
    saveOrders(orders);
    renderManagerOrders();
    updateStats();
    showToast(`Order ${orderId} marked as ${order.status}.`, 'success');
  }
}

function deleteOrder(orderId) {
  let orders = getOrders();
  orders = orders.filter(o => o.id !== orderId);
  saveOrders(orders);
  renderManagerOrders();
  updateStats();
  showToast('Order deleted.', 'info');
}

// ====== RENDER ORDERS ======
function renderManagerOrders() {
  const container = document.getElementById('manager-orders-list');
  const orders = getOrders();

  if (orders.length === 0) {
    container.innerHTML = '<div class="no-orders"><span>📦</span><p>No orders yet.</p></div>';
    return;
  }

  const statusLabels = { pending: 'Pending', ready: 'Ready', picked: 'Picked Up' };
  const nextLabels = { pending: 'Mark Ready', ready: 'Mark Picked Up' };

  container.innerHTML = orders.map(order => {
    const itemsList = order.items.map(i => `${i.name} x${i.qty}`).join(', ');
    const time = new Date(order.time).toLocaleString();
    return `
      <div class="order-card">
        <div class="order-top">
          <span class="order-id">${order.id}</span>
          <span class="order-status ${order.status}">${statusLabels[order.status]}</span>
        </div>
        <div class="order-customer">👤 ${order.customer} (${order.roll}) · ${time}</div>
        <div class="order-items">🍽️ ${itemsList}</div>
        <div class="order-bottom">
          <span class="order-total">${order.total}</span>
          <div class="order-actions">
            ${order.status !== 'picked' ? `<button class="btn btn-success btn-sm" onclick="updateOrderStatus('${order.id}')">${nextLabels[order.status]}</button>` : ''}
            <button class="btn btn-danger btn-sm" onclick="deleteOrder('${order.id}')">Delete</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateStats() {
  const items = getMenuItems();
  const orders = getOrders();
  const revenue = orders.reduce((sum, o) => sum + o.total, 0);

  document.getElementById('stat-items').textContent = items.length;
  document.getElementById('stat-orders').textContent = orders.length;
  document.getElementById('stat-revenue').textContent = `₹${revenue}`;
}

// ====== STUDENT ORDER HISTORY ======
function renderStudentOrders() {
  const container = document.getElementById('student-orders-list');
  const roll = localStorage.getItem('canteen_student_roll');
  const allOrders = getOrders();

  // Show all orders if no roll saved, otherwise filter by roll
  const orders = roll ? allOrders.filter(o => o.roll === roll) : [];

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="no-orders">
        <span>📦</span>
        <p>${roll ? 'No orders found for your account.' : 'Place your first order to see it here!'}</p>
      </div>`;
    return;
  }

  const statusLabels = { pending: 'Pending', ready: 'Ready', picked: 'Picked Up' };
  const statusIcons = { pending: '⏳', ready: '✅', picked: '🎉' };
  const steps = ['pending', 'ready', 'picked'];

  container.innerHTML = orders.map(order => {
    const itemsList = order.items.map(i => `${i.name} × ${i.qty}`).join(', ');
    const time = new Date(order.time).toLocaleString();
    const stepIdx = steps.indexOf(order.status);

    const progressHTML = steps.map((step, idx) => {
      const done = idx <= stepIdx;
      const label = statusLabels[step];
      return `<div class="track-step ${done ? 'done' : ''}">
        <div class="track-dot"></div>
        <span>${label}</span>
      </div>`;
    }).join('<div class="track-line"></div>');

    return `
      <div class="order-card">
        <div class="order-top">
          <span class="order-id">${order.id}</span>
          <span class="order-status ${order.status}">${statusIcons[order.status]} ${statusLabels[order.status]}</span>
        </div>
        <div class="order-customer">🕐 ${time}</div>
        <div class="order-items">🍽️ ${itemsList}</div>
        <div class="order-tracker">${progressHTML}</div>
        <div class="order-bottom">
          <span class="order-total">${order.total}</span>
        </div>
      </div>`;
  }).join('');
}
