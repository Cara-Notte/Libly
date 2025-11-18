document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const attributeSelect = document.getElementById('searchAttribute');
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const attribute = params.get('attribute') || '';
    if (q) searchInput.value = q;
    if (attribute) attributeSelect.value = attribute;
    if (q) {
        performSearch(q, attribute);
    }
    searchBtn.addEventListener('click', () => {
        const query = searchInput.value.trim();
        const attr = attributeSelect.value;
        performSearch(query, attr);
        updateUrl(query, attr);
    });
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = searchInput.value.trim();
            const attr = attributeSelect.value;
            performSearch(query, attr);
            updateUrl(query, attr);
        }
    });
});

function updateUrl(query, attribute) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (attribute) params.set('attribute', attribute);
    const newUrl = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, '', newUrl);
}

async function performSearch(query, attribute) {
    const container = document.getElementById('resultsContainer');
    if (!query) {
        container.innerHTML = '<p>Please enter a search query.</p>';
        return;
    }
    container.innerHTML = '<p>Searching...</p>';
    try {
        const url = new URL('/books/search', window.location.origin);
        url.searchParams.append('q', query);
        if (attribute) url.searchParams.append('attribute', attribute);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Search failed');
        const books = await res.json();
        if (!books || books.length === 0) {
            container.innerHTML = '<p>No books found for your query. Try searching by title, author, or genre.</p>';
            return;
        }
        renderSearchResults(books);
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p>Search error. Please try again later.</p>';
    }
}

async function renderSearchResults(books) {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = '';
    container.classList.add('book-grid');

    const promises = books.map(book => fetch(`/books/${book.id}`).then(res => res.ok ? res.json() : null));
    const details = await Promise.all(promises);

    books.forEach((book, idx) => {
        const detail = details[idx];
        const card = document.createElement('div');
        card.className = 'book-card';

        const img = document.createElement('img');
        img.className = 'book-cover';
        img.src = book.cover_url || 'default-cover.jpg';
        img.alt = `${book.title} cover`;
        card.appendChild(img);

        const titleEl = document.createElement('p');
        titleEl.className = 'book-title';
        titleEl.textContent = book.title;
        card.appendChild(titleEl);

        const stats = document.createElement('p');
        stats.className = 'book-rating';
        const avg = book.avg_rating !== null && book.avg_rating !== undefined ? Number(book.avg_rating).toFixed(1) : 'N/A';
        const count = book.rating_count || 0;
        stats.innerHTML = `⭐ ${avg} (${count})`;
        card.appendChild(stats);

        const actions = document.createElement('div');
        actions.className = 'book-actions';
        actions.innerHTML = `
            <button class="book-action-btn" onclick="addToCollection(${book.id}, '${book.title.replace(/'/g, "\\'")}')" title="Add to Collection">
                ➕
            </button>
        `;
        card.appendChild(actions);

        card.onclick = (e) => {
            if (!e.target.closest('.book-action-btn')) {
                window.location.href = `book.html?id=${book.id}`;
            }
        };

        container.appendChild(card);
    });
}

async function addToCollection(bookId, bookTitle) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Please login to add books to collections');
        return;
    }

    try {
        const response = await fetch('/me/collections', {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const collections = await response.json();
            showAddToCollectionModal(bookId, bookTitle, collections);
        } else {
            alert('Failed to load collections');
        }
    } catch (error) {
        console.error('Error loading collections:', error);
        alert('Network error. Please try again.');
    }
}

function showAddToCollectionModal(bookId, bookTitle, collections) {
    let modal = document.getElementById('addToCollectionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'addToCollectionModal';
        modal.className = 'modal';
        modal.style.display = 'none';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Add to Collection</h3>
                <p id="addToCollectionBookTitle">Book Title</p>
                
                <div class="form-group">
                    <label for="selectCollection">Choose Collection</label>
                    <select id="selectCollection" name="collection_id" required>
                        <option value="">Select a collection...</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="collectionNote">Note (Optional)</label>
                    <textarea id="collectionNote" name="note" rows="2" placeholder="Add a note about this book..."></textarea>
                </div>
                
                <div class="modal-actions">
                    <button id="confirmAddToCollection" class="btn btn-primary">Add to Collection</button>
                    <button id="cancelAddToCollection" class="btn btn-secondary">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        document.getElementById('confirmAddToCollection').addEventListener('click', handleAddToCollection);
        document.getElementById('cancelAddToCollection').addEventListener('click', hideAddToCollectionModal);
 
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideAddToCollectionModal();
            }
        });
    }
    
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

function hideAddToCollectionModal() {
    const modal = document.getElementById('addToCollectionModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.getElementById('selectCollection').value = '';
        document.getElementById('collectionNote').value = '';
    }
}

async function handleAddToCollection() {
    const modal = document.getElementById('addToCollectionModal');
    const collectionId = document.getElementById('selectCollection').value;
    const note = document.getElementById('collectionNote').value;
    const bookId = modal.dataset.bookId;
    
    if (!collectionId) {
        alert('Please select a collection');
        return;
    }
    
    console.log('Adding book to collection:', {
        collectionId,
        bookId: parseInt(bookId),
        note: note.trim()
    });
    
    try {
        const response = await fetch(`/me/collections/${collectionId}/books`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('authToken'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                book_id: parseInt(bookId),
                note: note.trim()
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(result.message || 'Book added to collection successfully!');
            hideAddToCollectionModal();
        } else {
            const error = await response.json().catch(() => null);
            console.error('Add to collection error:', response.status, error);
            alert((error && error.error) || 'Failed to add book to collection');
        }
    } catch (error) {
        console.error('Error adding book to collection:', error);
        alert('Network error. Please try again.');
    }
}
