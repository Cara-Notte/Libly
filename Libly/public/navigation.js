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
            // If user is admin, add an Admin Panel link
            if (this.currentUserRole === 'admin') {
                // Remove existing admin link if present to avoid duplicates
                const existingAdmin = navMenu.querySelector('a[href="admin.html"]');
                if (existingAdmin) existingAdmin.remove();
                const adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.className = 'nav-item';
                adminLink.textContent = 'Admin';
                navMenu.insertBefore(adminLink, navMenu.firstChild.nextSibling); // insert after Home but before others
            }
        } else {
            this.addAuthButtons(navMenu);
            // Remove admin link if it exists when logging out
            const existingAdmin = navMenu.querySelector('a[href="admin.html"]');
            if (existingAdmin) existingAdmin.remove();
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
        settingsItem.href = '#';
        settingsItem.className = 'profile-menu-item';
        settingsItem.innerHTML = '<span>⚙️</span> Account Settings';
        settingsItem.onclick = () => this.showAccountSettings();
        
        const libraryItem = document.createElement('a');
        libraryItem.href = '#';
        libraryItem.className = 'profile-menu-item';
        libraryItem.innerHTML = '<span>📚</span> My Library';
        libraryItem.onclick = () => this.showLibrarySettings();
        
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
    
    /**
     * Setup the global search bar on the navbar.  When a user types a query
     * and presses Enter, they will be redirected to the search page with
     * the current query and (optionally) selected attribute.  Clicking
     * the magnifying glass toggles a dropdown allowing the user to
     * choose a specific attribute (title, author or genre) to search on.
     */
    setupSearchFunctionality() {
        const searchContainer = document.querySelector('.search-container');
        if (!searchContainer) return;
        const searchIcon = searchContainer.querySelector('.search-icon');
        const searchInput = searchContainer.querySelector('.search-input');
        if (!searchInput) return;
        // Create attribute dropdown for advanced search.  It's hidden by default
        const attrSelect = document.createElement('select');
        attrSelect.className = 'search-attribute-main';
        attrSelect.style.display = 'none';
        // Options: All (blank), Title, Author, Genre
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
        // Insert the dropdown before the input for better layout
        searchContainer.insertBefore(attrSelect, searchInput);
        // Toggle dropdown visibility when clicking the search icon
        if (searchIcon) {
            searchIcon.style.cursor = 'pointer';
            searchIcon.addEventListener('click', () => {
                attrSelect.style.display = attrSelect.style.display === 'none' ? 'inline-block' : 'none';
            });
        }
        // Handle Enter key on search input
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = searchInput.value.trim();
                // Grab selected attribute; empty string means search all fields
                const attribute = attrSelect.value || '';
                this.redirectToSearch(query, attribute);
            }
        });
        // Optionally handle pressing the search icon to perform search if the dropdown is not open
        searchIcon?.addEventListener('dblclick', () => {
            // double-click on the icon triggers search immediately
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
    
    // Search functionality (placeholder)
    performSearch(query) {
        console.log('Searching for:', query);
        // TODO: Implement actual search functionality
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
        alert('Account Settings feature coming soon!');
    }

    showLibrarySettings() {
        alert('Library Settings feature coming soon!');
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
        // also set role from localStorage if available
        this.currentUserRole = localStorage.getItem('currentUserRole') || this.currentUserRole;
        this.updateNavigationState();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.liblyNav = new LiblyNavigation();
});

window.LiblyNavigation = LiblyNavigation;