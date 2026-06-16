// Carousel functionality
let currentSlideIndex = 0;
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
  slides.forEach(slide => slide.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));
  
  slides[index].classList.add('active');
  dots[index].classList.add('active');
}

function currentSlide(index) {
  currentSlideIndex = index;
  showSlide(currentSlideIndex);
}

function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % slides.length;
  showSlide(currentSlideIndex);
}

// Auto-rotate carousel every 5 seconds
setInterval(nextSlide, 5000);

// Load featured products
async function loadFeaturedProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products (${response.status})`);
    }

    const payload = await response.json();
    const products = Array.isArray(payload) ? payload : [];
    
    // Get top 6 products
    const featured = products.slice(0, 6);
    displayFeaturedProducts(featured);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function displayFeaturedProducts(products) {
  const container = document.getElementById('featured-products');
  container.innerHTML = '';
  
  products.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/240x200?text=${encodeURIComponent(product.name)}'">
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <div class="product-price">₹${product.price.toLocaleString('en-IN')}</div>
        <button class="btn btn-primary btn-small" onclick="addToCartFromHome('${product.id || product._id}', '${product.name}', ${product.price})">
          Add to Cart
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function addToCartFromHome(productId, productName, price) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  const existingItem = cart.find(item => item.productId === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId,
      name: productName,
      price,
      quantity: 1
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  
  // Show feedback
  alert(`${productName} added to cart!`);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadFeaturedProducts();
});
