/**
 * Modern Form Handler for MSC Wound Care Portal
 * This script handles multi-step form navigation, validation, and submission
 */

class FormHandler {
  constructor(formId, options = {}) {
    // Main elements
    this.form = document.getElementById(formId);
    if (!this.form) {
      console.error(`Form with ID "${formId}" not found.`);
      return;
    }

    // Options with defaults
    this.options = {
      steps: 5,
      validateOnStepChange: true,
      scrollToTop: true,
      scrollOffset: 20,
      ...options
    };

    // State
    this.currentStep = 1;
    this.formData = new FormData();
    this.isSubmitting = false;

    // Initialize
    this.init();
  }

  /**
   * Initialize the form handler
   */
  init() {
    // Find all form steps
    this.formSteps = Array.from(this.form.querySelectorAll('.form-step'));
    
    // Set up navigation buttons
    this.setupNavigation();
    
    // Set up conditional fields
    this.setupConditionalFields();
    
    // Set up product calculations and controls
    this.setupProductFunctionality();
    
    // Set up form submission
    this.setupFormSubmission();
    
    // Show the first step
    this.goToStep(1);
    
    console.log('Form handler initialized successfully.');
  }

  /**
   * Set up navigation buttons
   */
  setupNavigation() {
    // Next buttons
    const nextButtons = this.form.querySelectorAll('[data-action="next"]');
    nextButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToNextStep();
      });
    });

    // Back buttons
    const backButtons = this.form.querySelectorAll('[data-action="back"]');
    backButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.goToPreviousStep();
      });
    });

    // Step indicators (for direct navigation if enabled)
    const stepIndicators = document.querySelectorAll('.progress-step');
    if (this.options.allowDirectNavigation) {
      stepIndicators.forEach(indicator => {
        indicator.addEventListener('click', () => {
          const step = parseInt(indicator.dataset.step);
          if (step < this.currentStep || this.validateCurrentStep()) {
            this.goToStep(step);
          }
        });
      });
    }
  }

  /**
   * Navigate to a specific step
   * @param {number} step - The step number to navigate to
   */
  goToStep(step) {
    if (step < 1 || step > this.formSteps.length) {
      console.error(`Invalid step number: ${step}`);
      return;
    }

    // Hide all steps
    this.formSteps.forEach(stepEl => {
      stepEl.classList.remove('active');
      stepEl.style.display = 'none';
    });

    // Show the target step
    const targetStep = this.formSteps[step - 1];
    if (targetStep) {
      targetStep.classList.add('active');
      targetStep.style.display = 'block';
    }

    // Update progress indicators
    this.updateProgress(step);

    // Update current step
    this.currentStep = step;

    // Scroll to top if enabled
    if (this.options.scrollToTop) {
      window.scrollTo({
        top: this.form.offsetTop - this.options.scrollOffset,
        behavior: 'smooth'
      });
    }

    // If this is the review step, generate the summary
    if (step === this.formSteps.length) {
      this.generateSummary();
    }

    // Trigger step change event
    this.triggerEvent('stepChange', { step });
  }

  /**
   * Go to the next step
   */
  goToNextStep() {
    // Validate current step if enabled
    if (this.options.validateOnStepChange && !this.validateCurrentStep()) {
      return;
    }

    // Go to next step if not on the last step
    if (this.currentStep < this.formSteps.length) {
      this.goToStep(this.currentStep + 1);
    }
  }

  /**
   * Go to the previous step
   */
  goToPreviousStep() {
    // Go to previous step if not on the first step
    if (this.currentStep > 1) {
      this.goToStep(this.currentStep - 1);
    }
  }

  /**
   * Update progress indicators
   * @param {number} step - The current step
   */
  updateProgress(step) {
    // Update progress bar
    const progressBar = document.querySelector('.progress-bar-fill');
    if (progressBar) {
      const progress = ((step - 1) / (this.formSteps.length - 1)) * 100;
      progressBar.style.width = `${progress}%`;
    }

    // Update step text
    const currentStepEl = document.getElementById('currentStep');
    if (currentStepEl) {
      currentStepEl.textContent = step;
    }

    // Update completion percentage
    const percentageEl = document.getElementById('completionPercentage');
    if (percentageEl) {
      const percentage = Math.round(((step - 1) / (this.formSteps.length - 1)) * 100);
      percentageEl.textContent = percentage;
    }

    // Update step indicators
    const stepIndicators = document.querySelectorAll('.progress-step');
    stepIndicators.forEach((indicator, index) => {
      // Remove all classes first
      indicator.classList.remove('active', 'completed');

      // Add appropriate class based on current step
      if (index + 1 === step) {
        indicator.classList.add('active');
      } else if (index + 1 < step) {
        indicator.classList.add('completed');
      }
    });
  }

  /**
   * Validate the current step
   * @returns {boolean} - Whether the step is valid
   */
  validateCurrentStep() {
    const currentStepEl = this.formSteps[this.currentStep - 1];
    if (!currentStepEl) return true;

    // Get all required fields in the current step
    const requiredFields = currentStepEl.querySelectorAll('[required]');
    let isValid = true;

    // Check each required field
    requiredFields.forEach(field => {
      // Remove existing validation styling
      field.classList.remove('is-invalid');
      const feedbackEl = field.nextElementSibling;
      if (feedbackEl && feedbackEl.classList.contains('invalid-feedback')) {
        feedbackEl.style.display = 'none';
      }

      // Validate the field
      if (!field.value.trim()) {
        isValid = false;
        field.classList.add('is-invalid');
        
        // Show feedback message
        if (feedbackEl && feedbackEl.classList.contains('invalid-feedback')) {
          feedbackEl.style.display = 'block';
        } else {
          // Create feedback element if it doesn't exist
          const newFeedback = document.createElement('div');
          newFeedback.className = 'invalid-feedback';
          newFeedback.textContent = 'This field is required';
          newFeedback.style.display = 'block';
          field.parentNode.insertBefore(newFeedback, field.nextSibling);
        }
      }
    });

    // Custom validation for specific fields
    // Add any custom validation logic here

    return isValid;
  }

  /**
   * Set up conditional fields
   */
  setupConditionalFields() {
    // Example: Billing address same as shipping
    const sameAsShippingCheckbox = document.getElementById('sameAsShipping');
    const billingFields = document.getElementById('billingFields');
    
    if (sameAsShippingCheckbox && billingFields) {
      sameAsShippingCheckbox.addEventListener('change', function() {
        billingFields.style.display = this.checked ? 'none' : 'block';
      });
      
      // Initial state
      billingFields.style.display = sameAsShippingCheckbox.checked ? 'none' : 'block';
    }
    
    // Example: Payment method conditional fields
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const paymentTermsGroup = document.getElementById('paymentTerms')?.closest('.form-group');
    
    if (paymentMethodSelect && paymentTermsGroup) {
      paymentMethodSelect.addEventListener('change', function() {
        paymentTermsGroup.style.display = this.value === 'terms' ? 'block' : 'none';
      });
      
      // Initial state
      if (paymentMethodSelect.value) {
        paymentTermsGroup.style.display = paymentMethodSelect.value === 'terms' ? 'block' : 'none';
      }
    }
  }

  /**
   * Set up product functionality (calculations and controls)
   */
  setupProductFunctionality() {
    this.setupProductCalculations();
    this.setupProductControls();
  }

  /**
   * Set up product calculations
   */
  setupProductCalculations() {
    // Function to recalculate product totals
    const recalculateTotal = (index) => {
      const quantityInput = document.getElementById(`quantity-${index}`);
      const unitPriceInput = document.getElementById(`unitPrice-${index}`);
      const totalPriceInput = document.getElementById(`totalPrice-${index}`);
      
      if (quantityInput && unitPriceInput && totalPriceInput) {
        const quantity = parseFloat(quantityInput.value) || 0;
        const unitPrice = parseFloat(unitPriceInput.value) || 0;
        const total = quantity * unitPrice;
        
        totalPriceInput.value = total.toFixed(2);
      }
    };
    
    // Set up event listeners for all products
    const setupProductEvents = (index) => {
      const quantityInput = document.getElementById(`quantity-${index}`);
      const unitPriceInput = document.getElementById(`unitPrice-${index}`);
      
      if (quantityInput && unitPriceInput) {
        quantityInput.addEventListener('input', () => recalculateTotal(index));
        unitPriceInput.addEventListener('input', () => recalculateTotal(index));
        
        // Initial calculation
        recalculateTotal(index);
      }
    };
    
    // Set up initial product
    setupProductEvents(0);
    
    // Make functions available globally for dynamic products
    window.setupProductEvents = setupProductEvents;
    window.recalculateTotal = recalculateTotal;
  }

  /**
   * Set up product controls (add/remove)
   */
  setupProductControls() {
    const productContainer = document.getElementById('productContainer');
    const addProductBtn = document.getElementById('addProductBtn');
    
    if (!productContainer || !addProductBtn) return;
    
    // Add product button
    addProductBtn.addEventListener('click', () => {
      const products = productContainer.querySelectorAll('.product-item');
      const newIndex = products.length;
      
      const productTemplate = `
        <div class="product-item" data-product-index="${newIndex}">
          <button type="button" class="remove-product-btn" aria-label="Remove product">×</button>
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="manufacturer-${newIndex}">Manufacturer <span class="text-danger">*</span></label>
                <select id="manufacturer-${newIndex}" name="products[${newIndex}].manufacturer" class="form-control" required>
                  <option value="">Select Manufacturer</option>
                  <option value="ACZ_Distribution">ACZ Distribution</option>
                  <option value="Advanced_Solution">Advanced Solution</option>
                  <option value="MedLife_Solutions">MedLife Solutions</option>
                  <option value="BioWerX">BioWerX</option>
                  <option value="Imbed_Biosciences">Imbed Biosciences</option>
                  <option value="Stability_Biologics">Stability Biologics</option>
                  <option value="Legacy_Medical_Consultants">Legacy Medical Consultants</option>
                  <option value="BioWound_Solutions">BioWound Solutions</option>
                </select>
                <div class="form-text">Company that makes the product</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="productCode-${newIndex}">Product Code <span class="text-danger">*</span></label>
                <input type="text" id="productCode-${newIndex}" name="products[${newIndex}].productCode" class="form-control" required>
                <div class="form-text">SKU or item number</div>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label for="description-${newIndex}">Description <span class="text-danger">*</span></label>
            <input type="text" id="description-${newIndex}" name="products[${newIndex}].description" class="form-control" required>
            <div class="form-text">Product name and details</div>
          </div>
          
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="size-${newIndex}">Size <span class="text-danger">*</span></label>
                <input type="text" id="size-${newIndex}" name="products[${newIndex}].size" class="form-control" required>
                <div class="form-text">Dimensions of the product</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="quantity-${newIndex}">Quantity <span class="text-danger">*</span></label>
                <input type="number" id="quantity-${newIndex}" name="products[${newIndex}].quantity" class="form-control" required min="1" value="1">
              </div>
            </div>
          </div>
          
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="unitPrice-${newIndex}">Unit Price <span class="text-danger">*</span></label>
                <input type="number" id="unitPrice-${newIndex}" name="products[${newIndex}].unitPrice" class="form-control" required step="0.01">
                <div class="form-text">Price per unit</div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="totalPrice-${newIndex}">Total Price</label>
                <input type="number" id="totalPrice-${newIndex}" name="products[${newIndex}].totalPrice" class="form-control" readonly>
                <div class="form-text">Automatically calculated</div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Append the new product item
      productContainer.insertAdjacentHTML('beforeend', productTemplate);
      
      // Setup events for the new product
      window.setupProductEvents(newIndex);
      
      // Add remove event listener
      const newProduct = productContainer.lastElementChild;
      const removeBtn = newProduct.querySelector('.remove-product-btn');
      
      removeBtn.addEventListener('click', () => {
        newProduct.remove();
        this.renumberProducts();
      });
    });
    
    // Set up remove button for the initial product
    const initialRemoveBtn = document.querySelector('.product-item .remove-product-btn');
    if (initialRemoveBtn) {
      initialRemoveBtn.addEventListener('click', () => {
        const products = productContainer.querySelectorAll('.product-item');
        
        // Don't remove if it's the only product
        if (products.length === 1) {
          this.showAlert("You need at least one product in your order.", "warning");
          return;
        }
        
        // Remove the product
        initialRemoveBtn.closest('.product-item').remove();
        this.renumberProducts();
      });
    }
  }

  /**
   * Renumber products after deletion
   */
  renumberProducts() {
    const productContainer = document.getElementById('productContainer');
    if (!productContainer) return;
    
    const products = productContainer.querySelectorAll('.product-item');
    
    products.forEach((product, idx) => {
      // Update data attribute
      product.dataset.productIndex = idx;
      
      // Update all field IDs and names
      const fields = product.querySelectorAll('input, select');
      fields.forEach(field => {
        const fieldName = field.name.replace(/products\[\d+\]/, `products[${idx}]`);
        field.name = fieldName;
        
        const fieldId = field.id.replace(/\-\d+$/, `-${idx}`);
        field.id = fieldId;
      });
      
      // Update labels
      const labels = product.querySelectorAll('label');
      labels.forEach(label => {
        const forAttr = label.getAttribute('for').replace(/\-\d+$/, `-${idx}`);
        label.setAttribute('for', forAttr);
      });
    });
  }

  /**
   * Generate order summary for review step
   */
  generateSummary() {
    const orderSummary = document.getElementById('orderSummary');
    if (!orderSummary) return;
    
    // Get form data
    const formData = new FormData(this.form);
    
    let summaryHTML = '<div class="summary-section">';
    
    // Order Info Summary
    summaryHTML += `
      <h3 class="mb-3">Order Information</h3>
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>Order Number:</strong> ${formData.get('orderInfo.orderNumber') || 'N/A'}</p>
              <p><strong>Order Date:</strong> ${formData.get('orderInfo.orderDate') || 'N/A'}</p>
            </div>
            <div class="col-md-6">
              <p><strong>PO Number:</strong> ${formData.get('orderInfo.poNumber') || 'N/A'}</p>
              <p><strong>Status:</strong> ${
                document.getElementById('status')?.options[
                  document.getElementById('status')?.selectedIndex
                ]?.text || 'N/A'
              }</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Facility Info Summary
    summaryHTML += `
      <h3 class="mb-3">Facility Information</h3>
      <div class="card mb-4">
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <p><strong>Facility Name:</strong> ${formData.get('facilityInfo.facilityName') || 'N/A'}</p>
              <p><strong>Contact Name:</strong> ${formData.get('facilityInfo.contactName') || 'N/A'}</p>
            </div>
            <div class="col-md-6">
              <p><strong>Contact Phone:</strong> ${formData.get('facilityInfo.contactPhone') || 'N/A'}</p>
              <p><strong>Contact Email:</strong> ${formData.get('facilityInfo.contactEmail') || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Shipping Info Summary
    summaryHTML += `
      <h3 class="mb-3">Shipping Information</h3>
      <div class="card mb-4">
        <div class="card-body">
          <p><strong>Address:</strong> ${formData.get('shippingInfo.shippingAddressLine1') || 'N/A'}, 
            ${formData.get('shippingInfo.shippingCity') || ''}, 
            ${formData.get('shippingInfo.shippingState') || ''} 
            ${formData.get('shippingInfo.shippingZipCode') || ''}</p>
          <p><strong>Shipping Method:</strong> ${
            document.getElementById('shippingMethod')?.options[
              document.getElementById('shippingMethod')?.selectedIndex
            ]?.text || 'N/A'
          }</p>
        </div>
      </div>
    `;
    
    // Product Summary
    summaryHTML += `
      <h3 class="mb-3">Products</h3>
      <div class="card mb-4">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Size</th>
                  <th>Qty</th>
                  <th class="text-right">Unit Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
    `;
    
    // Collect product data
    const products = document.querySelectorAll('.product-item');
    let orderTotal = 0;
    
    products.forEach((product, idx) => {
      const description = formData.get(`products[${idx}].description`);
      const size = formData.get(`products[${idx}].size`);
      const quantity = formData.get(`products[${idx}].quantity`);
      const unitPrice = formData.get(`products[${idx}].unitPrice`);
      const totalPrice = formData.get(`products[${idx}].totalPrice`) || 
                         (parseFloat(quantity || 0) * parseFloat(unitPrice || 0)).toFixed(2);
      
      orderTotal += parseFloat(totalPrice || 0);
      
      summaryHTML += `
        <tr>
          <td>${description || 'N/A'}</td>
          <td>${size || 'N/A'}</td>
          <td>${quantity || '0'}</td>
          <td class="text-right">$${parseFloat(unitPrice || 0).toFixed(2)}</td>
          <td class="text-right">$${parseFloat(totalPrice || 0).toFixed(2)}</td>
        </tr>
      `;
    });
    
    summaryHTML += `
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4" class="text-right"><strong>Order Total:</strong></td>
                  <td class="text-right"><strong>$${orderTotal.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    `;
    
    summaryHTML += '</div>';
    
    orderSummary.innerHTML = summaryHTML;
  }

  /**
   * Set up form submission
   */
  setupFormSubmission() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Validate final step
      if (!this.validateCurrentStep()) {
        return;
      }
      
      // Prevent double submission
      if (this.isSubmitting) {
        return;
      }
      
      this.isSubmitting = true;
      
      // Show loading state
      const submitBtn = this.form.querySelector('[type="submit"]');
      if (submitBtn) {
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
      }
      
      // Get form data
      const formData = new FormData(this.form);
      const formObject = {};
      
      formData.forEach((value, key) => {
        // Handle nested properties (e.g., 'orderInfo.orderNumber')
        if (key.includes('.')) {
          const [parent, child] = key.split('.');
          formObject[parent] = formObject[parent] || {};
          formObject[parent][child] = value;
        } else if (key.includes('[')) {
          // Handle array properties (e.g., 'products[0].quantity')
          const matches = key.match(/([^\[]+)\[(\d+)\]\.(.+)/);
          if (matches) {
            const [, arrayName, index, property] = matches;
            formObject[arrayName] = formObject[arrayName] || [];
            formObject[arrayName][index] = formObject[arrayName][index] || {};
            formObject[arrayName][index][property] = value;
          }
        } else {
          formObject[key] = value;
        }
      });
      
      // In a real application, you would send this data to a server
      // For demo purposes, we'll simulate a server response
      setTimeout(() => {
        // Simulate successful submission
        const success = true;
        const responseContainer = document.getElementById('responseContainer');
        
        if (responseContainer) {
          if (success) {
            responseContainer.className = 'alert alert-success';
            responseContainer.innerHTML = `
              <h4>Order Submitted Successfully</h4>
              <p>Your order #${formObject.orderInfo?.orderNumber || 'WC-' + new Date().getTime()} has been received. A confirmation email will be sent shortly.</p>
              <p>Tracking Number: MSC-${Math.floor(Math.random() * 10000000)}</p>
            `;
          } else {
            responseContainer.className = 'alert alert-danger';
            responseContainer.innerHTML = `
              <h4>Error Submitting Order</h4>
              <p>There was a problem processing your order. Please try again or contact customer support.</p>
            `;
          }
          
          responseContainer.style.display = 'block';
          
          // Scroll to response
          responseContainer.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Reset loading state
        if (submitBtn) {
          submitBtn.classList.remove('btn-loading');
          submitBtn.disabled = false;
        }
        
        this.isSubmitting = false;
        
        // Trigger submit event
        this.triggerEvent('formSubmit', { success, data: formObject });
      }, 2000); // Simulate network delay
    });
  }

  /**
   * Show an alert message
   * @param {string} message - The message to display
   * @param {string} type - The type of alert (success, danger, warning, info)
   * @param {string} containerId - The ID of the container to append the alert to
   * @param {boolean} autoHide - Whether to automatically hide the alert after a delay
   * @returns {HTMLElement} - The alert element
   */
  showAlert(message, type = 'info', containerId = 'alertsContainer', autoHide = true) {
    // Create alerts container if it doesn't exist
    let alertsContainer = document.getElementById(containerId);
    if (!alertsContainer) {
      alertsContainer = document.createElement('div');
      alertsContainer.id = containerId;
      alertsContainer.className = 'alerts-container';
      this.form.prepend(alertsContainer);
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} fade-in`;
    alert.innerHTML = message;
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => alert.remove());
    alert.appendChild(closeButton);
    
    // Add to container
    alertsContainer.appendChild(alert);
    
    // Auto-hide if enabled
    if (autoHide) {
      setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
      }, 5000);
    }
    
    return alert;
  }

  /**
   * Trigger a custom event
   * @param {string} eventName - The name of the event
   * @param {object} detail - The event detail object
   */
  triggerEvent(eventName, detail = {}) {
    const event = new CustomEvent(`formHandler:${eventName}`, {
      bubbles: true,
      detail: {
        formId: this.form.id,
        ...detail
      }
    });
    
    this.form.dispatchEvent(event);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize form handlers for each form
  const orderForm = new FormHandler('universalOrderForm', {
    validateOnStepChange: true,
    scrollToTop: true
  });
  
  // Set default date to today for date fields
  const dateInputs = document.querySelectorAll('input[type="date"]');
  const today = new Date().toISOString().split('T')[0];
  
  dateInputs.forEach(input => {
    if (!input.value) {
      input.value = today;
    }
  });
});
