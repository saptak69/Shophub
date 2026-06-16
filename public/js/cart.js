let cart = [];

function loadCart() {
  cart = JSON.parse(localStorage.getItem('cart') || '[]');
  displayCart();
}

function displayCart() {
  const cartItemsDiv = document.getElementById('cartItems');

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `
      <div class="empty-state">
        <p style="margin-bottom: 1.5rem; font-size: 1.1rem;">Your bag is currently empty.</p>
        <a href="products.html" class="btn btn-primary">Browse Collection</a>
      </div>
    `;
    document.getElementById('subtotal').textContent = '₹0';
    document.getElementById('total').textContent = '₹0';
    return;
  }

  let subtotal = 0;
  cartItemsDiv.innerHTML = cart.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 6px; background: var(--bg-main);">
        <div class="cart-item-info" style="margin-left: 1.5rem;">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${Number(item.price).toLocaleString('en-IN')}</div>
        </div>
        <div class="cart-item-quantity">
          <button class="btn btn-secondary btn-small" style="padding: 0.25rem 0.6rem; border-color: var(--border-color);" onclick="updateQuantity(${index}, -1)">-</button>
          <input type="number" value="${item.quantity}" readonly style="width: 45px; text-align: center; border: none; background: transparent; font-weight: 500;">
          <button class="btn btn-secondary btn-small" style="padding: 0.25rem 0.6rem; border-color: var(--border-color);" onclick="updateQuantity(${index}, 1)">+</button>
        </div>
        <div style="text-align: right; min-width: 100px;">
          <div style="color: var(--text-main); font-weight: 700; margin-bottom: 0.5rem;">₹${Number(itemTotal).toLocaleString('en-IN')}</div>
          <button class="btn btn-secondary btn-small" style="color: var(--error); border-color: var(--border-color); font-size: 0.8rem;" onclick="removeFromCart(${index})">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  const formattedTotal = `₹${Number(subtotal).toLocaleString('en-IN')}`;
  document.getElementById('subtotal').textContent = formattedTotal;
  document.getElementById('total').textContent = formattedTotal;
}

function updateQuantity(index, change) {
  if (cart[index]) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      removeFromCart(index);
    } else {
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartCount();
      loadCart();
    }
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  loadCart();
}

document.addEventListener('DOMContentLoaded', loadCart);