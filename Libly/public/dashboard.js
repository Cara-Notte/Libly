document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update UI with user info (XSS-safe)
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
        usernameElement.textContent = `Hello, ${currentUser}!`; // Already safe, but making it explicit
    }
    
    // Load initial data
    loadUsers();
    
    // Add event listeners
    document.getElementById('refreshUsers').addEventListener('click', loadUsers);
});

// Load users function
async function loadUsers() {
    try {
        const response = await fetch('/users');
        
        if (response.ok) {
            const users = await response.json();
            displayUsers(users);
            updateUserCount(users.length);
        } else {
            console.error('Failed to load users');
            document.getElementById('usersList').innerHTML = '<p>Failed to load users.</p>';
        }
    } catch (error) {
        console.error('Network error:', error);
        document.getElementById('usersList').innerHTML = '<p>Network error. Please try again.</p>';
    }
}

// Display users function
function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    
    if (users.length === 0) {
        usersList.innerHTML = '<p>No users registered yet.</p>';
        return;
    }
    
    // Clear existing content
    usersList.innerHTML = '';
    
    // Create user items safely (XSS prevention)
    users.forEach((user, index) => {
        const createdDate = user.createdAt 
            ? new Date(user.createdAt).toLocaleDateString() 
            : 'Unknown';
        
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        
        const userInfo = document.createElement('div');
        const userName = document.createElement('strong');
        userName.textContent = user.username; // Safe: textContent prevents XSS
        
        const userNumber = document.createElement('small');
        userNumber.textContent = `Member #${index + 1}`;
        
        userInfo.appendChild(userName);
        userInfo.appendChild(document.createElement('br'));
        userInfo.appendChild(userNumber);
        
        const joinDate = document.createElement('div');
        const joinDateSmall = document.createElement('small');
        joinDateSmall.textContent = `Joined: ${createdDate}`;
        joinDate.appendChild(joinDateSmall);
        
        userItem.appendChild(userInfo);
        userItem.appendChild(joinDate);
        usersList.appendChild(userItem);
    });
}

// Update user count
function updateUserCount(count) {
    document.getElementById('totalUsers').textContent = count;
}