class LiblyNavigation {
    constructor() {
        this.currentUser = localStorage.getItem('currentUser');
        this.currentUserRole = localStorage.getItem('currentUserRole');
        this.init();
    }
    
    init() {
        this.setupSearchFunctionality();
        this.updateNavigationState();
        this.setupProfileDropdown();
    }
    
    isAuthenticated() {
        return !!this.currentUser;
    }
    
    updateNavigationState() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;
        
        const existingProfile = navMenu.querySelector('.profile-dropdown');
        const existingLogin = navMenu.querySelector('a[href="login.html"]');
        const existingRegister = navMenu.querySelector('a[href="register.html"]');
        
        if (existingProfile) existingProfile.remove();
        if (existingLogin) existingLogin.remove();
        if (existingRegister && !this.isAuthenticated()) {
        } else if (existingRegister) {
            existingRegister.remove();
        }
        
        if (this.isAuthenticated()) {
            this.addProfileDropdown(navMenu);
            const existingBooks = navMenu.querySelector('a[href="books.html"]');
            if (existingBooks) existingBooks.remove();
            const booksLink = document.createElement('a');
            booksLink.href = 'books.html';
            booksLink.className = 'nav-item';
            booksLink.textContent = 'Books';
            navMenu.insertBefore(booksLink, navMenu.firstChild.nextSibling);
            
            const existingReviews = navMenu.querySelector('a[href="reviews.html"]');
            if (existingReviews) existingReviews.remove();
            const reviewsLink = document.createElement('a');
            reviewsLink.href = 'reviews.html';
            reviewsLink.className = 'nav-item';
            reviewsLink.textContent = 'Reviews';
            navMenu.insertBefore(reviewsLink, navMenu.firstChild.nextSibling.nextSibling);
            
            const loansLink = document.createElement('a');
            loansLink.href = 'loans.html';
            loansLink.className = 'nav-item';
            loansLink.id = 'loansNavLink';
            loansLink.textContent = 'Loans';
            navMenu.insertBefore(loansLink, navMenu.firstChild.nextSibling.nextSibling.nextSibling);

            this.checkDueSoonNotifications();
   
            if (this.currentUserRole === 'admin') {
                const existingAdmin = navMenu.querySelector('a[href="admin.html"]');
                if (existingAdmin) existingAdmin.remove();
                const adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.className = 'nav-item';
                adminLink.textContent = 'Admin';
                navMenu.insertBefore(adminLink, navMenu.firstChild.nextSibling.nextSibling.nextSibling.nextSibling);
            }
            
            if (this.currentUserRole === 'librarian') {
                const existingLibrarian = navMenu.querySelector('a[href="librarian.html"]');
                if (existingLibrarian) existingLibrarian.remove();
                const librarianLink = document.createElement('a');
                librarianLink.href = 'librarian.html';
                librarianLink.className = 'nav-item';
                librarianLink.textContent = 'Librarian';
                navMenu.insertBefore(librarianLink, navMenu.firstChild.nextSibling.nextSibling.nextSibling.nextSibling);
            }
        } else {
            this.addAuthButtons(navMenu);
            const existingBooks = navMenu.querySelector('a[href="books.html"]');
            if (existingBooks) existingBooks.remove();
            const booksLink = document.createElement('a');
            booksLink.href = 'books.html';
            booksLink.className = 'nav-item';
            booksLink.textContent = 'Books';
            navMenu.insertBefore(booksLink, navMenu.firstChild.nextSibling);
            
            const existingReviews = navMenu.querySelector('a[href="reviews.html"]');
            if (existingReviews) existingReviews.remove();
            const reviewsLink = document.createElement('a');
            reviewsLink.href = 'reviews.html';
            reviewsLink.className = 'nav-item';
            reviewsLink.textContent = 'Reviews';
            navMenu.insertBefore(reviewsLink, navMenu.firstChild.nextSibling.nextSibling);
            
            const loansLink = document.createElement('a');
            loansLink.href = 'loans.html';
            loansLink.className = 'nav-item';
            loansLink.textContent = 'Loans';
            navMenu.insertBefore(loansLink, navMenu.firstChild.nextSibling.nextSibling.nextSibling);
            
            const existingAdmin = navMenu.querySelector('a[href="admin.html"]');
            if (existingAdmin) existingAdmin.remove();
            
            const existingLibrarian = navMenu.querySelector('a[href="librarian.html"]');
            if (existingLibrarian) existingLibrarian.remove();
        }
    }
    addProfileDropdown(navMenu) {
        const profileDropdown = document.createElement('div');
        profileDropdown.className = 'profile-dropdown';
        
        const profileBtn = document.createElement('button');
        profileBtn.className = 'profile-btn';
        profileBtn.onclick = () => this.toggleProfileMenu();
        
        const profileAvatar = document.createElement('div');
        profileAvatar.className = 'profile-avatar';
        profileAvatar.textContent = this.currentUser.charAt(0).toUpperCase();
        
        const profileName = document.createElement('span');
        profileName.textContent = this.currentUser;
        
        const dropdownArrow = document.createElement('span');
        dropdownArrow.textContent = '▼';
        
        profileBtn.appendChild(profileAvatar);
        profileBtn.appendChild(profileName);
        profileBtn.appendChild(dropdownArrow);
        
        const profileMenu = document.createElement('div');
        profileMenu.className = 'profile-menu';
        profileMenu.id = 'profileMenu';
        
        const dashboardItem = document.createElement('a');
        dashboardItem.href = 'dashboard.html';
        dashboardItem.className = 'profile-menu-item';
        dashboardItem.innerHTML = '<span>📊</span> Dashboard';
        
        const settingsItem = document.createElement('a');
        settingsItem.href = 'account_settings.html';
        settingsItem.className = 'profile-menu-item';
        settingsItem.innerHTML = '<span>⚙️</span> Account Settings';
        
        const libraryItem = document.createElement('a');
        libraryItem.href = 'my_library.html';
        libraryItem.className = 'profile-menu-item';
        libraryItem.innerHTML = '<span>📚</span> My Library';
        
        const logoutItem = document.createElement('div');
        logoutItem.className = 'profile-menu-item danger';
        logoutItem.innerHTML = '<span>🚪</span> Logout';
        logoutItem.onclick = () => this.handleLogout();
        
        profileMenu.appendChild(dashboardItem);
        profileMenu.appendChild(settingsItem);
        profileMenu.appendChild(libraryItem);
        profileMenu.appendChild(logoutItem);
        
        profileDropdown.appendChild(profileBtn);
        profileDropdown.appendChild(profileMenu);
        navMenu.appendChild(profileDropdown);
    }
    
    addAuthButtons(navMenu) {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        if (currentPage !== 'login.html') {
            const loginBtn = document.createElement('a');
            loginBtn.href = 'login.html';
            loginBtn.className = 'btn btn-primary';
            loginBtn.textContent = 'Login';
            navMenu.appendChild(loginBtn);
        }
        
        if (currentPage !== 'register.html') {
            const registerBtn = document.createElement('a');
            registerBtn.href = 'register.html';
            registerBtn.className = 'btn btn-secondary';
            registerBtn.textContent = 'Register';
            navMenu.appendChild(registerBtn);
        }
    }

    setupSearchFunctionality() {
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer) return;
        const searchIcon = searchContainer.querySelector('.search-icon');
        const searchInput = searchContainer.querySelector('.search-input');
        if (!searchInput) return;
        const attrSelect = document.createElement('select');
        attrSelect.className = 'search-attribute-main';
        attrSelect.style.display = 'none';
        [
            { value: '', label: 'All' },
            { value: 'title', label: 'Title' },
            { value: 'author', label: 'Author' },
            { value: 'genre', label: 'Genre' }
        ].forEach(opt => {
            const o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.label;
            attrSelect.appendChild(o);
        });
        searchContainer.insertBefore(attrSelect, searchInput);
        if (searchIcon) {
            searchIcon.style.cursor = 'pointer';
            searchIcon.addEventListener('click', () => {
                attrSelect.style.display = attrSelect.style.display === 'none' ? 'inline-block' : 'none';
            });
        }
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                const attribute = attrSelect.value || '';
                this.redirectToSearch(query, attribute);
            }
        });
        searchIcon?.addEventListener('dblclick', () => {
            const query = searchInput.value.trim();
            const attribute = attrSelect.value || '';
            this.redirectToSearch(query, attribute);
        });
    }

    /**
     * Redirect the user to the search page with the given query and
     * attribute.  If no query is provided, nothing happens.
     *
     * @param {string} query The search query
     * @param {string} attribute Optional attribute: title, author, genre or '' for all
     */
    redirectToSearch(query, attribute) {
        if (!query) return;
        let url = `search.html?q=${encodeURIComponent(query)}`;
        if (attribute) {
            url += `&attribute=${encodeURIComponent(attribute)}`;
        }
        window.location.href = url;
    }

    performSearch(query) {
        console.log('Searching for:', query);
    }
    
    setupProfileDropdown() {
        document.addEventListener('click', (e) => {
            const dropdown = document.querySelector('.profile-dropdown');
            if (dropdown && !dropdown.contains(e.target)) {
                const menu = document.getElementById('profileMenu');
                if (menu) menu.classList.remove('active');
            }
        });
    }

    toggleProfileMenu() {
        const menu = document.getElementById('profileMenu');
        if (menu) {
            menu.classList.toggle('active');
        }
    }

    showAccountSettings() {
        window.location.href = 'account_settings.html';
    }

    showLibrarySettings() {
        window.location.href = 'my_library.html';
    }
    
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('currentUserRole');
            localStorage.removeItem('authToken');
            this.currentUser = null;
            this.currentUserRole = null;
            window.location.href = 'index.html';
        }
    }

    setUser(username) {
        this.currentUser = username;
        localStorage.setItem('currentUser', username);
        this.currentUserRole = localStorage.getItem('currentUserRole') || this.currentUserRole;
        this.updateNavigationState();
    }
    
    async checkDueSoonNotifications() {
        if (!this.isAuthenticated()) return;
        
        try {
            const response = await fetch('/me/loans', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                const loans = data.loans || [];

                const now = new Date();
                now.setHours(0, 0, 0, 0);
                
                const tomorrow = new Date(now);
                tomorrow.setDate(tomorrow.getDate() + 1);
                
                const dayAfterTomorrow = new Date(tomorrow);
                dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
                
                const dueTomorrowCount = loans.filter(loan => {
                    if (loan.status !== 'active') return false;
                    
                    const dueDate = new Date(loan.due_at);
                    dueDate.setHours(0, 0, 0, 0);
                    
                    return dueDate >= tomorrow && dueDate < dayAfterTomorrow;
                }).length;

                if (dueTomorrowCount > 0) {
                    this.showLoansBadge(dueTomorrowCount);
                }
            }
        } catch (error) {
            console.error('Error checking due soon notifications:', error);
        }
    }
    
    showLoansBadge(count) {
        const loansLink = document.getElementById('loansNavLink');
        if (!loansLink) return;

        const existingBadge = loansLink.querySelector('.notification-badge');
        if (existingBadge) {
            existingBadge.remove();
        }

        const badge = document.createElement('span');
        badge.className = 'notification-badge';
        badge.textContent = count;
        loansLink.style.position = 'relative';
        loansLink.appendChild(badge);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.liblyNav = new LiblyNavigation();
});

window.LiblyNavigation = LiblyNavigation;