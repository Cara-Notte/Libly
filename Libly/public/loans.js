// loans.js - manages the Loans page functionality

let currentUser = null;
let currentUserRole = null;
let selectedBook = null;
let searchTimeout = null;

// Initialize page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    currentUser = localStorage.getItem('currentUser');
    currentUserRole = localStorage.getItem('currentUserRole');
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    setupEventListeners();
    loadUserLoans();
    loadLoanHistory();
});

// Setup event listeners
function setupEventListeners() {
    // Borrow book button
    document.getElementById('borrowBookBtn').addEventListener('click', showBorrowBookModal);
    document.getElementById('closeBorrowModal').addEventListener('click', hideBorrowBookModal);
    document.getElementById('cancelBorrowBtn').addEventListener('click', hideBorrowBookModal);
    document.getElementById('borrowBookForm').addEventListener('submit', handleBorrowBook);
    
    // Return book button
    document.getElementById('returnBookBtn').addEventListener('click', showReturnBookModal);
    document.getElementById('cancelReturnBtn').addEventListener('click', hideReturnBookModal);
    document.getElementById('returnBookForm').addEventListener('submit', handleReturnBook);
    
    // Book search in borrow modal
    document.getElementById('searchBooksBtn').addEventListener('click', searchBooks);
    document.getElementById('bookSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchBooks();
        }
    });
    
    // Loan duration change
    document.getElementById('loanDuration').addEventListener('change', updateDueDatePreview);
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
}

// Load user's active loans
async function loadUserLoans() {
    try {
        const response = await fetch('/me/loans', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            renderLoans(data.loans || []);
            updateLoansCount(data.loans ? data.loans.length : 0);
        } else {
            showLoansError('Failed to load loans');
        }
    } catch (error) {
        console.error('Error loading loans:', error);
        showLoansError('Network error. Please try again.');
    }
}

// Load loan history
async function loadLoanHistory() {
    try {
        const response = await fetch('/me/loans/history', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            renderLoanHistory(data.loans || []);
        } else {
            showLoanHistoryError('Failed to load loan history');
        }
    } catch (error) {
        console.error('Error loading loan history:', error);
        showLoanHistoryError('Network error. Please try again.');
    }
}

// Render active loans
function renderLoans(loans) {
    const container = document.getElementById('loansContainer');
    
    if (loans.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No active loans</h3>
                <p>You don't have any active book loans at the moment.</p>
                <button class="btn btn-primary" onclick="showBorrowBookModal()">Borrow a Book</button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    loans.forEach(loan => {
        const loanElement = createLoanElement(loan);
        container.appendChild(loanElement);
    });
}

// Render loan history
function renderLoanHistory(loans) {
    const container = document.getElementById('loanHistoryContainer');
    
    if (loans.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No loan history</h3>
                <p>You haven't borrowed any books yet.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    loans.forEach(loan => {
        const loanElement = createLoanHistoryElement(loan);
        container.appendChild(loanElement);
    });
}

// Create loan element
function createLoanElement(loan) {
    const element = document.createElement('div');
    element.className = 'loan-card active';
    
    const borrowedDate = new Date(loan.borrowed_at).toLocaleDateString();
    const dueDate = new Date(loan.due_at).toLocaleDateString();
    const isOverdue = new Date(loan.due_at) < new Date() && loan.status === 'active';
    
    element.innerHTML = `
        <div class="loan-header">
            <div class="loan-book">
                <img src="${loan.cover_url || 'default-cover.jpg'}" alt="${loan.title} cover" class="book-cover-small">
                <div class="book-info">
                    <h4 class="book-title">${loan.title}</h4>
                    <p class="book-author">${loan.author || 'Unknown Author'}</p>
                    <p class="book-barcode">Barcode: ${loan.barcode}</p>
                </div>
            </div>
            <div class="loan-status ${isOverdue ? 'overdue' : ''}">
                <span class="status-badge">${isOverdue ? 'OVERDUE' : 'ACTIVE'}</span>
            </div>
        </div>
        
        <div class="loan-details">
            <div class="loan-date">
                <span class="label">Borrowed:</span>
                <span class="value">${borrowedDate}</span>
            </div>
            <div class="loan-date ${isOverdue ? 'overdue' : ''}">
                <span class="label">Due:</span>
                <span class="value">${dueDate}</span>
            </div>
            <div class="loan-actions">
                <button class="btn btn-primary btn-sm" onclick="returnLoan(${loan.id})">Return Book</button>
            </div>
        </div>
    `;
    
    return element;
}

// Create loan history element
function createLoanHistoryElement(loan) {
    const element = document.createElement('div');
    element.className = 'loan-card history';
    
    const borrowedDate = new Date(loan.borrowed_at).toLocaleDateString();
    const dueDate = new Date(loan.due_at).toLocaleDateString();
    const returnedDate = loan.returned_at ? new Date(loan.returned_at).toLocaleDateString() : 'Not returned';
    
    element.innerHTML = `
        <div class="loan-header">
            <div class="loan-book">
                <img src="${loan.cover_url || 'default-cover.jpg'}" alt="${loan.title} cover" class="book-cover-small">
                <div class="book-info">
                    <h4 class="book-title">${loan.title}</h4>
                    <p class="book-author">${loan.author || 'Unknown Author'}</p>
                    <p class="book-barcode">Barcode: ${loan.barcode}</p>
                </div>
            </div>
            <div class="loan-status">
                <span class="status-badge ${loan.status}">${loan.status.toUpperCase()}</span>
            </div>
        </div>
        
        <div class="loan-details">
            <div class="loan-date">
                <span class="label">Borrowed:</span>
                <span class="value">${borrowedDate}</span>
            </div>
            <div class="loan-date">
                <span class="label">Due:</span>
                <span class="value">${dueDate}</span>
            </div>
            <div class="loan-date">
                <span class="label">Returned:</span>
                <span class="value">${returnedDate}</span>
            </div>
        </div>
    `;
    
    return element;
}

// Show borrow book modal
function showBorrowBookModal() {
    document.getElementById('borrowBookModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('bookSearch').focus();
}

// Hide borrow book modal
function hideBorrowBookModal() {
    document.getElementById('borrowBookModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    resetBorrowForm();
}

// Show return book modal
function showReturnBookModal() {
    populateReturnLoanSelect();
    document.getElementById('returnBookModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Hide return book modal
function hideReturnBookModal() {
    document.getElementById('returnBookModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('returnBookForm').reset();
}

// Search books function
async function searchBooks() {
    const query = document.getElementById('bookSearchInput').value.trim();
    
    if (query.length < 1) {
        alert('Please enter a search term');
        return;
    }
    
    const container = document.getElementById('bookListContainer');
    container.innerHTML = '<div class="loading-message">🔍 Searching for books...</div>';
    
    try {
        console.log('Searching for:', query);
        const response = await fetch(`/books/search?q=${encodeURIComponent(query)}&limit=20`);
        
        if (response.ok) {
            const books = await response.json();
            console.log('Search results:', books);
            displayBookList(books);
        } else {
            container.innerHTML = '<div class="loading-message">❌ Failed to search books. Please try again.</div>';
        }
    } catch (error) {
        console.error('Error searching books:', error);
        container.innerHTML = '<div class="loading-message">❌ Network error. Please check your connection.</div>';
    }
}

// Display book list
function displayBookList(books) {
    const container = document.getElementById('bookListContainer');
    
    if (!books || books.length === 0) {
        container.innerHTML = '<div class="loading-message">📚 No books found. Try a different search term.</div>';
        return;
    }
    
    container.innerHTML = '';
    
    books.forEach(book => {
        const bookItem = createBookItem(book);
        container.appendChild(bookItem);
    });
}

// Create book item element
function createBookItem(book) {
    const item = document.createElement('div');
    item.className = 'book-item';
    item.dataset.bookId = book.id;
    
    const availableCopies = book.available_copies || 0;
    const totalCopies = book.total_copies || 0;
    const isAvailable = availableCopies > 0;
    
    item.innerHTML = `
        <img src="${book.cover_url || 'default-cover.jpg'}" alt="${book.title} cover" class="book-cover">
        <div class="book-info">
            <div class="book-title">${book.title}</div>
            <div class="book-author">${book.author || 'Unknown Author'}</div>
            <div class="book-availability ${isAvailable ? 'available' : 'unavailable'}">
                ${isAvailable ? `✅ Available (${availableCopies}/${totalCopies} copies)` : `❌ Unavailable (${availableCopies}/${totalCopies} copies)`}
            </div>
        </div>
    `;
    
    item.addEventListener('click', () => selectBook(book));
    
    return item;
}


// Select book for borrowing
function selectBook(book) {
    selectedBook = book;
    
    // Update visual selection
    document.querySelectorAll('.book-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelector(`[data-book-id="${book.id}"]`).classList.add('selected');
    
    // Show selected book section
    document.getElementById('selectedBookCard').innerHTML = `
        <img src="${book.cover_url || 'default-cover.jpg'}" alt="${book.title} cover" class="book-cover">
        <div class="book-info">
            <h5>${book.title}</h5>
            <p>${book.author || 'Unknown Author'}</p>
            <p>Available: ${book.available_copies || 0}/${book.total_copies || 0} copies</p>
        </div>
    `;
    
    // Show sections
    document.getElementById('selectedBookSection').style.display = 'block';
    document.getElementById('loanSettingsSection').style.display = 'block';
    document.getElementById('confirmBorrowBtn').style.display = 'block';
    
    // Update loan info
    updateDueDatePreview();
    document.getElementById('availableCopies').textContent = `${book.available_copies || 0}/${book.total_copies || 0} copies`;
    
    // Scroll to selected book section
    document.getElementById('selectedBookSection').scrollIntoView({ behavior: 'smooth' });
}

// Update due date preview
function updateDueDatePreview() {
    const duration = parseInt(document.getElementById('loanDuration').value);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + duration);
    
    document.getElementById('dueDatePreview').textContent = dueDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Handle borrow book
async function handleBorrowBook(e) {
    e.preventDefault();
    
    if (!selectedBook) {
        alert('Please select a book to borrow');
        return;
    }
    
    const availableCopies = selectedBook.available_copies || 0;
    if (availableCopies === 0) {
        alert('This book is not available for borrowing');
        return;
    }
    
    const duration = parseInt(document.getElementById('loanDuration').value);
    
    // Show loading state
    const submitBtn = document.getElementById('confirmBorrowBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/me/loans', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                book_id: selectedBook.id,
                duration_days: duration
            })
        });
        
        if (response.ok) {
            alert(`✅ Book borrowed successfully!\n\n📚 ${selectedBook.title}\n📅 Due: ${document.getElementById('dueDatePreview').textContent}`);
            hideBorrowBookModal();
            loadUserLoans();
            loadLoanHistory();
        } else {
            const error = await response.json().catch(() => null);
            alert(`❌ Failed to borrow book: ${(error && error.error) || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error borrowing book:', error);
        alert('❌ Network error. Please try again.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Populate return loan select
async function populateReturnLoanSelect() {
    try {
        const response = await fetch('/me/loans', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            const select = document.getElementById('returnLoanSelect');
            
            select.innerHTML = '<option value="">Select a loan...</option>';
            
            if (data.loans && data.loans.length > 0) {
                data.loans.forEach(loan => {
                    const option = document.createElement('option');
                    option.value = loan.id;
                    option.textContent = `${loan.title} (Due: ${new Date(loan.due_at).toLocaleDateString()})`;
                    select.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading loans for return:', error);
    }
}

// Handle return book
async function handleReturnBook(e) {
    e.preventDefault();
    
    const loanId = document.getElementById('returnLoanSelect').value;
    
    if (!loanId) {
        alert('Please select a loan to return');
        return;
    }
    
    try {
        const response = await fetch(`/me/loans/${loanId}/return`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            alert('Book returned successfully!');
            hideReturnBookModal();
            loadUserLoans();
            loadLoanHistory();
        } else {
            const error = await response.json().catch(() => null);
            alert((error && error.error) || 'Failed to return book');
        }
    } catch (error) {
        console.error('Error returning book:', error);
        alert('Network error. Please try again.');
    }
}

// Return loan directly
async function returnLoan(loanId) {
    if (!confirm('Are you sure you want to return this book?')) {
        return;
    }
    
    try {
        const response = await fetch(`/me/loans/${loanId}/return`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            alert('Book returned successfully!');
            loadUserLoans();
            loadLoanHistory();
        } else {
            const error = await response.json().catch(() => null);
            alert((error && error.error) || 'Failed to return book');
        }
    } catch (error) {
        console.error('Error returning book:', error);
        alert('Network error. Please try again.');
    }
}

// Reset borrow form
function resetBorrowForm() {
    selectedBook = null;
    
    // Reset search
    document.getElementById('bookSearchInput').value = '';
    document.getElementById('bookListContainer').innerHTML = '<div class="loading-message">Click "Search" to find available books</div>';
    
    // Hide sections
    document.getElementById('selectedBookSection').style.display = 'none';
    document.getElementById('loanSettingsSection').style.display = 'none';
    document.getElementById('confirmBorrowBtn').style.display = 'none';
    
    // Reset form values
    document.getElementById('loanDuration').value = '14';
    document.getElementById('dueDatePreview').textContent = '-';
    document.getElementById('availableCopies').textContent = '-';
    
    // Clear selections
    document.querySelectorAll('.book-item').forEach(item => {
        item.classList.remove('selected');
    });
}

// Update loans count
function updateLoansCount(count) {
    document.getElementById('loansCount').textContent = `You have ${count} active loan${count !== 1 ? 's' : ''}`;
}

// Helper function to get authentication headers
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
}

// Show loans error
function showLoansError(message) {
    const container = document.getElementById('loansContainer');
    container.innerHTML = `
        <div class="error-state">
            <h3>Error</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="loadUserLoans()">Try Again</button>
        </div>
    `;
}

// Show loan history error
function showLoanHistoryError(message) {
    const container = document.getElementById('loanHistoryContainer');
    container.innerHTML = `
        <div class="error-state">
            <h3>Error</h3>
            <p>${message}</p>
            <button class="btn btn-primary" onclick="loadLoanHistory()">Try Again</button>
        </div>
    `;
}

