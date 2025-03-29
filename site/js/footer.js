/**
 * Footer Component for MSC Wound Care Forms
 * Creates a consistent footer across all forms
 * Mobile-optimized version
 */
const createFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return `
    <footer class="py-4 bg-white mt-4 border-t">
      <div class="container">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="mb-4 md:mb-0">
            <p class="text-gray-600">&copy; ${currentYear} MSC Wound Care. All rights reserved.</p>
          </div>
          <div class="flex flex-wrap gap-4 justify-center">
            <a href="#" class="text-blue-600 hover:underline px-2 py-1 min-h-10 flex items-center">Privacy Policy</a>
            <a href="#" class="text-blue-600 hover:underline px-2 py-1 min-h-10 flex items-center">Terms of Service</a>
            <a href="#" class="text-blue-600 hover:underline px-2 py-1 min-h-10 flex items-center">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  `;
};

// If running in a browser context, add to the window object
if (typeof window !== 'undefined') {
  window.createFooter = createFooter;
}

// If in Node.js, export the function
if (typeof module !== 'undefined') {
  module.exports = createFooter;
}
