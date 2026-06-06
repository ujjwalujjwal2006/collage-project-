// ====== ORDER MANAGEMENT (API-backed) ======

async function placeOrder() {
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

  const orderData = {
    customer: name,
    roll: roll,
    items: cart.map(c => ({ name: c.name, qty: c.qty, price: c.price }))
  };

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    if (!res.ok) throw new Error('Failed to place order');
    const order = await res.json();

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
  } catch (err) {
    showToast('Error placing order: ' + err.message, 'error');
  }
}

async function updateOrderStatus(orderId) {
  try {
    const res = await fetch(`/api/orders/${orderId}/advance`, { method: 'PUT' });
    if (!res.ok) throw new Error('Failed to update status');
    const order = await res.json();
    renderManagerOrders();
    updateStats();
    showToast(`Order ${orderId} marked as ${order.status.toLowerCase()}.`, 'success');
  } catch (err) {
    showToast('Error updating order.', 'error');
  }
}

async function deleteOrder(orderId) {
  try {
    await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    renderManagerOrders();
    updateStats();
    showToast('Order deleted.', 'info');
  } catch (err) {
    showToast('Error deleting order.', 'error');
  }
}

// ====== RENDER ORDERS ======
async function renderManagerOrders() {
  const container = document.getElementById('manager-orders-list');

  try {
    const res = await fetch('/api/orders');
    const orders = await res.json();

    if (orders.length === 0) {
      container.innerHTML = '<div class="no-orders"><span>📦</span><p>No orders yet.</p></div>';
      return;
    }

    const statusLabels = { PENDING: 'Pending', READY: 'Ready', PICKED: 'Picked Up' };
    const statusClasses = { PENDING: 'pending', READY: 'ready', PICKED: 'picked' };
    const nextLabels = { PENDING: 'Mark Ready', READY: 'Mark Picked Up' };

    container.innerHTML = orders.map(order => {
      const itemsList = order.items.map(i => `${escapeHtml(i.name)} x${i.quantity}`).join(', ');
      const time = new Date(order.createdAt).toLocaleString();
      const statusClass = statusClasses[order.status] || 'pending';
      return `
        <div class="order-card">
          <div class="order-top">
            <span class="order-id">${order.id}</span>
            <span class="order-status ${statusClass}">${statusLabels[order.status]}</span>
          </div>
          <div class="order-customer">👤 ${escapeHtml(order.customerName)} (${escapeHtml(order.rollNumber)}) · ${time}</div>
          <div class="order-items">🍽️ ${escapeHtml(itemsList)}</div>
          <div class="order-bottom">
            <span class="order-total">${order.total}</span>
            <div class="order-actions">
              ${order.status !== 'PICKED' ? `<button class="btn btn-success btn-sm" onclick="updateOrderStatus('${order.id}')">${nextLabels[order.status]}</button>` : ''}
              <button class="btn btn-danger btn-sm" onclick="deleteOrder('${order.id}')">Delete</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = '<div class="no-orders"><span>⚠️</span><p>Error loading orders.</p></div>';
  }
}

async function updateStats() {
  try {
    const res = await fetch('/api/orders/stats');
    const stats = await res.json();
    document.getElementById('stat-items').textContent = stats.totalItems;
    document.getElementById('stat-orders').textContent = stats.totalOrders;
    document.getElementById('stat-revenue').textContent = `₹${stats.totalRevenue}`;
  } catch (err) {
    console.error('Error fetching stats:', err);
  }
}

// ====== STUDENT ORDER HISTORY ======
async function renderStudentOrders() {
  const container = document.getElementById('student-orders-list');
  const roll = localStorage.getItem('canteen_student_roll');

  if (!roll) {
    container.innerHTML = `
      <div class="no-orders">
        <span>📦</span>
        <p>Place your first order to see it here!</p>
      </div>`;
    return;
  }

  try {
    const res = await fetch(`/api/orders?roll=${encodeURIComponent(roll)}`);
    const orders = await res.json();

    if (orders.length === 0) {
      container.innerHTML = `
        <div class="no-orders">
          <span>📦</span>
          <p>No orders found for your account.</p>
        </div>`;
      return;
    }

    const statusLabels = { PENDING: 'Pending', READY: 'Ready', PICKED: 'Picked Up' };
    const statusIcons = { PENDING: '⏳', READY: '✅', PICKED: '🎉' };
    const statusClasses = { PENDING: 'pending', READY: 'ready', PICKED: 'picked' };
    const steps = ['PENDING', 'READY', 'PICKED'];

    container.innerHTML = orders.map(order => {
      const itemsList = order.items.map(i => `${escapeHtml(i.name)} × ${i.quantity}`).join(', ');
      const time = new Date(order.createdAt).toLocaleString();
      const stepIdx = steps.indexOf(order.status);
      const statusClass = statusClasses[order.status] || 'pending';

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
            <span class="order-status ${statusClass}">${statusIcons[order.status]} ${statusLabels[order.status]}</span>
          </div>
          <div class="order-customer">🕐 ${time}</div>
          <div class="order-items">🍽️ ${escapeHtml(itemsList)}</div>
          <div class="order-tracker">${progressHTML}</div>
          <div class="order-bottom">
            <span class="order-total">${order.total}</span>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    container.innerHTML = '<div class="no-orders"><span>⚠️</span><p>Error loading orders.</p></div>';
  }
}

// ====== ANALYTICS / REVENUE CHARTS ======
let monthlyChartInstance = null;
let weeklyChartInstance = null;

async function renderAnalytics() {
  try {
    const res = await fetch('/api/orders/stats/revenue');
    const data = await res.json();

    // Update summary cards
    document.getElementById('analytics-today-revenue').textContent = `₹${data.todayRevenue}`;
    document.getElementById('analytics-today-orders').textContent = `${data.todayOrders} order${data.todayOrders !== 1 ? 's' : ''}`;
    document.getElementById('analytics-week-revenue').textContent = `₹${data.weekRevenue}`;
    document.getElementById('analytics-week-orders').textContent = `${data.weekOrders} order${data.weekOrders !== 1 ? 's' : ''}`;
    document.getElementById('analytics-month-revenue').textContent = `₹${data.monthRevenue}`;
    document.getElementById('analytics-month-orders').textContent = `${data.monthOrders} order${data.monthOrders !== 1 ? 's' : ''}`;

    // Render charts
    renderMonthlyChart(data.monthly);
    renderWeeklyChart(data.weekly);
  } catch (err) {
    console.error('Error loading analytics:', err);
  }
}

function getChartConfig(labels, revenueData, ordersData, accentColor, accentRgb) {
  return {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Revenue (₹)',
          data: revenueData,
          backgroundColor: function(context) {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return accentColor;
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, `rgba(${accentRgb}, 0.3)`);
            gradient.addColorStop(1, `rgba(${accentRgb}, 0.85)`);
            return gradient;
          },
          borderColor: accentColor,
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
          yAxisID: 'y',
          order: 2
        },
        {
          label: 'Orders',
          data: ordersData,
          type: 'line',
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2.5,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#0a0a0f',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
          yAxisID: 'y1',
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: '#8a8a9a',
            font: { family: 'Inter', size: 12, weight: '500' },
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: '#1a1a2e',
          titleColor: '#f0f0f5',
          bodyColor: '#8a8a9a',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          cornerRadius: 10,
          padding: 14,
          titleFont: { family: 'Inter', size: 13, weight: '600' },
          bodyFont: { family: 'Inter', size: 12 },
          callbacks: {
            label: function(context) {
              if (context.dataset.label === 'Revenue (₹)') {
                return ` Revenue: ₹${context.parsed.y}`;
              }
              return ` Orders: ${context.parsed.y}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          ticks: {
            color: '#55556a',
            font: { family: 'Inter', size: 11, weight: '500' },
            maxRotation: 45,
            minRotation: 0
          },
          border: { display: false }
        },
        y: {
          position: 'left',
          grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          ticks: {
            color: '#55556a',
            font: { family: 'Inter', size: 11 },
            callback: function(value) { return '₹' + value; }
          },
          border: { display: false },
          beginAtZero: true
        },
        y1: {
          position: 'right',
          grid: { display: false },
          ticks: {
            color: '#22c55e',
            font: { family: 'Inter', size: 11 },
            stepSize: 1
          },
          border: { display: false },
          beginAtZero: true
        }
      }
    }
  };
}

function renderMonthlyChart(monthlyData) {
  const canvas = document.getElementById('monthlyChart');
  if (!canvas) return;

  // Destroy previous instance
  if (monthlyChartInstance) {
    monthlyChartInstance.destroy();
    monthlyChartInstance = null;
  }

  const labels = monthlyData.map(d => d.label);
  const revenues = monthlyData.map(d => d.revenue);
  const orders = monthlyData.map(d => d.orders);

  const config = getChartConfig(labels, revenues, orders, '#f59e0b', '245, 158, 11');
  monthlyChartInstance = new Chart(canvas, config);
}

function renderWeeklyChart(weeklyData) {
  const canvas = document.getElementById('weeklyChart');
  if (!canvas) return;

  // Destroy previous instance
  if (weeklyChartInstance) {
    weeklyChartInstance.destroy();
    weeklyChartInstance = null;
  }

  const labels = weeklyData.map(d => d.label);
  const revenues = weeklyData.map(d => d.revenue);
  const orders = weeklyData.map(d => d.orders);

  const config = getChartConfig(labels, revenues, orders, '#3b82f6', '59, 130, 246');
  weeklyChartInstance = new Chart(canvas, config);
}

function showChart(type) {
  const monthlyContainer = document.getElementById('chart-monthly-container');
  const weeklyContainer = document.getElementById('chart-weekly-container');
  const monthlyBtn = document.getElementById('chart-monthly-btn');
  const weeklyBtn = document.getElementById('chart-weekly-btn');

  if (type === 'monthly') {
    monthlyContainer.classList.remove('hidden');
    weeklyContainer.classList.add('hidden');
    monthlyBtn.classList.add('active');
    weeklyBtn.classList.remove('active');
  } else {
    monthlyContainer.classList.add('hidden');
    weeklyContainer.classList.remove('hidden');
    monthlyBtn.classList.remove('active');
    weeklyBtn.classList.add('active');
  }
}
