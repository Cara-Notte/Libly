document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    const currentUserRole = localStorage.getItem('currentUserRole');
    if (!currentUser || (currentUserRole !== 'librarian' && currentUserRole !== 'admin')) {
        window.location.href = 'index.html';
        return;
    }
    const librarianUsername = document.getElementById('librarianUsername');
    if (librarianUsername) {
        librarianUsername.textContent = `Hello, ${currentUser}!`;
    }
    document.getElementById('bookForm').addEventListener('submit', handleBookFormSubmit);
    document.getElementById('cancelEditBtn').addEventListener('click', resetBookForm);
    document.getElementById('reviewSortBy').addEventListener('change', loadLibrarianReviews);

    loadBooks();
    loadLibrarianReviews();
});

function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
}

async function loadBooks() {
    const list = document.getElementById('booksList');
    list.innerHTML = '<p>Loading books...</p>';
    try {
        const res = await fetch('/books/search?q=');
        if (!res.ok) throw new Error('Failed to fetch books');
        const books = await res.json();
        displayBooksLibrarian(books);
    } catch (err) {
        console.error(err);
        list.innerHTML = '<p>Failed to load books.</p>';
    }
}

function displayBooksLibrarian(books) {
    const list = document.getElementById('booksList');
    list.innerHTML = '';
    if (!books || books.length === 0) {
        list.textContent = 'No books found.';
        return;
    }
    books.forEach(book => {
        const item = document.createElement('div');
        item.className = 'user-item';
        const info = document.createElement('div');
        info.innerHTML = `<strong>${escapeHtml(book.title)}</strong> (ID: ${book.id})`;
        const actions = document.createElement('div');
        actions.style.display = 'flex';
        actions.style.gap = '0.5rem';
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'btn btn-secondary';
        editBtn.onclick = () => editBook(book.id);
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.className = 'btn btn-danger';
        delBtn.onclick = () => deleteBook(book.id);
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);
        item.appendChild(info);
        item.appendChild(actions);
        list.appendChild(item);
    });
}

function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c];
    });
}

async function editBook(bookId) {
    try {
        const res = await fetch(`/books/${bookId}`);
        if (!res.ok) throw new Error('Failed to fetch book');
        const data = await res.json();
        const { book, authors, genres } = data;
        document.getElementById('bookId').value = bookId;
        document.getElementById('bookTitle').value = book.title || '';
        document.getElementById('bookSubtitle').value = book.subtitle || '';
        document.getElementById('bookDescription').value = book.description || '';
        document.getElementById('bookISBN10').value = book.isbn_10 || '';
        document.getElementById('bookISBN13').value = book.isbn_13 || '';
        document.getElementById('bookLanguage').value = book.language_code || '';
        document.getElementById('bookPages').value = book.page_count || '';
        if (book.release_date) {
            const d = new Date(book.release_date);
            document.getElementById('bookReleaseDate').value = d.toISOString().split('T')[0];
        } else {
            document.getElementById('bookReleaseDate').value = '';
        }
        document.getElementById('bookPublisherId').value = book.publisher_id || '';
        document.getElementById('bookCoverUrl').value = book.cover_url || '';
        const authorIds = authors && authors.length ? authors.map(a => a.id).join(',') : '';
        const genreIds = genres && genres.length ? genres.map(g => g.id).join(',') : '';
        document.getElementById('bookAuthorIds').value = authorIds;
        document.getElementById('bookGenreIds').value = genreIds;
        document.getElementById('saveBookBtn').textContent = 'Update Book';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
    } catch (err) {
        alert('Error loading book details.');
        console.error(err);
    }
}

function resetBookForm() {
    document.getElementById('bookId').value = '';
    document.getElementById('bookTitle').value = '';
    document.getElementById('bookSubtitle').value = '';
    document.getElementById('bookDescription').value = '';
    document.getElementById('bookISBN10').value = '';
    document.getElementById('bookISBN13').value = '';
    document.getElementById('bookLanguage').value = '';
    document.getElementById('bookPages').value = '';
    document.getElementById('bookReleaseDate').value = '';
    document.getElementById('bookPublisherId').value = '';
    document.getElementById('bookCoverUrl').value = '';
    document.getElementById('bookAuthorIds').value = '';
    document.getElementById('bookGenreIds').value = '';
    document.getElementById('saveBookBtn').textContent = 'Add Book';
    document.getElementById('cancelEditBtn').style.display = 'none';
}

async function handleBookFormSubmit(e) {
    e.preventDefault();
    const bookId = document.getElementById('bookId').value;
    const data = {
        title: document.getElementById('bookTitle').value.trim(),
        subtitle: document.getElementById('bookSubtitle').value.trim() || null,
        description: document.getElementById('bookDescription').value.trim() || null,
        isbn_10: document.getElementById('bookISBN10').value.trim() || null,
        isbn_13: document.getElementById('bookISBN13').value.trim() || null,
        language_code: document.getElementById('bookLanguage').value.trim() || null,
        page_count: document.getElementById('bookPages').value ? parseInt(document.getElementById('bookPages').value) : null,
        release_date: document.getElementById('bookReleaseDate').value || null,
        publisher_id: document.getElementById('bookPublisherId').value ? parseInt(document.getElementById('bookPublisherId').value) : null,
        cover_url: document.getElementById('bookCoverUrl').value.trim() || null,
        author_ids: parseIdList(document.getElementById('bookAuthorIds').value),
        genre_ids: parseIdList(document.getElementById('bookGenreIds').value)
    };
    const url = bookId ? `/books/${bookId}` : '/books';
    const method = bookId ? 'PUT' : 'POST';
    try {
        const res = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            alert((err && (err.error || err.message)) || 'Failed to save book');
            return;
        }
        alert('Book saved successfully');
        resetBookForm();
        loadBooks();
    } catch (err) {
        alert('Error saving book');
        console.error(err);
    }
}

function parseIdList(str) {
    if (!str) return [];
    return str
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
        .map(s => parseInt(s))
        .filter(n => !isNaN(n));
}

async function deleteBook(bookId) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    try {
        const res = await fetch(`/books/${bookId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            alert((err && (err.error || err.message)) || 'Failed to delete book');
            return;
        }
        alert('Book deleted');
        loadBooks();
    } catch (err) {
        alert('Error deleting book');
        console.error(err);
    }
}

async function loadLibrarianReviews() {
    try {
        const sort = document.getElementById('reviewSortBy').value;
        const response = await fetch(`/reviews?sort=${sort}&limit=50`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            renderLibrarianReviews(data.reviews);
            updateLibrarianReviewsCount(data.pagination);
        } else {
            showLibrarianReviewsError('Failed to load reviews');
        }
    } catch (error) {
        console.error('Error loading librarian reviews:', error);
        showLibrarianReviewsError('Network error. Please try again.');
    }
}

function renderLibrarianReviews(reviews) {
    const container = document.getElementById('librarianReviewsList');
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No reviews found</h3>
                <p>No reviews have been submitted yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    reviews.forEach(review => {
        const reviewElement = createLibrarianReviewElement(review);
        container.appendChild(reviewElement);
    });
}

function createLibrarianReviewElement(review) {
    const element = document.createElement('div');
    element.className = 'admin-review-card';
    
    const stars = '⭐'.repeat(review.rating);
    const date = new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    element.innerHTML = `
        <div class="admin-review-header">
            <div class="admin-review-user">
                <div class="user-avatar">
                    ${review.username.charAt(0).toUpperCase()}
                </div>
                <div class="user-info">
                    <h4 class="username">${review.username}</h4>
                    <p class="review-date">${date}</p>
                </div>
            </div>
            <div class="admin-review-actions">
                <button class="btn btn-danger" onclick="deleteReview(${review.id})" title="Delete Review">
                    🗑️ Delete
                </button>
            </div>
        </div>
        
        <div class="admin-review-book">
            <img src="${review.cover_url || 'default-cover.jpg'}" alt="${review.book_title} cover" class="book-cover-small">
            <div class="book-info">
                <h5 class="book-title">${review.book_title}</h5>
                <div class="review-rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-number">${review.rating}/5</span>
                </div>
                <button class="btn btn-link" onclick="viewBook(${review.book_id})">View Book</button>
            </div>
        </div>
        
        <div class="admin-review-content">
            <p class="admin-review-text">${review.review}</p>
        </div>
    `;
    
    return element;
}

function updateLibrarianReviewsCount(pagination) {
    const count = pagination.total;
    document.getElementById('librarianReviewsCount').textContent = `Showing ${count} review${count !== 1 ? 's' : ''}`;
}

async function deleteReview(reviewId) {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            alert('Review deleted successfully!');
            loadLibrarianReviews();
        } else {
            const error = await response.json().catch(() => null);
            alert((error && error.error) || 'Failed to delete review');
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        alert('Network error. Please try again.');
    }
}

function viewBook(bookId) {
    window.location.href = `book.html?id=${bookId}`;
}

function showLibrarianReviewsError(message) {
    const container = document.getElementById('librarianReviewsList');
    container.innerHTML = `
        <div class="error-state">
            <h3>Error</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="loadLibrarianReviews()">Try Again</button>
        </div>
    `;
}
