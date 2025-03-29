/**
 * Header Component for MSC Wound Care Forms
 * This creates a consistent header across all forms with proper navigation
 */
const createHeader = (activePage = '') => {
  return `
    <header class="bg-primary text-white py-3">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold">MSC Wound Care IVR Form</h1>
          <nav>
            <ul class="flex space-x-4">
              <li>
                <a href="/" class="${activePage === 'ivr' ? 'font-bold border-b-2' : ''} 
                   hover:border-b-2 hover:border-white pb-1 transition">
                  Insurance Verification Request
                </a>
              </li>
              <li>
                <a href="/product-education" class="${activePage === 'education' ? 'font-bold border-b-2' : ''} 
                   hover:border-b-2 hover:border-white pb-1 transition">
                  Product Education
                </a>
              </li>
              <li>
                <a href="/order" class="${activePage === 'order' ? 'font-bold border-b-2' : ''} 
                   hover:border-b-2 hover:border-white pb-1 transition">
                  Order Form
                </a>
              </li>
              <li>
                <a href="/onboarding" class="${activePage === 'onboarding' ? 'font-bold border-b-2' : ''} 
                   hover:border-b-2 hover:border-white pb-1 transition">
                  Onboarding
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
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
