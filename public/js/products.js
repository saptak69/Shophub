// Global State
let allProducts = [];

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products (${response.status})`);
    }

    const payload = await response.json();
    allProducts = Array.isArray(payload) ? payload : [];
    displayProducts(allProducts);
  } catch (error) {
    console.error('Error loading products:', error);
    document.getElementById('productsGrid').innerHTML = '<div class="empty-state"><p>Failed to load products.</p></div>';
  }
}

function displayProducts(products) {
  const productsGrid = document.getElementById('productsGrid');
  
  if (products.length === 0) {
    productsGrid.innerHTML = '<div class="empty-state"><p>No products found in this collection.</p></div>';
    return;
  }

  productsGrid.innerHTML = products.map(product => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/400x300?text=Image+Unavailable'">
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-description">${product.description}</div>
        <div class="product-price">₹${Number(product.price).toLocaleString('en-IN')}</div>
        <div class="product-stock">Available Units: ${product.stock}</div>
        <div class="product-actions">
          <button class="btn btn-primary" style="width: 100%;" onclick="addToCart('${product.id || product._id}', '${product.name}', ${product.price}, '${product.image}')">
            Add to Bag
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function addToCart(productId, name, price, image) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existingItem = cart.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ productId, name, price, image, quantity: 1 });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  alert(`${name} added to your bag.`);
}

// Category filter
const categoryFilter = document.getElementById('categoryFilter');
if (categoryFilter) {
  categoryFilter.addEventListener('change', (e) => {
    const category = e.target.value;
    const filtered = category ? allProducts.filter(p => p.category === category) : allProducts;
    displayProducts(filtered);
  });
}

// Load products on initialization
document.addEventListener('DOMContentLoaded', loadProducts);
