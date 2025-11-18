let currentPage = 1;
let currentSort = 'title_asc';
let currentView = 'grid';
let allBooks = [];
let filteredBooks = [];
const booksPerPage = 12;

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadBooks();
});

function setupEventListeners() {
    document.getElementById('sortBy').addEventListener('change', function() {
        currentSort = this.value;
        currentPage = 1;
        applySortingAndPagination();
    });

    document.getElementById('gridViewBtn').addEventListener('click', () => switchView('grid'));
    document.getElementById('listViewBtn').addEventListener('click', () => switchView('list'));

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            applySortingAndPagination();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            applySortingAndPagination();
        }
    });
}

async function loadBooks() {
    try {
        const response = await fetch(`/books?sort=${currentSort}&limit=1000`);
        
        if (response.ok) {
            const data = await response.json();
            allBooks = data.books || data;
            filteredBooks = [...allBooks];
            applySortingAndPagination();
            updateBooksCount();
        } else {
            showError('Failed to load books');
        }
    } catch (error) {
        console.error('Error loading books:', error);
        showError('Network error. Please try again.');
    }
}

function applySortingAndPagination() {
    const sortedBooks = sortBooks([...filteredBooks]);

    const totalPages = Math.ceil(sortedBooks.length / booksPerPage);
    const startIndex = (currentPage - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const pageBooks = sortedBooks.slice(startIndex, endIndex);

    renderBooks(pageBooks);

    updatePagination(totalPages);
}

function sortBooks(books) {
    return books.sort((a, b) => {
        switch (currentSort) {
            case 'title_asc':
                return a.title.localeCompare(b.title);
            case 'title_desc':
                return b.title.localeCompare(a.title);
            case 'release_date_asc':
                return new Date(a.release_date || '1900-01-01') - new Date(b.release_date || '1900-01-01');
            case 'release_date_desc':
                return new Date(b.release_date || '1900-01-01') - new Date(a.release_date || '1900-01-01');
            case 'popularity_asc':
                return (a.avg_rating || 0) - (b.avg_rating || 0);
            case 'popularity_desc':
                return (b.avg_rating || 0) - (a.avg_rating || 0);
            default:
                return 0;
        }
    });
}

function renderBooks(books) {
    const container = document.getElementById('booksContainer');
    
    if (books.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No books found</h3>
                <p>Try adjusting your search or filters.</p>
            </div>
        `;
        return;
    }
    
    container.className = currentView === 'grid' ? 'books-grid' : 'books-list';
    container.innerHTML = '';
    
    books.forEach(book => {
        const bookElement = createBookElement(book);
        container.appendChild(bookElement);
    });
}

function createBookElement(book) {
    const element = document.createElement('div');
    element.className = currentView === 'grid' ? 'book-card' : 'book-list-item';
    
    const avgRating = book.avg_rating ? Number(book.avg_rating).toFixed(1) : 'N/A';
    const ratingCount = book.rating_count || 0;
    const releaseYear = book.release_date ? new Date(book.release_date).getFullYear() : 'Unknown';
    
    if (currentView === 'grid') {
        element.innerHTML = `
            <div class="book-cover-container">
                <img src="${book.cover_url || 'default-cover.jpg'}" alt="${book.title} cover" class="book-cover">
                <div class="book-overlay">
                    <button class="book-action-btn" onclick="viewBook(${book.id})" title="View Details">
                        👁️
                    </button>
                </div>
            </div>
            <div class="book-info">
                <h3 class="book-title">${book.title}</h3>
                ${book.subtitle ? `<p class="book-subtitle">${book.subtitle}</p>` : ''}
                <p class="book-meta">${releaseYear}</p>
                <div class="book-rating">
                    <span class="rating-stars">⭐</span>
                    <span class="rating-value">${avgRating}</span>
                    <span class="rating-count">(${ratingCount})</span>
                </div>
            </div>
        `;
    } else {
        element.innerHTML = `
            <div class="book-list-cover">
                <img src="${book.cover_url || 'default-cover.jpg'}" alt="${book.title} cover" class="book-cover-small">
            </div>
            <div class="book-list-info">
                <h3 class="book-title">${book.title}</h3>
                ${book.subtitle ? `<p class="book-subtitle">${book.subtitle}</p>` : ''}
                <p class="book-meta">Release Year: ${releaseYear}</p>
                <div class="book-rating">
                    <span class="rating-stars">⭐</span>
                    <span class="rating-value">${avgRating}</span>
                    <span class="rating-count">(${ratingCount} ratings)</span>
                </div>
            </div>
            <div class="book-list-actions">
                <button class="btn btn-primary" onclick="viewBook(${book.id})">View Details</button>
            </div>
        `;
    }
    
    return element;
}

function switchView(view) {
    currentView = view;

    document.getElementById('gridViewBtn').classList.toggle('active', view === 'grid');
    document.getElementById('listViewBtn').classList.toggle('active', view === 'list');

    applySortingAndPagination();
}

function updateBooksCount() {
    const count = filteredBooks.length;
    document.getElementById('booksCount').textContent = `Showing ${count} book${count !== 1 ? 's' : ''}`;
}

function updatePagination(totalPages) {
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

function viewBook(bookId) {
    window.location.href = `book.html?id=${bookId}`;
}

function showError(message) {
    const container = document.getElementById('booksContainer');
    container.innerHTML = `
        <div class="error-state">
            <h3>Error</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="loadBooks()">Try Again</button>
        </div>
    `;
}
