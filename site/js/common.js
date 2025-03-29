/**
 * Common utility functions for all forms
 */

// Handle form validation
function validateField(fieldId, validationFn) {
    const field = document.getElementById(fieldId);
    if (!field) return false;
    
    const errorElement = document.getElementById(`${fieldId}-error`);
    const result = validationFn(field.value);
    
    if (result !== true) {
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = result;
            errorElement.style.display = 'block';
        } else {
            const newError = document.createElement('div');
            newError.id = `${fieldId}-error`;
            newError.className = 'error-text';
            newError.textContent = result;
            field.parentNode.appendChild(newError);
        }
        return false;
    } else {
        field.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        return true;
    }
}

// Common validation functions
const Validators = {
    required: (value) => value.trim() ? true : 'This field is required',
    email: (value) => {
        if (!value.trim()) return true; // Optional
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? true : 'Please enter a valid email address';
    },
    phone: (value) => {
        if (!value.trim()) return true; // Optional
        return /^[\d\(\)\-\+\s]{10,15}$/.test(value) ? true : 'Please enter a valid phone number';
    },
    minLength: (min) => (value) => {
        return value.length >= min ? true : `Must be at least ${min} characters`;
    },
    numeric: (value) => {
        if (!value.trim()) return true; // Optional
        return /^\d+$/.test(value) ? true : 'Please enter a number';
    },
    date: (value) => {
        if (!value.trim()) return true; // Optional
        const date = new Date(value);
        return !isNaN(date.getTime()) ? true : 'Please enter a valid date';
    }
};

// Initialize a signature pad
function initSignaturePad(canvasId, hiddenInputId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    
    const signaturePad = new SignaturePad(canvas);
    
    // Clear button functionality
    const clearButton = document.getElementById(`clear-${canvasId}`);
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            signaturePad.clear();
            document.getElementById(hiddenInputId).value = '';
        });
    }
    
    // Save signature data when drawing ends
    canvas.addEventListener('mouseup', () => {
        if (!signaturePad.isEmpty()) {
            document.getElementById(hiddenInputId).value = signaturePad.toDataURL();
        }
    });
    
    canvas.addEventListener('touchend', () => {
        if (!signaturePad.isEmpty()) {
            document.getElementById(hiddenInputId).value = signaturePad.toDataURL();
        }
    });
    
    return signaturePad;
}

// File upload preview
function initFileUpload(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    if (!input || !preview) return;
    
    // Handle file selection
    input.addEventListener('change', updateFilePreview);
    
    // Handle drag and drop
    const container = input.closest('.file-upload-container');
    if (container) {
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('drag-over');
        });
        
        container.addEventListener('dragleave', () => {
            container.classList.remove('drag-over');
        });
        
        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('drag-over');
            
            if (e.dataTransfer.files.length) {
                input.files = e.dataTransfer.files;
                updateFilePreview();
            }
        });
    }
    
    function updateFilePreview() {
        preview.innerHTML = '';
        
        if (input.files.length) {
            for (let i = 0; i < input.files.length; i++) {
                const file = input.files[i];
                const item = document.createElement('div');
                item.className = 'file-preview-item';
                
                const icon = document.createElement('span');
                icon.className = 'mr-1';
                icon.innerHTML = '📄';
                
                const name = document.createElement('span');
                name.textContent = file.name;
                
                const removeButton = document.createElement('button');
                removeButton.type = 'button';
                removeButton.textContent = '×';
                removeButton.addEventListener('click', () => {
                    // Remove the file from input
                    const dt = new DataTransfer();
                    for (let j = 0; j < input.files.length; j++) {
                        if (j !== i) dt.items.add(input.files[j]);
                    }
                    input.files = dt.files;
                    updateFilePreview();
                });
                
                item.appendChild(icon);
                item.appendChild(name);
                item.appendChild(removeButton);
                preview.appendChild(item);
            }
        }
    }
}

// Multi-step form navigation
function initMultiStepForm(config) {
    const { formId, steps, onStepChange, onSubmit } = config;
    const form = document.getElementById(formId);
    if (!form) return;
    
    let currentStepIndex = 0;
    
    // Initialize navigation buttons
    function setupNavigation() {
        // Setup next buttons
        const nextButtons = form.querySelectorAll('[data-action="next"]');
        nextButtons.forEach(button => {
            button.addEventListener('click', goToNextStep);
        });
        
        // Setup previous buttons
        const prevButtons = form.querySelectorAll('[data-action="prev"]');
        prevButtons.forEach(button => {
            button.addEventListener('click', goToPrevStep);
        });
        
        // Setup form submission
        form.addEventListener('submit', handleSubmit);
    }
    
    // Show a specific step
    function showStep(index) {
        // Hide all steps
        steps.forEach((step, i) => {
            const stepElement = document.getElementById(step.id);
            if (stepElement) {
                stepElement.style.display = i === index ? 'block' : 'none';
            }
        });
        
        // Update progress indicators
        updateProgress(index);
        
        // Call the step change callback
        if (onStepChange) onStepChange(index, steps[index].id);
    }
    
    // Update progress bar and indicators
    function updateProgress(index) {
        const progressBar = document.querySelector('.progress-bar-fill');
        if (progressBar) {
            const progressPercentage = (index / (steps.length - 1)) * 100;
            progressBar.style.width = `${progressPercentage}%`;
        }
        
        const currentStepEl = document.getElementById('currentStep');
        if (currentStepEl) currentStepEl.textContent = index + 1;
        
        const percentageEl = document.getElementById('completionPercentage');
        if (percentageEl) {
            const percentage = Math.round((index / (steps.length - 1)) * 100);
            percentageEl.textContent = percentage;
        }
        
        // Update step indicators
        const stepElements = document.querySelectorAll('.progress-step');
        stepElements.forEach((el, i) => {
            el.classList.remove('active', 'completed');
            if (i < index) {
                el.classList.add('completed');
            } else if (i === index) {
                el.classList.add('active');
            }
        });
    }
    
    // Go to the next step
    function goToNextStep() {
        // Validate current step
        if (steps[currentStepIndex].validate && !steps[currentStepIndex].validate()) {
            // Do not proceed if validation fails
            return;
        }
        
        // Move to next step if not at the end
        if (currentStepIndex < steps.length - 1) {
            currentStepIndex++;
            showStep(currentStepIndex);
        }
    }
    
    // Go to the previous step
    function goToPrevStep() {
        // Move to previous step if not at the beginning
        if (currentStepIndex > 0) {
            currentStepIndex--;
            showStep(currentStepIndex);
        }
    }
    
    // Handle form submission
    function handleSubmit(e) {
        e.preventDefault();
        
        // Validate final step
        if (steps[currentStepIndex].validate && !steps[currentStepIndex].validate()) {
            return;
        }
        
        // Call onSubmit callback
        if (onSubmit) onSubmit(new FormData(form));
    }
    
    // Initialize
    setupNavigation();
    showStep(currentStepIndex);
    
    // Return public methods
    return {
        goToStep: (index) => {
            if (index >= 0 && index < steps.length) {
                currentStepIndex = index;
                showStep(index);
            }
        },
        getCurrentStep: () => currentStepIndex
    };
}

// Populate a select element with options from an API
async function populateSelectFromApi(selectId, apiUrl, valueKey, textKey, emptyOption = true) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    try {
        // Show loading state
        select.disabled = true;
        
        // Fetch data
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        
        // Clear existing options
        select.innerHTML = '';
        
        // Add empty option if requested
        if (emptyOption) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Select...';
            select.appendChild(option);
        }
        
        // Add options from API data
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueKey];
            option.textContent = item[textKey];
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error populating select:', error);
    } finally {
        select.disabled = false;
    }
}

// Display an alert message
function showAlert(message, type = 'info', container = 'alerts', autoHide = true) {
    const alertsContainer = document.getElementById(container);
    if (!alertsContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertsContainer.appendChild(alert);
    
    if (autoHide) {
        setTimeout(() => {
            alert.classList.add('fade-out');
            setTimeout(() => alert.remove(), 300);
        }, 5000);
    }
    
    return alert;
}