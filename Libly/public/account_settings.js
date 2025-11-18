document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    const currentUsernameElement = document.getElementById('currentUsername');
    if (currentUsernameElement) {
        currentUsernameElement.textContent = `Hello, ${currentUser}!`;
    }

    loadUserProfile();

    setupEventListeners();
});

function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
}

async function loadUserProfile() {
    try {
        const response = await fetch('/me/profile', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const profile = await response.json();
            populateProfileForm(profile);
        } else {
            showMessage('Failed to load profile data', 'error');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function populateProfileForm(profile) {
    document.getElementById('username').value = profile.username || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('createdAt').textContent = profile.created_at 
        ? new Date(profile.created_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'Unknown';
    document.getElementById('userRole').textContent = profile.role || 'member';
}

function setupEventListeners() {
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    document.getElementById('passwordForm').addEventListener('submit', handlePasswordChange);
    document.getElementById('deleteAccountForm').addEventListener('submit', handleDeleteAccount);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDeleteAccount);
    document.getElementById('cancelDeleteBtn').addEventListener('click', hideModal);
    document.getElementById('confirmModal').addEventListener('click', function(e) {
        if (e.target === this) {
            hideModal();
        }
    });

    const newPassword = document.getElementById('newPassword');
    const confirmPassword = document.getElementById('confirmNewPassword');
    
    confirmPassword.addEventListener('input', function() {
        validatePasswordConfirmation();
    });
    
    newPassword.addEventListener('input', function() {
        validatePasswordConfirmation();
    });
}

async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        username: formData.get('username').trim(),
        email: formData.get('email').trim() || null
    };

    if (data.username.length < 3) {
        showMessage('Username must be at least 3 characters long', 'error');
        return;
    }
    
    if (data.username.length > 50) {
        showMessage('Username must be less than 50 characters', 'error');
        return;
    }
    
    try {
        const response = await fetch('/me/profile', {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const result = await response.json();
            showMessage(result.message || 'Profile updated successfully!', 'success');

            if (data.username !== localStorage.getItem('currentUser')) {
                localStorage.setItem('currentUser', data.username);
                if (window.liblyNav) {
                    window.liblyNav.setUser(data.username);
                }
            }
        } else {
            const error = await response.json().catch(() => null);
            showMessage((error && error.error) || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

async function handlePasswordChange(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmNewPassword');

    if (newPassword.length < 6) {
        showMessage('New password must be at least 6 characters long', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match', 'error');
        return;
    }
    
    if (currentPassword === newPassword) {
        showMessage('New password must be different from current password', 'error');
        return;
    }
    
    try {
        const response = await fetch('/me/password', {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showMessage(result.message || 'Password changed successfully!', 'success');

            e.target.reset();
        } else {
            const error = await response.json().catch(() => null);
            showMessage((error && error.error) || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function handleDeleteAccount(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const password = formData.get('deletePassword');
    
    if (!password) {
        showMessage('Please enter your password to confirm account deletion', 'error');
        return;
    }

    window.tempDeletePassword = password;

    showModal();
}

function showModal() {
    document.getElementById('confirmModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideModal() {
    document.getElementById('confirmModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    delete window.tempDeletePassword;
}

async function confirmDeleteAccount() {
    if (!window.tempDeletePassword) {
        showMessage('Password verification failed', 'error');
        hideModal();
        return;
    }
    
    try {
        const response = await fetch('/me/account', {
            method: 'DELETE',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                password: window.tempDeletePassword
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showMessage(result.message || 'Account deleted successfully', 'success');

            setTimeout(() => {
                localStorage.removeItem('currentUser');
                localStorage.removeItem('currentUserRole');
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUserId');
                window.location.href = 'index.html';
            }, 2000);
        } else {
            const error = await response.json().catch(() => null);
            showMessage((error && error.error) || 'Failed to delete account', 'error');
            hideModal();
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        showMessage('Network error. Please try again.', 'error');
        hideModal();
    }
}

function validatePasswordConfirmation() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    const formGroup = document.getElementById('confirmNewPassword').closest('.form-group');
    
    if (confirmPassword && newPassword !== confirmPassword) {
        formGroup.classList.add('error');
        if (!formGroup.querySelector('.error-message')) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Passwords do not match';
            formGroup.appendChild(errorMsg);
        }
    } else {
        formGroup.classList.remove('error');
        const errorMsg = formGroup.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }
    }
}

function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }

    if (type === 'error') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
