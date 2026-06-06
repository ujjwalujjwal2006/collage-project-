// ====== MENU MANAGEMENT (API-backed) ======
let cachedMenuItems = [];
let uploadedImageData = '';

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) { uploadedImageData = ''; document.getElementById('image-preview').style.display = 'none'; return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedImageData = e.target.result;
    document.getElementById('image-preview').style.display = 'block';
    document.getElementById('image-preview-img').src = uploadedImageData;
  };
  reader.readAsDataURL(file);
}

async function fetchMenuItems(category, search) {
  let url = '/api/menu';
  const params = new URLSearchParams();
  if (category && category !== 'All') params.set('category', category);
  if (search) params.set('search', search);
  if (params.toString()) url += '?' + params.toString();

  const res = await fetch(url);
  const items = await res.json();
  cachedMenuItems = items;
  return items;
}

async function fetchCategories() {
  const res = await fetch('/api/menu/categories');
  return await res.json();
}

async function addMenuItem() {
  const name = document.getElementById('item-name').value.trim();
  const price = parseInt(document.getElementById('item-price').value);
  const category = document.getElementById('item-category').value;
  const desc = document.getElementById('item-desc').value.trim();
  const imageFile = document.getElementById('item-image').files[0];

  if (!name || isNaN(price) || price <= 0) {
    showToast('Please fill in name and a valid price.', 'error');
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('price', price);
  formData.append('category', category);
  formData.append('description', desc || 'Delicious food item.');

  if (imageFile) {
    formData.append('image', imageFile);
  } else if (uploadedImageData) {
    formData.append('imageUrl', uploadedImageData);
  }

  try {
    const res = await fetch('/api/menu', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Failed to add item');

    // Reset form
    document.getElementById('item-name').value = '';
    document.getElementById('item-price').value = '';
    document.getElementById('item-desc').value = '';
    uploadedImageData = '';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('item-image').value = '';

    showToast(`"${name}" added to menu!`, 'success');
    renderManagerMenu();
    updateStats();
    switchManagerTab('menu');
  } catch (err) {
    showToast('Error adding item: ' + err.message, 'error');
  }
}

async function deleteMenuItem(id) {
  try {
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    showToast('Item removed from menu.', 'info');
    renderManagerMenu();
    updateStats();
  } catch (err) {
    showToast('Error deleting item.', 'error');
  }
}

// ====== RENDER STUDENT MENU ======
let activeCategory = 'All';
let searchQuery = '';

async function renderStudentMenu() {
  const grid = document.getElementById('menu-grid');
  const empty = document.getElementById('menu-empty');

  const items = await fetchMenuItems(
    activeCategory !== 'All' ? activeCategory : null,
    searchQuery || null
  );

  if (items.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  grid.innerHTML = items.map(item => `
    <div class="menu-card">
      <img class="menu-card-img" src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'">
      <div class="menu-card-body">
        <span class="menu-card-cat">${escapeHtml(item.category)}</span>
        <h3 class="menu-card-name">${escapeHtml(item.name)}</h3>
        <p class="menu-card-desc">${escapeHtml(item.description)}</p>
        <div class="menu-card-footer">
          <span class="menu-card-price">${item.price}</span>
          <button class="add-cart-btn" onclick="addToCart(${item.id})">+ Add</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function renderCategoryFilters() {
  const container = document.getElementById('category-filters');
  const categories = await fetchCategories();
  const allCategories = ['All', ...categories];
  container.innerHTML = allCategories.map(cat => `
    <button class="cat-btn ${cat === activeCategory ? 'active' : ''}" onclick="filterCategory('${cat}')">${cat}</button>
  `).join('');
}

function filterCategory(cat) {
  activeCategory = cat;
  renderCategoryFilters();
  renderStudentMenu();
}

function handleSearch() {
  searchQuery = document.getElementById('search-input').value;
  renderStudentMenu();
}

// ====== RENDER MANAGER MENU ======
async function renderManagerMenu() {
  const grid = document.getElementById('manager-menu-grid');
  const items = await fetchMenuItems();

  if (items.length === 0) {
    grid.innerHTML = '<div class="no-orders"><span>📋</span><p>No menu items yet. Add your first item!</p></div>';
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="manager-menu-card">
      <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.name)}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'">
      <div class="info">
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.category)}</p>
      </div>
      <span class="price">${item.price}</span>
      <button class="btn btn-danger btn-sm" onclick="deleteMenuItem(${item.id})">Delete</button>
    </div>
  `).join('');
}
