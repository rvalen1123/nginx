/**
 * MSC Wound Care Portal Form Handler
 * A comprehensive JavaScript library for handling multi-step forms
 * Version 1.0.0
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize all forms
  initForms();
  
  // Initialize signature pad if present
  initSignaturePad();
});

/**
 * Initialize all forms on the page
 */
function initForms() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    // Set up form validation
    setupFormValidation(form);
    
    // Set up multi-step navigation
    setupMultiStepNavigation(form);
    
    // Set up conditional fields
    setupConditionalFields(form);
    
    // Set up product management (for order forms)
    setupProductManagement(form);
    
    // Set up form submission
    setupFormSubmission(form);
  });
}

/**
 * Set up form validation
 * @param {HTMLFormElement} form - The form element
 */
function setupFormValidation(form) {
  // Add validation on input change
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateInput(this);
    });
    
    // For select elements, also validate on change
    if (input.tagName === 'SELECT') {
      input.addEventListener('change', function() {
        validateInput(this);
      });
    }
  });
}

/**
 * Validate a single input field
 * @param {HTMLElement} input - The input element to validate
 * @returns {boolean} - Whether the input is valid
 */
function validateInput(input) {
  // Skip validation for non-required fields that are empty
  if (!input.hasAttribute('required') && !input.value) {
    input.classList.remove('is-invalid');
    return true;
  }
  
  let isValid = true;
  
  // Check validity based on input type
  if (input.type === 'email') {
    isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
  } else if (input.type === 'tel') {
    // Basic phone validation (can be enhanced for specific formats)
    isValid = /^[0-9\-\+\(\)\s]{10,15}$/.test(input.value);
  } else if (input.type === 'date') {
    isValid = input.value !== '';
  } else if (input.tagName === 'SELECT') {
    isValid = input.value !== '';
  } else {
    isValid = input.value.trim() !== '';
  }
  
  // Update UI based on validation result
  if (isValid) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
  }
  
  return isValid;
}

/**
 * Validate all inputs in a specific form step
 * @param {HTMLElement} formStep - The form step element
 * @returns {boolean} - Whether all inputs in the step are valid
 */
function validateFormStep(formStep) {
  const inputs = formStep.querySelectorAll('input, select, textarea');
  let isValid = true;
  
  inputs.forEach(input => {
    // Only validate required fields or fields with values
    if (input.hasAttribute('required') || input.value.trim() !== '') {
      const inputValid = validateInput(input);
      isValid = isValid && inputValid;
    }
  });
  
  return isValid;
}

/**
 * Set up multi-step form navigation
 * @param {HTMLFormElement} form - The form element
 */
function setupMultiStepNavigation(form) {
  // Get all steps in the form
  const steps = form.querySelectorAll('.form-step');
  if (steps.length === 0) return;
  
  // Set the first step as active
  steps[0].classList.add('active');
  updateProgressBar(1, steps.length);
  
  // Set up next buttons
  const nextButtons = form.querySelectorAll('[data-action="next"]');
  nextButtons.forEach(button => {
    button.addEventListener('click', function() {
      const currentStep = this.closest('.form-step');
      const currentStepNumber = parseInt(currentStep.dataset.step);
      
      // Validate current step before proceeding
      if (!validateFormStep(currentStep)) {
        showAlert('Please fill in all required fields correctly before proceeding.', 'danger');
        return;
      }
      
      // Find the next step
      const nextStep = form.querySelector(`.form-step[data-step="${currentStepNumber + 1}"]`);
      if (nextStep) {
        // Hide current step
        currentStep.classList.remove('active');
        
        // Show next step
        nextStep.classList.add('active');
        
        // Update progress bar
        updateProgressBar(currentStepNumber + 1, steps.length);
        
        // Scroll to top of form
        form.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  
  // Set up back buttons
  const backButtons = form.querySelectorAll('[data-action="back"]');
  backButtons.forEach(button => {
    button.addEventListener('click', function() {
      const currentStep = this.closest('.form-step');
      const currentStepNumber = parseInt(currentStep.dataset.step);
      
      // Find the previous step
      const prevStep = form.querySelector(`.form-step[data-step="${currentStepNumber - 1}"]`);
      if (prevStep) {
        // Hide current step
        currentStep.classList.remove('active');
        
        // Show previous step
        prevStep.classList.add('active');
        
        // Update progress bar
        updateProgressBar(currentStepNumber - 1, steps.length);
        
        // Scroll to top of form
        form.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/**
 * Update the progress bar and step indicators
 * @param {number} currentStep - The current step number
 * @param {number} totalSteps - The total number of steps
 */
function updateProgressBar(currentStep, totalSteps) {
  // Update progress bar fill
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const progressBarFill = document.querySelector('.progress-bar-fill');
  if (progressBarFill) {
    progressBarFill.style.width = `${progressPercentage}%`;
  }
  
  // Update step text
  const currentStepElement = document.getElementById('currentStep');
  if (currentStepElement) {
    currentStepElement.textContent = currentStep;
  }
  
  // Update completion percentage
  const completionPercentageElement = document.getElementById('completionPercentage');
  if (completionPercentageElement) {
    completionPercentageElement.textContent = Math.round(progressPercentage);
  }
  
  // Update step indicators
  const stepIndicators = document.querySelectorAll('.progress-step');
  stepIndicators.forEach((indicator, index) => {
    // Remove all status classes
    indicator.classList.remove('active', 'completed');
    
    // Add appropriate class based on current step
    if (index + 1 === currentStep) {
      indicator.classList.add('active');
    } else if (index + 1 < currentStep) {
      indicator.classList.add('completed');
    }
  });
}

/**
 * Set up conditional fields that show/hide based on other field values
 * @param {HTMLFormElement} form - The form element
 */
function setupConditionalFields(form) {
  // Example: Toggle billing fields based on "Same as Shipping" checkbox
  const sameAsShippingCheckbox = form.querySelector('#sameAsShipping');
  const billingFields = form.querySelector('#billingFields');
  
  if (sameAsShippingCheckbox && billingFields) {
    // Initial state
    billingFields.style.display = sameAsShippingCheckbox.checked ? 'none' : 'block';
    
    // Toggle on change
    sameAsShippingCheckbox.addEventListener('change', function() {
      billingFields.style.display = this.checked ? 'none' : 'block';
    });
  }
  
  // Add more conditional field logic as needed
}

/**
 * Set up product management for order forms
 * @param {HTMLFormElement} form - The form element
 */
function setupProductManagement(form) {
  // Add product button
  const addProductBtn = form.querySelector('#addProductBtn');
  if (!addProductBtn) return;
  
  addProductBtn.addEventListener('click', function() {
    addNewProduct(form);
  });
  
  // Set up existing product items
  setupExistingProducts(form);
  
  // Set up price calculation
  setupPriceCalculation(form);
}

/**
 * Set up existing product items
 * @param {HTMLFormElement} form - The form element
 */
function setupExistingProducts(form) {
  const productItems = form.querySelectorAll('.product-item');
  
  productItems.forEach(item => {
    // Set up remove button
    const removeBtn = item.querySelector('.remove-product-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', function() {
        removeProduct(item);
      });
    }
    
    // Set up price calculation
    const quantityInput = item.querySelector('[name$=".quantity"]');
    const unitPriceInput = item.querySelector('[name$=".unitPrice"]');
    
    if (quantityInput && unitPriceInput) {
      quantityInput.addEventListener('input', function() {
        calculateProductTotal(item);
      });
      
      unitPriceInput.addEventListener('input', function() {
        calculateProductTotal(item);
      });
      
      // Calculate initial total
      calculateProductTotal(item);
    }
  });
}

/**
 * Add a new product item to the form
 * @param {HTMLFormElement} form - The form element
 */
function addNewProduct(form) {
  const productContainer = form.querySelector('#productContainer');
  if (!productContainer) return;
  
  // Get existing products to determine the new index
  const existingProducts = productContainer.querySelectorAll('.product-item');
  const newIndex = existingProducts.length;
  
  // Clone the first product item as a template
  const template = existingProducts[0].cloneNode(true);
  
  // Update IDs and names with the new index
  template.dataset.productIndex = newIndex;
  
  const inputs = template.querySelectorAll('input, select');
  inputs.forEach(input => {
    const namePattern = /products\[\d+\]/;
    const idPattern = /-\d+$/;
    
    // Update name attribute
    if (input.name && namePattern.test(input.name)) {
      input.name = input.name.replace(namePattern, `products[${newIndex}]`);
    }
    
    // Update id attribute
    if (input.id && idPattern.test(input.id)) {
      input.id = input.id.replace(idPattern, `-${newIndex}`);
    }
    
    // Clear values
    input.value = '';
  });
  
  // Update labels to point to the new input IDs
  const labels = template.querySelectorAll('label');
  labels.forEach(label => {
    const forPattern = /-\d+$/;
    if (label.htmlFor && forPattern.test(label.htmlFor)) {
      label.htmlFor = label.htmlFor.replace(forPattern, `-${newIndex}`);
    }
  });
  
  // Add the new product item to the container
  productContainer.appendChild(template);
  
  // Set up the new product item
  const newItem = productContainer.lastElementChild;
  
  // Set up remove button
  const removeBtn = newItem.querySelector('.remove-product-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      removeProduct(newItem);
    });
  }
  
  // Set up price calculation
  const quantityInput = newItem.querySelector('[name$=".quantity"]');
  const unitPriceInput = newItem.querySelector('[name$=".unitPrice"]');
  
  if (quantityInput && unitPriceInput) {
    quantityInput.addEventListener('input', function() {
      calculateProductTotal(newItem);
    });
    
    unitPriceInput.addEventListener('input', function() {
      calculateProductTotal(newItem);
    });
  }
}

/**
 * Remove a product item from the form
 * @param {HTMLElement} productItem - The product item element
 */
function removeProduct(productItem) {
  const productContainer = productItem.parentElement;
  
  // Don't remove if it's the only product
  if (productContainer.querySelectorAll('.product-item').length <= 1) {
    showAlert('At least one product is required.', 'warning');
    return;
  }
  
  // Remove the product item
  productItem.remove();
  
  // Reindex remaining products
  reindexProducts(productContainer);
}

/**
 * Reindex product items after removal
 * @param {HTMLElement} productContainer - The container of product items
 */
function reindexProducts(productContainer) {
  const productItems = productContainer.querySelectorAll('.product-item');
  
  productItems.forEach((item, index) => {
    // Update data attribute
    item.dataset.productIndex = index;
    
    // Update input names and IDs
    const inputs = item.querySelectorAll('input, select');
    inputs.forEach(input => {
      const namePattern = /products\[\d+\]/;
      const idPattern = /-\d+$/;
      
      // Update name attribute
      if (input.name && namePattern.test(input.name)) {
        input.name = input.name.replace(namePattern, `products[${index}]`);
      }
      
      // Update id attribute
      if (input.id && idPattern.test(input.id)) {
        input.id = input.id.replace(idPattern, `-${index}`);
      }
    });
    
    // Update labels
    const labels = item.querySelectorAll('label');
    labels.forEach(label => {
      const forPattern = /-\d+$/;
      if (label.htmlFor && forPattern.test(label.htmlFor)) {
        label.htmlFor = label.htmlFor.replace(forPattern, `-${index}`);
      }
    });
  });
}

/**
 * Calculate the total price for a product item
 * @param {HTMLElement} productItem - The product item element
 */
function calculateProductTotal(productItem) {
  const quantityInput = productItem.querySelector('[name$=".quantity"]');
  const unitPriceInput = productItem.querySelector('[name$=".unitPrice"]');
  const totalPriceInput = productItem.querySelector('[name$=".totalPrice"]');
  
  if (quantityInput && unitPriceInput && totalPriceInput) {
    const quantity = parseFloat(quantityInput.value) || 0;
    const unitPrice = parseFloat(unitPriceInput.value) || 0;
    const totalPrice = quantity * unitPrice;
    
    totalPriceInput.value = totalPrice.toFixed(2);
  }
}

/**
 * Set up price calculation for the entire form
 * @param {HTMLFormElement} form - The form element
 */
function setupPriceCalculation(form) {
  // This could be expanded to calculate subtotals, taxes, shipping, etc.
  // For now, we'll just make sure all product totals are calculated
  const productItems = form.querySelectorAll('.product-item');
  
  productItems.forEach(item => {
    calculateProductTotal(item);
  });
}

/**
 * Set up form submission
 * @param {HTMLFormElement} form - The form element
 */
function setupFormSubmission(form) {
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate all fields before submission
    const isValid = validateForm(form);
    
    if (!isValid) {
      showAlert('Please fill in all required fields correctly before submitting.', 'danger');
      return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <span class="loading-spinner"></span>
      Submitting...
    `;
    
    try {
      // Create FormData
      const formData = new FormData(form);
      
      // Add any additional data
      // For example, if using a signature pad
      const signatureInput = form.querySelector('#signature');
      const signaturePad = document.getElementById('signaturePad');
      if (signatureInput && signaturePad && typeof SignaturePad !== 'undefined') {
        const signaturePadInstance = new SignaturePad(signaturePad);
        if (!signaturePadInstance.isEmpty()) {
          signatureInput.value = signaturePadInstance.toDataURL();
        }
      }
      
      // Prepare order summary for review step
      if (form.id === 'universalOrderForm') {
        updateOrderSummary(form);
      }
      
      // Submit the form
      const response = await fetch(form.action, {
        method: form.method || 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Show success message
        showAlert('Form submitted successfully!', 'success');
        
        // Display response in the response container
        const responseContainer = form.querySelector('#responseContainer');
        if (responseContainer) {
          responseContainer.innerHTML = `
            <div class="alert alert-success">
              <h4>Submission Successful!</h4>
              <p>${result.message || 'Your form has been submitted successfully.'}</p>
              <p>Reference ID: ${result.documentId || 'N/A'}</p>
            </div>
          `;
        }
        
        // Disable form fields
        const inputs = form.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => {
          if (input.type !== 'submit') {
            input.disabled = true;
          }
        });
        
        // Reset submit button
        submitButton.disabled = false;
        submitButton.innerHTML = 'Submitted ✓';
        
        // Optionally redirect after a delay
        // setTimeout(() => {
        //   window.location.href = '/dashboard';
        // }, 3000);
      } else {
        // Show error message
        showAlert(`Error: ${result.message || 'An error occurred during submission.'}`, 'danger');
        
        // Reset submit button
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      showAlert('An error occurred. Please try again.', 'danger');
      
      // Reset submit button
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
    }
  });
}

/**
 * Validate the entire form
 * @param {HTMLFormElement} form - The form element
 * @returns {boolean} - Whether the form is valid
 */
function validateForm(form) {
  const inputs = form.querySelectorAll('input, select, textarea');
  let isValid = true;
  
  inputs.forEach(input => {
    // Only validate required fields or fields with values
    if (input.hasAttribute('required') || input.value.trim() !== '') {
      const inputValid = validateInput(input);
      isValid = isValid && inputValid;
    }
  });
  
  return isValid;
}

/**
 * Update the order summary for review
 * @param {HTMLFormElement} form - The form element
 */
function updateOrderSummary(form) {
  const orderSummary = form.querySelector('#orderSummary');
  if (!orderSummary) return;
  
  // Get form data
  const formData = new FormData(form);
  const formDataObj = {};
  
  for (const [key, value] of formData.entries()) {
    // Handle nested objects (e.g., orderInfo.orderNumber)
    if (key.includes('.')) {
      const [parent, child] = key.split('.');
      formDataObj[parent] = formDataObj[parent] || {};
      formDataObj[parent][child] = value;
    } else {
      formDataObj[key] = value;
    }
  }
  
  // Build summary HTML
  let summaryHTML = `
    <div class="summary-section">
      <h4>Order Information</h4>
      <div class="summary-row">
        <div class="summary-label">Order Number:</div>
        <div class="summary-value">${formDataObj.orderInfo?.orderNumber || 'N/A'}</div>
      </div>
      <div class="summary-row">
        <div class="summary-label">Order Date:</div>
        <div class="summary-value">${formDataObj.orderInfo?.orderDate || 'N/A'}</div>
      </div>
      <div class="summary-row">
        <div class="summary-label">Status:</div>
        <div class="summary-value">${formDataObj.orderInfo?.status || 'N/A'}</div>
      </div>
    </div>
    
    <div class="summary-section">
      <h4>Facility Information</h4>
      <div class="summary-row">
        <div class="summary-label">Facility Name:</div>
        <div class="summary-value">${formDataObj.facilityInfo?.facilityName || 'N/A'}</div>
      </div>
      <div class="summary-row">
        <div class="summary-label">Contact:</div>
        <div class="summary-value">${formDataObj.facilityInfo?.contactName || 'N/A'}</div>
      </div>
    </div>
    
    <div class="summary-section">
      <h4>Shipping Information</h4>
      <div class="summary-row">
        <div class="summary-label">Address:</div>
        <div class="summary-value">
          ${formDataObj.shippingInfo?.shippingAddressLine1 || 'N/A'}<br>
          ${formDataObj.shippingInfo?.shippingCity || ''}, 
          ${formDataObj.shippingInfo?.shippingState || ''} 
          ${formDataObj.shippingInfo?.shippingZipCode || ''}
        </div>
      </div>
      <div class="summary-row">
        <div class="summary-label">Shipping Method:</div>
        <div class="summary-value">${formDataObj.shippingInfo?.shippingMethod || 'N/A'}</div>
      </div>
    </div>
  `;
  
  // Add products section
  summaryHTML += `
    <div class="summary-section">
      <h4>Products</h4>
      <table class="summary-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Size</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  // Get products
  const productItems = form.querySelectorAll('.product-item');
  let orderTotal = 0;
  
  productItems.forEach((item, index) => {
    const manufacturer = item.querySelector(`[name="products[${index}].manufacturer"]`)?.value || 'N/A';
    const description = item.querySelector(`[name="products[${index}].description"]`)?.value || 'N/A';
    const size = item.querySelector(`[name="products[${index}].size"]`)?.value || 'N/A';
    const quantity = item.querySelector(`[name="products[${index}].quantity"]`)?.value || '0';
    const unitPrice = item.querySelector(`[name="products[${index}].unitPrice"]`)?.value || '0';
    const totalPrice = item.querySelector(`[name="products[${index}].totalPrice"]`)?.value || '0';
    
    orderTotal += parseFloat(totalPrice);
    
    summaryHTML += `
      <tr>
        <td>${manufacturer} - ${description}</td>
        <td>${size}</td>
        <td>${quantity}</td>
        <td>$${parseFloat(unitPrice).toFixed(2)}</td>
        <td>$${parseFloat(totalPrice).toFixed(2)}</td>
      </tr>
    `;
  });
  
  summaryHTML += `
        </tbody>
        <tfoot>
          <tr>
            <td colspan="4" class="text-right"><strong>Order Total:</strong></td>
            <td><strong>$${orderTotal.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
  
  // Add special instructions
  summaryHTML += `
    <div class="summary-section">
      <h4>Special Instructions</h4>
      <p>${formDataObj.additionalInfo?.specialInstructions || 'None'}</p>
    </div>
  `;
  
  // Update the summary container
  orderSummary.innerHTML = summaryHTML;
}

/**
 * Initialize signature pad if present
 */
function initSignaturePad() {
  const canvas = document.getElementById('signaturePad');
  if (!canvas) return;
  
  // Check if SignaturePad library is available
  if (typeof SignaturePad === 'undefined') {
    // Create a simple fallback
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    canvas.addEventListener('mousedown', function(e) {
      isDrawing = true;
      [lastX, lastY] = [e.offsetX, e.offsetY];
    });
    
    canvas.addEventListener('mousemove', function(e) {
      if (!isDrawing) return;
      
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
      
      [lastX, lastY] = [e.offsetX, e.offsetY];
    });
    
    canvas.addEventListener('mouseup', function() {
      isDrawing = false;
      
      // Save signature data
      const signatureInput = document.getElementById('signature');
      if (signatureInput) {
        signatureInput.value = canvas.toDataURL();
      }
    });
    
    canvas.addEventListener('mouseleave', function() {
      isDrawing = false;
    });
    
    // Touch events
    canvas.addEventListener('touchstart', function(e) {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      [lastX, lastY] = [touch.clientX - rect.left, touch.clientY - rect.top];
      isDrawing = true;
    });
    
    canvas.addEventListener('touchmove', function(e) {
      e.preventDefault();
      if (!isDrawing) return;
      
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const offsetX = touch.clientX - rect.left;
      const offsetY = touch.clientY - rect.top;
      
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(offsetX, offsetY);
      ctx.stroke();
      
      [lastX, lastY] = [offsetX, offsetY];
    });
    
    canvas.addEventListener('touchend', function(e) {
      e.preventDefault();
      isDrawing = false;
      
      // Save signature data
      const signatureInput = document.getElementById('signature');
      if (signatureInput) {
        signatureInput.value = canvas.toDataURL();
      }
    });
    
    // Clear signature button
    const clearButton = document.getElementById('clearSignature');
    if (clearButton) {
      clearButton.addEventListener('click', function() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Clear signature data
        const signatureInput = document.getElementById('signature');
        if (signatureInput) {
          signatureInput.value = '';
        }
      });
    }
  } else {
    // Use SignaturePad library
    const signaturePad = new SignaturePad(canvas);
    
    // Clear signature button
    const clearButton = document.getElementById('clearSignature');
    if (clearButton) {
      clearButton.addEventListener('click', function() {
        signaturePad.clear();
        
        // Clear signature data
        const signatureInput = document.getElementById('signature');
        if (signatureInput) {
          signatureInput.value = '';
        }
      });
    }
    
    // Save signature data on end
    signaturePad.addEventListener('endStroke', function() {
      const signatureInput = document.getElementById('signature');
      if (signatureInput && !signaturePad.isEmpty()) {
        signatureInput.value = signaturePad.toDataURL();
      }
    });
  }
}

/**
 * Show an alert message
 * @param {string} message - The message to display
 * @param {string} type - The type of alert (success, danger, warning, info)
 */
function showAlert(message, type = 'info') {
  const alertsContainer = document.getElementById('alertsContainer');
  if (!alertsContainer) return;
  
  // Create alert element
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = message;
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'close';
  closeButton.innerHTML = '&times;';
  closeButton.style.float = 'right';
  closeButton.style.cursor = 'pointer';
  closeButton.style.border = 'none';
  closeButton.style.background = 'none';
  closeButton.style.fontSize = '1.25rem';
  closeButton.style.fontWeight = 'bold';
  closeButton.style.lineHeight = '1';
  closeButton.style.opacity = '0.5';
  closeButton.addEventListener('click', function() {
    alert.remove();
  });
  
  alert.prepend(closeButton);
  
  // Add to container
  alertsContainer.appendChild(alert);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    alert.style.opacity = '0';
    alert.style.transition = 'opacity 0.5s';
    
    setTimeout(() => {
      alert.remove();
    }, 500);
  }, 5000);
}
