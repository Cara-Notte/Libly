let currentPage = 1;
let currentSort = 'newest';
let allReviews = [];
const reviewsPerPage = 20;

document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadReviews();
});

function setupEventListeners() {
    document.getElementById('sortBy').addEventListener('change', function() {
        currentSort = this.value;
        currentPage = 1;
        loadReviews();
    });

    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadReviews();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(allReviews.length / reviewsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            loadReviews();
        }
    });
}

async function loadReviews() {
    try {
        const response = await fetch(`/reviews?sort=${currentSort}&page=${currentPage}&limit=${reviewsPerPage}`);
        
        if (response.ok) {
            const data = await response.json();
            allReviews = data.reviews || [];
            renderReviews(allReviews);
            updatePagination(data.pagination);
            updateReviewsCount(data.pagination);
        } else {
            showError('Failed to load reviews');
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        showError('Network error. Please try again.');
    }
}

function renderReviews(reviews) {
    const container = document.getElementById('reviewsContainer');
    
    if (reviews.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No reviews found</h3>
                <p>Be the first to write a review! Find a book you love and share your thoughts.</p>
                <a href="search.html" class="btn btn-primary">Browse Books</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    reviews.forEach(review => {
        const reviewElement = createReviewElement(review);
        container.appendChild(reviewElement);
    });
}

function createReviewElement(review) {
    const element = document.createElement('div');
    element.className = 'review-card';
    
    const stars = '⭐'.repeat(review.rating);
    const date = new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const currentUser = localStorage.getItem('currentUser');
    const currentUserRole = localStorage.getItem('currentUserRole');
    const canDelete = currentUser === review.username || currentUserRole === 'admin';
    
    element.innerHTML = `
        <div class="review-header">
            <div class="review-user">
                <div class="user-avatar">
                    ${review.username.charAt(0).toUpperCase()}
                </div>
                <div class="user-info">
                    <h4 class="username">${review.username}</h4>
                    <p class="review-date">${date}</p>
                </div>
            </div>
            <div class="review-rating">
                <span class="stars">${stars}</span>
                <span class="rating-number">${review.rating}/5</span>
            </div>
        </div>
        
        <div class="review-book">
            <img src="${review.cover_url || 'default-cover.jpg'}" alt="${review.book_title} cover" class="book-cover-small">
            <div class="book-info">
                <h5 class="book-title">${review.book_title}</h5>
                <button class="btn btn-link" onclick="viewBook(${review.book_id})">View Book</button>
            </div>
        </div>
        
        <div class="review-content">
            <p class="review-text">${review.review}</p>
        </div>
        
        ${canDelete ? `
        <div class="review-actions">
            <button class="btn btn-danger btn-sm" onclick="deleteReview(${review.id})" title="Delete Review">
                🗑️ Delete
            </button>
        </div>
        ` : ''}
    `;
    
    return element;
}

function updateReviewsCount(pagination) {
    const count = pagination.total;
    document.getElementById('reviewsCount').textContent = `Showing ${count} review${count !== 1 ? 's' : ''}`;
}

function updatePagination(pagination) {
    const paginationEl = document.getElementById('pagination');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    if (pagination.totalPages <= 1) {
        paginationEl.style.display = 'none';
        return;
    }
    
    paginationEl.style.display = 'flex';
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === pagination.totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${pagination.totalPages}`;
}

function viewBook(bookId) {
    window.location.href = `book.html?id=${bookId}`;
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
            loadReviews();
        } else {
            const error = await response.json().catch(() => null);
            alert((error && error.error) || 'Failed to delete review');
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        alert('Network error. Please try again.');
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
}

function showError(message) {
    const container = document.getElementById('reviewsContainer');
    container.innerHTML = `
        <div class="error-state">
            <h3>Error</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="loadReviews()">Try Again</button>
        </div>
    `;
}
