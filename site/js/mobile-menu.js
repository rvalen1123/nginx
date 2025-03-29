/**
 * Mobile Menu Handler
 * Controls the mobile navigation menu functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
});

function initMobileMenu() {
    // Get mobile menu elements
    const mobileMenuButton = document.querySelector('.mobile-menu-button');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!mobileMenuButton || !mobileMenu) {
        console.warn('Mobile menu elements not found');
        return;
    }
    
    // Toggle mobile menu when button is clicked
    mobileMenuButton.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.contains('open');
        
        if (isOpen) {
            // Close menu
            mobileMenu.classList.remove('open');
            mobileMenuButton.classList.remove('mobile-menu-open');
            document.body.style.overflow = '';
        } else {
            // Open menu
            mobileMenu.classList.add('open');
            mobileMenuButton.classList.add('mobile-menu-open');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (event) => {
        const isMenuOpen = mobileMenu.classList.contains('open');
        
        if (isMenuOpen && 
            !mobileMenu.contains(event.target) && 
            !mobileMenuButton.contains(event.target)) {
            
            mobileMenu.classList.remove('open');
            mobileMenuButton.classList.remove('mobile-menu-open');
            document.body.style.overflow = '';
        }
    });
    
    // Close menu when window is resized to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && mobileMenu.classList.contains('open')) {
            mobileMenu.classList.remove('open');
            mobileMenuButton.classList.remove('mobile-menu-open');
            document.body.style.overflow = '';
        }
    });
    
    // Add click handlers to mobile menu items
    const mobileMenuItems = document.querySelectorAll('.mobile-nav-item');
    mobileMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Close menu when an item is clicked
            mobileMenu.classList.remove('open');
            mobileMenuButton.classList.remove('mobile-menu-open');
            document.body.style.overflow = '';
        });
    });
}

// Make the function available globally for usage in HTML
window.initMobileMenu = initMobileMenu; 