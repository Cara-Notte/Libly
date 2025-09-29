// book.js - manages book details page

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get('id');
    if (!bookId) {
        // No book id provided, redirect to search
        window.location.href = 'search.html';
        return;
    }
    loadBookDetails(bookId);
    // quick search functionality (navigate to search page)
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

// Helper to get auth headers
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
        // Populate static details
        document.getElementById('bookTitle').textContent = book.title;
        document.getElementById('bookAuthors').innerHTML = `<strong>Authors:</strong> ${authors && authors.length ? authors.map(a => a.name).join(', ') : 'N/A'}`;
        document.getElementById('bookGenres').innerHTML = `<strong>Genres:</strong> ${genres && genres.length ? genres.map(g => g.name).join(', ') : 'N/A'}`;
        document.getElementById('bookDescription').textContent = book.description || 'No description available.';
        // Set aggregated stats
        const avg = book.avg_rating !== null && book.avg_rating !== undefined ? Number(book.avg_rating).toFixed(1) : 'N/A';
        const count = book.rating_count || 0;
        const fav = favorites_count || 0;
        document.getElementById('bookStats').innerHTML = `⭐ ${avg} (${count} ${count === 1 ? 'rating' : 'ratings'}) | ❤️ ${fav} ${fav === 1 ? 'favorite' : 'favorites'}`;
        // If user logged in, enable rating and favorite sections
        const token = localStorage.getItem('authToken');
        if (token) {
            document.getElementById('ratingSection').style.display = 'block';
            document.getElementById('favoriteSection').style.display = 'block';
            // Load my rating and favorites
            loadMyRatingAndFavorite(bookId);
        }
    } catch (err) {
        console.error(err);
        document.getElementById('bookTitle').textContent = 'Error loading book';
    }
}

async function loadMyRatingAndFavorite(bookId) {
    try {
        // Fetch summary to get my_rating
        let myRating = null;
        try {
            const res = await fetch(`/books/${bookId}/summary`, {
                headers: getAuthHeaders()
            });
            if (res.ok) {
                const data = await res.json();
                myRating = data.my_rating ? data.my_rating.rating : null;
                // update aggregated stats just in case they changed
                if (data.book) {
                    const book = data.book;
                    const avg = book.avg_rating !== null && book.avg_rating !== undefined ? Number(book.avg_rating).toFixed(1) : 'N/A';
                    const count = book.rating_count || 0;
                    const fav = book.favorites_count || 0;
                    document.getElementById('bookStats').innerHTML = `⭐ ${avg} (${count} ${count === 1 ? 'rating' : 'ratings'}) | ❤️ ${fav} ${fav === 1 ? 'favorite' : 'favorites'}`;
                }
            }
        } catch (_) {
            // ignore if summary fails
        }
        // Create rating stars
        const starsContainer = document.getElementById('ratingStars');
        starsContainer.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.textContent = '★';
            star.dataset.value = i;
            star.style.cursor = 'pointer';
            star.style.fontSize = '1.5rem';
            star.style.color = i <= myRating ? '#f7c948' : '#ccc';
            star.onclick = async () => {
                await submitRating(bookId, i);
            };
            starsContainer.appendChild(star);
        }
        // favourite state
        let isFavourite = false;
        try {
            const favRes = await fetch('/me/favorites', { headers: getAuthHeaders() });
            if (favRes.ok) {
                const favs = await favRes.json();
                isFavourite = favs.some(b => b.id === Number(bookId));
            }
        } catch (_) {
            // ignore
        }
        updateFavoriteButton(bookId, isFavourite);
    } catch (err) {
        console.error('Error loading my rating/favorite', err);
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
        // Refresh my rating and aggregated stats
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
            // Update isFavourite based on response
            const newIsFav = !!data.favorited;
            updateFavoriteButton(bookId, newIsFav);
            // Refresh aggregated stats by refetching details
            await loadBookDetails(bookId);
        } catch (err) {
            alert('Error toggling favorite');
            console.error(err);
        }
    };
}