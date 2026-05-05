// ====== MAIN APP ======
let currentRole = null;

async function enterAsStudent() {
  currentRole = 'student';
  document.getElementById('role-badge').textContent = 'Student';
  document.getElementById('role-badge').className = 'topbar-role student';
  document.getElementById('cart-toggle').classList.remove('hidden');
  document.getElementById('my-orders-btn').classList.remove('hidden');

  showView('student-menu');
  await renderCategoryFilters();
  await renderStudentMenu();
  updateCartUI();
}

async function handleManagerLogin() {
  const pwd = document.getElementById('manager-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd })
    });

    const data = await res.json();

    if (data.success) {
      currentRole = 'manager';
      closeLoginModal();
      document.getElementById('role-badge').textContent = 'Manager';
      document.getElementById('role-badge').className = 'topbar-role manager';
      document.getElementById('cart-toggle').classList.add('hidden');
      document.getElementById('my-orders-btn').classList.add('hidden');

      showView('manager-dashboard');
      await renderManagerMenu();
      await renderManagerOrders();
      await updateStats();
      showToast('Welcome, Manager!', 'success');
    } else {
      showToast('Incorrect password.', 'error');
    }
  } catch (err) {
    showToast('Login failed. Please try again.', 'error');
  }
}

function switchManagerTab(tab) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  document.getElementById(`tab-${tab}`).classList.remove('hidden');
  const tabBtn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
  if (tabBtn) tabBtn.classList.add('active');

  if (tab === 'menu') renderManagerMenu();
  if (tab === 'orders') renderManagerOrders();
  if (tab === 'analytics') renderAnalytics();
}

function showMyOrders() {
  showView('student-orders');
  renderStudentOrders();
}

function goHome() {
  if (currentRole === 'student') {
    showView('student-menu');
    renderStudentMenu();
  } else if (currentRole === 'manager') {
    showView('manager-dashboard');
  }
}

function backToMenu() {
  enterAsStudent();
}

function logout() {
  currentRole = null;
  showView('landing');
  document.getElementById('cart-toggle').classList.add('hidden');
  document.getElementById('my-orders-btn').classList.add('hidden');
}

// Enter key support for login
document.getElementById('manager-password').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleManagerLogin();
});

// Initialize — no more localStorage seeding needed, backend handles it
(function init() {
  console.log('Campus Bites initialized — Spring Boot backend');
})();
