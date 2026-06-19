let allOrders = [];

function showSection(section) {
  document.querySelectorAll('.admin-section-content').forEach((content) => {
    content.classList.remove('active');
  });

  document.querySelectorAll('.admin-nav a').forEach((link) => {
    link.classList.remove('active');
  });

  const activeSection = document.getElementById(`${section}-section`);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  const activeLink = Array.from(document.querySelectorAll('.admin-nav a')).find((link) => link.textContent.toLowerCase().includes(section === 'products' ? 'catalog' : 'order'));
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

async function handleAddProduct(event) {
  event.preventDefault();

  const product = {
    name: document.getElementById('prodName').value,
    description: document.getElementById('prodDesc').value,
    price: parseFloat(document.getElementById('prodPrice').value),
    stock: parseInt(document.getElementById('prodStock').value, 10),
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

    if (!response.ok) {
      throw new Error('Failed to publish item.');
    }

    msgDiv.className = 'admin-message success';
    msgDiv.textContent = 'Item published to the catalog successfully.';
    document.getElementById('addProductForm').reset();
  } catch (error) {
    msgDiv.className = 'error-message';
    msgDiv.textContent = `Error: ${error.message}`;
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

  tbody.innerHTML = allOrders.map((order) => `
    <tr>
      <td style="font-family:monospace;color:var(--text-soft);">${order._id.substring(0, 8)}...</td>
      <td>${order.userId?.name || order.userName || 'Guest user'}</td>
      <td>
        <select class="admin-inline-select" onchange="updateOrderStatus('${order._id}', this.value)">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
      <td>
        <button class="btn btn-secondary btn-small admin-danger" onclick="deleteOrder('${order._id}')">Remove</button>
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

    if (!response.ok) {
      throw new Error('Update failed');
    }
  } catch (error) {
    alert(`System error: ${error.message}`);
  }
}

async function deleteOrder(orderId) {
  if (!confirm('Permanently delete this record?')) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Deletion failed');
    }

    loadAdminOrders();
  } catch (error) {
    alert(`System error: ${error.message}`);
  }
}

const addProductForm = document.getElementById('addProductForm');
if (addProductForm) {
  addProductForm.addEventListener('submit', handleAddProduct);
}

document.addEventListener('DOMContentLoaded', () => {
  if (!currentUser || currentUser.role !== 'admin') {
    window.location.href = 'index.html';
    return;
  }

  loadAdminOrders();
});
