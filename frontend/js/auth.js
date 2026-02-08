const API_BASE = '/api';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const toast = document.getElementById('toast');

// Check if already logged in
if (localStorage.getItem('token')) {
  window.location.href = 'index.html';
}

// Login Handler
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = loginForm.querySelector('button');

    setLoading(btn, true);

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Login failed');
      }

      // Save token and user info
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      showToast('Login successful!', 'success');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);

    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(btn, false);
    }
  });
}

// Register Handler
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = registerForm.querySelector('button');

    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(btn, true);

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Registration failed');
      }

      // Save token and user info
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      
      showToast('Account created successfully!', 'success');
      
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);

    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setLoading(btn, false);
    }
  });
}

// ===================================
// Helper Functions
// ===================================

function setLoading(btn, isLoading) {
  const text = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  
  btn.disabled = isLoading;
  text.classList.toggle('hidden', isLoading);
  loader.classList.toggle('hidden', !isLoading);
}

function showToast(message, type = 'info') {
  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };
  
  toast.querySelector('.toast-icon').textContent = icons[type] || icons.info;
  toast.querySelector('.toast-message').textContent = message;
  toast.className = `toast ${type}`;
  
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('show'), 10);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 3000);
}
