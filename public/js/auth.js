// Global state
let currentUser = null;

// Determine API URL based on environment
function getAPIURL() {
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:5000/api';
  }
  // For production, use relative path so it works on any domain
  return '/api';
}

const API_URL = getAPIURL();

// Check if user is logged in
function checkAuth() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  if (token && user) {
    currentUser = user;
    updateNavigation();
    updateCartCount();
  }
}

// Update navigation based on user role
function updateNavigation() {
  const authMenu = document.getElementById('auth-menu');
  const adminMenu = document.getElementById('admin-menu');
  const profileMenu = document.getElementById('profile-menu');

  if (currentUser) {
    authMenu.style.display = 'none';
    profileMenu.style.display = 'block';

    if (currentUser.role === 'admin') {
      adminMenu.style.display = 'block';
    }
  } else {
    authMenu.style.display = 'block';
    profileMenu.style.display = 'none';
    adminMenu.style.display = 'none';
  }
}

// Logout
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentUser = null;
  updateNavigation();
  window.location.href = 'index.html';
}

// Update cart count
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartCountElements = document.querySelectorAll('.cart-count');
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCountElements.forEach(el => el.textContent = count);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', checkAuth);
