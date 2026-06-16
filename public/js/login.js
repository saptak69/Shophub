async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('loginError');

  if (!email || !password) {
    errorDiv.textContent = '❌ Please fill in all fields.';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    errorDiv.style.display = 'none';
    
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      errorDiv.textContent = '❌ ' + (data.message || 'Authentication failed. Please check your credentials.');
      errorDiv.style.display = 'block';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    updateNavigation();
    updateCartCount();
    
    // Inject clean success feedback
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.style.position = 'fixed';
    successMsg.style.top = '20px';
    successMsg.style.left = '50%';
    successMsg.style.transform = 'translateX(-50%)';
    successMsg.style.zIndex = '1000';
    successMsg.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
    successMsg.textContent = '✅ Sign in successful. Redirecting...';
    document.body.appendChild(successMsg);
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (error) {
    console.error('Login error:', error);
    errorDiv.textContent = '❌ Connection error. Please try again.';
    errorDiv.style.display = 'block';
  }
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}