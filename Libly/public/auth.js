document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    document.querySelectorAll('.password-toggle').forEach(btn => {
        const container = btn.closest('.form-group');
        if (!container) return;
        const input = container.querySelector('input[type="password"]');
        if (!input) return;

        btn.addEventListener('click', () => {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            btn.classList.toggle('active', isPassword);
            btn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
            btn.title = isPassword ? 'Hide password' : 'Show password';
        });
    });

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

async function handleLogin(e) {
    e.preventDefault();
    const messageDiv = document.getElementById('message');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const result = await response.json();
            if (result.token && result.user) {
                localStorage.setItem('authToken', result.token);
                localStorage.setItem('currentUser', result.user.username);
                localStorage.setItem('currentUserRole', result.user.role);
                localStorage.setItem('currentUserId', result.user.id);
            }
            showMessage(result.message || 'Login successful!', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            const error = await response.json().catch(() => null);
            showMessage((error && (error.error || error.message)) || 'Login failed', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const messageDiv = document.getElementById('message');
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        showMessage('Passwords do not match!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password must be at least 6 characters long!', 'error');
        return;
    }
    
    if (username.length < 3) {
        showMessage('Username must be at least 3 characters long!', 'error');
        return;
    }
    
    try {
        const response = await fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            showMessage('Registration successful! You can now login.', 'success');
            
            document.getElementById('registerForm').reset();
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            const error = await response.text();
            showMessage(error || 'Registration failed. Please try again.', 'error');
        }
    } catch (error) {
        showMessage('Network error. Please try again.', 'error');
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    if (type === 'error') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}
