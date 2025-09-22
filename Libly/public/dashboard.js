document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('username').textContent = `Hello, ${currentUser}!`;
    
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('refreshUsers').addEventListener('click', loadUsers);
    
    loadUsers();
});

async function loadUsers() {
    try {
        const response = await fetch('/users');
        
        if (response.ok) {
            const users = await response.json();
            displayUsers(users);
            updateUserCount(users.length);
        } else {
            console.error('Failed to load users');
        }
    } catch (error) {
        console.error('Network error:', error);
    }
}

function displayUsers(users) {
    const usersList = document.getElementById('usersList');
    
    if (users.length === 0) {
        usersList.innerHTML = '<p>No users registered yet.</p>';
        return;
    }
    
    const usersHTML = users.map((user, index) => {
        const createdDate = user.createdAt 
            ? new Date(user.createdAt).toLocaleDateString() 
            : 'Unknown';
        
        return `
            <div class="user-item">
                <div>
                    <strong>${user.username}</strong>
                    <small>User #${index + 1}</small>
                </div>
                <div>
                    <small>Joined: ${createdDate}</small>
                </div>
            </div>
        `;
    }).join('');
    
    usersList.innerHTML = usersHTML;
}

function updateUserCount(count) {
    document.getElementById('totalUsers').textContent = count;
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    
    window.location.href = 'index.html';
}
