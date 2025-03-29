/**
 * Form Validation Utilities for MSC Wound Care Forms
 * Provides validation functionality for form fields
 */

/**
 * Shows error message for a form field
 * @param {string} fieldId - ID of the field with error
 * @param {string} message - Error message to display
 */
const showFieldError = (fieldId, message) => {
  const field = document.getElementById(fieldId);
  if (!field) return;
  
  // Find or create error message element
  let errorElement = document.getElementById(`${fieldId}-error`);
  if (!errorElement) {
    errorElement = document.createElement('p');
    errorElement.id = `${fieldId}-error`;
    errorElement.className = 'text-sm text-red-600 mt-1';
    
    // Insert after the field
    field.parentNode.insertBefore(errorElement, field.nextSibling);
  }
  
  // Set error message
  errorElement.textContent = message;
  
  // Add error styles to the field
  field.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
};

/**
 * Clears error message for a form field
 * @param {string} fieldId - ID of the field to clear error
 */
const clearFieldError = (fieldId) => {
  const field = document.getElementById(fieldId);
  if (!field) return;
  
  // Remove error message if exists
  const errorElement = document.getElementById(`${fieldId}-error`);
  if (errorElement) {
    errorElement.remove();
  }
  
  // Remove error styles from the field
  field.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
};

/**
 * Validates that a field is not empty
 * @param {string} fieldId - ID of the field to validate
 * @param {string} fieldName - Human-readable field name for error message
 * @returns {boolean} Whether validation passed
 */
const validateRequired = (fieldId, fieldName) => {
  const field = document.getElementById(fieldId);
  if (!field) return false;
  
  const value = field.value.trim();
  
  if (!value) {
    showFieldError(fieldId, `${fieldName} is required`);
    return false;
  }
  
  clearFieldError(fieldId);
  return true;
};

/**
 * Validates email format
 * @param {string} fieldId - ID of the email field
 * @param {boolean} required - Whether field is required
 * @returns {boolean} Whether validation passed
 */
const validateEmail = (fieldId, required = true) => {
  const field = document.getElementById(fieldId);
  if (!field) return false;
  
  const value = field.value.trim();
  
  // Skip validation if not required and empty
  if (!required && !value) {
    clearFieldError(fieldId);
    return true;
  }
  
  // Check if required but empty
  if (required && !value) {
    showFieldError(fieldId, 'Email address is required');
    return false;
  }
  
  // Check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    showFieldError(fieldId, 'Please enter a valid email address');
    return false;
  }
  
  clearFieldError(fieldId);
  return true;
};

/**
 * Validates phone number format
 * @param {string} fieldId - ID of the phone field
 * @param {boolean} required - Whether field is required
 * @returns {boolean} Whether validation passed
 */
const validatePhone = (fieldId, required = true) => {
  const field = document.getElementById(fieldId);
  if (!field) return false;
  
  const value = field.value.trim();
  
  // Skip validation if not required and empty
  if (!required && !value) {
    clearFieldError(fieldId);
    return true;
  }
  
  // Check if required but empty
  if (required && !value) {
    showFieldError(fieldId, 'Phone number is required');
    return false;
  }
  
  // Check phone format (simple validation for US numbers)
  // Allow formats like: (123) 456-7890, 123-456-7890, 1234567890
  const phoneRegex = /^[(]?\d{3}[)]?[-\s]?\d{3}[-\s]?\d{4}$/;
  if (!phoneRegex.test(value)) {
    showFieldError(fieldId, 'Please enter a valid phone number');
    return false;
  }
  
  clearFieldError(fieldId);
  return true;
};

/**
 * Validates a date field
 * @param {string} fieldId - ID of the date field
 * @param {boolean} required - Whether field is required
 * @param {Object} options - Additional validation options
 * @returns {boolean} Whether validation passed
 */
const validateDate = (fieldId, required = true, options = {}) => {
  const { minDate, maxDate } = options;
  
  const field = document.getElementById(fieldId);
  if (!field) return false;
  
  const value = field.value.trim();
  
  // Skip validation if not required and empty
  if (!required && !value) {
    clearFieldError(fieldId);
    return true;
  }
  
  // Check if required but empty
  if (required && !value) {
    showFieldError(fieldId, 'Date is required');
    return false;
  }
  
  // Check date format and validity
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    showFieldError(fieldId, 'Please enter a valid date');
    return false;
  }
  
  // Check min date if provided
  if (minDate && date < new Date(minDate)) {
    showFieldError(fieldId, `Date must be on or after ${new Date(minDate).toLocaleDateString()}`);
    return false;
  }
  
  // Check max date if provided
  if (maxDate && date > new Date(maxDate)) {
    showFieldError(fieldId, `Date must be on or before ${new Date(maxDate).toLocaleDateString()}`);
    return false;
  }
  
  clearFieldError(fieldId);
  return true;
};

/**
 * Validates that at least one checkbox in a group is checked
 * @param {string} groupName - Name attribute of the checkbox group
 * @param {string} errorElementId - ID of element to display error message
 * @param {string} errorMessage - Error message to display
 * @returns {boolean} Whether validation passed
 */
const validateCheckboxGroup = (groupName, errorElementId, errorMessage = 'Please select at least one option') => {
  const checkboxes = document.querySelectorAll(`input[type="checkbox"][name="${groupName}"]`);
  const errorElement = document.getElementById(errorElementId);
  
  let isChecked = false;
  checkboxes.forEach(checkbox => {
    if (checkbox.checked) {
      isChecked = true;
    }
  });
  
  if (!isChecked && errorElement) {
    errorElement.textContent = errorMessage;
    errorElement.style.display = 'block';
    return false;
  }
  
  if (errorElement) {
    errorElement.textContent = '';
    errorElement.style.display = 'none';
  }
  
  return true;
};

// If running in a browser context, add to the window object
if (typeof window !== 'undefined') {
  window.FormValidation = {
    showFieldError,
    clearFieldError,
    validateRequired,
    validateEmail,
    validatePhone,
    validateDate,
    validateCheckboxGroup
  };
}

// If in Node.js, export the functions
if (typeof module !== 'undefined') {
  module.exports = {
    showFieldError,
    clearFieldError,
    validateRequired,
    validateEmail,
    validatePhone,
    validateDate,
    validateCheckboxGroup
  };
}
