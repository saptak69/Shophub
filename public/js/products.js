let allProducts = [];

function getCategoryFromQuery() {
  const params = new URLSearchParams(window.location.search);
  return params.get('category') || '';
}

function syncCategoryFilter(category) {
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.value = category;
  }
}

function normalizeCategory(category) {
  return (category || '').trim();
}

function updateURLCategory(category) {
  const url = new URL(window.location.href);
  if (category) {
    url.searchParams.set('category', category);
  } else {
    url.searchParams.delete('category');
  }
  window.history.replaceState({}, '', url);
}

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products (${response.status})`);
    }

    const payload = await response.json();
    allProducts = Array.isArray(payload) ? payload : [];
    const initialCategory = normalizeCategory(getCategoryFromQuery());
    syncCategoryFilter(initialCategory);
    filterProducts(initialCategory);
  } catch (error) {
    console.error('Error loading products:', error);
    document.getElementById('productsGrid').innerHTML = '<div style="color: var(--accent); font-weight: bold;">[!] FAILED TO PULL CATALOG DATA.</div>';
  }
}

function filterProducts(category) {
  const normalizedCategory = normalizeCategory(category);
  const filteredProducts = normalizedCategory
    ? allProducts.filter((product) => product.category === normalizedCategory)
    : allProducts;

  displayProducts(filteredProducts);
  updateURLCategory(normalizedCategory);
}

function displayProducts(products) {
  const productsGrid = document.getElementById('productsGrid');

  if (products.length === 0) {
    productsGrid.innerHTML = '<div style="color: var(--text-muted); font-weight: bold;">NO DROPS FOUND IN THIS CATEGORY.</div>';
    return;
  }

  // Injecting the new Brutalist HTML structure
  productsGrid.innerHTML = products.map((product) => `
    <article class="product-card">
      <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=400&auto=format&fit=crop'">
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-description">${product.description}</div>
        <div class="product-price">Rs ${Number(product.price).toLocaleString('en-IN')}</div>
        <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">[STOCK: ${product.stock}]</div>
        <button class="btn btn-primary" onclick="addToCart('${product.id || product._id}', '${product.name}', ${product.price}, '${product.image}')">
          Add To Bag
        </button>
      </div>
    </article>
  `).join('');
}

function addToCart(productId, name, price, image) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existingItem = cart.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ productId, name, price, image, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  // Trigger brutalist terminal-style toast notification
  const notify = document.getElementById('toast-notification');
  if (notify) {
    notify.textContent = `[+] ${name.toUpperCase()} LOCKED IN CART`;
    notify.classList.add('show');
    setTimeout(() => {
      notify.classList.remove('show');
    }, 2500);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (event) => {
      filterProducts(event.target.value);
    });
  }

  loadProducts();
});
