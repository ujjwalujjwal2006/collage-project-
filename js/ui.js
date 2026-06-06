// ====== UI HELPERS ======
function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(String(str)));
  return div.innerHTML;
}
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || icons.info}</span> ${message}`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s ease-in forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function showView(viewId) {
  const views = ['landing', 'student-menu', 'student-orders', 'manager-dashboard', 'order-success'];
  views.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('hidden', id !== viewId);
  });
  const topbar = document.getElementById('topbar');
  topbar.classList.toggle('hidden', viewId === 'landing');
}

function openLoginModal() {
  document.getElementById('login-modal').classList.add('active');
  document.getElementById('manager-password').value = '';
  document.getElementById('manager-password').focus();
}

function closeLoginModal() {
  document.getElementById('login-modal').classList.remove('active');
}
