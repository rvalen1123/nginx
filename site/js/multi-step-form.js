/**
 * Multi-step Form Utilities for MSC Wound Care Forms
 * Provides JavaScript functionality for multi-step form handling
 */

/**
 * Initialize a multi-step form
 * @param {Object} options - Configuration options
 */
const initMultiStepForm = ({
  formId = 'multistepForm',
  stepClass = 'form-step',
  nextBtnId = 'nextStep',
  prevBtnId = 'prevStep',
  submitBtnId = 'submitForm',
  stepIndicatorId = 'stepIndicator',
  onStepChange = null,
  onSubmit = null,
  validateStep = null
}) => {
  const form = document.getElementById(formId);
  if (!form) return;
  
  const steps = form.querySelectorAll(`.${stepClass}`);
  let currentStep = 0;
  
  // Initialize - show only the first step
  const showStep = (stepIndex) => {
    steps.forEach((step, index) => {
      step.style.display = index === stepIndex ? 'block' : 'none';
    });
    
    // Update step indicator if it exists
    const stepIndicator = document.getElementById(stepIndicatorId);
    if (stepIndicator) {
      const indicators = stepIndicator.querySelectorAll('.step');
      indicators.forEach((indicator, index) => {
        if (index < stepIndex) {
          indicator.classList.add('complete');
          indicator.classList.remove('active');
        } else if (index === stepIndex) {
          indicator.classList.add('active');
          indicator.classList.remove('complete');
        } else {
          indicator.classList.remove('active', 'complete');
        }
      });
    }
    
    // Call the onStepChange callback if provided
    if (onStepChange && typeof onStepChange === 'function') {
      onStepChange(stepIndex, steps.length);
    }
  };
  
  // Initialize form showing the first step
  showStep(currentStep);
  
  // Next button functionality
  const nextBtn = document.getElementById(nextBtnId);
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      // If validation function is provided, run it
      if (validateStep && typeof validateStep === 'function') {
        const isValid = validateStep(currentStep);
        if (!isValid) return;
      }
      
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    });
  }
  
  // Previous button functionality
  const prevBtn = document.getElementById(prevBtnId);
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  }
  
  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // If validation function is provided, run it for final step
    if (validateStep && typeof validateStep === 'function') {
      const isValid = validateStep(currentStep);
      if (!isValid) return;
    }
    
    // If onSubmit callback is provided, run it
    if (onSubmit && typeof onSubmit === 'function') {
      try {
        await onSubmit(new FormData(form));
      } catch (error) {
        console.error('Form submission error:', error);
        showNotification('An error occurred while submitting the form. Please try again.', 'error');
      }
    } else {
      // Default form submission
      form.submit();
    }
  });
};

/**
 * Shows a notification message
 * @param {string} message - The message to show
 * @param {string} type - The type of notification (success, error, info)
 * @param {number} duration - How long to show the message (ms)
 */
const showNotification = (message, type = 'info', duration = 5000) => {
  // Create notification container if it doesn't exist
  let container = document.getElementById('notificationContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = 'fixed top-4 right-4 z-50 max-w-md';
    document.body.appendChild(container);
  }
  
  // Set notification styles based on type
  let bgColor, borderColor, textColor, icon;
  
  switch (type) {
    case 'success':
      bgColor = 'bg-green-100';
      borderColor = 'border-green-500';
      textColor = 'text-green-700';
      icon = `<svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>`;
      break;
    case 'error':
      bgColor = 'bg-red-100';
      borderColor = 'border-red-500';
      textColor = 'text-red-700';
      icon = `<svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>`;
      break;
    default: // info
      bgColor = 'bg-blue-100';
      borderColor = 'border-blue-500';
      textColor = 'text-blue-700';
      icon = `<svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clip-rule="evenodd"></path>
            </svg>`;
  }
  
  // Create the notification element
  const notification = document.createElement('div');
  notification.className = `${bgColor} border-l-4 ${borderColor} ${textColor} p-4 mb-4 shadow-md rounded`;
  notification.innerHTML = `
    <div class="flex items-center">
      ${icon}
      <span>${message}</span>
    </div>
  `;
  
  // Add to container
  container.appendChild(notification);
  
  // Remove after duration
  setTimeout(() => {
    notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
    setTimeout(() => notification.remove(), 300);
  }, duration);
};

// If running in a browser context, add to the window object
if (typeof window !== 'undefined') {
  window.initMultiStepForm = initMultiStepForm;
  window.showNotification = showNotification;
}

// If in Node.js, export the functions
if (typeof module !== 'undefined') {
  module.exports = {
    initMultiStepForm,
    showNotification
  };
}
