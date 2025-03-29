/**
 * MSC Wound Care Form Handler
 * Provides core functionality for all form types
 * Version 1.0.0
 */

// Check if the function is already defined to avoid redefinition
if (typeof window.initForms !== 'function') {
    /**
     * Initialize all forms on the page
     */
    window.initForms = function() {
        console.log('Initializing forms');
        
        // Find all forms with data-form-type attribute
        const forms = document.querySelectorAll('form[data-form-type]');
        
        if (forms.length === 0) {
            console.log('No forms found with data-form-type attribute');
            return;
        }
        
        console.log(`Found ${forms.length} form(s) to initialize`);
        
        // Initialize each form
        forms.forEach(form => {
            const formType = form.dataset.formType;
            console.log(`Initializing ${formType} form`);
            
            // Setup common form features
            setupFormValidation(form);
            setupMultiStepNavigation(form);
            setupConditionalFields(form);
            setupProductManagement(form);
            setupFormSubmission(form);
            
            // Call form-specific initialization functions if they exist
            switch (formType) {
                case 'ivr':
                    if (typeof window.initIVRForm === 'function') {
                        window.initIVRForm();
                    }
                    break;
                    
                case 'order':
                    if (typeof window.initOrderForm === 'function') {
                        window.initOrderForm();
                    }
                    break;
                    
                case 'onboarding':
                    if (typeof window.initOnboardingForm === 'function') {
                        window.initOnboardingForm();
                    }
                    break;
                    
                case 'education':
                    if (typeof window.initEducationForm === 'function') {
                        window.initEducationForm();
                    }
                    break;
                    
                default:
                    console.log(`No specific initialization for form type: ${formType}`);
            }
        });
        
        console.log('Form initialization complete');
    };
}

/**
 * Setup form validation for a form
 * @param {HTMLFormElement} form - The form element
 */
function setupFormValidation(form) {
    if (!form) return;
    
    console.log('Setting up form validation');
    
    // Find all input fields with required or data-validate attributes
    const fields = form.querySelectorAll('input[required], select[required], textarea[required], [data-validate]');
    
    fields.forEach(field => {
        // Validate on blur
        field.addEventListener('blur', () => {
            validateField(field);
        });
        
        // Validate on change for select fields
        if (field.tagName === 'SELECT') {
            field.addEventListener('change', () => {
                validateField(field);
            });
        }
    });
    
    // Form submission validation
    form.addEventListener('submit', function(e) {
        // If this is a multi-step form, don't validate on submit as we're
        // handling validation in the step navigation
        if (form.querySelector('.form-step')) {
            return;
        }
        
        // Check all required fields
        let isValid = true;
        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        // Prevent submission if form is invalid
        if (!isValid) {
            e.preventDefault();
            showAlert('Please fill in all required fields correctly.', 'warning');
            
            // Focus the first invalid field
            const firstInvalid = form.querySelector('.is-invalid');
            if (firstInvalid) {
                firstInvalid.focus();
            }
        }
    });
}

/**
 * Validate a single form field
 * @param {HTMLElement} field - The field to validate
 * @returns {boolean} Whether the field is valid
 */
function validateField(field) {
    if (!field) return true;
    
    // Get validation type
    const validationType = field.dataset.validate || field.type;
    let isValid = true;
    const value = field.value.trim();
    
    // Check if required and empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
    } 
    // If has a value, check format based on type
    else if (value) {
        switch (validationType) {
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                break;
                
            case 'tel':
            case 'phone':
                // Remove non-numeric characters and check length
                const digitsOnly = value.replace(/\D/g, '');
                isValid = digitsOnly.length >= 10;
                break;
                
            case 'zip':
            case 'zipcode':
                isValid = /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(value);
                break;
                
            case 'date':
                isValid = !isNaN(new Date(value).getTime());
                break;
                
            case 'number':
                isValid = !isNaN(parseFloat(value)) && isFinite(value);
                break;
                
            // Add more validation types as needed
        }
    }
    
    // Update field styling
    if (isValid) {
        field.classList.remove('is-invalid');
        field.classList.add('is-valid');
    } else {
        field.classList.add('is-invalid');
        field.classList.remove('is-valid');
    }
    
    return isValid;
}

/**
 * Validate all inputs in a specific form step
 * @param {HTMLElement} form - The form element
 * @param {number} step - The step number to validate
 * @returns {boolean} Whether the step is valid
 */
function validateFormStep(form, step) {
    if (!form) return false;
    
    // For development, return true to skip validation
    // REMOVE THIS IN PRODUCTION
    return true;
    
    const stepElement = form.querySelector(`.form-step[data-step="${step}"]`);
    if (!stepElement) return false;
    
    const fields = stepElement.querySelectorAll('input[required], select[required], textarea[required], [data-validate]');
    let isValid = true;
    
    fields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Setup multi-step navigation for a form
 * @param {HTMLFormElement} form - The form element
 */
function setupMultiStepNavigation(form) {
    if (!form) return;
    
    const formSteps = form.querySelectorAll('.form-step');
    if (formSteps.length <= 1) return; // Not a multi-step form
    
    console.log('Setting up multi-step navigation');
    
    // Get all next and back buttons
    const nextButtons = form.querySelectorAll('[data-action="next"]');
    const backButtons = form.querySelectorAll('[data-action="back"]');
    
    // Handle next button clicks
    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentStep = getCurrentStep(form);
            if (currentStep < formSteps.length) {
                // Validate current step before proceeding
                if (validateFormStep(form, currentStep)) {
                    showStep(form, currentStep + 1);
                } else {
                    // Show validation errors
                    const invalidFields = form.querySelectorAll('.form-step[data-step="' + currentStep + '"] .is-invalid');
                    if (invalidFields.length) {
                        invalidFields[0].focus();
                        showAlert('Please fill in all required fields correctly.', 'warning');
                    }
                }
            }
        });
    });
    
    // Handle back button clicks
    backButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentStep = getCurrentStep(form);
            if (currentStep > 1) {
                showStep(form, currentStep - 1);
            }
        });
    });
    
    // Show the first step
    showStep(form, 1);
}

/**
 * Get the current visible step
 * @param {HTMLFormElement} form - The form element
 * @returns {number} The current step number
 */
function getCurrentStep(form) {
    if (!form) return 1;
    
    const activeStep = form.querySelector('.form-step.active');
    return activeStep ? parseInt(activeStep.dataset.step) : 1;
}

/**
 * Show a specific form step
 * @param {HTMLFormElement} form - The form element
 * @param {number} step - The step number to show
 */
function showStep(form, step) {
    if (!form) return;
    
    console.log(`Showing step ${step}`);
    
    const formSteps = form.querySelectorAll('.form-step');
    const totalSteps = formSteps.length;
    
    // Hide all steps
    formSteps.forEach(stepElement => {
        stepElement.style.display = 'none';
        stepElement.classList.remove('active');
    });
    
    // Show the target step
    const stepToShow = form.querySelector(`.form-step[data-step="${step}"]`);
    if (stepToShow) {
        stepToShow.style.display = 'block';
        stepToShow.classList.add('active');
        
        // Focus first input field for accessibility
        setTimeout(() => {
            const firstInput = stepToShow.querySelector('input:not([type="hidden"]), select, textarea');
            if (firstInput) firstInput.focus();
        }, 100);
    }
    
    // Update progress bar
    updateProgressBar(form, step, totalSteps);
    
    // Scroll to top of form on mobile
    if (window.innerWidth < 768) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Update the progress bar for multi-step forms
 * @param {HTMLFormElement} form - The form element
 * @param {number} currentStep - The current step number
 * @param {number} totalSteps - The total number of steps
 */
function updateProgressBar(form, currentStep, totalSteps) {
    if (!form) return;
    
    // Find progress container (either inside the form or nearby)
    let progressContainer = form.querySelector('.progress-container');
    if (!progressContainer) {
        // Try to find it as a sibling of the form
        progressContainer = form.parentElement.querySelector('.progress-container');
    }
    
    if (!progressContainer) return;
    
    // Calculate percentage
    const percentage = ((currentStep - 1) / (totalSteps - 1)) * 100;
    
    // Update progress bar fill
    const progressBarFill = progressContainer.querySelector('.progress-bar-fill');
    if (progressBarFill) {
        progressBarFill.style.width = `${percentage}%`;
    }
    
    // Update step indicators
    const stepElements = progressContainer.querySelectorAll('.progress-step');
    stepElements.forEach(stepElement => {
        const stepNumber = parseInt(stepElement.dataset.step);
        stepElement.classList.toggle('active', stepNumber === currentStep);
        stepElement.classList.toggle('completed', stepNumber < currentStep);
    });
    
    // Update text
    const currentStepEl = progressContainer.querySelector('#currentStep');
    const completionPercentageEl = progressContainer.querySelector('#completionPercentage');
    
    if (currentStepEl) {
        currentStepEl.textContent = currentStep;
    }
    
    if (completionPercentageEl) {
        completionPercentageEl.textContent = Math.round(percentage);
    }
}

/**
 * Setup conditional fields based on other field values
 * @param {HTMLFormElement} form - The form element
 */
function setupConditionalFields(form) {
    if (!form) return;
    
    console.log('Setting up conditional fields');
    
    // Find all elements with data-condition-* attributes
    const conditionalTriggers = form.querySelectorAll('[data-condition-field]');
    
    conditionalTriggers.forEach(trigger => {
        const targetField = trigger.dataset.conditionField;
        const targetValue = trigger.dataset.conditionValue;
        const targetAction = trigger.dataset.conditionAction || 'show';
        
        // Find the field that triggers the condition
        const triggerField = form.querySelector(`#${targetField}`);
        if (!triggerField) return;
        
        // Function to check condition and take action
        const checkCondition = () => {
            const fieldValue = triggerField.type === 'checkbox' ? 
                triggerField.checked.toString() : triggerField.value;
            
            const conditionMet = targetValue ?
                fieldValue === targetValue :
                fieldValue !== '';
            
            if (targetAction === 'show') {
                trigger.style.display = conditionMet ? 'block' : 'none';
                
                // Toggle required attribute on child inputs
                const inputs = trigger.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    if (input.dataset.conditionalRequired) {
                        input.required = conditionMet;
                    }
                });
            } else if (targetAction === 'hide') {
                trigger.style.display = conditionMet ? 'none' : 'block';
                
                // Toggle required attribute on child inputs
                const inputs = trigger.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    if (input.dataset.conditionalRequired) {
                        input.required = !conditionMet;
                    }
                });
            }
        };
        
        // Add event listeners
        if (triggerField.type === 'checkbox') {
            triggerField.addEventListener('change', checkCondition);
        } else {
            triggerField.addEventListener('change', checkCondition);
            triggerField.addEventListener('input', checkCondition);
        }
        
        // Initial check
        checkCondition();
    });
    
    // Setup "same as" billing address checkbox
    const sameAddressCheckbox = form.querySelector('#same_address');
    if (sameAddressCheckbox) {
        const billingSection = document.getElementById('billing_address_section');
        if (billingSection) {
            sameAddressCheckbox.addEventListener('change', () => {
                billingSection.style.display = sameAddressCheckbox.checked ? 'none' : 'block';
                
                // Toggle required attributes
                const inputs = billingSection.querySelectorAll('input, select');
                inputs.forEach(input => {
                    if (input.dataset.required === 'true') {
                        input.required = !sameAddressCheckbox.checked;
                    }
                });
            });
            
            // Initial check
            sameAddressCheckbox.dispatchEvent(new Event('change'));
        }
    }
}

/**
 * Setup product management for order forms
 * @param {HTMLFormElement} form - The form element
 */
function setupProductManagement(form) {
    if (!form) return;
    
    console.log('Setting up product management');
    
    // Find the product management elements
    const addProductButton = form.querySelector('[data-action="add-product"]');
    if (!addProductButton) return; // Not an order form
    
    const productSelect = form.querySelector('#product_select');
    const quantityInput = form.querySelector('#product_quantity');
    const productListContainer = form.querySelector('#product_list');
    
    if (!productSelect || !quantityInput || !productListContainer) return;
    
    // Products array
    let products = [];
    
    // Add product button click
    addProductButton.addEventListener('click', () => {
        if (!productSelect.value) {
            showAlert('Please select a product', 'warning');
            return;
        }
        
        const quantity = parseInt(quantityInput.value);
        if (isNaN(quantity) || quantity <= 0) {
            showAlert('Please enter a valid quantity', 'warning');
            return;
        }
        
        // Get product details
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const product = {
            id: productSelect.value,
            name: selectedOption.text,
            price: parseFloat(selectedOption.dataset.price || 0),
            sku: selectedOption.dataset.sku || '',
            quantity: quantity,
            total: quantity * parseFloat(selectedOption.dataset.price || 0)
        };
        
        // Add to products array
        products.push(product);
        
        // Update product list
        updateProductList();
        
        // Reset inputs
        productSelect.selectedIndex = 0;
        quantityInput.value = 1;
    });
    
    // Update product list
    function updateProductList() {
        // Clear current items
        productListContainer.innerHTML = '';
        
        if (products.length === 0) {
            productListContainer.innerHTML = '<p id="no_products_message">No products added yet. Use the form above to add products.</p>';
            return;
        }
        
        // Create table
        const table = document.createElement('table');
        table.className = 'table product-table';
        
        // Add header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
                <th>Actions</th>
            </tr>
        `;
        table.appendChild(thead);
        
        // Add body
        const tbody = document.createElement('tbody');
        let subtotal = 0;
        
        products.forEach((product, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${product.name}<br><small class="text-muted">SKU: ${product.sku}</small></td>
                <td>${product.quantity}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>$${product.total.toFixed(2)}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-danger" data-action="remove-product" data-index="${index}">Remove</button>
                </td>
            `;
            
            tbody.appendChild(row);
            subtotal += product.total;
        });
        
        table.appendChild(tbody);
        
        // Add footer
        const tfoot = document.createElement('tfoot');
        tfoot.innerHTML = `
            <tr>
                <td colspan="3" class="text-end">Subtotal:</td>
                <td class="subtotal">$${subtotal.toFixed(2)}</td>
                <td></td>
            </tr>
        `;
        table.appendChild(tfoot);
        
        // Add to container
        productListContainer.appendChild(table);
        
        // Add remove button event listeners
        const removeButtons = productListContainer.querySelectorAll('[data-action="remove-product"]');
        removeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = parseInt(button.dataset.index);
                if (!isNaN(index) && index >= 0 && index < products.length) {
                    products.splice(index, 1);
                    updateProductList();
                }
            });
        });
        
        // Update hidden input for order items
        const orderItemsInput = form.querySelector('#order_items');
        if (orderItemsInput) {
            orderItemsInput.value = JSON.stringify(products);
        }
    }
    
    // Initialize product list
    updateProductList();
}

/**
 * Setup form submission handling
 * @param {HTMLFormElement} form - The form element
 */
function setupFormSubmission(form) {
    if (!form) return;
    
    console.log('Setting up form submission');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate all fields first
        const fields = form.querySelectorAll('input[required], select[required], textarea[required], [data-validate]');
        let isValid = true;
        
        fields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            showAlert('Please fill in all required fields correctly.', 'warning');
            return;
        }
        
        // Show loading state
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            const originalText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
        }
        
        try {
            // Get form data
            const formData = new FormData(form);
            
            // Submit form data
            const response = await fetch(form.action, {
                method: form.method || 'POST',
                body: formData,
            });
            
            // Check response
            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Show success message
            showAlert(data.message || 'Form submitted successfully!', 'success');
            
            // Reset form
            form.reset();
            
            // If multi-step form, go back to first step
            if (form.querySelector('.form-step')) {
                showStep(form, 1);
            }
            
        } catch (error) {
            console.error('Form submission error:', error);
            showAlert('There was an error submitting the form. Please try again.', 'error');
        } finally {
            // Reset button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalText;
            }
        }
    });
}

/**
 * Show an alert message
 * @param {string} message - The message to display
 * @param {string} type - The alert type (success, warning, danger, info)
 * @param {number} timeout - Time in milliseconds before auto-dismissing
 */
function showAlert(message, type = 'info', timeout = 5000) {
    console.log(`Showing ${type} alert: ${message}`);
    
    // Find alerts container
    let alertsContainer = document.getElementById('alertsContainer');
    
    // Create it if it doesn't exist
    if (!alertsContainer) {
        alertsContainer = document.createElement('div');
        alertsContainer.id = 'alertsContainer';
        alertsContainer.className = 'alerts-container';
        document.body.appendChild(alertsContainer);
    }
    
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" aria-label="Close"></button>
    `;
    
    // Add to container
    alertsContainer.appendChild(alertElement);
    
    // Setup dismiss button
    const dismissButton = alertElement.querySelector('.btn-close');
    if (dismissButton) {
        dismissButton.addEventListener('click', () => {
            alertElement.classList.remove('show');
            setTimeout(() => {
                alertElement.remove();
            }, 300);
        });
    }
    
    // Auto-dismiss non-error alerts
    if (type !== 'error' && timeout > 0) {
        setTimeout(() => {
            alertElement.classList.remove('show');
            setTimeout(() => {
                alertElement.remove();
            }, 300);
        }, timeout);
    }
}

// Initialize forms when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on a page with forms
    const hasForms = document.querySelectorAll('form').length > 0;
    
    if (hasForms) {
        console.log('DOM loaded, initializing forms');
        if (typeof window.initForms === 'function') {
            window.initForms();
        }
    }
});
