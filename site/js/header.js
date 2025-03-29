document.addEventListener('DOMContentLoaded', () => {
  // Set active nav link based on current page
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });

  // Mobile menu toggle
  const mobileMenuButton = document.querySelector('.mobile-menu-button');
  const navLinksContainer = document.querySelector('.nav-links');
  const headerActions = document.querySelector('.header-actions');

  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', () => {
      navLinksContainer.classList.toggle('active');
      headerActions.classList.toggle('active');
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-header')) {
      navLinksContainer.classList.remove('active');
      headerActions.classList.remove('active');
    }
  });
}); 