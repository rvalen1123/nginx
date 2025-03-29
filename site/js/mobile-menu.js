/**
 * Mobile Menu Handler
 * Controls the mobile navigation menu functionality
 * Works with both MSC Wound Care Portal and individual form pages
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
});

function initMobileMenu() {
    // Get mobile menu elements - handle both portal and form page structures
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    
    // The menu can be either .mobile-menu (in forms) or nav.w-full ul (in portal)
    const mobileMenu = document.querySelector('.mobile-menu') || document.querySelector('nav.w-full ul');
    const mobileMenuIcon = document.querySelector('.mobile-menu-icon');
    
    if (!mobileMenuButton) {
        console.warn('Mobile menu button not found');
        return;
    }
    
    if (!mobileMenu) {
        console.warn('Mobile menu elements not found');
        return;
    }
    
    // Initialize menu state
    let isMenuOpen = false;
    
    // Add touch-friendly attributes
    mobileMenuButton.setAttribute('role', 'button');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    mobileMenuButton.setAttribute('aria-label', 'Toggle navigation menu');
    
    // Create a touchstart event handler with better response
    const toggleMenu = (e) => {
        // Prevent default to avoid double-triggering on some devices
        e.preventDefault();
        
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            // Handle both menu types
            if (mobileMenu.classList.contains('mobile-menu')) {
                // Form pages
                mobileMenu.classList.add('open');
                mobileMenuButton.classList.add('mobile-menu-open');
            } else {
                // Portal page
                document.body.classList.add('mobile-nav-active');
            }
            
            mobileMenuButton.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        } else {
            // Handle both menu types
            if (mobileMenu.classList.contains('mobile-menu')) {
                // Form pages
                mobileMenu.classList.remove('open');
                mobileMenuButton.classList.remove('mobile-menu-open');
            } else {
                // Portal page
                document.body.classList.remove('mobile-nav-active');
            }
            
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = ''; // Restore scrolling
        }
    };
    
    // Toggle mobile menu when button is clicked - with better touch response
    mobileMenuButton.addEventListener('click', toggleMenu);
    mobileMenuButton.addEventListener('touchend', (e) => {
        e.preventDefault(); // Prevent ghost click
    }, {passive: false});
    
    // Add active class to current page link
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Handle links in the mobile menu (both types)
    const mobileMenuItems = document.querySelectorAll('.mobile-menu-item, nav.w-full ul a');
    mobileMenuItems.forEach(item => {
        const itemHref = item.getAttribute('href');
        if (itemHref === currentPage || itemHref === currentPath) {
            item.classList.add('active');
            
            // For portal links, also add the border styling
            if (!item.classList.contains('mobile-menu-item')) {
                item.classList.add('text-blue-800', 'border-b-2', 'border-blue-800');
                item.classList.remove('text-gray-600');
            }
        }
        
        // Close menu when an item is clicked or touched
        item.addEventListener('click', () => {
            // Handle both menu types
            if (mobileMenu.classList.contains('mobile-menu')) {
                // Form pages
                mobileMenu.classList.remove('open');
                mobileMenuButton.classList.remove('mobile-menu-open');
            } else {
                // Portal page
                document.body.classList.remove('mobile-nav-active');
            }
            
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            isMenuOpen = false;
        });
        
        // Add touch-friendly attributes
        item.setAttribute('role', 'menuitem');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        if (isMenuOpen && 
            !mobileMenu.contains(event.target) && 
            !mobileMenuButton.contains(event.target)) {
            
            // Handle both menu types
            if (mobileMenu.classList.contains('mobile-menu')) {
                // Form pages
                mobileMenu.classList.remove('open');
                mobileMenuButton.classList.remove('mobile-menu-open');
            } else {
                // Portal page
                document.body.classList.remove('mobile-nav-active');
            }
            
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            isMenuOpen = false;
        }
    });
    
    // Close menu when window is resized to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isMenuOpen) {
            // Handle both menu types
            if (mobileMenu.classList.contains('mobile-menu')) {
                // Form pages
                mobileMenu.classList.remove('open');
                mobileMenuButton.classList.remove('mobile-menu-open');
            } else {
                // Portal page
                document.body.classList.remove('mobile-nav-active');
            }
            
            mobileMenuButton.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            isMenuOpen = false;
        }
    });
}

// Make the function available globally for usage in HTML
window.initMobileMenu = initMobileMenu; 