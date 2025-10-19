// my_library.js - manages My Library page functionality

document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    const authToken = localStorage.getItem('authToken');
    
    console.log('Current user:', currentUser);
    console.log('Auth token:', authToken ? 'Present' : 'Missing');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update UI with current username
    const currentUsernameElement = document.getElementById('currentUsername');
    if (currentUsernameElement) {
        currentUsernameElement.textContent = `Hello, ${currentUser}!`;
    }
    
    // Initialize the page
    initializePage();
});

// Helper function to get authentication headers
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
}

// Initialize page functionality
function initializePage() {
    setupEventListeners();
    loadFavorites();
    loadCollections();
}

// Setup all event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Create collection modal
    document.getElementById('createCollectionBtn').addEventListener('click', showCreateCollectionModal);
    document.getElementById('createCollectionForm').addEventListener('submit', handleCreateCollection);
    document.getElementById('cancelCreateCollection').addEventListener('click', hideCreateCollectionModal);
    
    // Collection details modal
    document.getElementById('closeCollectionDetails').addEventListener('click', hideCollectionDetailsModal);
    document.getElementById('editCollectionBtn').addEventListener('click', () => {
        const modal = document.getElementById('collectionDetailsModal');
        const collectionId = modal.dataset.collectionId;
        if (collectionId) {
            editCollection(collectionId);
        }
    });
    document.getElementById('deleteCollectionBtn').addEventListener('click', deleteCollection);
    
    // Add to collection modal
    document.getElementById('confirmAddToCollection').addEventListener('click', handleAddToCollection);
    document.getElementById('cancelAddToCollection').addEventListener('click', hideAddToCollectionModal);
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
            }
        });
    });
}

// Switch between tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Load user's favorite books
async function loadFavorites() {
    const container = document.getElementById('favoritesList');
    container.innerHTML = '<div class="loading-placeholder"><p>Loading your favorite books...</p></div>';
    
    try {
        const response = await fetch('/me/favorites', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const favorites = await response.json();
            displayFavorites(favorites);
        } else {
            container.innerHTML = '<div class="empty-state"><p>Failed to load favorites</p></div>';
        }
    } catch (error) {
        console.error('Error loading favorites:', error);
        container.innerHTML = '<div class="empty-state"><p>Network error. Please try again.</p></div>';
    }
}

// Display favorite books
function displayFavorites(favorites) {
    const container = document.getElementById('favoritesList');
    
    if (favorites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❤️</div>
                <h3>No Favorite Books Yet</h3>
                <p>Start exploring books and add them to your favorites!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    container.classList.add('book-grid');
    
    favorites.forEach(book => {
        const bookCard = createBookCard(book, 'favorites');
        container.appendChild(bookCard);
    });
}

// Load user's collections
async function loadCollections() {
    const container = document.getElementById('collectionsList');
    container.innerHTML = '<div class="loading-placeholder"><p>Loading your collections...</p></div>';
    
    try {
        const response = await fetch('/me/collections', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const collections = await response.json();
            displayCollections(collections);
        } else {
            container.innerHTML = '<div class="empty-state"><p>Failed to load collections</p></div>';
        }
    } catch (error) {
        console.error('Error loading collections:', error);
        container.innerHTML = '<div class="empty-state"><p>Network error. Please try again.</p></div>';
    }
}

// Display collections
function displayCollections(collections) {
    const container = document.getElementById('collectionsList');
    
    if (collections.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <h3>No Collections Yet</h3>
                <p>Create your first collection to organize your books!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    collections.forEach(collection => {
        const collectionCard = createCollectionCard(collection);
        container.appendChild(collectionCard);
    });
}

// Create a book card
function createBookCard(book, context = '') {
    const card = document.createElement('div');
    card.className = 'book-card-library';
    
    const avgRating = book.avg_rating ? Number(book.avg_rating).toFixed(1) : 'N/A';
    const ratingCount = book.rating_count || 0;
    
    card.innerHTML = `
        <div class="book-actions">
            <button class="book-action-btn" onclick="addToCollection(${book.id}, '${book.title}')" title="Add to Collection">
                ➕
            </button>
            ${context === 'favorites' ? `
                <button class="book-action-btn danger" onclick="removeFromFavorites(${book.id})" title="Remove from Favorites">
                    ❤️
                </button>
            ` : ''}
        </div>
        <img src="${book.cover_url || 'default-cover.jpg'}" alt="${book.title} cover" class="book-cover-library">
        <h3 class="book-title-library">${book.title}</h3>
        <p class="book-rating-library">⭐ ${avgRating} (${ratingCount})</p>
    `;
    
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.book-action-btn')) {
            window.location.href = `book.html?id=${book.id}`;
        }
    });
    
    return card;
}

// Create a collection card
function createCollectionCard(collection) {
    const card = document.createElement('div');
    card.className = 'collection-card';
    
    const createdDate = new Date(collection.created_at).toLocaleDateString();
    
    card.innerHTML = `
        <div class="collection-actions">
            <button class="collection-action-btn" onclick="editCollection(${collection.id})" title="Edit Collection">
                ✏️
            </button>
            <button class="collection-action-btn danger" onclick="deleteCollection(${collection.id})" title="Delete Collection">
                🗑️
            </button>
        </div>
        <div class="collection-header">
            <div>
                <h3 class="collection-title">${collection.name}</h3>
                <p class="collection-description">${collection.description || 'No description'}</p>
            </div>
        </div>
        <div class="collection-stats">
            <div class="collection-stat">
                <span>📚</span>
                <span>${collection.book_count} books</span>
            </div>
            <div class="collection-stat">
                <span>📅</span>
                <span>Created ${createdDate}</span>
            </div>
            ${collection.is_public ? '<div class="collection-stat"><span>🌐</span><span>Public</span></div>' : ''}
        </div>
    `;
    
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.collection-action-btn')) {
            showCollectionDetails(collection.id, collection.name);
        }
    });
    
    return card;
}

// Show create collection modal
function showCreateCollectionModal() {
    document.getElementById('createCollectionModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Hide create collection modal
function hideCreateCollectionModal() {
    document.getElementById('createCollectionModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('createCollectionForm').reset();
}

// Handle create collection form submission
async function handleCreateCollection(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name').trim(),
        description: formData.get('description').trim(),
        is_public: document.getElementById('collectionPublic').checked
    };
    
    if (!data.name) {
        showMessage('Collection name is required', 'error');
        return;
    }
    
    console.log('Creating collection with data:', data);
    console.log('Auth headers:', getAuthHeaders());
    
    try {
        const response = await fetch('/me/collections', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const result = await response.json();
            showMessage(result.message || 'Collection created successfully!', 'success');
            hideCreateCollectionModal();
            loadCollections();
        } else {
            const error = await response.json().catch(() => null);
            console.error('Create collection error:', response.status, error);
            showMessage((error && error.error) || 'Failed to create collection', 'error');
        }
    } catch (error) {
        console.error('Error creating collection:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Show collection details modal
async function showCollectionDetails(collectionId, collectionName) {
    const modal = document.getElementById('collectionDetailsModal');
    const title = document.getElementById('collectionDetailsTitle');
    const booksList = document.getElementById('collectionBooksList');
    
    title.textContent = collectionName;
    booksList.innerHTML = '<div class="loading-placeholder"><p>Loading books...</p></div>';
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Store collection ID for edit/delete operations
    modal.dataset.collectionId = collectionId;
    
    try {
        const response = await fetch(`/me/collections/${collectionId}/books`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const books = await response.json();
            displayCollectionBooks(books, collectionId);
        } else {
            booksList.innerHTML = '<div class="empty-state"><p>Failed to load books</p></div>';
        }
    } catch (error) {
        console.error('Error loading collection books:', error);
        booksList.innerHTML = '<div class="empty-state"><p>Network error. Please try again.</p></div>';
    }
}

// Display books in collection
function displayCollectionBooks(books, collectionId) {
    const container = document.getElementById('collectionBooksList');
    
    if (books.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📚</div>
                <h3>No Books in Collection</h3>
                <p>Add books to this collection to get started!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    container.classList.add('book-grid');
    
    books.forEach(book => {
        const bookCard = createBookCard(book, 'collection');
        // Add remove from collection button
        const actions = bookCard.querySelector('.book-actions');
        const removeBtn = document.createElement('button');
        removeBtn.className = 'book-action-btn danger';
        removeBtn.title = 'Remove from Collection';
        removeBtn.innerHTML = '➖';
        removeBtn.onclick = () => removeFromCollection(collectionId, book.id);
        actions.appendChild(removeBtn);
        
        container.appendChild(bookCard);
    });
}

// Hide collection details modal
function hideCollectionDetailsModal() {
    document.getElementById('collectionDetailsModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Edit collection
function editCollection(collectionId) {
    // For now, just show a simple prompt
    const newName = prompt('Enter new collection name:');
    if (newName && newName.trim()) {
        updateCollection(collectionId, { name: newName.trim() });
    }
}

// Update collection
async function updateCollection(collectionId, data) {
    try {
        const response = await fetch(`/me/collections/${collectionId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            const result = await response.json();
            showMessage(result.message || 'Collection updated successfully!', 'success');
            loadCollections();
            hideCollectionDetailsModal();
        } else {
            const error = await response.json().catch(() => null);
            showMessage((error && error.error) || 'Failed to update collection', 'error');
        }
    } catch (error) {
        console.error('Error updating collection:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Delete collection
async function deleteCollection(collectionId) {
    if (!confirm('Are you sure you want to delete this collection? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/me/collections/${collectionId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const result = await response.json();
            showMessage(result.message || 'Collection deleted successfully!', 'success');
            loadCollections();
            hideCollectionDetailsModal();
        } else {
            const error = await response.json().catch(() => null);
            showMessage((error && error.error) || 'Failed to delete collection', 'error');
        }
    } catch (error) {
        console.error('Error deleting collection:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Add to collection (global function)
async function addToCollection(bookId, bookTitle) {
    // Load user's collections
    try {
        const response = await fetch('/me/collections', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const collections = await response.json();
            showAddToCollectionModal(bookId, bookTitle, collections);
        } else {
            showMessage('Failed to load collections', 'error');
        }
    } catch (error) {
        console.error('Error loading collections:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Show add to collection modal
function showAddToCollectionModal(bookId, bookTitle, collections) {
    const modal = document.getElementById('addToCollectionModal');
    const title = document.getElementById('addToCollectionBookTitle');
    const select = document.getElementById('selectCollection');
    
    title.textContent = bookTitle;
    select.innerHTML = '<option value="">Select a collection...</option>';
    
    collections.forEach(collection => {
        const option = document.createElement('option');
        option.value = collection.id;
        option.textContent = collection.name;
        select.appendChild(option);
    });
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    modal.dataset.bookId = bookId;
}

// Hide add to collection modal
function hideAddToCollectionModal() {
    document.getElementById('addToCollectionModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('selectCollection').value = '';
    document.getElementById('collectionNote').value = '';
}

// Handle add to collection
async function handleAddToCollection() {
    const modal = document.getElementById('addToCollectionModal');
    const collectionId = document.getElementById('selectCollection').value;
    const note = document.getElementById('collectionNote').value;
    const bookId = modal.dataset.bookId;
    
    if (!collectionId) {
        showMessage('Please select a collection', 'error');
        return;
    }
    
    try {
        const response = await fetch(`/me/collections/${collectionId}/books`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                book_id: parseInt(bookId),
                note: note.trim()
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            showMessage(result.message || 'Book added to collection successfully!', 'success');
            hideAddToCollectionModal();
        } else {
            const error = await response.json().catch(() => null);
            showMessage((error && error.error) || 'Failed to add book to collection', 'error');
        }
    } catch (error) {
        console.error('Error adding book to collection:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Remove from favorites
async function removeFromFavorites(bookId) {
    try {
        const response = await fetch(`/books/${bookId}/favorite`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const result = await response.json();
            if (!result.favorited) {
                showMessage('Book removed from favorites!', 'success');
                loadFavorites();
            }
        } else {
            showMessage('Failed to remove from favorites', 'error');
        }
    } catch (error) {
        console.error('Error removing from favorites:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Remove from collection
async function removeFromCollection(collectionId, bookId) {
    if (!confirm('Remove this book from the collection?')) {
        return;
    }
    
    try {
        const response = await fetch(`/me/collections/${collectionId}/books/${bookId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const result = await response.json();
            showMessage(result.message || 'Book removed from collection!', 'success');
            showCollectionDetails(collectionId, document.getElementById('collectionDetailsTitle').textContent);
        } else {
            const error = await response.json().catch(() => null);
            showMessage((error && error.error) || 'Failed to remove book from collection', 'error');
        }
    } catch (error) {
        console.error('Error removing book from collection:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Show message to user
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 3000);
    }
    
    // Auto-hide error messages after 5 seconds
    if (type === 'error') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
    
    // Scroll to top to show message
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
