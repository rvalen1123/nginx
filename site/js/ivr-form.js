/**
 * MSC Wound Care Portal - IVR Form Specific Functionality
 * Extends the core form-handler.js with IVR-specific features
 * Version 1.0.0
 */

// Form step configuration
const FORM_STEPS = [
    { id: 1, title: 'Form Setup', label: 'Setup' },
    { id: 2, title: 'Patient & Insurance Information', label: 'Patient Info' },
    { id: 3, title: 'Provider & Facility Information', label: 'Provider Info' },
    { id: 4, title: 'Wound & Product Information', label: 'Product Info' },
    { id: 5, title: 'Review & Submit', label: 'Review' }
];

class IVRForm {
    constructor() {
        console.log('IVRForm constructor called');
        this.currentStep = 1;
        this.form = document.getElementById('ivrForm');
        
        if (!this.form) {
            console.error('IVR Form not found in the document');
            // Try again with a small delay to account for DOM loading
            setTimeout(() => {
                this.form = document.getElementById('ivrForm');
                if (this.form) {
                    console.log('Form found after delay');
                    this.initializeForm();
                } else {
                    console.error('Form still not found after delay');
                }
            }, 500);
            return;
        }
        
        console.log('Form found immediately');
        this.initializeForm();
    }
    
    initializeForm() {
        this.progressContainer = this.form.closest('.card-body').querySelector('.progress-container');
        
        if (!this.progressContainer) {
            // Create progress container if it doesn't exist
            console.log('Creating progress container');
            this.progressContainer = document.createElement('div');
            this.progressContainer.className = 'progress-container';
            
            if (this.form.parentElement) {
                this.form.parentElement.insertBefore(this.progressContainer, this.form);
            } else {
                // Fallback: add inside the form
                this.form.prepend(this.progressContainer);
            }
        }
        
        this.init();
    }

    init() {
        console.log('Initializing IVR form');
        try {
            console.log('Initializing progress bar');
            this.initializeProgressBar();
            
            console.log('Initializing form steps');
            this.initializeFormSteps();
            
            console.log('Setting up event listeners');
            this.setupEventListeners();
            
            console.log('Loading dynamic data');
            this.loadDynamicData();
            
            console.log('IVR form initialized successfully');
        } catch (error) {
            console.error('Error initializing IVR form:', error);
        }
    }

    initializeProgressBar() {
        // Check if progress container exists
        if (!this.progressContainer) {
            console.error('Progress container not found');
            return;
        }
        
        // Create progress bar HTML
        const progressHTML = `
            <div class="progress-steps">
                ${FORM_STEPS.map(step => `
                    <div class="progress-step ${step.id === 1 ? 'active' : ''}" data-step="${step.id}">
                        <div class="progress-step-number">${step.id}</div>
                        <div class="progress-step-label">${step.label}</div>
                    </div>
                `).join('')}
            </div>
            <div class="progress-bar">
                <div class="progress-bar-fill" style="width: 20%"></div>
            </div>
            <div class="progress-text">
                <span>Step <span id="currentStep">1</span> of ${FORM_STEPS.length}</span>
                <span><span id="completionPercentage">20</span>% Complete</span>
            </div>
        `;
        
        this.progressContainer.innerHTML = progressHTML;
    }

    initializeFormSteps() {
        // Check if form exists
        if (!this.form) {
            console.error('Form not found, cannot initialize steps');
            return;
        }
        
        // Add HTML for additional steps
        const stepsHTML = `
            <!-- Step 2: Patient & Insurance -->
            <div class="form-step" data-step="2" style="display: none;">
                <div class="form-section">
                    <div class="form-section-title">Patient Information</div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="patient_first_name">First Name <span class="text-danger">*</span></label>
                                <input type="text" id="patient_first_name" name="patientFirstName" class="form-control" required>
                                <div class="invalid-feedback">Please enter patient's first name</div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="patient_last_name">Last Name <span class="text-danger">*</span></label>
                                <input type="text" id="patient_last_name" name="patientLastName" class="form-control" required>
                                <div class="invalid-feedback">Please enter patient's last name</div>
                            </div>
                        </div>
                    </div>
                    <!-- Additional patient fields -->
                </div>
                
                <div class="form-section">
                    <div class="form-section-title">Insurance Information</div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="primary_insurance">Primary Insurance <span class="text-danger">*</span></label>
                                <input type="text" id="primary_insurance" name="primaryInsurance" class="form-control" required>
                                <div class="invalid-feedback">Please enter primary insurance</div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="form-group">
                                <label for="policy_number">Policy Number <span class="text-danger">*</span></label>
                                <input type="text" id="policy_number" name="policyNumber" class="form-control" required>
                                <div class="invalid-feedback">Please enter policy number</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="form-navigation">
                    <button type="button" class="btn btn-secondary" data-action="back">
                        <svg class="icon" viewBox="0 0 24 24">
                            <path d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back
                    </button>
                    <button type="button" class="btn btn-primary" data-action="next">
                        Continue to Provider Information
                        <svg class="icon" viewBox="0 0 24 24">
                            <path d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Step 3: Provider & Facility -->
            <div class="form-step" data-step="3" style="display: none;">
                <!-- Provider & Facility fields will be added here -->
                <div class="form-navigation">
                    <button type="button" class="btn btn-secondary" data-action="back">
                        <svg class="icon" viewBox="0 0 24 24">
                            <path d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back
                    </button>
                    <button type="button" class="btn btn-primary" data-action="next">
                        Continue to Product Information
                        <svg class="icon" viewBox="0 0 24 24">
                            <path d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Step 4: Wound & Product -->
            <div class="form-step" data-step="4" style="display: none;">
                <!-- Wound & Product fields will be added here -->
                <div class="form-navigation">
                    <button type="button" class="btn btn-secondary" data-action="back">
                        <svg class="icon" viewBox="0 0 24 24">
                            <path d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back
                    </button>
                    <button type="button" class="btn btn-primary" data-action="next">
                        Continue to Review
                        <svg class="icon" viewBox="0 0 24 24">
                            <path d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Step 5: Review & Submit -->
            <div class="form-step" data-step="5" style="display: none;">
                <div class="form-section">
                    <div class="form-section-title">Required Documents</div>
                    <!-- Document upload fields -->
                </div>
                
                <div class="form-section">
                    <div class="form-section-title">Review Information</div>
                    <div id="reviewSummary"></div>
                </div>
                
                <div class="form-navigation">
                    <button type="button" class="btn btn-secondary" data-action="back">
                        <svg class="icon" viewBox="0 0 24 24">
                            <path d="M15 19l-7-7 7-7"></path>
                        </svg>
                        Back
                    </button>
                    <button type="submit" class="btn btn-primary">
                        Submit Request
                        <svg class="icon" viewBox="0 0 24 24">
                            <path d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        this.form.insertAdjacentHTML('beforeend', stepsHTML);
    }

    setupEventListeners() {
        if (!this.form) {
            console.error('Form not found, cannot set up event listeners');
            return;
        }
        
        console.log('Setting up event listeners on form', this.form);
        
        // Helper function to handle button clicks
        const handleButtonClick = (e) => {
            // Log the element that was clicked for debugging
            console.log('Clicked element:', e.target);
            
            // Find the button or closest button ancestor
            const button = e.target.closest('[data-action]');
            
            if (!button) {
                console.log('No button with data-action found');
                return; // Not a button click
            }
            
            const action = button.getAttribute('data-action');
            console.log(`Button action: ${action}`);
            
            if (action === 'next') {
                console.log('Next button clicked');
                this.nextStep();
            } else if (action === 'back') {
                console.log('Back button clicked');
                this.previousStep();
            }
        };
        
        // Navigation buttons - use event delegation with more robust targeting
        this.form.addEventListener('click', handleButtonClick);

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            console.log('Form submission attempted');
            if (this.validateCurrentStep()) {
                this.submitForm();
            }
        });
    }

    async loadDynamicData() {
        console.log('Loading dynamic data');
        try {
            // Load manufacturers
            console.log('Fetching manufacturers');
            const manufacturers = await this.fetchManufacturers();
            if (manufacturers && manufacturers.length) {
                console.log(`Loaded ${manufacturers.length} manufacturers`);
                this.populateSelect('manufacturer', manufacturers);
            } else {
                console.warn('No manufacturers returned');
            }
            
            // Load sales representatives
            console.log('Fetching sales representatives');
            const salesReps = await this.fetchSalesReps();
            if (salesReps && salesReps.length) {
                console.log(`Loaded ${salesReps.length} sales representatives`);
                this.populateSelect('sales_rep', salesReps);
            } else {
                console.warn('No sales representatives returned');
            }
            
            console.log('Dynamic data loaded successfully');
        } catch (error) {
            console.error('Error loading dynamic data:', error);
            this.showAlert('Error loading form data. Using mock data for testing.', 'info');
        }
    }

    async fetchManufacturers() {
        try {
            const response = await fetch('/api/manufacturers');
            if (!response.ok) throw new Error('Failed to fetch manufacturers');
            return await response.json();
        } catch (error) {
            console.warn('Using mock manufacturer data due to API error:', error);
            // Mock data for testing
            return [
                { id: 1, name: 'Acme Medical Supplies' },
                { id: 2, name: 'MediTech Innovations' },
                { id: 3, name: 'BioHeal Solutions' },
                { id: 4, name: 'WoundCare Specialists' },
                { id: 5, name: 'Advanced Healing Products' }
            ];
        }
    }

    async fetchSalesReps() {
        try {
            const response = await fetch('/api/sales-representatives');
            if (!response.ok) throw new Error('Failed to fetch sales representatives');
            return await response.json();
        } catch (error) {
            console.warn('Using mock sales rep data due to API error:', error);
            // Mock data for testing
            return [
                { id: 1, name: 'John Smith' },
                { id: 2, name: 'Sarah Johnson' },
                { id: 3, name: 'Michael Brown' },
                { id: 4, name: 'Jessica Davis' },
                { id: 5, name: 'David Wilson' },
                { id: 6, name: 'Emily Martinez' },
                { id: 7, name: 'Robert Taylor' }
            ];
        }
    }

    populateSelect(elementId, options) {
        const select = document.getElementById(elementId);
        if (!select) {
            console.error(`Select element with ID '${elementId}' not found`);
            return;
        }

        console.log(`Populating select '${elementId}' with ${options.length} options`);
        
        try {
            // Clear existing options except the first placeholder
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            // Add new options
            options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option.id;
                optionElement.textContent = option.name;
                select.appendChild(optionElement);
            });
            
            console.log(`Successfully populated select '${elementId}'`);
        } catch (error) {
            console.error(`Error populating select '${elementId}':`, error);
        }
    }

    showStep(step) {
        if (!this.form) {
            console.error('Form not found, cannot show step');
            return;
        }
        
        console.log(`Showing step ${step}`);
        
        // Get all step elements
        const steps = this.form.querySelectorAll('.form-step');
        console.log(`Found ${steps.length} step elements`);
        
        if (steps.length === 0) {
            console.error('No form steps found');
            return;
        }
        
        // Hide all steps and remove active class
        steps.forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
            console.log(`Hiding step ${s.dataset.step}`);
        });
        
        // Find and show the target step
        const currentStepElement = this.form.querySelector(`.form-step[data-step="${step}"]`);
        if (currentStepElement) {
            console.log(`Displaying step ${step}`);
            currentStepElement.style.display = 'block';
            currentStepElement.classList.add('active');
            
            // Scroll to top of form on mobile devices
            if (window.innerWidth <= 768) {
                // Using smoother scrolling for better UX
                setTimeout(() => {
                    this.form.closest('.card-body').scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'start'
                    });
                }, 100);
            }
            
            // Focus on the first input in the step for better accessibility
            const firstInput = currentStepElement.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => {
                    firstInput.focus();
                }, 200);
            }
        } else {
            console.error(`Step ${step} not found in the form`);
        }

        // Update progress indicators
        this.updateProgress(step);
    }

    updateProgress(step) {
        const progress = ((step - 1) / (FORM_STEPS.length - 1)) * 100;
        
        // Update progress bar
        const progressBar = this.progressContainer?.querySelector('.progress-bar-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Update step indicators
        const steps = this.progressContainer?.querySelectorAll('.progress-step');
        if (steps) {
            steps.forEach(s => {
                const stepNum = parseInt(s.dataset.step);
                s.classList.toggle('active', stepNum === step);
                s.classList.toggle('completed', stepNum < step);
            });
        }
        
        // Update text
        const currentStepEl = document.getElementById('currentStep');
        const completionPercentageEl = document.getElementById('completionPercentage');
        
        if (currentStepEl) {
            currentStepEl.textContent = step;
        }
        
        if (completionPercentageEl) {
            completionPercentageEl.textContent = Math.round(progress);
        }
    }

    validateCurrentStep() {
        if (!this.form) {
            console.error('Form not found, cannot validate step');
            return false;
        }
        
        // For debugging/development - skip validation
        // REMOVE THIS IN PRODUCTION
        const skipValidation = true; // Set to false to enable validation
        if (skipValidation) {
            console.log('Validation skipped for testing');
            return true;
        }
        
        const currentStepElement = this.form.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        if (!currentStepElement) {
            console.error(`Step ${this.currentStep} not found in the form`);
            return false;
        }
        
        console.log(`Validating step ${this.currentStep}`);
        
        const fields = currentStepElement.querySelectorAll('input[required], select[required]');
        console.log(`Found ${fields.length} required fields to validate`);
        
        let isValid = true;
        fields.forEach(field => {
            if (!field.value) {
                field.classList.add('is-invalid');
                console.log(`Field ${field.id || field.name} is invalid (empty)`);
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
                console.log(`Field ${field.id || field.name} is valid`);
            }
        });
        
        console.log(`Validation result: ${isValid ? 'valid' : 'invalid'}`);
        return isValid;
    }

    nextStep() {
        console.log('nextStep called, current step:', this.currentStep);
        
        // Always skip validation for test purposes
        const skipValidation = true;
        
        if (this.currentStep < FORM_STEPS.length) {
            console.log(`Moving from step ${this.currentStep} to step ${this.currentStep + 1}`);
            this.currentStep++;
            this.showStep(this.currentStep);
            return true;
        } else {
            console.log('Already at last step');
            return false;
        }
    }

    previousStep() {
        console.log('previousStep called, current step:', this.currentStep);
        
        if (this.currentStep > 1) {
            console.log(`Moving from step ${this.currentStep} to step ${this.currentStep - 1}`);
            this.currentStep--;
            this.showStep(this.currentStep);
            return true;
        } else {
            console.log('Already at first step');
            return false;
        }
    }

    showAlert(message, type = 'info') {
        const alertsContainer = document.getElementById('alertsContainer');
        const alert = document.createElement('div');
        alert.className = `alert alert-${type} alert-dismissible fade show`;
        alert.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        alertsContainer.appendChild(alert);
    }

    async submitForm() {
        try {
            const formData = new FormData(this.form);
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Form submission failed');

            const result = await response.json();
            this.showAlert('Form submitted successfully!', 'success');
            
            // Reset form after successful submission
            setTimeout(() => {
                this.form.reset();
                this.currentStep = 1;
                this.showStep(1);
            }, 2000);
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showAlert('Error submitting form. Please try again.', 'error');
        }
    }
}

// Initialize the form when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing IVR Form');
    window.ivrFormInstance = new IVRForm();
});

// Add this function to be called from HTML
function initIVRForm() {
    console.log('initIVRForm called');
    if (!window.ivrFormInstance) {
        window.ivrFormInstance = new IVRForm();
    }
    return window.ivrFormInstance;
}

// Make the function available globally
window.initIVRForm = initIVRForm;
