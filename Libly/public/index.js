document.addEventListener('DOMContentLoaded', function() {
    const elements = document.querySelectorAll('.fade-in');
    elements.forEach((el, index) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, index * 100);
    });

    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            element.textContent = Math.floor(start);
            if (start >= target) {
                element.textContent = target;
                clearInterval(timer);
            }
        }, 16);
    }

    async function loadStats() {
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();

            const statNumbers = document.querySelectorAll('.stat-number');
            statNumbers.forEach(number => {
                const label = number.nextElementSibling.textContent;
                if (label === 'Books Available') {
                    number.setAttribute('data-target', stats.booksAvailable);
                } else if (label === 'Active Members') {
                    number.setAttribute('data-target', stats.activeMembers);
                }
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -50px 0px'
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(number => {
                    const target = parseInt(number.getAttribute('data-target'));
                    animateCounter(number, target);
                });
                statsObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        loadStats().then(() => {
            statsObserver.observe(heroStats);
        });
    }

    let ticking = false;
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const books = document.querySelectorAll('.book');
        
        books.forEach((book, index) => {
            const speed = (index + 1) * 0.5;
            book.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
        
        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);

    document.addEventListener('mousemove', (e) => {
        const orbs = document.querySelectorAll('.orb');
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 20;
            const x = (mouseX - 0.5) * speed;
            const y = (mouseY - 0.5) * speed;
            orb.style.transform = `translate(${x}px, ${y}px)`;
        });
    });

    setTimeout(() => {
        const typingElement = document.querySelector('.typing-animation');
        if (typingElement) {
            typingElement.style.borderRight = 'none';
        }
    }, 5000);

    const ferrisWheel = document.getElementById('ferrisWheel');
    const cards = document.querySelectorAll('.ferris-card');
    let isDragging = false;
    let currentRotation = 0;
    let lastMouseAngle = 0;
    let autoRotateInterval;

    function startAutoRotation() {
        if (autoRotateInterval) return;
        
        autoRotateInterval = setInterval(() => {
            if (!isDragging) {
                currentRotation += 0.3;
                updateCardPositions();
            }
        }, 50);
    }

    function stopAutoRotation() {
        if (autoRotateInterval) {
            clearInterval(autoRotateInterval);
            autoRotateInterval = null;
        }
    }

    function getMouseAngle(e, centerX, centerY) {
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        return Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    }

    function updateCardPositions() {
        const radius = 200;
        const containerRect = ferrisWheel.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;
        
        cards.forEach((card, index) => {
            const cardAngle = currentRotation + (index * 90);
            const angleRad = (cardAngle - 90) * (Math.PI / 180);
            
            const x = centerX + Math.cos(angleRad) * radius;
            const y = centerY + Math.sin(angleRad) * radius;
            
            card.style.left = x + 'px';
            card.style.top = y + 'px';
            const normalizedAngle = ((cardAngle % 360) + 360) % 360;
            const isAtTop = normalizedAngle <= 45 || normalizedAngle >= 315;
            
            if (isAtTop) {
                card.classList.add('highlighted');
            } else {
                card.classList.remove('highlighted');
            }
        });
    }

    function onMouseDown(e) {
        isDragging = true;
        stopAutoRotation();
        const containerRect = ferrisWheel.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;
        const centerY = containerRect.top + containerRect.height / 2;
        lastMouseAngle = getMouseAngle(e, centerX, centerY);
        ferrisWheel.style.cursor = 'grabbing';
        e.preventDefault();
    }

    function onMouseMove(e) {
        if (!isDragging) return;
        
        const containerRect = ferrisWheel.getBoundingClientRect();
        const centerX = containerRect.left + containerRect.width / 2;
        const centerY = containerRect.top + containerRect.height / 2;
        const currentMouseAngle = getMouseAngle(e, centerX, centerY);
        
        let angleDiff = currentMouseAngle - lastMouseAngle;

        if (angleDiff > 180) angleDiff -= 360;
        if (angleDiff < -180) angleDiff += 360;
        
        currentRotation += angleDiff;
        lastMouseAngle = currentMouseAngle;
        
        updateCardPositions();
        e.preventDefault();
    }

    function onMouseUp() {
        isDragging = false;
        ferrisWheel.style.cursor = 'grab';
        setTimeout(startAutoRotation, 2000);
    }

    ferrisWheel.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    ferrisWheel.addEventListener('mouseenter', stopAutoRotation);
    ferrisWheel.addEventListener('mouseleave', () => {
        if (!isDragging) {
            setTimeout(startAutoRotation, 1000);
        }
    });

    ferrisWheel.addEventListener('touchstart', (e) => {
        stopAutoRotation();
        const touch = e.touches[0];
        const mouseEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => e.preventDefault()
        };
        onMouseDown(mouseEvent);
    });

    document.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches.length > 0) {
            const touch = e.touches[0];
            const mouseEvent = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => e.preventDefault()
            };
            onMouseMove(mouseEvent);
        }
    });

    document.addEventListener('touchend', () => {
        onMouseUp();
        setTimeout(startAutoRotation, 2000);
    });

    updateCardPositions();
    setTimeout(startAutoRotation, 1000);
    loadBookRecommendations();
});

async function loadBookRecommendations() {
    try {
        const todayPickResponse = await fetch('/books/random');
        const todayPick = await todayPickResponse.json();
        displayBook('todayPick', todayPick);

        const topRatedResponse = await fetch('/books/top-rated');
        const topRated = await topRatedResponse.json();
        displayBook('topRated', topRated);

        const mostFavoritedResponse = await fetch('/books/most-favorited');
        const mostFavorited = await mostFavoritedResponse.json();
        displayBook('mostFavorited', mostFavorited);
    } catch (error) {
        console.error('Error loading book recommendations:', error);
        document.querySelectorAll('.books-grid').forEach(grid => {
            grid.innerHTML = '<p class="error-message">Failed to load recommendations</p>';
        });
    }
}

function displayBook(containerId, book) {
    const container = document.getElementById(containerId);
    
    if (!book) {
        container.innerHTML = '<p class="no-books">No books available</p>';
        return;
    }

    const bookCard = document.createElement('div');
    bookCard.className = 'book-card';
    bookCard.innerHTML = `
        <div class="book-cover">
            ${book.cover_url 
                ? `<img src="${book.cover_url}" alt="${book.title}" onerror="this.parentElement.innerHTML='<div class=\\'placeholder-cover\\'><span>📚</span><p>${book.title}</p></div>'">` 
                : `<div class="placeholder-cover"><span>📚</span><p>${book.title}</p></div>`
            }
        </div>
        <div class="book-info">
            <h3 class="book-title">${book.title}</h3>
            <p class="book-authors">${book.authors || 'Unknown Author'}</p>
            <div class="book-meta">
                ${book.average_rating ? `<span class="book-rating">⭐ ${Number(book.average_rating).toFixed(1)}</span>` : ''}
                ${book.favorites_count ? `<span class="book-favorites">❤️ ${book.favorites_count}</span>` : ''}
                <span class="book-pages">📄 ${book.page_count || 'N/A'} pages</span>
            </div>
            <a href="book.html?id=${book.id}" class="btn btn-small btn-primary">View Details</a>
        </div>
    `;
    
    container.innerHTML = '';
    container.appendChild(bookCard);
}
