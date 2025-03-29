/**
 * Insurance Verification Request Form Functionality
 */

function initIVRForm() {
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
        },
        {
            id: 'step4',
            validate: validateStep4
        },
        {
            id: 'step5',
            validate: validateStep5
        }
    ];
    
    const multiStepForm = initMultiStepForm({
        formId: 'ivrForm',
        steps: formSteps,
        onStepChange: handleStepChange,
        onSubmit: handleFormSubmit
    });
    
    // Initialize conditional fields
    setupConditionalFields();
    
    // Initialize file uploads
    initFileUpload('demographicFile', 'demographicPreview');
    initFileUpload('insuranceCardsFile', 'insuranceCardsPreview');
    initFileUpload('clinicalNotesFile', 'clinicalNotesPreview');
    
    // Initialize signature pad
    initSignaturePad('signaturePad', 'signature');
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('request_date').value = today;
    document.getElementById('signatureDate').value = today;
    
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
            
            // Load sales reps
            await populateSelectFromApi(
                'sales_rep',
                '/api/users?role=REP',
                'userId',
                'name'
            );
            
            // Load practices if we have a practice selector
            const practiceSelector = document.getElementById('practice');
            if (practiceSelector) {
                await populateSelectFromApi(
                    'practice',
                    '/api/practices',
                    'practiceId',
                    'name'
                );
            }
        } catch (error) {
            console.error('Error loading form data:', error);
            showAlert('Error loading form data. Please try again later.', 'error');
        }
    }
    
    // Handle conditional field visibility
    function setupConditionalFields() {
        // Show secondary insurance fields when "Yes" is selected
        const hasSecondaryInsurance = document.querySelectorAll('input[name="hasSecondaryIns"]');
        const secondaryInsContainer = document.getElementById('secondaryInsContainer');
        
        hasSecondaryInsurance.forEach(radio => {
            radio.addEventListener('change', function() {
                if (secondaryInsContainer) {
                    secondaryInsContainer.style.display = this.value === 'yes' ? 'block' : 'none';
                }
            });
        });
        
        // Show surgical period fields when "Yes" is selected
        const surgicalPeriod = document.querySelectorAll('input[name="surgicalPeriod"]');
        const surgicalInfoContainer = document.getElementById('surgicalInfoContainer');
        
        surgicalPeriod.forEach(radio => {
            radio.addEventListener('change', function() {
                if (surgicalInfoContainer) {
                    surgicalInfoContainer.style.display = this.value === 'yes' ? 'block' : 'none';
                }
            });
        });
        
        // Show SNF fields when "Yes" is selected
        const snfStatus = document.querySelectorAll('input[name="snfStatus"]');
        const snfDetailsContainer = document.getElementById('snfDetailsGroup');
        
        snfStatus.forEach(radio => {
            radio.addEventListener('change', function() {
                if (snfDetailsContainer) {
                    snfDetailsContainer.style.display = this.value === 'yes' ? 'block' : 'none';
                }
            });
        });
    }
    
    // When step changes, handle any special cases
    function handleStepChange(stepIndex, stepId) {
        // If we're on the review step, populate the review content
        if (stepId === 'step5') {
            updateReviewSection();
        }
    }
    
    // Validate Step 1: Form Setup
    function validateStep1() {
        let isValid = true;
        
        isValid = validateField('manufacturer', Validators.required) && isValid;
        isValid = validateField('request_type', Validators.required) && isValid;
        isValid = validateField('request_date', Validators.required) && isValid;
        isValid = validateField('sales_rep', Validators.required) && isValid;
        
        return isValid;
    }
    
    // Validate Step 2: Patient & Insurance
    function validateStep2() {
        let isValid = true;
        
        isValid = validateField('patientName', Validators.required) && isValid;
        isValid = validateField('patientDob', Validators.required) && isValid;
        isValid = validateField('patientPhone', Validators.phone) && isValid;
        
        // Primary insurance validation
        isValid = validateField('primaryInsName', Validators.required) && isValid;
        isValid = validateField('primaryInsPolicyNumber', Validators.required) && isValid;
        isValid = validateField('primaryInsPhone', Validators.required) && isValid;
        
        // Secondary insurance validation if applicable
        const hasSecondary = document.querySelector('input[name="hasSecondaryIns"]:checked')?.value === 'yes';
        if (hasSecondary) {
            isValid = validateField('secondaryInsName', Validators.required) && isValid;
            isValid = validateField('secondaryInsPolicyNumber', Validators.required) && isValid;
        }
        
        return isValid;
    }
    
    // Validate Step 3: Provider & Facility
    function validateStep3() {
        let isValid = true;
        
        isValid = validateField('physicianName', Validators.required) && isValid;
        isValid = validateField('physicianNpi', Validators.required) && isValid;
        isValid = validateField('physicianTaxID', Validators.required) && isValid;
        
        isValid = validateField('facilityName', Validators.required) && isValid;
        isValid = validateField('facilityAddressLine1', Validators.required) && isValid;
        isValid = validateField('facilityCity', Validators.required) && isValid;
        isValid = validateField('facilityState', Validators.required) && isValid;
        isValid = validateField('facilityZipCode', Validators.required) && isValid;
        
        isValid = validateField('placeOfService', Validators.required) && isValid;
        
        return isValid;
    }
    
   // Validate Step 4: Wound & Product (continued)
    function validateStep4() {
        let isValid = true;
        
        // Ensure at least one wound type is selected
        const woundTypeSelected = document.querySelector('input[name="woundInfo.woundType"]:checked');
        if (!woundTypeSelected) {
            const woundTypeError = document.getElementById('woundType-error') || 
                document.createElement('div');
            
            woundTypeError.id = 'woundType-error';
            woundTypeError.className = 'error-text';
            woundTypeError.textContent = 'Please select at least one wound type';
            
            const woundTypeContainer = document.getElementById('woundTypeMultiselect');
            if (woundTypeContainer && !document.getElementById('woundType-error')) {
                woundTypeContainer.appendChild(woundTypeError);
            }
            
            isValid = false;
        } else if (document.getElementById('woundType-error')) {
            document.getElementById('woundType-error').remove();
        }
        
        isValid = validateField('woundSizeTotal', Validators.required) && isValid;
        isValid = validateField('woundLocation', Validators.required) && isValid;
        isValid = validateField('diagnosisCodes', Validators.required) && isValid;
        isValid = validateField('productInfo', Validators.required) && isValid;
        
        return isValid;
    }
    
    // Validate Step 5: Review & Submit
    function validateStep5() {
        let isValid = true;
        
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
        
        isValid = validateField('signatureDate', Validators.required) && isValid;
        
        return isValid;
    }
    
    // Update review section content
    function updateReviewSection() {
        // Patient Information Review
        const patientInfoReview = document.getElementById('patientInfoReview');
        if (patientInfoReview) {
            patientInfoReview.innerHTML = `
                <p><strong>Name:</strong> ${document.getElementById('patientName')?.value || 'N/A'}</p>
                <p><strong>DOB:</strong> ${document.getElementById('patientDob')?.value || 'N/A'}</p>
                <p><strong>Phone:</strong> ${document.getElementById('patientPhone')?.value || 'N/A'}</p>
                <p><strong>Contact Permission:</strong> ${getRadioValue('contactPermission')}</p>
                <p><strong>In Nursing Facility:</strong> ${getRadioValue('nursingFacility')}</p>
            `;
        }
        
        // Insurance Information Review
        const insuranceInfoReview = document.getElementById('insuranceInfoReview');
        if (insuranceInfoReview) {
            let html = `
                <p><strong>Primary Insurance:</strong> ${document.getElementById('primaryInsName')?.value || 'N/A'}</p>
                <p><strong>Policy Number:</strong> ${document.getElementById('primaryInsPolicyNumber')?.value || 'N/A'}</p>
                <p><strong>Phone:</strong> ${document.getElementById('primaryInsPhone')?.value || 'N/A'}</p>
            `;
            
            // Add secondary insurance if applicable
            if (getRadioValue('hasSecondaryIns') === 'yes') {
                html += `
                    <div class="mt-3">
                        <p><strong>Secondary Insurance:</strong> ${document.getElementById('secondaryInsName')?.value || 'N/A'}</p>
                        <p><strong>Policy Number:</strong> ${document.getElementById('secondaryInsPolicyNumber')?.value || 'N/A'}</p>
                    </div>
                `;
            }
            
            insuranceInfoReview.innerHTML = html;
        }
        
        // Provider & Facility Review
        const providerInfoReview = document.getElementById('providerInfoReview');
        if (providerInfoReview) {
            providerInfoReview.innerHTML = `
                <p><strong>Physician:</strong> ${document.getElementById('physicianName')?.value || 'N/A'}</p>
                <p><strong>NPI:</strong> ${document.getElementById('physicianNpi')?.value || 'N/A'}</p>
                <p><strong>Facility:</strong> ${document.getElementById('facilityName')?.value || 'N/A'}</p>
                <p><strong>Place of Service:</strong> ${document.getElementById('placeOfService')?.options[document.getElementById('placeOfService')?.selectedIndex]?.text || 'N/A'}</p>
            `;
        }
        
        // Wound & Product Review
        const woundInfoReview = document.getElementById('woundInfoReview');
        if (woundInfoReview) {
            // Get selected wound types
            const selectedWoundTypes = Array.from(document.querySelectorAll('input[name="woundInfo.woundType"]:checked'))
                .map(input => input.parentNode.textContent.trim())
                .join(', ');
            
            woundInfoReview.innerHTML = `
                <p><strong>Wound Type:</strong> ${selectedWoundTypes || 'N/A'}</p>
                <p><strong>Wound Size:</strong> ${document.getElementById('woundSizeTotal')?.value || 'N/A'} sq cm</p>
                <p><strong>Location:</strong> ${document.getElementById('woundLocation')?.value || 'N/A'}</p>
                <p><strong>Diagnosis Codes:</strong> ${document.getElementById('diagnosisCodes')?.value || 'N/A'}</p>
                <p><strong>Product:</strong> ${document.getElementById('productInfo')?.value || 'N/A'}</p>
            `;
        }
    }
    
    // Get the value of a selected radio button
    function getRadioValue(name) {
        const selectedRadio = document.querySelector(`input[name="${name}"]:checked`);
        return selectedRadio ? (selectedRadio.value === 'yes' ? 'Yes' : 'No') : 'N/A';
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
            const response = await fetch('/api/submit-ivr', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                showAlert('Insurance verification request submitted successfully!', 'success');
                
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