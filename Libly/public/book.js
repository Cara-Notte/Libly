document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('id');
    if (!bookId) {
        window.location.href = 'search.html';
        return;
    }
    loadBookDetails(bookId);
    const searchInput = document.getElementById('quickSearch');
    const searchBtn = document.getElementById('quickSearchBtn');
    searchBtn.addEventListener('click', () => {
        const q = searchInput.value.trim();
        if (q) {
            window.location.href = `search.html?q=${encodeURIComponent(q)}`;
        }
    });
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const q = searchInput.value.trim();
            if (q) {
                window.location.href = `search.html?q=${encodeURIComponent(q)}`;
            }
        }
    });
});

function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    return headers;
}

async function loadBookDetails(bookId) {
    try {
        const res = await fetch(`/books/${bookId}`);
        if (!res.ok) throw new Error('Failed to fetch book');
        const data = await res.json();
        const { book, authors, genres, favorites_count } = data;
        const coverEl = document.getElementById('bookCover');
        if (coverEl) {
            coverEl.src = book.cover_url || 'default-cover.jpg';
            coverEl.alt = `${book.title} cover`;
        }
        document.getElementById('bookTitle').textContent = book.title;
        document.getElementById('bookAuthors').innerHTML = `<strong>Authors:</strong> ${authors && authors.length ? authors.map(a => a.name).join(', ') : 'N/A'}`;
        document.getElementById('bookGenres').innerHTML = `<strong>Genres:</strong> ${genres && genres.length ? genres.map(g => g.name).join(', ') : 'N/A'}`;
        document.getElementById('bookDescription').textContent = book.description || 'No description available.';
        const avg = book.avg_rating !== null && book.avg_rating !== undefined ? Number(book.avg_rating).toFixed(1) : 'N/A';
        const count = book.rating_count || 0;
        const fav = favorites_count || 0;
        document.getElementById('bookStats').innerHTML = `⭐ ${avg} (${count} ${count === 1 ? 'rating' : 'ratings'}) | ❤️ ${fav} ${fav === 1 ? 'favorite' : 'favorites'}`;
        const token = localStorage.getItem('authToken');
        if (token) {
            document.getElementById('ratingSection').style.display = 'block';
            document.getElementById('favoriteSection').style.display = 'block';
            document.getElementById('collectionSection').style.display = 'block';
            loadMyRatingAndFavorite(bookId);
            setupCollectionButton(bookId, book.title);
        }
    } catch (err) {
        console.error(err);
        document.getElementById('bookTitle').textContent = 'Error loading book';
    }
}

async function loadMyRatingAndFavorite(bookId) {
    try {
        let myRating = null;
        try {
            const res = await fetch(`/books/${bookId}/summary`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                myRating = data.my_rating ? data.my_rating.rating : null;
                if (data.book) {
                    const book = data.book;
                    const avg = book.avg_rating !== null && book.avg_rating !== undefined ? Number(book.avg_rating).toFixed(1) : 'N/A';
                    const count = book.rating_count || 0;
                    const fav = book.favorites_count || 0;
                    document.getElementById('bookStats').innerHTML = `⭐ ${avg} (${count} ${count === 1 ? 'rating' : 'ratings'}) | ❤️ ${fav} ${fav === 1 ? 'favorite' : 'favorites'}`;
                }
            }
        } catch (_) {
        }
        const starsContainer = document.getElementById('ratingStars');
        starsContainer.innerHTML = '';
        let selectedRating = myRating || 0;
        
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.dataset.value = i;
            star.style.cursor = 'pointer';
            star.style.fontSize = '1.5rem';
            star.style.color = i <= myRating ? '#f7c948' : '#ccc';
            star.onclick = () => selectRating(i);
            starsContainer.appendChild(star);
        }

        if (myRating && myRating.review) {
            document.getElementById('reviewText').value = myRating.review;
            updateCharCount();
        }

        setupRatingForm(bookId);
        let isFavourite = false;
        try {
            const favRes = await fetch('/me/favorites', { headers: getAuthHeaders() });
            if (favRes.ok) {
                const favs = await favRes.json();
                isFavourite = favs.some(b => b.id === Number(bookId));
            }
        } catch (_) {
        }
        updateFavoriteButton(bookId, isFavourite);
    } catch (err) {
        console.error('Error loading my rating/favorite', err);
    }
}

function selectRating(rating) {
    const stars = document.querySelectorAll('#ratingStars span');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.color = '#f7c948';
            star.classList.add('active');
        } else {
            star.style.color = '#ccc';
            star.classList.remove('active');
        }
    });

    document.getElementById('submitRatingBtn').style.display = 'block';
}

function setupRatingForm(bookId) {
    const reviewText = document.getElementById('reviewText');
    const charCount = document.getElementById('charCount');
    const submitBtn = document.getElementById('submitRatingBtn');
    
    reviewText.addEventListener('input', updateCharCount);
    submitBtn.addEventListener('click', () => submitRatingAndReview(bookId));
}

function updateCharCount() {
    const reviewText = document.getElementById('reviewText');
    const charCount = document.getElementById('charCount');
    const length = reviewText.value.length;
    charCount.textContent = length;
    
    if (length > 900) {
        charCount.style.color = 'var(--warning)';
    } else if (length > 800) {
        charCount.style.color = 'var(--accent-color)';
    } else {
        charCount.style.color = 'var(--text-light)';
    }
}

async function submitRatingAndReview(bookId) {
    const stars = document.querySelectorAll('#ratingStars span.active');
    const rating = stars.length;
    const review = document.getElementById('reviewText').value.trim();
    
    if (rating === 0) {
        alert('Please select a rating');
        return;
    }
    
    try {
        const res = await fetch(`/books/${bookId}/rating`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ 
                rating: rating,
                review: review || null
            })
        });
        
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            alert((err && (err.error || err.message)) || 'Failed to submit rating');
            return;
        }

        document.getElementById('submitRatingBtn').style.display = 'none';
        alert('Rating and review submitted successfully!');

        await loadMyRatingAndFavorite(bookId);
    } catch (err) {
        alert('Error submitting rating');
        console.error(err);
    }
}

async function submitRating(bookId, rating) {
    try {
        const res = await fetch(`/books/${bookId}/rating`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ rating })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => null);
            alert((err && (err.error || err.message)) || 'Failed to submit rating');
            return;
        }
        await loadMyRatingAndFavorite(bookId);
    } catch (err) {
        alert('Error submitting rating');
        console.error(err);
    }
}

function updateFavoriteButton(bookId, isFavourite) {
    const favSection = document.getElementById('favoriteSection');
    const btn = document.getElementById('favoriteBtn');
    if (isFavourite) {
        btn.textContent = '💔 Unfavorite';
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-danger');
    } else {
        btn.textContent = '❤️ Favorite';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-secondary');
    }
    btn.onclick = async () => {
        try {
            const res = await fetch(`/books/${bookId}/favorite`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            if (!res.ok) {
                const err = await res.json().catch(() => null);
                alert((err && (err.error || err.message)) || 'Failed to toggle favorite');
                return;
            }
            const data = await res.json();
            const newIsFav = !!data.favorited;
            updateFavoriteButton(bookId, newIsFav);
            await loadBookDetails(bookId);
        } catch (err) {
            alert('Error toggling favorite');
            console.error(err);
        }
    };
}

function setupCollectionButton(bookId, bookTitle) {
    const addToCollectionBtn = document.getElementById('addToCollectionBtn');
    
    addToCollectionBtn.onclick = async () => {
        try {
            const response = await fetch('/me/collections', {
                headers: getAuthHeaders()
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
    };
}

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

    if (!modal.dataset.listenersAdded) {
        document.getElementById('confirmAddToCollection').addEventListener('click', handleAddToCollection);
        document.getElementById('cancelAddToCollection').addEventListener('click', hideAddToCollectionModal);
        
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                hideAddToCollectionModal();
            }
        });
        
        modal.dataset.listenersAdded = 'true';
    }
}

function hideAddToCollectionModal() {
    const modal = document.getElementById('addToCollectionModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('selectCollection').value = '';
    document.getElementById('collectionNote').value = '';
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
            headers: getAuthHeaders(),
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