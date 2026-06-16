async function handleCheckout(e) {
  e.preventDefault();

  if (!currentUser) {
    alert('Please sign in to complete your purchase.');
    window.location.href = 'login.html';
    return;
  }

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (cart.length === 0) {
    alert('Your bag is empty.');
    return;
  }

  // Fixed form IDs to match checkout.html
  const shippingAddress = {
    street: document.getElementById('street').value.trim(),
    city: document.getElementById('city').value.trim(),
    state: document.getElementById('state').value.trim(),
    zipCode: document.getElementById('zipCode').value.trim(),
    country: document.getElementById('country').value.trim()
  };

  // Validate address fields
  if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
    alert('Please fill in all shipping details.');
    return;
  }

  const paymentMethod = document.getElementById('paymentMethod').value;

  const orderItems = cart.map(item => ({
    productId: item.productId,
    quantity: item.quantity
  }));

  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        items: orderItems,
        shippingAddress,
        paymentMethod
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Order failed');
    }

    const order = await response.json();
    localStorage.removeItem('cart');
    updateCartCount();
    
    alert('✅ Order placed successfully! Redirecting to profile...');
    setTimeout(() => {
      window.location.href = 'profile.html';
    }, 1500);
  } catch (error) {
    console.error('Checkout error:', error);
    alert('❌ Transaction Error: ' + error.message);
  }
}

function displayCheckoutSummary() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  let total = 0;
  let itemCount = 0;
  
  cart.forEach(item => {
    total += (item.price * item.quantity);
    itemCount += item.quantity;
  });

  const summaryItems = document.getElementById('summaryItems');
  const summaryTotal = document.getElementById('summaryTotal');
  
  if(summaryItems) summaryItems.textContent = itemCount;
  if(summaryTotal) summaryTotal.textContent = `₹${Number(total).toLocaleString('en-IN')}`;
}

const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
  checkoutForm.addEventListener('submit', handleCheckout);
  document.addEventListener('DOMContentLoaded', displayCheckoutSummary);
}