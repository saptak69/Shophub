let cart = [];

function loadCart() {
  cart = JSON.parse(localStorage.getItem('cart') || '[]');
  displayCart();
}

function displayCart() {
  const cartItemsDiv = document.getElementById('cartItems');

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = `
      <div style="border: 1px dashed var(--border-color); padding: 4rem 2rem; text-align: center;">
        <p style="font-weight: 700; font-size: 1.2rem; margin-bottom: 1.5rem; color: var(--text-muted);">YOUR BAG IS EMPTY.</p>
        <a href="products.html" class="btn" style="border: 1px solid #fff; color: #fff;">BROWSE CATALOG</a>
      </div>
    `;
    document.getElementById('subtotal').textContent = 'Rs 0';
    document.getElementById('total').textContent = 'Rs 0';
    return;
  }

  let subtotal = 0;
  cartItemsDiv.innerHTML = cart.map((item, index) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    return `
      <div class="cart-line-item">
        <img src="${item.image}" alt="${item.name}" class="cart-line-image">
        
        <div class="cart-line-content">
          <div class="cart-line-header">
            <div>
              <div class="cart-line-name">${item.name}</div>
              <div class="cart-line-price">Rs ${Number(item.price).toLocaleString('en-IN')}</div>
            </div>
            <div class="cart-line-total">
              Rs ${Number(itemTotal).toLocaleString('en-IN')}
            </div>
          </div>
          
          <div class="cart-line-footer">
            <div class="cart-line-quantity">
              <button class="cart-qty-btn" onclick="updateQuantity(${index}, -1)">-</button>
              <input type="number" value="${item.quantity}" readonly class="cart-qty-input">
              <button class="cart-qty-btn" onclick="updateQuantity(${index}, 1)">+</button>
            </div>
            <button class="cart-remove-btn" onclick="removeFromCart(${index})">[ REMOVE ]</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const formattedTotal = `Rs ${Number(subtotal).toLocaleString('en-IN')}`;
  document.getElementById('subtotal').textContent = formattedTotal;
  document.getElementById('total').textContent = formattedTotal;
}

function updateQuantity(index, change) {
  if (!cart[index]) return;
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    removeFromCart(index);
    return;
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  loadCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
  loadCart();
  
}

document.addEventListener('DOMContentLoaded', loadCart);
