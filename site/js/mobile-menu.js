/**
 * Mobile Menu Controller for MSC Wound Care Portal
 * Handles the mobile menu toggle functionality
 */

document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
});

/**
 * Initialize mobile menu functionality
 */
function initMobileMenu() {
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  const headerNav = document.querySelector('.header-nav');
  
  if (!mobileMenuButton || !headerNav) {
    console.warn('Mobile menu elements not found');
    return;
  }
  
  // Create overlay for mobile menu
  const overlay = document.createElement('div');
  overlay.className = 'header-nav-mobile-overlay';
  headerNav.parentNode.insertBefore(overlay, headerNav.nextSibling);
  
  // Toggle menu when button is clicked
  mobileMenuButton.addEventListener('click', function() {
    toggleMobileMenu(headerNav, overlay);
  });
  
  // Close menu when overlay is clicked
  overlay.addEventListener('click', function() {
    closeMobileMenu(headerNav, overlay);
  });
  
  // Close menu when a navigation link is clicked
  const navLinks = headerNav.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      closeMobileMenu(headerNav, overlay);
    });
  });
  
  // Close menu when pressing escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && headerNav.classList.contains('active')) {
      closeMobileMenu(headerNav, overlay);
    }
  });
}

/**
 * Toggle mobile menu open/closed
 */
function toggleMobileMenu(nav, overlay) {
  nav.classList.toggle('active');
  
  // Prevent body scrolling when menu is open
  if (nav.classList.contains('active')) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}

/**
 * Close mobile menu
 */
function closeMobileMenu(nav, overlay) {
  nav.classList.remove('active');
  document.body.style.overflow = '';
}

// Make functions globally available
window.initMobileMenu = initMobileMenu;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu; 