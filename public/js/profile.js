async function loadProfile() {
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('userName').textContent = currentUser.name || currentUser.email.split('@')[0];
  document.getElementById('userEmail').textContent = currentUser.email;
  document.getElementById('userRole').textContent = currentUser.role || 'Customer';

  loadUserOrders();
}

async function loadUserOrders() {
  try {
    const response = await fetch(`${API_URL}/orders/my-orders`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    const orders = await response.json();
    displayUserOrders(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
    document.getElementById('ordersTableBody').innerHTML = '<tr><td colspan="4" class="empty-state">Error loading orders.</td></tr>';
  }
}

function displayUserOrders(orders) {
  const tbody = document.getElementById('ordersTableBody');

  if (!orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No transaction history found.</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td style="font-family: monospace; color: #999;">${order.id.substring(0, 8)}...</td>
      <td>₹${Number(order.totalPrice).toLocaleString('en-IN')}</td>
      <td>
        <span style="background: ${getStatusColor(order.status).bg}; color: ${getStatusColor(order.status).text}; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem; font-weight: 500; text-transform: capitalize;">
          ${order.status}
        </span>
      </td>
      <td>${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
    </tr>
  `).join('');
}

function getStatusColor(status) {
  const styles = {
    pending: { bg: '#fef3c7', text: '#d97706' },
    confirmed: { bg: '#e0e7ff', text: '#4338ca' },
    shipped: { bg: '#f3e8ff', text: '#7e22ce' },
    delivered: { bg: '#dcfce3', text: '#15803d' }
  };
  return styles[status] || { bg: '#f1f5f9', text: '#64748b' };
}

document.addEventListener('DOMContentLoaded', loadProfile);