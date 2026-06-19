let currentSlideIndex = 0;
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
  slides.forEach((slide, slideIndex) => {
    slide.classList.toggle('active', slideIndex === index);
  });

  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle('active', dotIndex === index);
  });
}

function currentSlide(index) {
  currentSlideIndex = index;
  showSlide(currentSlideIndex);
}

function nextSlide() {
  currentSlideIndex = (currentSlideIndex + 1) % slides.length;
  showSlide(currentSlideIndex);
}

setInterval(nextSlide, 5500);

async function loadFeaturedProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products (${response.status})`);
    }

    const payload = await response.json();
    const products = Array.isArray(payload) ? payload : [];
    displayFeaturedProducts(products.slice(0, 6));
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function displayFeaturedProducts(products) {
  const container = document.getElementById('featured-products');
  container.innerHTML = '';

  products.forEach((product) => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-reveal', '');
    card.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/240x200?text=${encodeURIComponent(product.name)}'">
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-price">Rs ${Number(product.price).toLocaleString('en-IN')}</div>
        <button class="btn btn-primary btn-small" onclick="addToCartFromHome('${product.id || product._id}', '${product.name}', ${product.price}, '${product.image}')">
          Add to cart
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function addToCartFromHome(productId, productName, price, image = '') {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const existingItem = cart.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      productId,
      name: productName,
      price,
      image,
      quantity: 1
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  alert(`${productName} added to cart.`);
}

document.addEventListener('DOMContentLoaded', loadFeaturedProducts);
