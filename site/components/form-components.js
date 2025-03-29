/**
 * Form Components for MSC Wound Care Forms
 * This provides reusable form elements to maintain consistency across forms
 */

/**
 * Creates a form section with a title and optional description
 * @param {string} title - The section title
 * @param {string} description - Optional description
 * @returns {string} HTML string for the form section
 */
const createFormSection = (title, description = '') => {
  return `
    <div class="form-section mb-6">
      <h3 class="text-xl font-semibold mb-2">${title}</h3>
      ${description ? `<p class="text-gray-600 mb-4">${description}</p>` : ''}
      <div class="form-section-content border p-4 rounded-md bg-white shadow-sm">
      <!-- Form fields will go here -->
      </div>
    </div>
  `;
};

/**
 * Creates a text input field with label
 * @param {Object} options - Input field options
 * @returns {string} HTML string for the input field
 */
const createTextInput = ({ 
  id, 
  label, 
  name = id, 
  placeholder = '', 
  required = false,
  value = '',
  type = 'text',
  helpText = ''
}) => {
  return `
    <div class="form-group mb-4">
      <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">
        ${label} ${required ? '<span class="text-red-500">*</span>' : ''}
      </label>
      <input 
        type="${type}" 
        id="${id}" 
        name="${name}" 
        class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
        placeholder="${placeholder}"
        value="${value}"
        ${required ? 'required' : ''}
      >
      ${helpText ? `<p class="mt-1 text-xs text-gray-500">${helpText}</p>` : ''}
    </div>
  `;
};

/**
 * Creates a select dropdown with label
 * @param {Object} options - Select field options
 * @returns {string} HTML string for the select field
 */
const createSelect = ({
  id,
  label,
  name = id,
  options = [],
  required = false,
  value = '',
  helpText = ''
}) => {
  const optionsHtml = options.map(opt => {
    if (typeof opt === 'string') {
      return `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt}</option>`;
    } else {
      return `<option value="${opt.value}" ${value === opt.value ? 'selected' : ''}>${opt.label}</option>`;
    }
  }).join('');

  return `
    <div class="form-group mb-4">
      <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">
        ${label} ${required ? '<span class="text-red-500">*</span>' : ''}
      </label>
      <select 
        id="${id}" 
        name="${name}" 
        class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        ${required ? 'required' : ''}
      >
        <option value="">Please select</option>
        ${optionsHtml}
      </select>
      ${helpText ? `<p class="mt-1 text-xs text-gray-500">${helpText}</p>` : ''}
    </div>
  `;
};

/**
 * Creates a textarea with label
 * @param {Object} options - Textarea field options
 * @returns {string} HTML string for the textarea
 */
const createTextarea = ({
  id,
  label,
  name = id,
  placeholder = '',
  required = false,
  value = '',
  rows = 4,
  helpText = ''
}) => {
  return `
    <div class="form-group mb-4">
      <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">
        ${label} ${required ? '<span class="text-red-500">*</span>' : ''}
      </label>
      <textarea 
        id="${id}" 
        name="${name}" 
        rows="${rows}"
        class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
        placeholder="${placeholder}"
        ${required ? 'required' : ''}
      >${value}</textarea>
      ${helpText ? `<p class="mt-1 text-xs text-gray-500">${helpText}</p>` : ''}
    </div>
  `;
};

/**
 * Creates a checkbox input with label
 * @param {Object} options - Checkbox field options
 * @returns {string} HTML string for the checkbox
 */
const createCheckbox = ({
  id,
  label,
  name = id,
  checked = false,
  helpText = ''
}) => {
  return `
    <div class="form-group mb-4">
      <div class="flex items-center">
        <input 
          type="checkbox" 
          id="${id}" 
          name="${name}" 
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
          ${checked ? 'checked' : ''}
        >
        <label for="${id}" class="ml-2 block text-sm text-gray-700">
          ${label}
        </label>
      </div>
      ${helpText ? `<p class="mt-1 text-xs text-gray-500 ml-6">${helpText}</p>` : ''}
    </div>
  `;
};

/**
 * Creates a radio button group
 * @param {Object} options - Radio group options
 * @returns {string} HTML string for the radio group
 */
const createRadioGroup = ({
  name,
  label,
  options = [],
  required = false,
  selectedValue = '',
  helpText = ''
}) => {
  const radioOptions = options.map((opt, index) => {
    const id = `${name}_${index}`;
    if (typeof opt === 'string') {
      return `
        <div class="flex items-center mb-2">
          <input 
            type="radio" 
            id="${id}" 
            name="${name}" 
            value="${opt}" 
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
            ${selectedValue === opt ? 'checked' : ''}
            ${required ? 'required' : ''}
          >
          <label for="${id}" class="ml-2 block text-sm text-gray-700">
            ${opt}
          </label>
        </div>
      `;
    } else {
      return `
        <div class="flex items-center mb-2">
          <input 
            type="radio" 
            id="${id}" 
            name="${name}" 
            value="${opt.value}" 
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
            ${selectedValue === opt.value ? 'checked' : ''}
            ${required ? 'required' : ''}
          >
          <label for="${id}" class="ml-2 block text-sm text-gray-700">
            ${opt.label}
          </label>
        </div>
      `;
    }
  }).join('');

  return `
    <div class="form-group mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-1">
        ${label} ${required ? '<span class="text-red-500">*</span>' : ''}
      </label>
      <div class="mt-1">
        ${radioOptions}
      </div>
      ${helpText ? `<p class="mt-1 text-xs text-gray-500">${helpText}</p>` : ''}
    </div>
  `;
};

/**
 * Creates a signature field
 * @param {Object} options - Signature field options
 * @returns {string} HTML string for the signature field
 */
const createSignatureField = ({
  id,
  label,
  name = id,
  required = false,
  helpText = ''
}) => {
  return `
    <div class="form-group mb-4">
      <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">
        ${label} ${required ? '<span class="text-red-500">*</span>' : ''}
      </label>
      <div class="signature-container border border-gray-300 rounded-md p-2 bg-white">
        <canvas id="${id}_canvas" class="signature-pad w-full h-32 border border-gray-200 rounded cursor-crosshair"></canvas>
        <input type="hidden" id="${id}" name="${name}" ${required ? 'required' : ''}>
        <div class="flex justify-end mt-2">
          <button type="button" class="text-sm text-blue-600 hover:text-blue-800" onclick="clearSignature('${id}_canvas', '${id}')">
            Clear
          </button>
        </div>
      </div>
      ${helpText ? `<p class="mt-1 text-xs text-gray-500">${helpText}</p>` : ''}
    </div>
  `;
};

/**
 * Creates a date picker field
 * @param {Object} options - Date picker options
 * @returns {string} HTML string for the date picker
 */
const createDatePicker = ({
  id,
  label,
  name = id,
  required = false,
  value = '',
  helpText = ''
}) => {
  return `
    <div class="form-group mb-4">
      <label for="${id}" class="block text-sm font-medium text-gray-700 mb-1">
        ${label} ${required ? '<span class="text-red-500">*</span>' : ''}
      </label>
      <input 
        type="date" 
        id="${id}" 
        name="${name}" 
        class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
        value="${value}"
        ${required ? 'required' : ''}
      >
      ${helpText ? `<p class="mt-1 text-xs text-gray-500">${helpText}</p>` : ''}
    </div>
  `;
};

/**
 * Creates a simple form step indicator
 * @param {number} currentStep - Current step number (1-based)
 * @param {number} totalSteps - Total number of steps
 * @param {Array} stepLabels - Array of labels for each step
 * @returns {string} HTML string for step indicator
 */
const createStepIndicator = (currentStep, totalSteps, stepLabels = []) => {
  let stepsHtml = '';
  
  for (let i = 1; i <= totalSteps; i++) {
    const label = stepLabels[i-1] || `Step ${i}`;
    stepsHtml += `
      <div class="step ${i < currentStep ? 'complete' : ''} ${i === currentStep ? 'active' : ''}">
        <div class="step-circle ${i <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}">${i}</div>
        <div class="step-label ${i === currentStep ? 'font-medium' : ''}">${label}</div>
      </div>
      ${i < totalSteps ? '<div class="step-line"></div>' : ''}
    `;
  }
  
  return `
    <div class="step-indicator flex items-center justify-between mb-8">
      ${stepsHtml}
    </div>
  `;
};

/**
 * Creates form navigation buttons (prev/next/submit)
 * @param {Object} options - Navigation button options
 * @returns {string} HTML string for navigation buttons
 */
const createFormNavigation = ({
  currentStep,
  totalSteps,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  submitLabel = 'Submit',
  showPrev = true
}) => {
  return `
    <div class="form-navigation flex justify-between mt-8">
      ${showPrev && currentStep > 1 ? 
        `<button type="button" id="prevStep" class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          ${prevLabel}
        </button>` : 
        `<div></div>`
      }
      
      ${currentStep < totalSteps ? 
        `<button type="button" id="nextStep" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
          ${nextLabel}
        </button>` : 
        `<button type="submit" id="submitForm" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
          ${submitLabel}
        </button>`
      }
    </div>
  `;
};

// Export all components if in a browser context
if (typeof window !== 'undefined') {
  window.FormComponents = {
    createFormSection,
    createTextInput,
    createSelect,
    createTextarea,
    createCheckbox,
    createRadioGroup,
    createSignatureField,
    createDatePicker,
    createStepIndicator,
    createFormNavigation
  };
}

// If in Node.js, export the functions
if (typeof module !== 'undefined') {
  module.exports = {
    createFormSection,
    createTextInput,
    createSelect,
    createTextarea,
    createCheckbox,
    createRadioGroup,
    createSignatureField,
    createDatePicker,
    createStepIndicator,
    createFormNavigation
  };
}
