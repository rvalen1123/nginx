/**
 * DME Kit Sign-up Form Handling
 * 
 * Manages the DME Kit Sign-up form functionality including:
 * - Multi-step form navigation
 * - Form validation
 * - Conditional fields
 * - Signature pad functionality
 * - Form submission
 */

class DMEKitForm {
    constructor(formElement) {
        this.form = formElement;
        this.currentStep = 1;
        this.totalSteps = document.querySelectorAll('.form-step').length;
        this.signaturePad = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showStep(this.currentStep);
        this.setupConditionalFields();
        this.initializeSignaturePad();
        this.setupPercentageCalculator();
        this.setupFormSubmission();
    }
    
    setupEventListeners() {
        // Navigation buttons
        this.form.querySelectorAll('[data-action="next"]').forEach(button => {
            button.addEventListener('click', () => this.nextStep());
        });
        
        this.form.querySelectorAll('[data-action="back"]').forEach(button => {
            button.addEventListener('click', () => this.prevStep());
        });
        
        // Add Physician button
        const addPhysicianBtn = document.getElementById('addPhysicianBtn');
        if (addPhysicianBtn) {
            addPhysicianBtn.addEventListener('click', () => this.addPhysician());
        }
        
        // Input validation on blur
        this.form.querySelectorAll('input, select, textarea').forEach(input => {
            input.addEventListener('blur', (e) => this.validateField(e.target));
            input.addEventListener('change', (e) => {
                this.validateField(e.target);
                this.checkConditionalFields(e.target);
            });
        });
        
        // Clear signature button
        const clearSignatureBtn = document.getElementById('clearSignature');
        if (clearSignatureBtn) {
            clearSignatureBtn.addEventListener('click', () => this.clearSignature());
        }
        
        // Retry submission button
        const retryBtn = document.getElementById('retrySubmission');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                document.querySelector('.form-submission-status').style.display = 'none';
                this.form.style.display = 'block';
            });
        }
    }
    
    showStep(step) {
        // Hide all steps
        this.form.querySelectorAll('.form-step').forEach(stepElement => {
            stepElement.style.display = 'none';
        });
        
        // Show the current step
        const currentStepElement = this.form.querySelector(`.form-step[data-step="${step}"]`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
        }
        
        // Update progress indicator if it exists
        this.updateProgress();
    }
    
    updateProgress() {
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const percentComplete = (this.currentStep / this.totalSteps) * 100;
            progressBar.style.width = `${percentComplete}%`;
            progressBar.setAttribute('aria-valuenow', percentComplete);
        }
        
        // Update step indicators if they exist
        const stepIndicators = document.querySelectorAll('.step-indicator');
        if (stepIndicators.length > 0) {
            stepIndicators.forEach((indicator, index) => {
                if (index + 1 < this.currentStep) {
                    indicator.classList.add('completed');
                    indicator.classList.remove('active');
                } else if (index + 1 === this.currentStep) {
                    indicator.classList.add('active');
                    indicator.classList.remove('completed');
                } else {
                    indicator.classList.remove('active', 'completed');
                }
            });
        }
    }
    
    validateStep(step) {
        const stepElement = this.form.querySelector(`.form-step[data-step="${step}"]`);
        if (!stepElement) return true;
        
        let isValid = true;
        const requiredFields = stepElement.querySelectorAll('input[required], select[required], textarea[required]');
        
        requiredFields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Special validation for signature on final step
        if (step === this.totalSteps && this.signaturePad && this.signaturePad.isEmpty()) {
            isValid = false;
            this.showFieldError(document.getElementById('signatureCanvas'), 'Signature is required');
        }
        
        return isValid;
    }
    
    validateField(field) {
        // Skip validation for hidden fields (in inactive steps or conditional fields)
        if (field.closest('.form-step').style.display === 'none' || 
            (field.closest('.conditional-field') && field.closest('.conditional-field').style.display === 'none')) {
            return true;
        }
        
        let isValid = true;
        const errorElement = this.getFieldErrorElement(field);
        
        // Clear existing error
        if (errorElement) {
            errorElement.remove();
        }
        
        // Check if empty but required
        if (field.required && !field.value.trim()) {
            this.showFieldError(field, 'This field is required');
            isValid = false;
        } 
        // Check pattern validation
        else if (field.pattern && field.value && !new RegExp(field.pattern).test(field.value)) {
            this.showFieldError(field, `Please enter a valid format: ${field.placeholder || ''}`);
            isValid = false;
        }
        // Check email format
        else if (field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            isValid = false;
        }
        // Check numeric fields
        else if (field.type === 'number' && field.value) {
            const numValue = parseFloat(field.value);
            if (isNaN(numValue)) {
                this.showFieldError(field, 'Please enter a valid number');
                isValid = false;
            } else if (field.min !== '' && numValue < parseFloat(field.min)) {
                this.showFieldError(field, `Value must be at least ${field.min}`);
                isValid = false;
            } else if (field.max !== '' && numValue > parseFloat(field.max)) {
                this.showFieldError(field, `Value must be at most ${field.max}`);
                isValid = false;
            }
        }
        
        // Visual feedback
        if (isValid) {
            field.classList.remove('is-invalid');
            field.classList.add('is-valid');
        } else {
            field.classList.remove('is-valid');
            field.classList.add('is-invalid');
        }
        
        return isValid;
    }
    
    showFieldError(field, message) {
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        
        // Insert after field
        if (field.nextElementSibling && field.nextElementSibling.className === 'invalid-feedback') {
            field.nextElementSibling.textContent = message;
        } else {
            field.parentNode.insertBefore(errorDiv, field.nextElementSibling);
        }
    }
    
    getFieldErrorElement(field) {
        return field.nextElementSibling && field.nextElementSibling.className === 'invalid-feedback' 
            ? field.nextElementSibling : null;
    }
    
    nextStep() {
        if (this.validateStep(this.currentStep)) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.showStep(this.currentStep);
                window.scrollTo(0, 0);
            }
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            window.scrollTo(0, 0);
        }
    }
    
    setupConditionalFields() {
        // Initial setup - hide all conditional fields
        const conditionalFields = document.querySelectorAll('.conditional-field');
        conditionalFields.forEach(field => {
            field.style.display = 'none';
        });
        
        // Set up listeners for fields that control conditional fields
        document.querySelectorAll('input, select').forEach(input => {
            this.checkConditionalFields(input);
        });
    }
    
    checkConditionalFields(changedInput) {
        const conditionalFields = document.querySelectorAll('.conditional-field');
        
        conditionalFields.forEach(field => {
            const condition = field.getAttribute('data-condition');
            const conditionValue = field.getAttribute('data-condition-value');
            
            if (condition) {
                const controlElement = document.getElementById(condition);
                
                if (controlElement) {
                    let shouldShow = false;
                    
                    // Checkbox controlling visibility
                    if (controlElement.type === 'checkbox') {
                        shouldShow = controlElement.checked;
                    }
                    // Radio button controlling visibility
                    else if (controlElement.type === 'radio') {
                        const radioGroup = document.querySelectorAll(`input[name="${controlElement.name}"]`);
                        const checkedRadio = Array.from(radioGroup).find(radio => radio.checked);
                        
                        if (checkedRadio && conditionValue) {
                            shouldShow = checkedRadio.value === conditionValue;
                        } else if (checkedRadio) {
                            shouldShow = checkedRadio.id === condition;
                        }
                    }
                    // Select controlling visibility
                    else if (controlElement.tagName === 'SELECT') {
                        if (conditionValue) {
                            shouldShow = controlElement.value === conditionValue;
                        } else {
                            shouldShow = !!controlElement.value;
                        }
                    }
                    
                    field.style.display = shouldShow ? 'block' : 'none';
                    
                    // Clear validation errors for hidden fields
                    if (!shouldShow) {
                        field.querySelectorAll('.is-invalid').forEach(invalidInput => {
                            invalidInput.classList.remove('is-invalid');
                            const errorElement = this.getFieldErrorElement(invalidInput);
                            if (errorElement) errorElement.remove();
                        });
                    }
                }
            }
        });
    }
    
    initializeSignaturePad() {
        const canvas = document.getElementById('signatureCanvas');
        if (!canvas) return;
        
        this.signaturePad = new SignaturePad(canvas, {
            backgroundColor: 'rgb(255, 255, 255)',
            penColor: 'rgb(0, 0, 0)'
        });
        
        // Adjust canvas dimensions for high DPI displays
        this.resizeCanvas();
        
        // Update signature data field when signed
        this.signaturePad.addEventListener('endStroke', () => {
            document.getElementById('signatureData').value = this.signaturePad.toDataURL();
            
            // Remove error if it exists
            canvas.classList.remove('is-invalid');
            const errorElement = this.getFieldErrorElement(canvas);
            if (errorElement) errorElement.remove();
        });
        
        // Resize canvas on window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        if (!this.signaturePad) return;
        
        const canvas = document.getElementById('signatureCanvas');
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        const container = canvas.parentElement;
        
        canvas.width = container.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext('2d').scale(ratio, ratio);
        
        this.signaturePad.clear(); // Clear the canvas
    }
    
    clearSignature() {
        if (this.signaturePad) {
            this.signaturePad.clear();
            document.getElementById('signatureData').value = '';
        }
    }
    
    setupPercentageCalculator() {
        const percentageInputs = document.querySelectorAll('.percentage-input');
        const totalPercentageElement = document.getElementById('totalPercentage');
        
        if (percentageInputs.length > 0 && totalPercentageElement) {
            const updateTotal = () => {
                let total = 0;
                percentageInputs.forEach(input => {
                    if (input.value) {
                        total += parseFloat(input.value) || 0;
                    }
                });
                
                totalPercentageElement.textContent = `${total}%`;
                
                // Visual indicator if total is not 100%
                if (total === 100) {
                    totalPercentageElement.classList.remove('alert-warning', 'alert-danger');
                    totalPercentageElement.classList.add('alert-success');
                } else if (total < 100) {
                    totalPercentageElement.classList.remove('alert-success', 'alert-danger');
                    totalPercentageElement.classList.add('alert-warning');
                } else {
                    totalPercentageElement.classList.remove('alert-success', 'alert-warning');
                    totalPercentageElement.classList.add('alert-danger');
                }
            };
            
            percentageInputs.forEach(input => {
                input.addEventListener('input', updateTotal);
                input.addEventListener('change', updateTotal);
            });
            
            // Initial calculation
            updateTotal();
        }
    }
    
    setupFormSubmission() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validate all steps first
            let allValid = true;
            for (let i = 1; i <= this.totalSteps; i++) {
                if (!this.validateStep(i)) {
                    allValid = false;
                    // If a step is invalid, navigate to it
                    if (i !== this.currentStep) {
                        this.currentStep = i;
                        this.showStep(i);
                        window.scrollTo(0, 0);
                        break;
                    }
                }
            }
            
            if (allValid) {
                this.submitForm();
            }
        });
    }
    
    submitForm() {
        // Show loading state
        const submitButton = document.getElementById('submitButton');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...`;
        
        // Collect all form data
        const formData = new FormData(this.form);
        
        // Make API request
        fetch('/api/submit-dme-kit-form', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Hide form and show success message
            this.form.style.display = 'none';
            const statusElement = document.querySelector('.form-submission-status');
            statusElement.style.display = 'block';
            statusElement.querySelector('.success-message').style.display = 'block';
            statusElement.querySelector('.error-message').style.display = 'none';
            
            // Scroll to top
            window.scrollTo(0, 0);
        })
        .catch(error => {
            console.error('Error submitting form:', error);
            
            // Show error message
            this.form.style.display = 'none';
            const statusElement = document.querySelector('.form-submission-status');
            statusElement.style.display = 'block';
            statusElement.querySelector('.success-message').style.display = 'none';
            statusElement.querySelector('.error-message').style.display = 'block';
            
            // Scroll to top
            window.scrollTo(0, 0);
        })
        .finally(() => {
            // Reset button state
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        });
    }
    
    addPhysician() {
        // This would dynamically add another physician row
        // For simplicity in this example, we just show hidden physician rows
        const physicianRows = document.querySelectorAll('.physician-info');
        let hiddenRowFound = false;
        
        for (let i = 0; i < physicianRows.length; i++) {
            if (physicianRows[i].style.display === 'none') {
                physicianRows[i].style.display = 'flex';
                hiddenRowFound = true;
                break;
            }
        }
        
        if (!hiddenRowFound) {
            // If there are no hidden rows, we could dynamically create a new one
            // or show a message indicating the maximum limit
            alert('Maximum number of physicians reached (4). Please contact support if you need to add more physicians.');
        }
    }
}

// Initialize the form when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const dmeKitForm = document.getElementById('dmeKitForm');
    if (dmeKitForm) {
        new DMEKitForm(dmeKitForm);
    }
}); 