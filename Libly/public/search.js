document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const attributeSelect = document.getElementById('searchAttribute');
    // Load initial search from URL params
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const attribute = params.get('attribute') || '';
    if (q) searchInput.value = q;
    if (attribute) attributeSelect.value = attribute;
    if (q) {
        performSearch(q, attribute);
    }
    // Event listeners for search
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

// Update query parameters without reloading page
function updateUrl(query, attribute) {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (attribute) params.set('attribute', attribute);
    const newUrl = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, '', newUrl);
}

// Perform search by calling the API and rendering results
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
    const promises = books.map(book => fetch(`/books/${book.id}`).then(res => res.ok ? res.json() : null));
    const details = await Promise.all(promises);
    books.forEach((book, idx) => {
        const detail = details[idx];
        const card = document.createElement('div');
        card.className = 'book-card';
        const titleEl = document.createElement('h3');
        titleEl.textContent = book.title;
        card.appendChild(titleEl);
        let authors = '';
        let genres = '';
        if (detail && detail.authors) {
            authors = detail.authors.map(a => a.name).join(', ');
        }
        if (detail && detail.genres) {
            genres = detail.genres.map(g => g.name).join(', ');
        }
        const authorEl = document.createElement('p');
        authorEl.innerHTML = `<strong>Authors:</strong> ${authors || 'N/A'}`;
        card.appendChild(authorEl);
        const genreEl = document.createElement('p');
        genreEl.innerHTML = `<strong>Genres:</strong> ${genres || 'N/A'}`;
        card.appendChild(genreEl);
        const desc = document.createElement('p');
        const snippet = (book.description || '').substring(0, 200);
        desc.textContent = snippet ? snippet + (book.description && book.description.length > 200 ? '...' : '') : 'No description available.';
        card.appendChild(desc);
        const stats = document.createElement('p');
        const avg = book.avg_rating !== null && book.avg_rating !== undefined ? Number(book.avg_rating).toFixed(1) : 'N/A';
        const count = book.rating_count || 0;
        const fav = book.favorites_count || 0;
        stats.innerHTML = `⭐ ${avg} (${count} ${count === 1 ? 'rating' : 'ratings'}) | ❤️ ${fav} ${fav === 1 ? 'favorite' : 'favorites'}`;
        card.appendChild(stats);
        const viewBtn = document.createElement('button');
        viewBtn.textContent = 'View';
        viewBtn.className = 'btn btn-primary';
        viewBtn.onclick = () => {
            window.location.href = `book.html?id=${book.id}`;
        };
        card.appendChild(viewBtn);
        container.appendChild(card);
    });
}