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
      <div style="display: flex; gap: 1.5rem; background: var(--bg-surface); border: 1px solid var(--border-color); padding: 1.5rem; margin-bottom: 1rem; transition: border 0.2s;">
        <img src="${item.image}" alt="${item.name}" style="width: 120px; height: 120px; object-fit: cover; border: 1px solid var(--border-color); filter: contrast(1.1);">
        
        <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <div style="font-family: var(--font-display); font-size: 1.8rem; text-transform: uppercase; line-height: 1; margin-bottom: 0.5rem;">${item.name}</div>
              <div style="color: var(--accent); font-weight: bold; font-size: 1.2rem;">Rs ${Number(item.price).toLocaleString('en-IN')}</div>
            </div>
            <div style="font-weight: bold; font-size: 1.2rem;">
              Rs ${Number(itemTotal).toLocaleString('en-IN')}
            </div>
          </div>
          
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 1rem;">
            <div style="display: flex; align-items: center; border: 1px solid var(--border-color); background: #000;">
              <button style="background: none; border: none; color: #fff; padding: 0.5rem 1rem; cursor: pointer; font-weight: bold;" onclick="updateQuantity(${index}, -1)">-</button>
              <input type="number" value="${item.quantity}" readonly style="width: 50px; text-align: center; background: none; border: none; color: #fff; border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color); padding: 0.5rem; font-family: var(--font-mono); font-weight: bold;">
              <button style="background: none; border: none; color: #fff; padding: 0.5rem 1rem; cursor: pointer; font-weight: bold;" onclick="updateQuantity(${index}, 1)">+</button>
            </div>
            <button style="background: none; border: none; color: #ff3333; text-transform: uppercase; font-size: 0.9rem; font-weight: bold; cursor: pointer; letter-spacing: 1px;" onclick="removeFromCart(${index})">[ REMOVE ]</button>
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