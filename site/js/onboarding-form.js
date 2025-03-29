/**
 * Onboarding Form Functionality
 */

function initOnboardingForm() {
    // Get form element
    const form = document.getElementById('onboardingForm');
    if (!form) {
        console.error('Onboarding form not found');
        return;
    }
    
    // Add event listener for form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Initialize the section togglers
    initSectionTogglers();
    
    // Initialize conditional fields
    setupConditionalFields();
    
    // Initialize repeaters
    initRepeaters();
    
    // Initialize signature pad
    initSignaturePad('signature_canvas', 'signature');
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('signed_date').value = today;
    
    // Initialize section togglers
    function initSectionTogglers() {
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const isVisible = content.style.display !== 'none';
                
                content.style.display = isVisible ? 'none' : 'block';
                this.querySelector('span').textContent = isVisible ? '▶' : '▼';
            });
        });
    }
    
    // Set up conditional fields
    function setupConditionalFields() {
        // Shipping same as practice address
        const shippingSameCheckbox = document.getElementById('shipping_same_as_billing');
        const shippingFields = document.getElementById('shipping_fields');
        
        if (shippingSameCheckbox && shippingFields) {
            shippingSameCheckbox.addEventListener('change', function() {
                shippingFields.style.display = this.checked ? 'none' : 'block';
            });
            
            // Initial state
            shippingFields.style.display = shippingSameCheckbox.checked ? 'none' : 'block';
        }
        
        // Carrier account when shipping on facility's account
        const shippingTermsRadios = document.querySelectorAll('input[name="shipping_terms"]');
        const carrierAccountContainer = document.getElementById('carrier_account_container');
        
        if (shippingTermsRadios.length && carrierAccountContainer) {
            shippingTermsRadios.forEach(radio => {
                radio.addEventListener('change', function() {
                    carrierAccountContainer.style.display = 
                        this.value === 'Ship on Facility\'s Carrier Account' ? 'block' : 'none';
                });
            });
            
            // Initial state - check if any radio is checked
            const checkedRadio = document.querySelector('input[name="shipping_terms"]:checked');
            if (checkedRadio) {
                carrierAccountContainer.style.display = 
                    checkedRadio.value === 'Ship on Facility\'s Carrier Account' ? 'block' : 'none';
            } else {
                carrierAccountContainer.style.display = 'none';
            }
        }
    }
    
    // Initialize repeater functionality (add/remove providers and locations)
    function initRepeaters() {
        // Providers repeater
        const addProviderBtn = document.getElementById('add_provider_btn');
        if (addProviderBtn) {
            addProviderBtn.addEventListener('click', addProvider);
        }
        
        // Locations repeater
        const addLocationBtn = document.getElementById('add_location_btn');
        if (addLocationBtn) {
            addLocationBtn.addEventListener('click', addLocation);
        }
        
        // Initialize existing remove buttons
        document.querySelectorAll('.remove-provider').forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.repeater-group').remove();
            });
        });
        
        document.querySelectorAll('.remove-location').forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.repeater-group').remove();
            });
        });
    }
    
    // Add a new provider
    function addProvider() {
        const container = document.getElementById('multi_provider_container');
        if (!container) return;
        
        const providerIndex = container.children.length;
        const providerId = `provider_${Date.now()}`;
        
        const providerHtml = `
            <div class="repeater-group border p-4 rounded-md mb-4 bg-gray-50" id="${providerId}">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label for="${providerId}_name" class="block text-sm font-medium text-gray-700 mb-1">
                            Provider Name
                        </label>
                        <input type="text" id="${providerId}_name" name="additional_provider_name[]" class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="form-group">
                        <label for="${providerId}_npi" class="block text-sm font-medium text-gray-700 mb-1">
                            Provider NPI
                        </label>
                        <input type="text" id="${providerId}_npi" name="additional_provider_npi[]" class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                </div>
                <div class="flex justify-end mt-2">
                    <button type="button" class="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 remove-provider">
                        Remove
                    </button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', providerHtml);
        
        // Add remove event listener
        const newProvider = document.getElementById(providerId);
        if (newProvider) {
            newProvider.querySelector('.remove-provider').addEventListener('click', function() {
                newProvider.remove();
            });
        }
    }
    
    // Add a new location
    function addLocation() {
        const container = document.getElementById('multi_location_container');
        if (!container) return;
        
        const locationIndex = container.children.length;
        const locationId = `location_${Date.now()}`;
        
        const locationHtml = `
            <div class="repeater-group border p-4 rounded-md mb-4 bg-gray-50" id="${locationId}">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label for="${locationId}_name" class="block text-sm font-medium text-gray-700 mb-1">
                            Location Name
                        </label>
                        <input type="text" id="${locationId}_name" name="additional_location_name[]" class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="form-group">
                        <label for="${locationId}_address" class="block text-sm font-medium text-gray-700 mb-1">
                            Address
                        </label>
                        <input type="text" id="${locationId}_address" name="additional_location_address[]" class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div class="form-group">
                        <label for="${locationId}_city" class="block text-sm font-medium text-gray-700 mb-1">
                            City
                        </label>
                        <input type="text" id="${locationId}_city" name="additional_location_city[]" class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="form-group">
                        <label for="${locationId}_state" class="block text-sm font-medium text-gray-700 mb-1">
                            State
                        </label>
                        <input type="text" id="${locationId}_state" name="additional_location_state[]" class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                    <div class="form-group">
                        <label for="${locationId}_zip" class="block text-sm font-medium text-gray-700 mb-1">
                            ZIP
                        </label>
                        <input type="text" id="${locationId}_zip" name="additional_location_zip[]" class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    </div>
                </div>
                <div class="flex justify-end mt-2">
                    <button type="button" class="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 remove-location">
                        Remove
                    </button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', locationHtml);
        
        // Add remove event listener
        const newLocation = document.getElementById(locationId);
        if (newLocation) {
            newLocation.querySelector('.remove-location').addEventListener('click', function() {
                newLocation.remove();
            });
        }
    }
    
    // Handle form submission
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        try {
            // Show loading state
            const submitButton = document.querySelector('button[type="submit"]');
            const saveButton = document.getElementById('save-draft');
            const originalSubmitText = submitButton.innerHTML;
            
            submitButton.disabled = true;
            if (saveButton) saveButton.disabled = true;
            
            submitButton.innerHTML = `
                <span class="loading-spinner mr-2"></span>
                Submitting...
            `;
            
            // Get form data
            const formData = new FormData(form);
            
            // Send to server
            const response = await fetch('/api/submit-onboarding', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                showAlert('Onboarding form submitted successfully!', 'success');
                
                // Optionally redirect or reset form
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            } else {
                // Show error message
                showAlert(`Error: ${result.message || 'Unknown error'}`, 'error');
                
                // Re-enable buttons
                submitButton.disabled = false;
                if (saveButton) saveButton.disabled = false;
                submitButton.innerHTML = originalSubmitText;
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showAlert('An error occurred. Please try again.', 'error');
            
            // Re-enable buttons
            const submitButton = document.querySelector('button[type="submit"]');
            const saveButton = document.getElementById('save-draft');
            
            submitButton.disabled = false;
            if (saveButton) saveButton.disabled = false;
            submitButton.innerHTML = 'Submit Form';
        }
    }
    
    // Save draft functionality
    const saveDraftButton = document.getElementById('save-draft');
    if (saveDraftButton) {
        saveDraftButton.addEventListener('click', async function() {
            try {
                // Show loading state
                const originalText = this.innerHTML;
                this.disabled = true;
                this.innerHTML = `
                    <span class="loading-spinner mr-2"></span>
                    Saving...
                `;
                
                // Get form data
                const formData = new FormData(form);
                formData.append('action', 'save_draft');
                
                // Send to server
                const response = await fetch('/api/save-onboarding-draft', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.success) {
                    // Show success message
                    showAlert('Draft saved successfully!', 'success');
                } else {
                    // Show error message
                    showAlert(`Error: ${result.message || 'Unknown error'}`, 'error');
                }
            } catch (error) {
                console.error('Save draft error:', error);
                showAlert('An error occurred while saving draft. Please try again.', 'error');
            } finally {
                // Reset button
                saveDraftButton.disabled = false;
                saveDraftButton.innerHTML = 'Save Draft';
            }
        });
    }
    
    // Form validation
    function validateForm() {
        let isValid = true;
        
        // Validate required fields
        isValid = validateField('sales_rep_name', Validators.required) && isValid;
        isValid = validateField('provider_name', Validators.required) && isValid;
        isValid = validateField('tax_id', Validators.required) && isValid;
        isValid = validateField('individual_npi', Validators.required) && isValid;
        isValid = validateField('practice_name', Validators.required) && isValid;
        isValid = validateField('practice_phone', Validators.required) && isValid;
        isValid = validateField('facility_type', Validators.required) && isValid;
        
        // Validate billing address
        isValid = validateField('billing_address', Validators.required) && isValid;
        isValid = validateField('billing_city', Validators.required) && isValid;
        isValid = validateField('billing_state', Validators.required) && isValid;
        isValid = validateField('billing_zip', Validators.required) && isValid;
        isValid = validateField('billing_phone', Validators.required) && isValid;
        isValid = validateField('billing_email', Validators.email) && isValid;
        
        // Validate shipping address if not same as billing
        if (document.getElementById('shipping_same_as_billing') && !document.getElementById('shipping_same_as_billing').checked) {
            isValid = validateField('shipping_address', Validators.required) && isValid;
            isValid = validateField('shipping_city', Validators.required) && isValid;
            isValid = validateField('shipping_state', Validators.required) && isValid;
            isValid = validateField('shipping_zip', Validators.required) && isValid;
        }
        
        // Validate terms agreement
        isValid = validateField('terms_agreement', Validators.required) && isValid;
        
        // Validate signature
        const signatureValue = document.getElementById('signature').value;
        if (!signatureValue) {
            const signatureError = document.getElementById('signature-error') || 
                document.createElement('div');
            
            signatureError.id = 'signature-error';
            signatureError.className = 'error-text';
            signatureError.textContent = 'Signature is required';
            
            const signatureContainer = document.querySelector('.signature-pad-container');
            if (signatureContainer && !document.getElementById('signature-error')) {
                signatureContainer.parentNode.appendChild(signatureError);
            }
            
            isValid = false;
        } else if (document.getElementById('signature-error')) {
            document.getElementById('signature-error').remove();
        }
        
        // Validate printed name and date
        isValid = validateField('signer_name', Validators.required) && isValid;
        isValid = validateField('signed_date', Validators.required) && isValid;
        
        return isValid;
    }
}