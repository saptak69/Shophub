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

  tbody.innerHTML = orders.map((order) => {
    const statusStyles = getStatusColor(order.status);

    return `
      <tr>
        <td style="font-family:monospace;color:var(--text-soft);">${(order.id || order._id).substring(0, 8)}...</td>
        <td>Rs ${Number(order.totalPrice).toLocaleString('en-IN')}</td>
        <td><span class="status-badge" style="background:${statusStyles.bg};color:${statusStyles.text};">${order.status}</span></td>
        <td>${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
      </tr>
    `;
  }).join('');
}

function getStatusColor(status) {
  const styles = {
    pending: { bg: '#fef3c7', text: '#b45309' },
    confirmed: { bg: '#dbeafe', text: '#1d4ed8' },
    shipped: { bg: '#e0f2fe', text: '#0369a1' },
    delivered: { bg: '#dcfce7', text: '#15803d' }
  };

  return styles[status] || { bg: '#e2e8f0', text: '#475569' };
}

document.addEventListener('DOMContentLoaded', loadProfile);
