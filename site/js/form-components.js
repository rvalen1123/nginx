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
    <div class="form-group">
      <label for="${id}" class="block font-medium text-gray-700 mb-1">
        ${label} ${required ? '<span class="text-danger">*</span>' : ''}
      </label>
      <input 
        type="${type}" 
        id="${id}" 
        name="${name}" 
        class="form-control shadow-sm" 
        placeholder="${placeholder}"
        value="${value}"
        ${required ? 'required' : ''}
      >
      ${helpText ? `<div class="form-text">${helpText}</div>` : ''}
      <div class="invalid-feedback">This field is required</div>
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
    <div class="form-group">
      <label for="${id}" class="block font-medium text-gray-700 mb-1">
        ${label} ${required ? '<span class="text-danger">*</span>' : ''}
      </label>
      <div class="relative">
        <select 
          id="${id}" 
          name="${name}" 
          class="form-control appearance-none shadow-sm"
          ${required ? 'required' : ''}
        >
          <option value="">Please select</option>
          ${optionsHtml}
        </select>
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
          <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
      ${helpText ? `<div class="form-text">${helpText}</div>` : ''}
      <div class="invalid-feedback">Please select an option</div>
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
    <div class="form-group">
      <label for="${id}" class="block font-medium text-gray-700 mb-1">
        ${label} ${required ? '<span class="text-danger">*</span>' : ''}
      </label>
      <textarea 
        id="${id}" 
        name="${name}" 
        rows="${rows}"
        class="form-control shadow-sm" 
        placeholder="${placeholder}"
        ${required ? 'required' : ''}
      >${value}</textarea>
      ${helpText ? `<div class="form-text">${helpText}</div>` : ''}
      <div class="invalid-feedback">This field is required</div>
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
    <div class="form-group">
      <div class="form-check">
        <input 
          type="checkbox" 
          id="${id}" 
          name="${name}" 
          class="form-check-input" 
          ${checked ? 'checked' : ''}
        >
        <label for="${id}" class="form-check-label">
          ${label}
        </label>
      </div>
      ${helpText ? `<div class="form-text">${helpText}</div>` : ''}
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
        <div class="form-check mb-2">
          <input 
            type="radio" 
            id="${id}" 
            name="${name}" 
            value="${opt}" 
            class="form-check-input" 
            ${selectedValue === opt ? 'checked' : ''}
            ${required ? 'required' : ''}
          >
          <label for="${id}" class="form-check-label">
            ${opt}
          </label>
        </div>
      `;
    } else {
      return `
        <div class="form-check mb-2">
          <input 
            type="radio" 
            id="${id}" 
            name="${name}" 
            value="${opt.value}" 
            class="form-check-input" 
            ${selectedValue === opt.value ? 'checked' : ''}
            ${required ? 'required' : ''}
          >
          <label for="${id}" class="form-check-label">
            ${opt.label}
          </label>
        </div>
      `;
    }
  }).join('');

  return `
    <div class="form-group">
      <label class="block font-medium text-gray-700 mb-2">
        ${label} ${required ? '<span class="text-danger">*</span>' : ''}
      </label>
      <div class="space-y-1">
        ${radioOptions}
      </div>
      ${helpText ? `<div class="form-text">${helpText}</div>` : ''}
      <div class="invalid-feedback">Please select an option</div>
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
    <div class="form-group">
      <label for="${id}" class="block font-medium text-gray-700 mb-1">
        ${label} ${required ? '<span class="text-danger">*</span>' : ''}
      </label>
      <div class="signature-pad-container border border-gray-300 rounded-md overflow-hidden shadow-sm">
        <canvas id="${id}_canvas" class="signature-pad w-full h-32 bg-white"></canvas>
        <input type="hidden" id="${id}" name="${name}" ${required ? 'required' : ''}>
        <div class="bg-gray-50 px-4 py-2 border-t border-gray-200 flex justify-end">
          <button type="button" class="btn btn-sm text-primary hover:text-primary-hover" onclick="clearSignature('${id}_canvas', '${id}')">
            Clear Signature
          </button>
        </div>
      </div>
      ${helpText ? `<div class="form-text">${helpText}</div>` : ''}
      <div class="invalid-feedback">Signature is required</div>
    </div>
  `;
};

/**
 * Creates a date picker field
 * @param {Object} options - Date field options
 * @returns {string} HTML string for the date field
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
    <div class="form-group">
      <label for="${id}" class="block font-medium text-gray-700 mb-1">
        ${label} ${required ? '<span class="text-danger">*</span>' : ''}
      </label>
      <div class="relative">
        <input 
          type="date" 
          id="${id}" 
          name="${name}" 
          class="form-control shadow-sm" 
          value="${value}"
          ${required ? 'required' : ''}
        >
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path>
          </svg>
        </div>
      </div>
      ${helpText ? `<div class="form-text">${helpText}</div>` : ''}
      <div class="invalid-feedback">Please select a date</div>
    </div>
  `;
};

/**
 * Creates a multi-step form progress indicator
 * @param {number} currentStep - Current active step
 * @param {number} totalSteps - Total number of steps
 * @param {Array} stepLabels - Labels for each step
 * @returns {string} HTML string for the step indicator
 */
const createStepIndicator = (currentStep, totalSteps, stepLabels = []) => {
  let stepsHTML = '';
  for (let i = 1; i <= totalSteps; i++) {
    const label = stepLabels[i-1] || `Step ${i}`;
    const isActive = i === currentStep;
    const isCompleted = i < currentStep;
    
    stepsHTML += `
      <div class="progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}" data-step="${i}">
        <div class="progress-step-number">${isCompleted ? '✓' : i}</div>
        <div class="progress-step-label">${label}</div>
      </div>
    `;
  }
  
  const percentComplete = ((currentStep - 1) / (totalSteps - 1)) * 100;
  
  return `
    <div class="progress-container">
      <div class="progress-steps">
        ${stepsHTML}
      </div>
      <div class="progress-bar">
        <div class="progress-bar-fill" style="width: ${percentComplete}%"></div>
      </div>
      <div class="progress-text">
        <span>Step ${currentStep} of ${totalSteps}</span>
        <span>${Math.round(percentComplete)}% Complete</span>
      </div>
    </div>
  `;
};

/**
 * Creates navigation buttons for multi-step form
 * @param {Object} options - Navigation options
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
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;
  
  return `
    <div class="form-navigation mt-6 flex ${showPrev ? 'justify-between' : 'justify-end'}">
      ${showPrev && !isFirstStep ? `
        <button type="button" class="btn btn-secondary" data-action="back">
          <svg class="inline-block w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          ${prevLabel}
        </button>
      ` : showPrev ? '<div></div>' : ''}
      
      ${isLastStep ? `
        <button type="submit" class="btn btn-primary">
          ${submitLabel}
          <svg class="inline-block w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </button>
      ` : `
        <button type="button" class="btn btn-primary" data-action="next">
          ${nextLabel}
          <svg class="inline-block w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      `}
    </div>
  `;
};

/**
 * Creates a file upload field
 * @param {Object} options - File upload options
 * @returns {string} HTML string for the file upload
 */
const createFileUpload = ({
  id,
  label,
  name = id,
  required = false,
  accept = '',
  multiple = false,
  helpText = ''
}) => {
  return `
    <div class="form-group">
      <label for="${id}" class="block font-medium text-gray-700 mb-1">
        ${label} ${required ? '<span class="text-danger">*</span>' : ''}
      </label>
      <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md shadow-sm">
        <div class="space-y-1 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="flex text-sm text-gray-600">
            <label for="${id}" class="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary-hover">
              <span>Upload a file</span>
              <input 
                id="${id}" 
                name="${name}" 
                type="file" 
                class="sr-only" 
                ${required ? 'required' : ''}
                ${accept ? `accept="${accept}"` : ''}
                ${multiple ? 'multiple' : ''}
              >
            </label>
            <p class="pl-1">or drag and drop</p>
          </div>
          <p class="text-xs text-gray-500">
            ${accept ? `${accept.replace(/\./g, '').toUpperCase()} up to 10MB` : 'Upload files up to 10MB'}
          </p>
        </div>
      </div>
      ${helpText ? `<div class="form-text">${helpText}</div>` : ''}
      <div class="invalid-feedback">Please upload a file</div>
    </div>
  `;
};

// Export all components
if (typeof module !== 'undefined' && module.exports) {
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
    createFormNavigation,
    createFileUpload
  };
}
