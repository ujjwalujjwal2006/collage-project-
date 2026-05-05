// ====== MENU MANAGEMENT ======
const DEFAULT_MENU = [
  { id: 1, name: 'Samosa', price: 15, category: 'Snacks', desc: 'Crispy fried pastry with spiced potato filling.', image: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?w=400&h=300&fit=crop' },
  { id: 2, name: 'Vada Pav', price: 20, category: 'Snacks', desc: 'Mumbai-style spicy potato fritter in a bun.', image: 'https://images.unsplash.com/photo-1606491956689-2ea866880049?w=400&h=300&fit=crop' },
  { id: 3, name: 'Masala Dosa', price: 50, category: 'Meals', desc: 'Thin crispy crepe with spiced potato filling.', image: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=400&h=300&fit=crop' },
  { id: 4, name: 'Paneer Wrap', price: 60, category: 'Meals', desc: 'Grilled paneer with veggies wrapped in roti.', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop' },
  { id: 5, name: 'Cold Coffee', price: 40, category: 'Beverages', desc: 'Chilled blended coffee with milk and ice cream.', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop' },
  { id: 6, name: 'Masala Chai', price: 15, category: 'Beverages', desc: 'Traditional Indian spiced tea brewed to perfection.', image: 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=400&h=300&fit=crop' },
  { id: 7, name: 'Veg Thali', price: 80, category: 'Meals', desc: 'Complete meal with roti, rice, dal, sabzi, and salad.', image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop' },
  { id: 8, name: 'Gulab Jamun', price: 30, category: 'Desserts', desc: 'Soft milk-solid dumplings soaked in rose syrup.', image: 'https://images.unsplash.com/photo-1666190073498-0fe0946e9dea?w=400&h=300&fit=crop' },
];

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

function getMenuItems() {
  const stored = localStorage.getItem('canteen_menu');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('canteen_menu', JSON.stringify(DEFAULT_MENU));
  return DEFAULT_MENU;
}

function saveMenuItems(items) {
  localStorage.setItem('canteen_menu', JSON.stringify(items));
}

function addMenuItem() {
  const name = document.getElementById('item-name').value.trim();
  const price = parseInt(document.getElementById('item-price').value);
  const category = document.getElementById('item-category').value;
  const desc = document.getElementById('item-desc').value.trim();
  const image = uploadedImageData;

  if (!name || !price) {
    showToast('Please fill in name and price.', 'error');
    return;
  }

  const items = getMenuItems();
  const newItem = {
    id: Date.now(),
    name,
    price,
    category,
    desc: desc || 'Delicious food item.',
    image: image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
  };
  items.push(newItem);
  saveMenuItems(items);

  // Reset form
  document.getElementById('item-name').value = '';
  document.getElementById('item-price').value = '';
  document.getElementById('item-desc').value = '';
  uploadedImageData = '';
  document.getElementById('image-preview').style.display = 'none';
  document.getElementById('item-image').value = null;

  showToast(`"${name}" added to menu!`, 'success');
  renderManagerMenu();
  updateStats();
  switchManagerTab('menu');
}

function deleteMenuItem(id) {
  let items = getMenuItems();
  const item = items.find(i => i.id === id);
  items = items.filter(i => i.id !== id);
  saveMenuItems(items);
  showToast(`"${item?.name}" removed from menu.`, 'info');
  renderManagerMenu();
  updateStats();
}

function getCategories() {
  const items = getMenuItems();
  return ['All', ...new Set(items.map(i => i.category))];
}

// ====== RENDER STUDENT MENU ======
let activeCategory = 'All';
let searchQuery = '';

function renderStudentMenu() {
  const grid = document.getElementById('menu-grid');
  const empty = document.getElementById('menu-empty');
  let items = getMenuItems();

  if (activeCategory !== 'All') {
    items = items.filter(i => i.category === activeCategory);
  }
  if (searchQuery) {
    items = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  if (items.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }

  empty.classList.add('hidden');
  grid.innerHTML = items.map(item => `
    <div class="menu-card">
      <img class="menu-card-img" src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'">
      <div class="menu-card-body">
        <span class="menu-card-cat">${item.category}</span>
        <h3 class="menu-card-name">${item.name}</h3>
        <p class="menu-card-desc">${item.desc}</p>
        <div class="menu-card-footer">
          <span class="menu-card-price">${item.price}</span>
          <button class="add-cart-btn" onclick="addToCart(${item.id})">+ Add</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderCategoryFilters() {
  const container = document.getElementById('category-filters');
  const categories = getCategories();
  container.innerHTML = categories.map(cat => `
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
function renderManagerMenu() {
  const grid = document.getElementById('manager-menu-grid');
  const items = getMenuItems();

  if (items.length === 0) {
    grid.innerHTML = '<div class="no-orders"><span>📋</span><p>No menu items yet. Add your first item!</p></div>';
    return;
  }

  grid.innerHTML = items.map(item => `
    <div class="manager-menu-card">
      <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'">
      <div class="info">
        <h3>${item.name}</h3>
        <p>${item.category}</p>
      </div>
      <span class="price">${item.price}</span>
      <button class="btn btn-danger btn-sm" onclick="deleteMenuItem(${item.id})">Delete</button>
    </div>
  `).join('');
}
