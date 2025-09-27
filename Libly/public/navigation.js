// Shared navigation functionality across all pages
class LiblyNavigation {
    constructor() {
        this.currentUser = localStorage.getItem('currentUser');
        this.init();
    }
    
    init() {
        this.setupSearchFunctionality();
        this.updateNavigationState();
        this.setupProfileDropdown();
    }
    
    // Check if user is authenticated
    isAuthenticated() {
        return !!this.currentUser;
    }
    
    // Update navigation based on authentication state
    updateNavigationState() {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;
        
        // Clear existing auth-related items
        const existingProfile = navMenu.querySelector('.profile-dropdown');
        const existingLogin = navMenu.querySelector('a[href="login.html"]');
        const existingRegister = navMenu.querySelector('a[href="register.html"]');
        
        if (existingProfile) existingProfile.remove();
        if (existingLogin) existingLogin.remove();
        if (existingRegister && !this.isAuthenticated()) {
            // Keep register button only when not authenticated
        } else if (existingRegister) {
            existingRegister.remove();
        }
        
        if (this.isAuthenticated()) {
            this.addProfileDropdown(navMenu);
        } else {
            this.addAuthButtons(navMenu);
        }
    }
    
    // Add profile dropdown for authenticated users (XSS-safe)
    addProfileDropdown(navMenu) {
        const profileDropdown = document.createElement('div');
        profileDropdown.className = 'profile-dropdown';
        
        // Create profile button safely
        const profileBtn = document.createElement('button');
        profileBtn.className = 'profile-btn';
        profileBtn.onclick = () => this.toggleProfileMenu();
        
        const profileAvatar = document.createElement('div');
        profileAvatar.className = 'profile-avatar';
        profileAvatar.textContent = this.currentUser.charAt(0).toUpperCase(); // Safe: textContent
        
        const profileName = document.createElement('span');
        profileName.textContent = this.currentUser; // Safe: textContent
        
        const dropdownArrow = document.createElement('span');
        dropdownArrow.textContent = '▼';
        
        profileBtn.appendChild(profileAvatar);
        profileBtn.appendChild(profileName);
        profileBtn.appendChild(dropdownArrow);
        
        // Create profile menu safely
        const profileMenu = document.createElement('div');
        profileMenu.className = 'profile-menu';
        profileMenu.id = 'profileMenu';
        
        // Dashboard menu item
        const dashboardItem = document.createElement('a');
        dashboardItem.href = 'dashboard.html';
        dashboardItem.className = 'profile-menu-item';
        dashboardItem.innerHTML = '<span>📊</span> Dashboard';
        
        // Account settings menu item
        const settingsItem = document.createElement('a');
        settingsItem.href = '#';
        settingsItem.className = 'profile-menu-item';
        settingsItem.innerHTML = '<span>⚙️</span> Account Settings';
        settingsItem.onclick = () => this.showAccountSettings();
        
        // Library settings menu item
        const libraryItem = document.createElement('a');
        libraryItem.href = '#';
        libraryItem.className = 'profile-menu-item';
        libraryItem.innerHTML = '<span>📚</span> My Library';
        libraryItem.onclick = () => this.showLibrarySettings();
        
        // Logout menu item
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
    
    // Add login/register buttons for non-authenticated users
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
    
    // Setup search functionality
    setupSearchFunctionality() {
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                if (query.length > 2) {
                    this.performSearch(query);
                }
            });
        }
    }
    
    // Search functionality (placeholder)
    performSearch(query) {
        console.log('Searching for:', query);
        // TODO: Implement actual search functionality
    }
    
    // Setup profile dropdown functionality
    setupProfileDropdown() {
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.querySelector('.profile-dropdown');
            if (dropdown && !dropdown.contains(e.target)) {
                const menu = document.getElementById('profileMenu');
                if (menu) menu.classList.remove('active');
            }
        });
    }
    
    // Toggle profile menu
    toggleProfileMenu() {
        const menu = document.getElementById('profileMenu');
        if (menu) {
            menu.classList.toggle('active');
        }
    }
    
    // Account settings placeholder
    showAccountSettings() {
        alert('Account Settings feature coming soon!');
    }
    
    // Library settings placeholder
    showLibrarySettings() {
        alert('Library Settings feature coming soon!');
    }
    
    // Handle logout
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('currentUser');
            this.currentUser = null;
            window.location.href = 'index.html';
        }
    }
    
    // Update user info after login
    setUser(username) {
        this.currentUser = username;
        localStorage.setItem('currentUser', username);
        this.updateNavigationState();
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.liblyNav = new LiblyNavigation();
});

// Export for use in other scripts
window.LiblyNavigation = LiblyNavigation;