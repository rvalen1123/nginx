/**
 * Product Education Form Functionality
 */

function initProductEducationForm() {
    // Load form dependencies
    loadFormData();
    
    // Initialize multi-step form
    const formSteps = [
        {
            id: 'step1',
            validate: validateStep1
        },
        {
            id: 'step2',
            validate: validateStep2
        },
        {
            id: 'step3',
            validate: validateStep3
        }
    ];
    
    const multiStepForm = initMultiStepForm({
        formId: 'productEducationForm',
        steps: formSteps,
        onStepChange: handleStepChange,
        onSubmit: handleFormSubmit
    });
    
    // Initialize conditional fields
    setupConditionalFields();
    
    // Initialize file uploads
    initFileUpload('productMaterialsFile', 'productMaterialsPreview');
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const requestDateEl = document.getElementById('request_date');
    
    if (requestDateEl) requestDateEl.value = today;
    
    // Load data from APIs for dropdowns
    async function loadFormData() {
        try {
            // Load manufacturers
            await populateSelectFromApi(
                'manufacturer',
                '/api/manufacturers',
                'manufacturerId',
                'name'
            );
            
            // Load products if manufacturer is selected
            const manufacturerSelect = document.getElementById('manufacturer');
            if (manufacturerSelect) {
                manufacturerSelect.addEventListener('change', async function() {
                    const manufacturerId = this.value;
                    if (manufacturerId) {
                        await populateSelectFromApi(
                            'product',
                            `/api/manufacturers/${manufacturerId}/products`,
                            'productId',
                            'name'
                        );
                    } else {
                        // Clear product dropdown if no manufacturer selected
                        const productSelect = document.getElementById('product');
                        if (productSelect) {
                            productSelect.innerHTML = '<option value="">Select...</option>';
                            productSelect.disabled = true;
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error loading form data:', error);
            showAlert('Error loading form data. Please try again later.', 'error');
        }
    }
    
    // Handle conditional field visibility
    function setupConditionalFields() {
        // Show product details when a product is selected
        const productSelect = document.getElementById('product');
        const productDetailsContainer = document.getElementById('productDetailsContainer');
        
        if (productSelect && productDetailsContainer) {
            productSelect.addEventListener('change', function() {
                productDetailsContainer.style.display = this.value ? 'block' : 'none';
            });
        }
    }
    
    // When step changes, handle any special cases
    function handleStepChange(stepIndex, stepId) {
        // If we're on the review step, populate the review content
        if (stepId === 'step3') {
            updateReviewSection();
        }
    }
    
    // Validate Step 1: Basic Information
    function validateStep1() {
        let isValid = true;
        
        isValid = validateField('manufacturer', Validators.required) && isValid;
        isValid = validateField('product', Validators.required) && isValid;
        isValid = validateField('request_date', Validators.required) && isValid;
        
        return isValid;
    }
    
    // Validate Step 2: Education Details
    function validateStep2() {
        let isValid = true;
        
        isValid = validateField('educationType', Validators.required) && isValid;
        isValid = validateField('audience', Validators.required) && isValid;
        isValid = validateField('attendees', Validators.numeric) && isValid;
        
        return isValid;
    }
    
    // Validate Step 3: Review & Submit
    function validateStep3() {
        // No additional validation needed for review step
        return true;
    }
    
    // Update review section content
    function updateReviewSection() {
        // Basic Information Review
        const basicInfoReview = document.getElementById('basicInfoReview');
        if (basicInfoReview) {
            const manufacturerSelect = document.getElementById('manufacturer');
            const productSelect = document.getElementById('product');
            
            basicInfoReview.innerHTML = `
                <p><strong>Manufacturer:</strong> ${sanitizeHTML(manufacturerSelect?.options[manufacturerSelect?.selectedIndex]?.text)}</p>
                <p><strong>Product:</strong> ${sanitizeHTML(productSelect?.options[productSelect?.selectedIndex]?.text)}</p>
                <p><strong>Request Date:</strong> ${sanitizeHTML(document.getElementById('request_date')?.value)}</p>
            `;
        }
        
        // Education Details Review
        const educationDetailsReview = document.getElementById('educationDetailsReview');
        if (educationDetailsReview) {
            const educationTypeSelect = document.getElementById('educationType');
            
            educationDetailsReview.innerHTML = `
                <p><strong>Education Type:</strong> ${sanitizeHTML(educationTypeSelect?.options[educationTypeSelect?.selectedIndex]?.text)}</p>
                <p><strong>Audience:</strong> ${sanitizeHTML(document.getElementById('audience')?.value)}</p>
                <p><strong>Number of Attendees:</strong> ${sanitizeHTML(document.getElementById('attendees')?.value)}</p>
                <p><strong>Additional Notes:</strong> ${sanitizeHTML(document.getElementById('notes')?.value) || 'N/A'}</p>
            `;
        }
    }
    
    // Sanitize HTML to prevent XSS attacks
    function sanitizeHTML(str) {
        if (!str) return 'N/A';
        
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }
    
    // Handle form submission
    async function handleFormSubmit(formData) {
        try {
            // Show loading state
            const submitButton = document.getElementById('submitForm');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="loading-spinner mr-2"></span>
                Submitting...
            `;
            
            // Send form data to server
            const response = await fetch('/api/submit-product-education', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                showAlert('Product education request submitted successfully!', 'success');
                
                // Optionally redirect or reset form
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            } else {
                // Show error message
                showAlert(`Error: ${result.message || 'Unknown error'}`, 'error');
                
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showAlert('An error occurred. Please try again.', 'error');
            
            // Re-enable submit button
            const submitButton = document.getElementById('submitForm');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Submit Request';
        }
    }
}
