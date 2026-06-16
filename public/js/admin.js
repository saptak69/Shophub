let allProducts = [];
let allOrders = [];

// Removed the old 'showSection' logic since the new design handles both panels on one clean screen, 
// unless you specifically want the simple toggle to hide/show them. The HTML handles the visual toggle via the simple toggle button.

async function loadAdminProducts() {
  // Logic remains identical, purely fetching data
  try {
    const response = await fetch(`${API_URL}/products`);
    allProducts = await response.json();
    // displayAdminProducts() would go here if you decide to list them on the admin page later.
    // Right now the new admin.html focuses on adding items and viewing orders.
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

async function handleAddProduct(e) {
  e.preventDefault();

  const product = {
    name: document.getElementById('prodName').value,
    description: document.getElementById('prodDesc').value,
    price: parseFloat(document.getElementById('prodPrice').value),
    stock: parseInt(document.getElementById('prodStock').value),
    category: document.getElementById('prodCategory').value,
    image: document.getElementById('prodImage').value
  };

  const msgDiv = document.getElementById('adminMessage');

  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(product)
    });

    if (!response.ok) throw new Error('Failed to publish item.');

    msgDiv.innerHTML = '<span style="color: var(--success); font-size: 0.9rem;">Item published to catalog successfully.</span>';
    document.getElementById('addProductForm').reset();
    
    setTimeout(() => { msgDiv.innerHTML = ''; }, 3000);
  } catch (error) {
    msgDiv.innerHTML = `<span style="color: var(--error); font-size: 0.9rem;">Error: ${error.message}</span>`;
  }
}

async function loadAdminOrders() {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    allOrders = await response.json();
    displayAdminOrders();
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

function displayAdminOrders() {
  const tbody = document.getElementById('adminOrdersList');
  
  if (!allOrders || allOrders.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No active transactions.</td></tr>';
      return;
  }

  tbody.innerHTML = allOrders.map(order => `
    <tr>
      <td style="font-family: monospace; color: var(--text-muted);">${order._id.substring(0, 8)}...</td>
      <td>${order.userId?.name || 'Guest User'}</td>
      <td>
        <select onchange="updateOrderStatus('${order._id}', this.value)" style="padding: 0.25rem; border-radius: 4px; border: 1px solid var(--border-color); font-size: 0.85rem; outline: none;">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
      <td>
        <button class="btn btn-secondary btn-small" style="color: var(--error); padding: 0.25rem 0.75rem;" onclick="deleteOrder('${order._id}')">Remove</button>
      </td>
    </tr>
  `).join('');
}

async function updateOrderStatus(orderId, status) {
  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) throw new Error('Update failed');
  } catch (error) {
    alert('System Error: ' + error.message);
  }
}

async function deleteOrder(orderId) {
  if (!confirm('Permanently delete this record?')) return;

  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error('Deletion failed');
    loadAdminOrders();
  } catch (error) {
    alert('System Error: ' + error.message);
  }
}

const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
  addProductForm.addEventListener('submit', handleAddProduct);
}

document.addEventListener('DOMContentLoaded', () => {
  if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'index.html';
  } else {
    loadAdminOrders();
  }
});