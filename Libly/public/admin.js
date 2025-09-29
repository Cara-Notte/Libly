// admin.js - functionality for the admin panel

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    const currentUserRole = localStorage.getItem('currentUserRole');
    // Only allow access to admins
    if (!currentUser || currentUserRole !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    // Update UI with admin username
    const adminUsername = document.getElementById('adminUsername');
    if (adminUsername) {
        adminUsername.textContent = `Hello, ${currentUser}!`;
    }
    // Setup event listeners
    document.getElementById('bookForm').addEventListener('submit', handleBookFormSubmit);
    document.getElementById('cancelEditBtn').addEventListener('click', resetBookForm);
    // Load initial data
    loadBooks();
    loadUsersAdmin();
});

// Helper to build headers with JWT
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
}

// Load books for admin view
async function loadBooks() {
    const list = document.getElementById('booksList');
    list.innerHTML = '<p>Loading books...</p>';
    try {
        // fetch latest books (no query)
        const res = await fetch('/books/search?q=');
        if (!res.ok) throw new Error('Failed to fetch books');
        const books = await res.json();
        displayBooksAdmin(books);
    } catch (err) {
        console.error(err);
        list.innerHTML = '<p>Failed to load books.</p>';
    }
}

// Display books in admin panel
function displayBooksAdmin(books) {
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

// Escape HTML to prevent injection
function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c];
    });
}

// Edit a book: populate form with details and switch to update mode
async function editBook(bookId) {
    try {
        const res = await fetch(`/books/${bookId}`);
        if (!res.ok) throw new Error('Failed to fetch book');
        const data = await res.json();
        const { book, authors, genres } = data;
        // populate fields
        document.getElementById('bookId').value = bookId;
        document.getElementById('bookTitle').value = book.title || '';
        document.getElementById('bookSubtitle').value = book.subtitle || '';
        document.getElementById('bookDescription').value = book.description || '';
        document.getElementById('bookISBN10').value = book.isbn_10 || '';
        document.getElementById('bookISBN13').value = book.isbn_13 || '';
        document.getElementById('bookLanguage').value = book.language_code || '';
        document.getElementById('bookPages').value = book.page_count || '';
        // convert date to yyyy-mm-dd format
        if (book.release_date) {
            const d = new Date(book.release_date);
            document.getElementById('bookReleaseDate').value = d.toISOString().split('T')[0];
        } else {
            document.getElementById('bookReleaseDate').value = '';
        }
        document.getElementById('bookPublisherId').value = book.publisher_id || '';
        document.getElementById('bookCoverUrl').value = book.cover_url || '';
        // author_ids and genre_ids as comma-separated
        const authorIds = authors && authors.length ? authors.map(a => a.id).join(',') : '';
        const genreIds = genres && genres.length ? genres.map(g => g.id).join(',') : '';
        document.getElementById('bookAuthorIds').value = authorIds;
        document.getElementById('bookGenreIds').value = genreIds;
        // switch to edit mode
        document.getElementById('saveBookBtn').textContent = 'Update Book';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
    } catch (err) {
        alert('Error loading book details.');
        console.error(err);
    }
}

// Reset form to default state
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

// Handle add/update book form submission
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
    // Determine if adding or updating
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

// Parse comma-separated IDs into an array of numbers
function parseIdList(str) {
    if (!str) return [];
    return str
        .split(',')
        .map(s => s.trim())
        .filter(s => s !== '')
        .map(s => parseInt(s))
        .filter(n => !isNaN(n));
}

// Delete a book by ID
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

// Load users for admin management
async function loadUsersAdmin() {
    const list = document.getElementById('usersAdminList');
    list.innerHTML = '<p>Loading users...</p>';
    try {
        const res = await fetch('/users');
        if (!res.ok) throw new Error('Failed to fetch users');
        const users = await res.json();
        displayUsersAdmin(users);
    } catch (err) {
        console.error(err);
        list.innerHTML = '<p>Failed to load users.</p>';
    }
}

// Display users with management controls
function displayUsersAdmin(users) {
    const list = document.getElementById('usersAdminList');
    list.innerHTML = '';
    if (!users || users.length === 0) {
        list.textContent = 'No users found.';
        return;
    }
    users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'user-item';
        // user info
        const info = document.createElement('div');
        info.innerHTML = `<strong>${escapeHtml(user.username)}</strong> (ID: ${user.id})`;
        // role selector
        const roleSelect = document.createElement('select');
        ['member','librarian','admin'].forEach(r => {
            const opt = document.createElement('option');
            opt.value = r;
            opt.textContent = r;
            if (user.role === r) opt.selected = true;
            roleSelect.appendChild(opt);
        });
        roleSelect.onchange = () => updateUser(user.id, { role: roleSelect.value });
        // active toggle
        const activeToggle = document.createElement('input');
        activeToggle.type = 'checkbox';
        activeToggle.checked = user.is_active !== undefined ? !!user.is_active : true;
        activeToggle.onchange = () => updateUser(user.id, { is_active: activeToggle.checked });
        // delete button
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.className = 'btn btn-danger';
        delBtn.onclick = () => deleteUser(user.id);
        // disable delete if this is the current admin
        const currentUserId = parseInt(localStorage.getItem('currentUserId') || '0');
        if (currentUserId === user.id) {
            delBtn.disabled = true;
        }
        // container for controls
        const controls = document.createElement('div');
        controls.style.display = 'flex';
        controls.style.gap = '0.5rem';
        controls.appendChild(roleSelect);
        controls.appendChild(activeToggle);
        controls.appendChild(delBtn);
        item.appendChild(info);
        item.appendChild(controls);
        list.appendChild(item);
    });
}

// Update user with given payload
async function updateUser(userId, payload) {
    try {
        const res = await fetch(`/users/${userId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload)
        });
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            alert((err && (err.error || err.message)) || 'Failed to update user');
            return;
        }
        // reload users to reflect changes
        loadUsersAdmin();
    } catch (err) {
        alert('Error updating user');
        console.error(err);
    }
}

// Delete a user (admin only)
async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
        const res = await fetch(`/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            alert((err && (err.error || err.message)) || 'Failed to delete user');
            return;
        }
        // refresh list
        loadUsersAdmin();
    } catch (err) {
        alert('Error deleting user');
        console.error(err);
    }
}