// Register page
async function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorDiv = document.getElementById('registerError');

  if (!name || !email || !password) {
    errorDiv.textContent = '❌ Please fill in all fields';
    errorDiv.style.display = 'block';
    return;
  }

  if (password.length < 6) {
    errorDiv.textContent = '❌ Password must be at least 6 characters';
    errorDiv.style.display = 'block';
    return;
  }

  try {
    errorDiv.style.display = 'none';
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      errorDiv.textContent = '❌ ' + (data.message || 'Registration failed');
      errorDiv.style.display = 'block';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    currentUser = data.user;
    updateNavigation();
    updateCartCount();
    
    // Show success message
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.textContent = '✅ Registration successful! Redirecting...';
    document.body.insertBefore(successMsg, document.body.firstChild);
    
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (error) {
    console.error('Register error:', error);
    errorDiv.textContent = '❌ Connection error. Please try again.';
    errorDiv.style.display = 'block';
  }
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', handleRegister);
}
