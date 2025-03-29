/**
 * Footer Component for MSC Wound Care Forms
 * Creates a consistent footer across all forms
 */
const createFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return `
    <footer class="bg-gray-100 py-4 mt-8">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="text-sm text-gray-600">
            &copy; ${currentYear} MSC Wound Care. All rights reserved.
          </div>
          <div class="mt-2 md:mt-0">
            <ul class="flex space-x-4 text-sm">
              <li><a href="#" class="text-blue-600 hover:underline">Privacy Policy</a></li>
              <li><a href="#" class="text-blue-600 hover:underline">Terms of Service</a></li>
              <li><a href="#" class="text-blue-600 hover:underline">Contact Us</a></li>
            </ul>
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
