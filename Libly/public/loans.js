let currentUser = null;
let currentUserRole = null;
let selectedBook = null;
let searchTimeout = null;

function showNotification(message, type = 'info', title = '', duration = 5000) {
    let container = document.getElementById('notificationContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificationContainer';
        container.className = 'notification-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    const defaultTitles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Info'
    };
    
    const toastTitle = title || defaultTitles[type];
    const icon = icons[type] || icons.info;
    
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-content">
            <div class="toast-title">${toastTitle}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        <div class="toast-progress" style="animation-duration: ${duration}ms;"></div>
    `;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('removing');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

document.addEventListener('DOMContentLoaded', function() {
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

function setupEventListeners() {
    document.getElementById('borrowBookBtn').addEventListener('click', showBorrowBookModal);
    document.getElementById('closeBorrowModal').addEventListener('click', hideBorrowBookModal);
    document.getElementById('cancelBorrowBtn').addEventListener('click', hideBorrowBookModal);
    document.getElementById('borrowBookForm').addEventListener('submit', handleBorrowBook);

    document.getElementById('returnBookBtn').addEventListener('click', showReturnBookModal);
    document.getElementById('cancelReturnBtn').addEventListener('click', hideReturnBookModal);
    document.getElementById('returnBookForm').addEventListener('submit', handleReturnBook);

    document.getElementById('closeExtendModal').addEventListener('click', hideExtendLoanModal);
    document.getElementById('cancelExtendBtn').addEventListener('click', hideExtendLoanModal);
    document.getElementById('extendLoanForm').addEventListener('submit', handleExtendLoan);

    document.querySelectorAll('input[name="extensionDays"]').forEach(radio => {
        radio.addEventListener('change', updateExtensionPreview);
    });

    document.getElementById('closeConfirmReturnModal').addEventListener('click', hideConfirmReturnModal);
    document.getElementById('cancelConfirmReturnBtn').addEventListener('click', hideConfirmReturnModal);
    document.getElementById('confirmReturnBookBtn').addEventListener('click', handleConfirmReturn);

    document.getElementById('searchBooksBtn').addEventListener('click', searchBooks);
    document.getElementById('bookSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            searchBooks();
        }
    });

    document.getElementById('loanDuration').addEventListener('change', updateDueDatePreview);

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    });
}

async function loadUserLoans() {
    try {
        const response = await fetch('/me/loans', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            renderLoans(data.loans || []);
            updateLoansCount(data.loans ? data.loans.length : 0);
            checkDueSoonReminder(data.loans || []);
        } else {
            showLoansError('Failed to load loans');
        }
    } catch (error) {
        console.error('Error loading loans:', error);
        showLoansError('Network error. Please try again.');
    }
}

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

function checkDueSoonReminder(loans) {
    const reminderDiv = document.getElementById('dueSoonReminder');
    const reminderMessage = document.getElementById('dueSoonMessage');
    
    if (!reminderDiv || !reminderMessage) return;

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
    
    const dueTomorrowBooks = loans.filter(loan => {
        if (loan.status !== 'active') return false;
        
        const dueDate = new Date(loan.due_at);
        dueDate.setHours(0, 0, 0, 0);
        
        return dueDate >= tomorrow && dueDate < dayAfterTomorrow;
    });
    
    if (dueTomorrowBooks.length > 0) {
        const bookCount = dueTomorrowBooks.length;
        const bookWord = bookCount === 1 ? 'book' : 'books';
        
        reminderMessage.textContent = `You have ${bookCount} ${bookWord} due tomorrow. Please return ${bookCount === 1 ? 'it' : 'them'} on time to avoid late fees!`;
        reminderDiv.style.display = 'flex';
    } else {
        reminderDiv.style.display = 'none';
    }
}

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

function createLoanElement(loan) {
    const element = document.createElement('div');
    element.className = 'loan-card active';
    
    const borrowedDate = new Date(loan.borrowed_at).toLocaleDateString();
    const dueDate = new Date(loan.due_at).toLocaleDateString();
    const isOverdue = new Date(loan.due_at) < new Date() && loan.status === 'active';

    const lateFee = loan.current_late_fee || 0;
    const daysOverdue = loan.days_overdue || 0;
    const lateFeeDisplay = lateFee > 0 
        ? `<div class="late-fee-warning">
             <span class="late-fee-icon">⚠️</span>
             <div class="late-fee-info">
               <strong>Late Fee: Rp. ${lateFee.toLocaleString('id-ID')}</strong>
               <span class="days-overdue">${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue</span>
             </div>
           </div>` 
        : '';
    
    element.innerHTML = `
        <div class="loan-header">
            <div class="loan-book">
                <img src="${loan.cover_url || 'default-cover.jpg'}" alt="${loan.title} cover" class="book-cover-small">
                <div class="book-info">
                    <h4 class="book-title">${loan.title}</h4>
                    <p class="book-barcode">Barcode: ${loan.barcode}</p>
                </div>
            </div>
            <div class="loan-status ${isOverdue ? 'overdue' : ''}">
                <span class="status-badge">${isOverdue ? 'OVERDUE' : 'ACTIVE'}</span>
            </div>
        </div>
        
        ${lateFeeDisplay}
        
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
                ${!isOverdue ? `<button class="btn btn-extend btn-sm" onclick="extendLoan(${loan.id})">📅 Extend Due Date</button>` : ''}
                <button class="btn btn-primary btn-sm" onclick="returnLoan(${loan.id})">Return Book</button>
            </div>
        </div>
    `;
    
    return element;
}

function createLoanHistoryElement(loan) {
    const element = document.createElement('div');
    element.className = 'loan-card history';
    
    const borrowedDate = new Date(loan.borrowed_at).toLocaleDateString();
    const dueDate = new Date(loan.due_at).toLocaleDateString();
    const returnedDate = loan.returned_at ? new Date(loan.returned_at).toLocaleDateString() : 'Not returned';

    const lateFee = loan.late_fee || 0;
    const lateFeeDisplay = lateFee > 0 
        ? `<div class="loan-date late-fee-history">
             <span class="label">Late Fee Charged:</span>
             <span class="value fee-amount">Rp. ${lateFee.toLocaleString('id-ID')}</span>
           </div>` 
        : '';
    
    element.innerHTML = `
        <div class="loan-header">
            <div class="loan-book">
                <img src="${loan.cover_url || 'default-cover.jpg'}" alt="${loan.title} cover" class="book-cover-small">
                <div class="book-info">
                    <h4 class="book-title">${loan.title}</h4>
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
            ${lateFeeDisplay}
        </div>
    `;
    
    return element;
}

function showBorrowBookModal() {
    document.getElementById('borrowBookModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    document.getElementById('bookSearch').focus();
}

function hideBorrowBookModal() {
    document.getElementById('borrowBookModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    resetBorrowForm();
}

function showReturnBookModal() {
    populateReturnLoanSelect();
    document.getElementById('returnBookModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function hideReturnBookModal() {
    document.getElementById('returnBookModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('returnBookForm').reset();
}

async function searchBooks() {
    const query = document.getElementById('bookSearchInput').value.trim();
    
    if (query.length < 1) {
        showNotification('Please enter a search term to find books', 'warning', 'Search Required');
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
            <div class="book-availability ${isAvailable ? 'available' : 'unavailable'}">
                ${isAvailable ? `✅ Available (${availableCopies}/${totalCopies} copies)` : `❌ Unavailable (${availableCopies}/${totalCopies} copies)`}
            </div>
        </div>
    `;
    
    item.addEventListener('click', () => selectBook(book));
    
    return item;
}

function selectBook(book) {
    selectedBook = book;

    document.querySelectorAll('.book-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.querySelector(`[data-book-id="${book.id}"]`).classList.add('selected');

    document.getElementById('selectedBookCard').innerHTML = `
        <img src="${book.cover_url || 'default-cover.jpg'}" alt="${book.title} cover" class="book-cover">
        <div class="book-info">
            <h5>${book.title}</h5>
            <p>Available: ${book.available_copies || 0}/${book.total_copies || 0} copies</p>
        </div>
    `;

    document.getElementById('selectedBookSection').style.display = 'block';
    document.getElementById('loanSettingsSection').style.display = 'block';
    document.getElementById('confirmBorrowBtn').style.display = 'block';

    updateDueDatePreview();
    document.getElementById('availableCopies').textContent = `${book.available_copies || 0}/${book.total_copies || 0} copies`;

    document.getElementById('selectedBookSection').scrollIntoView({ behavior: 'smooth' });
}

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

async function handleBorrowBook(e) {
    e.preventDefault();
    
    if (!selectedBook) {
        showNotification('Please select a book to borrow', 'warning', 'Selection Required');
        return;
    }
    
    const availableCopies = selectedBook.available_copies || 0;
    if (availableCopies === 0) {
        showNotification('This book is not available for borrowing', 'error', 'Not Available');
        return;
    }
    
    const duration = parseInt(document.getElementById('loanDuration').value);

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
            const dueDate = document.getElementById('dueDatePreview').textContent;
            showNotification(
                `📚 ${selectedBook.title}\n📅 Due: ${dueDate}`,
                'success',
                'Book Borrowed Successfully!',
                6000
            );
            hideBorrowBookModal();
            loadUserLoans();
            loadLoanHistory();
        } else {
            const error = await response.json().catch(() => null);
            showNotification(
                (error && error.error) || 'Unknown error occurred',
                'error',
                'Failed to Borrow Book'
            );
        }
    } catch (error) {
        console.error('Error borrowing book:', error);
        showNotification('Please check your connection and try again', 'error', 'Network Error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

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

async function handleReturnBook(e) {
    e.preventDefault();
    
    const loanId = document.getElementById('returnLoanSelect').value;
    
    if (!loanId) {
        showNotification('Please select a loan to return', 'warning', 'Selection Required');
        return;
    }
    
    try {
        const response = await fetch(`/me/loans/${loanId}/return`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(result.message || 'Book returned successfully!', 'success', 'Return Successful');
            hideReturnBookModal();
            loadUserLoans();
            loadLoanHistory();
        } else {
            const error = await response.json().catch(() => null);
            showNotification((error && error.error) || 'Failed to return book', 'error', 'Return Failed');
        }
    } catch (error) {
        console.error('Error returning book:', error);
        showNotification('Network error. Please try again.', 'error', 'Network Error');
    }
}

async function returnLoan(loanId) {
    try {
        const response = await fetch('/me/loans', {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            showNotification('Failed to load loan details', 'error', 'Error');
            return;
        }
        
        const data = await response.json();
        const loan = data.loans.find(l => l.id === loanId);
        
        if (!loan) {
            showNotification('Loan not found', 'error', 'Error');
            return;
        }

        showConfirmReturnModal(loan);
    } catch (error) {
        console.error('Error loading loan details:', error);
        showNotification('Failed to load loan details', 'error', 'Error');
    }
}

function showConfirmReturnModal(loan) {
    const modal = document.getElementById('confirmReturnModal');
    const confirmBtn = document.getElementById('confirmReturnBookBtn');

    confirmBtn.dataset.loanId = loan.id;

    modal.style.display = 'flex';
}

async function handleConfirmReturn() {
    const confirmBtn = document.getElementById('confirmReturnBookBtn');
    const loanId = confirmBtn.dataset.loanId;

    document.getElementById('confirmReturnModal').style.display = 'none';
    
    try {
        const response = await fetch(`/me/loans/${loanId}/return`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(result.message || 'Book returned successfully!', 'success', 'Return Successful');
            loadUserLoans();
            loadLoanHistory();
        } else {
            const error = await response.json().catch(() => null);
            showNotification((error && error.error) || 'Failed to return book', 'error', 'Return Failed');
        }
    } catch (error) {
        console.error('Error returning book:', error);
        showNotification('Network error. Please try again.', 'error', 'Network Error');
    }
}

async function extendLoan(loanId) {
    try {
        const response = await fetch('/me/loans', {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            showNotification('Failed to load loan details', 'error', 'Error');
            return;
        }
        
        const data = await response.json();
        const loan = data.loans.find(l => l.id === loanId);
        
        if (!loan) {
            showNotification('Loan not found', 'error', 'Error');
            return;
        }

        window.currentExtendLoan = loan;

        const bookInfoContainer = document.getElementById('extendBookInfo');
        bookInfoContainer.innerHTML = `
            <img src="${loan.cover_url || 'default-cover.jpg'}" alt="${loan.title}" class="book-cover-tiny">
            <div class="book-details">
                <h4>${loan.title}</h4>
                <p>${loan.author || 'Unknown Author'}</p>
            </div>
        `;

        const currentDueDate = new Date(loan.due_at);
        document.getElementById('currentDueDate').textContent = currentDueDate.toLocaleDateString();

        updateExtensionPreview();

        document.getElementById('extendLoanModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
    } catch (error) {
        console.error('Error opening extend modal:', error);
        showNotification('Network error. Please try again.', 'error', 'Network Error');
    }
}

function updateExtensionPreview() {
    const selectedRadio = document.querySelector('input[name="extensionDays"]:checked');
    if (!selectedRadio || !window.currentExtendLoan) return;
    
    const days = parseInt(selectedRadio.value);
    const currentDue = new Date(window.currentExtendLoan.due_at);
    const newDue = new Date(currentDue);
    newDue.setDate(newDue.getDate() + days);
    
    document.getElementById('newDueDate').textContent = newDue.toLocaleDateString();
}

function hideExtendLoanModal() {
    document.getElementById('extendLoanModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    window.currentExtendLoan = null;
}

function hideConfirmReturnModal() {
    document.getElementById('confirmReturnModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

async function handleExtendLoan(e) {
    e.preventDefault();
    
    const selectedRadio = document.querySelector('input[name="extensionDays"]:checked');
    if (!selectedRadio || !window.currentExtendLoan) {
        showNotification('Please select an extension period', 'warning', 'Selection Required');
        return;
    }
    
    const days = parseInt(selectedRadio.value);
    const loanId = window.currentExtendLoan.id;

    const submitBtn = document.getElementById('confirmExtendBtn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Extending...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(`/me/loans/${loanId}/extend`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ days: days })
        });
        
        if (response.ok) {
            const result = await response.json();
            showNotification(result.message || 'Due date extended successfully!', 'success', 'Extension Successful');
            hideExtendLoanModal();
            loadUserLoans();
            loadLoanHistory();
        } else {
            const error = await response.json().catch(() => null);
            showNotification((error && error.error) || 'Failed to extend loan', 'error', 'Extension Failed');
        }
    } catch (error) {
        console.error('Error extending loan:', error);
        showNotification('Network error. Please try again.', 'error', 'Network Error');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function resetBorrowForm() {
    selectedBook = null;

    document.getElementById('bookSearchInput').value = '';
    document.getElementById('bookListContainer').innerHTML = '<div class="loading-message">Click "Search" to find available books</div>';

    document.getElementById('selectedBookSection').style.display = 'none';
    document.getElementById('loanSettingsSection').style.display = 'none';
    document.getElementById('confirmBorrowBtn').style.display = 'none';

    document.getElementById('loanDuration').value = '14';
    document.getElementById('dueDatePreview').textContent = '-';
    document.getElementById('availableCopies').textContent = '-';

    document.querySelectorAll('.book-item').forEach(item => {
        item.classList.remove('selected');
    });
}

function updateLoansCount(count) {
    document.getElementById('loansCount').textContent = `You have ${count} active loan${count !== 1 ? 's' : ''}`;
}

function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
}

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