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
    loadBookRecommendations();
    
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

// Function to load book recommendations
async function loadBookRecommendations() {
    try {
        // Load Today's Pick (random book)
        const todayPickResponse = await fetch('/books/random');
        const todayPick = await todayPickResponse.json();
        displayBook('todayPick', todayPick);

        // Load Top Rated book
        const topRatedResponse = await fetch('/books/top-rated');
        const topRated = await topRatedResponse.json();
        displayBook('topRated', topRated);

        // Load Most Favorited book
        const mostFavoritedResponse = await fetch('/books/most-favorited');
        const mostFavorited = await mostFavoritedResponse.json();
        displayBook('mostFavorited', mostFavorited);
    } catch (error) {
        console.error('Error loading book recommendations:', error);
        document.querySelectorAll('.books-grid').forEach(grid => {
            grid.innerHTML = '<p class="error-message">Failed to load recommendations</p>';
        });
    }
}

// Function to display a single book in a grid
function displayBook(containerId, book) {
    const container = document.getElementById(containerId);
    
    if (!book) {
        container.innerHTML = '<p class="no-books">No books available</p>';
        return;
    }

    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.innerHTML = `
        <div class="book-cover">
            ${book.cover_url 
                ? `<img src="${book.cover_url}" alt="${book.title}" onerror="this.parentElement.innerHTML='<div class=\\'placeholder-cover\\'><span>📚</span><p>${book.title}</p></div>'">` 
                : `<div class="placeholder-cover"><span>📚</span><p>${book.title}</p></div>`
            }
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-authors">${book.authors || 'Unknown Author'}</p>
            <div class="book-meta">
                ${book.average_rating ? `<span class="book-rating">⭐ ${Number(book.average_rating).toFixed(1)}</span>` : ''}
                ${book.favorites_count ? `<span class="book-favorites">❤️ ${book.favorites_count}</span>` : ''}
                <span class="book-pages">📄 ${book.page_count || 'N/A'} pages</span>
            </div>
            <a href="book.html?id=${book.id}" class="btn btn-small btn-primary">View Details</a>
        </div>
    `;
    
    container.innerHTML = '';
    container.appendChild(bookCard);
}
