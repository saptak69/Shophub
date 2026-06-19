// Global state
let currentUser = null;

function getAPIURL() {
  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return 'http://localhost:5000/api';
  }

  const explicitAPIURL = document.querySelector('meta[name="api-base-url"]')?.content?.trim();
  if (explicitAPIURL) {
    return `${explicitAPIURL.replace(/\/$/, '')}/api`;
  }

  return '/api';
}

const API_URL = getAPIURL();

function checkAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (token && user) {
    currentUser = user;
    updateNavigation();
    updateCartCount();
  }
}

function updateNavigation() {
  const authMenu = document.getElementById('auth-menu');
  const adminMenu = document.getElementById('admin-menu');
  const profileMenu = document.getElementById('profile-menu');

  if (currentUser) {
    if (authMenu) authMenu.style.display = 'none';
    if (profileMenu) profileMenu.style.display = 'block';

    if (adminMenu) {
      adminMenu.style.display = currentUser.role === 'admin' ? 'block' : 'none';
    }
  } else {
    if (authMenu) authMenu.style.display = 'block';
    if (profileMenu) profileMenu.style.display = 'none';
    if (adminMenu) adminMenu.style.display = 'none';
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  updateNavigation();
  window.location.href = 'index.html';
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartCountElements = document.querySelectorAll('.cart-count');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountElements.forEach((element) => {
    element.textContent = count;
  });
}

document.addEventListener('DOMContentLoaded', checkAuth);
