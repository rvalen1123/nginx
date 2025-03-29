/**
 * Header Component for MSC Wound Care Forms
 * This creates a consistent header across all forms with proper navigation
 * Mobile-friendly version with responsive menu
 */
const createHeader = (activePage = '') => {
  return `
    <header class="header">
      <div class="container header-container">
        <div class="header-logo">
          <a href="index.html">
            <img src="/images/msc-logo.png" alt="MSC Wound Care" class="h-8">
          </a>
        </div>
        <div class="header-title">MSC Wound Care Portal</div>
        <nav class="header-nav">
          <a href="/" class="header-nav-item ${activePage === 'home' ? 'active' : ''}">Home</a>
          <a href="/onboarding" class="header-nav-item ${activePage === 'onboarding' ? 'active' : ''}">Provider Onboarding</a>
          <a href="/ivr" class="header-nav-item ${activePage === 'ivr' ? 'active' : ''}">Insurance Verification</a>
          <a href="/order" class="header-nav-item ${activePage === 'order' ? 'active' : ''}">Order Products</a>
          <a href="/dme-kit" class="header-nav-item ${activePage === 'dme' ? 'active' : ''}">DME Kit Sign-up</a>
        </nav>
        <button class="mobile-menu-button" aria-label="Toggle menu">
          <span class="mobile-menu-icon"><span></span></span>
        </button>
      </div>
      <div class="mobile-menu">
        <a href="/" class="mobile-menu-item ${activePage === 'home' ? 'active' : ''}">Home</a>
        <a href="/onboarding" class="mobile-menu-item ${activePage === 'onboarding' ? 'active' : ''}">Provider Onboarding</a>
        <a href="/ivr" class="mobile-menu-item ${activePage === 'ivr' ? 'active' : ''}">Insurance Verification</a>
        <a href="/order" class="mobile-menu-item ${activePage === 'order' ? 'active' : ''}">Order Products</a>
        <a href="/dme-kit" class="mobile-menu-item ${activePage === 'dme' ? 'active' : ''}">DME Kit Sign-up</a>
      </div>
    </header>
    <script>
      // Initialize the mobile menu
      document.addEventListener('DOMContentLoaded', function() {
        if (typeof initMobileMenu === 'function') {
          initMobileMenu();
        } else {
          // Fallback mobile menu init if the global function isn't available
          const mobileMenuButton = document.querySelector('.mobile-menu-button');
          const mobileMenu = document.querySelector('.mobile-menu');
          
          if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', function() {
              mobileMenu.classList.toggle('open');
              mobileMenuButton.classList.toggle('mobile-menu-open');
            });
          }
        }
      });
    </script>
  `;
};

// If running in a browser context, add to the window object
if (typeof window !== 'undefined') {
  window.createHeader = createHeader;
}

// If in Node.js, export the function
if (typeof module !== 'undefined') {
  module.exports = createHeader;
}
