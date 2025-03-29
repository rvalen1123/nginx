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
        this.currentStep = 1;
        this.form = document.getElementById('ivrForm');
        this.progressContainer = document.querySelector('.progress-container');
        
        this.init();
    }

    init() {
        this.initializeProgressBar();
        this.initializeFormSteps();
        this.setupEventListeners();
        this.loadDynamicData();
    }

    initializeProgressBar() {
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
        // Navigation buttons
        this.form.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="next"]')) {
                this.nextStep();
            } else if (e.target.matches('[data-action="back"]')) {
                this.previousStep();
            }
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.validateCurrentStep()) {
                this.submitForm();
            }
        });
    }

    async loadDynamicData() {
        try {
            // Load manufacturers
            const manufacturers = await this.fetchManufacturers();
            this.populateSelect('manufacturer', manufacturers);
            
            // Load sales representatives
            const salesReps = await this.fetchSalesReps();
            this.populateSelect('sales_rep', salesReps);
        } catch (error) {
            console.error('Error loading dynamic data:', error);
            this.showAlert('Error loading form data. Please try again.', 'error');
        }
    }

    async fetchManufacturers() {
        const response = await fetch('/api/manufacturers');
        if (!response.ok) throw new Error('Failed to fetch manufacturers');
        return await response.json();
    }

    async fetchSalesReps() {
        const response = await fetch('/api/sales-representatives');
        if (!response.ok) throw new Error('Failed to fetch sales representatives');
        return await response.json();
    }

    populateSelect(elementId, options) {
        const select = document.getElementById(elementId);
        if (!select) return;

        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.id;
            optionElement.textContent = option.name;
            select.appendChild(optionElement);
        });
    }

    showStep(step) {
        const steps = this.form.querySelectorAll('.form-step');
        steps.forEach(s => s.style.display = 'none');
        
        const currentStepElement = this.form.querySelector(`[data-step="${step}"]`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
        }

        // Update progress indicators
        this.updateProgress(step);
    }

    updateProgress(step) {
        const progress = ((step - 1) / (FORM_STEPS.length - 1)) * 100;
        
        // Update progress bar
        const progressBar = this.progressContainer.querySelector('.progress-bar-fill');
        progressBar.style.width = `${progress}%`;
        
        // Update step indicators
        const steps = this.progressContainer.querySelectorAll('.progress-step');
        steps.forEach(s => {
            const stepNum = parseInt(s.dataset.step);
            s.classList.toggle('active', stepNum === step);
            s.classList.toggle('completed', stepNum < step);
        });
        
        // Update text
        document.getElementById('currentStep').textContent = step;
        document.getElementById('completionPercentage').textContent = Math.round(progress);
    }

    validateCurrentStep() {
        const currentStepElement = this.form.querySelector(`[data-step="${this.currentStep}"]`);
        const fields = currentStepElement.querySelectorAll('input[required], select[required]');
        
        let isValid = true;
        fields.forEach(field => {
            if (!field.value) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        return isValid;
    }

    nextStep() {
        if (this.validateCurrentStep() && this.currentStep < FORM_STEPS.length) {
            this.currentStep++;
            this.showStep(this.currentStep);
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
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
    new IVRForm();
});
