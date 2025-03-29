/**
 * Insurance Verification Request Form Handler
 * Manages the IVR form functionality and data submission
 * Version 1.0.0
 */

// Define the IVR form steps
const FORM_STEPS = [
    { step: 1, name: 'Provider Info' },
    { step: 2, name: 'Patient Info' },
    { step: 3, name: 'Insurance' },
    { step: 4, name: 'Diagnosis' },
    { step: 5, name: 'Review' }
];

// Make sure we don't redefine the global function
if (typeof window.initIVRForm !== 'function') {
    window.initIVRForm = function() {
        console.log('Initializing IVR Form');
        new IVRForm().init();
    };
}

/**
 * IVR Form Manager Class
 */
class IVRForm {
    constructor() {
        this.form = null;
        this.progressContainer = null;
        this.currentStep = 1;
        this.totalSteps = FORM_STEPS.length;
    }

    async init() {
        console.log('IVR Form init started');
        
        // Find the form
        this.form = document.getElementById('ivrForm');
        if (!this.form) {
            console.error('IVR Form not found on page');
            return;
        }
        
        console.log('IVR Form found:', this.form);
        
        // Find or create progress container
        this.progressContainer = document.querySelector('.progress-container');
        if (!this.progressContainer) {
            console.warn('Progress container not found, creating one');
            this.createProgressContainer();
        }
        
        // Load form data
        try {
            console.log('Loading form data');
            await this.loadFormData();
            console.log('Form data loaded successfully');
        } catch (error) {
            console.error('Error loading form data:', error);
            showAlert('Error loading form data. Using mock data where available.', 'warning');
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Show the first step
        this.showStep(this.currentStep);
        
        console.log('IVR Form initialization complete');
    }

    createProgressContainer() {
        // Already exists, no need to create
        const existingContainer = document.querySelector('.progress-container');
        if (existingContainer) {
            this.progressContainer = existingContainer;
            return;
        }
        
        // Create progress container
        this.progressContainer = document.createElement('div');
        this.progressContainer.className = 'progress-container';
        
        // Create steps
        const stepsContainer = document.createElement('div');
        stepsContainer.className = 'progress-steps';
        
        FORM_STEPS.forEach(step => {
            const stepEl = document.createElement('div');
            stepEl.className = 'progress-step';
            stepEl.dataset.step = step.step;
            
            const stepNumber = document.createElement('div');
            stepNumber.className = 'progress-step-number';
            stepNumber.textContent = step.step;
            
            const stepLabel = document.createElement('div');
            stepLabel.className = 'progress-step-label';
            stepLabel.textContent = step.name;
            
            stepEl.appendChild(stepNumber);
            stepEl.appendChild(stepLabel);
            stepsContainer.appendChild(stepEl);
        });
        
        // Create progress bar
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        
        const progressBarFill = document.createElement('div');
        progressBarFill.className = 'progress-bar-fill';
        progressBarFill.style.width = '0%';
        
        progressBar.appendChild(progressBarFill);
        
        // Create progress text
        const progressText = document.createElement('div');
        progressText.className = 'progress-text';
        progressText.innerHTML = `
            <span>Step <span id="currentStep">1</span> of ${FORM_STEPS.length}</span>
            <span><span id="completionPercentage">0</span>% Complete</span>
        `;
        
        // Append all to progress container
        this.progressContainer.appendChild(stepsContainer);
        this.progressContainer.appendChild(progressBar);
        this.progressContainer.appendChild(progressText);
        
        // Insert into DOM before the form
        if (this.form) {
            this.form.parentNode.insertBefore(this.progressContainer, this.form);
        }
    }

    setupEventListeners() {
        if (!this.form) return;
        
        console.log('Setting up event listeners');
        
        // Next buttons
        const nextButtons = this.form.querySelectorAll('[data-action="next"]');
        nextButtons.forEach(button => {
            button.addEventListener('click', () => this.nextStep());
        });
        
        // Back buttons
        const backButtons = this.form.querySelectorAll('[data-action="back"]');
        backButtons.forEach(button => {
            button.addEventListener('click', () => this.previousStep());
        });
        
        // Submit button
        const submitButton = this.form.querySelector('[data-action="submit"]');
        if (submitButton) {
            submitButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitForm();
            });
        }
        
        // Manufacturer selection changes product options
        const manufacturerSelect = this.form.querySelector('#manufacturer');
        if (manufacturerSelect) {
            manufacturerSelect.addEventListener('change', () => this.loadProducts());
        }
    }

    async loadFormData() {
        console.log('Loading form data');
        
        try {
            // Load manufacturers
            const manufacturers = await this.fetchManufacturers();
            this.populateSelect('manufacturer', manufacturers);
            
            // Load sales representatives
            const salesReps = await this.fetchSalesReps();
            this.populateSelect('sales_rep', salesReps);
            
            // Load any other necessary data
            
            return true;
        } catch (error) {
            console.error('Error loading form data:', error);
            throw error;
        }
    }
    
    async fetchManufacturers() {
        try {
            const response = await fetch('/api/manufacturers');
            if (!response.ok) throw new Error('Failed to fetch manufacturers');
            return await response.json();
        } catch (error) {
            console.warn('Using mock manufacturer data due to API error:', error);
            // Updated manufacturer list to match product groupings
            return [
                { id: 1, name: 'MedBio Innovations' },
                { id: 2, name: 'Complete Therapeutics' },
                { id: 3, name: 'Advanced Membrane Solutions' },
                { id: 4, name: 'Neostim Biologics' },
                { id: 5, name: 'Regenerative Wound Solutions' },
                { id: 6, name: 'AmnioCare Technologies' },
                { id: 7, name: 'XCell Medical' },
                { id: 8, name: 'EpiHealing Products' },
                { id: 9, name: 'SURGraft Solutions' },
                { id: 10, name: 'Advanced Derm Products' },
                { id: 11, name: 'Redbook Specialty Products' }
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
            // Enhanced mock data with more realistic details
            return [
                { id: 1, name: 'John Smith', email: 'jsmith@mscwound.com', phone: '(555) 123-4567', territory: 'Northeast', specialty: 'Diabetes Care' },
                { id: 2, name: 'Sarah Johnson', email: 'sjohnson@mscwound.com', phone: '(555) 234-5678', territory: 'Southeast', specialty: 'Surgical Wounds' },
                { id: 3, name: 'Michael Brown', email: 'mbrown@mscwound.com', phone: '(555) 345-6789', territory: 'Midwest', specialty: 'Chronic Wounds' },
                { id: 4, name: 'Jessica Davis', email: 'jdavis@mscwound.com', phone: '(555) 456-7890', territory: 'Southwest', specialty: 'Pressure Ulcers' },
                { id: 5, name: 'David Wilson', email: 'dwilson@mscwound.com', phone: '(555) 567-8901', territory: 'West Coast', specialty: 'Burns' },
                { id: 6, name: 'Emily Martinez', email: 'emartinez@mscwound.com', phone: '(555) 678-9012', territory: 'Northwest', specialty: 'Venous Ulcers' },
                { id: 7, name: 'Robert Taylor', email: 'rtaylor@mscwound.com', phone: '(555) 789-0123', territory: 'Central', specialty: 'Arterial Ulcers' },
                { id: 8, name: 'Amanda Garcia', email: 'agarcia@mscwound.com', phone: '(555) 890-1234', territory: 'Mid-Atlantic', specialty: 'Diabetic Foot Ulcers' },
                { id: 9, name: 'Christopher Lee', email: 'clee@mscwound.com', phone: '(555) 901-2345', territory: 'Great Lakes', specialty: 'Surgical Site Infections' },
                { id: 10, name: 'Jennifer Robinson', email: 'jrobinson@mscwound.com', phone: '(555) 012-3456', territory: 'South Central', specialty: 'Radiation Wounds' }
            ];
        }
    }
    
    populateSelect(elementId, options) {
        console.log(`Populating select #${elementId} with ${options?.length || 0} options`);
        
        const select = this.form.querySelector(`#${elementId}`);
        if (!select) {
            console.error(`Select element with ID '${elementId}' not found`);
            return;
        }
        
        // Clear existing options (except first placeholder if it exists)
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add new options
        options?.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.id;
            optionElement.textContent = option.name;
            
            // Add data attributes for additional info if needed
            if (option.email) optionElement.dataset.email = option.email;
            if (option.phone) optionElement.dataset.phone = option.phone;
            if (option.territory) optionElement.dataset.territory = option.territory;
            if (option.specialty) optionElement.dataset.specialty = option.specialty;
            
            select.appendChild(optionElement);
        });
        
        console.log(`Successfully populated select #${elementId}`);
    }

    async loadProducts() {
        const manufacturerSelect = this.form.querySelector('#manufacturer');
        if (!manufacturerSelect) {
            console.error('Manufacturer select not found');
            return;
        }
        
        const manufacturerId = manufacturerSelect.value;
        if (!manufacturerId) {
            console.log('No manufacturer selected');
            return;
        }
        
        console.log(`Loading products for manufacturer ID: ${manufacturerId}`);
        
        try {
            const products = await this.fetchProductsByManufacturer(manufacturerId);
            this.populateSelect('product', products);
        } catch (error) {
            console.error('Error loading products:', error);
            showAlert('Error loading products. Please try again.', 'error');
        }
    }
    
    async fetchProductsByManufacturer(manufacturerId) {
        try {
            const response = await fetch(`/api/products?manufacturer=${manufacturerId}`);
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.warn('Using mock product data due to API error:', error);
            // Comprehensive product list with Q codes and National ASP prices, organized by manufacturer
            const mockProducts = {
                '1': [ // MedBio Innovations
                    { id: 1, name: 'Biovance', price: 550.64, sku: 'Q4154' },
                    { id: 2, name: 'IMPAX', price: 169.86, sku: 'Q4262' },
                    { id: 3, name: 'Helicol', price: 322.15, sku: 'Q4164' },
                    { id: 4, name: 'Zenith', price: 71.49, sku: 'Q4253' },
                    { id: 5, name: 'Orion', price: 464.34, sku: 'Q4276' }
                ],
                '2': [ // Complete Therapeutics
                    { id: 6, name: 'Complete FT', price: 1399.12, sku: 'Q4271' },
                    { id: 16, name: 'Complete ACA', price: 2008.70, sku: 'Q4302' },
                    { id: 21, name: 'Complete AA', price: 3397.40, sku: 'Q4303' },
                    { id: 22, name: 'Complete SL', price: 3370.80, sku: 'Q4270' }
                ],
                '3': [ // Advanced Membrane Solutions
                    { id: 7, name: 'Barrera', price: 560.29, sku: 'Q4281' },
                    { id: 8, name: 'CarePatch', price: 482.71, sku: 'Q4236' },
                    { id: 9, name: 'Membrane Wrap', price: 1055.97, sku: 'Q4205' },
                    { id: 10, name: 'Membrane Wrap Hydro', price: 1841.00, sku: 'Q4290' }
                ],
                '4': [ // Neostim Biologics
                    { id: 11, name: 'Neostim TL', price: 1750.26, sku: 'Q4265' },
                    { id: 12, name: 'Neostim DL', price: 274.60, sku: 'Q4267' },
                    { id: 13, name: 'Neostim SL', price: 989.67, sku: 'Q4266' }
                ],
                '5': [ // Regenerative Wound Solutions
                    { id: 14, name: 'Restorigin', price: 940.15, sku: 'Q4191' },
                    { id: 15, name: 'Wound Fix', price: 273.51, sku: 'Q4217' },
                    { id: 17, name: 'Procenta', price: 2213.13, sku: 'Q4310' },
                    { id: 18, name: 'Revoshield+ Amnio', price: 1602.22, sku: 'Q4289' }
                ],
                '6': [ // AmnioCare Technologies
                    { id: 19, name: 'AmnioBand', price: 136.47, sku: 'Q4151' },
                    { id: 20, name: 'Amnio AMP', price: 2863.13, sku: 'Q4250' },
                    { id: 26, name: 'Amnio-Maxx', price: 2349.92, sku: 'Q4239' },
                    { id: 28, name: 'Amniocore Pro', price: 2279.00, sku: 'Q4298' },
                    { id: 29, name: 'Amniocore Pro +', price: 2597.00, sku: 'Q4299' },
                    { id: 30, name: 'Amnio quad-core', price: 2650.00, sku: 'Q4294' },
                    { id: 31, name: 'Amnio tri-core', price: 2332.00, sku: 'Q4295' },
                    { id: 32, name: 'AmnioCore', price: 1192.50, sku: 'Q4227' }
                ],
                '7': [ // XCell Medical
                    { id: 23, name: 'Xcellerate', price: 247.91, sku: 'Q4234' },
                    { id: 37, name: 'Xcell Amnio Matrix', price: 3246.50, sku: 'Q4280' }
                ],
                '8': [ // EpiHealing Products
                    { id: 24, name: 'Epifix', price: 158.34, sku: 'Q4186' },
                    { id: 25, name: 'Epicord', price: 247.02, sku: 'Q4187' }
                ],
                '9': [ // SURGraft Solutions
                    { id: 27, name: 'SURGraft XT', price: 2862.00, sku: 'Q4268' },
                    { id: 36, name: 'Surgraft TL', price: 1712.99, sku: 'Q4263' }
                ],
                '10': [ // Advanced Derm Products
                    { id: 33, name: 'Coll-e-derm', price: 1608.27, sku: 'Q4193' },
                    { id: 34, name: 'Xwrap', price: 2929.01, sku: 'Q4204' },
                    { id: 35, name: 'Derm-maxx', price: 1644.99, sku: 'Q4238' }
                ],
                '11': [ // Redbook Specialty Products
                    { id: 38, name: 'Rampart T.M. DL Matrix', price: 2850.00, sku: 'Q4347' },
                    { id: 39, name: 'Microlyte', price: 239.00, sku: 'A2005' }
                ]
            };
            
            return mockProducts[manufacturerId] || [];
        }
    }

    showStep(step) {
        if (!this.form) {
            console.error('Form not found, cannot show step');
            return;
        }
        
        console.log(`Showing step ${step}`);
        
        // Update current step
        this.currentStep = step;
        
        // Get all step elements
        const steps = this.form.querySelectorAll('.form-step');
        if (steps.length === 0) {
            console.error('No form steps found');
            return;
        }
        
        // Hide all steps
        steps.forEach(stepElement => {
            stepElement.style.display = 'none';
            stepElement.classList.remove('active');
        });
        
        // Show current step
        const currentStepElement = this.form.querySelector(`.form-step[data-step="${step}"]`);
        if (currentStepElement) {
            currentStepElement.style.display = 'block';
            currentStepElement.classList.add('active');
            
            // Focus first input for accessibility
            setTimeout(() => {
                const firstInput = currentStepElement.querySelector('input:not([type="hidden"]), select, textarea');
                if (firstInput) {
                    firstInput.focus();
                }
            }, 100);
        } else {
            console.error(`Step ${step} element not found`);
        }
        
        // Update progress indicators
        this.updateProgress(step);
    }
    
    updateProgress(step) {
        if (!this.progressContainer) return;
        
        // Calculate percentage
        const percentage = ((step - 1) / (this.totalSteps - 1)) * 100;
        
        // Update progress bar fill
        const progressBarFill = this.progressContainer.querySelector('.progress-bar-fill');
        if (progressBarFill) {
            progressBarFill.style.width = `${percentage}%`;
        }
        
        // Update step indicators
        const stepElements = this.progressContainer.querySelectorAll('.progress-step');
        stepElements.forEach(stepElement => {
            const stepNumber = parseInt(stepElement.dataset.step);
            stepElement.classList.toggle('active', stepNumber === step);
            stepElement.classList.toggle('completed', stepNumber < step);
        });
        
        // Update text indicators
        const currentStepEl = this.progressContainer.querySelector('#currentStep');
        const completionPercentageEl = this.progressContainer.querySelector('#completionPercentage');
        
        if (currentStepEl) {
            currentStepEl.textContent = step;
        }
        
        if (completionPercentageEl) {
            completionPercentageEl.textContent = Math.round(percentage);
        }
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            // Validate current step
            if (this.validateStep(this.currentStep)) {
                this.showStep(this.currentStep + 1);
                return true;
            } else {
                // Show validation errors
                this.showValidationErrors(this.currentStep);
                return false;
            }
        } else {
            console.log('Already at the last step');
            return false;
        }
    }
    
    previousStep() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
            return true;
        } else {
            console.log('Already at the first step');
            return false;
        }
    }
    
    validateStep(step) {
        // For development, return true to skip validation
        // Remove this in production
        return true;
        
        /*
        const stepElement = this.form.querySelector(`.form-step[data-step="${step}"]`);
        if (!stepElement) return false;
        
        const requiredFields = stepElement.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });
        
        return isValid;
        */
    }
    
    showValidationErrors(step) {
        const stepElement = this.form.querySelector(`.form-step[data-step="${step}"]`);
        if (!stepElement) return;
        
        const requiredFields = stepElement.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                
                // Add a small shake animation for better UX
                field.classList.add('shake');
                setTimeout(() => {
                    field.classList.remove('shake');
                }, 500);
                
                // Focus the first invalid field
                if (field === requiredFields[0]) {
                    field.focus();
                }
            }
        });
        
        showAlert('Please fill in all required fields', 'warning');
    }

    async submitForm() {
        // Validate all steps
        let isValid = true;
        for (let i = 1; i <= this.totalSteps; i++) {
            if (!this.validateStep(i)) {
                isValid = false;
                this.showStep(i);
                this.showValidationErrors(i);
                break;
            }
        }
        
        if (!isValid) {
            showAlert('Please complete all required fields before submitting', 'warning');
            return;
        }
        
        // Show loading state
        const submitButton = this.form.querySelector('[data-action="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
        }
        
        try {
            // Collect form data
            const formData = new FormData(this.form);
            
            // API submission
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Server responded with ${response.status}`);
            }
            
            const result = await response.json();
            
            // Show success message
            showAlert('Insurance verification request submitted successfully!', 'success');
            
            // Reset form after delay
            setTimeout(() => {
                this.form.reset();
                this.showStep(1);
            }, 2000);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showAlert('Error submitting form. Please try again.', 'error');
        } finally {
            // Reset button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Submit Request';
            }
        }
    }
}

/**
 * Helper function to show alerts
 */
function showAlert(message, type = 'info') {
    // Find alerts container or create it
    let alertsContainer = document.getElementById('alertsContainer');
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
    
    // Add alert to container
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
    
    // Auto-dismiss after 5 seconds for non-error alerts
    if (type !== 'error') {
        setTimeout(() => {
            alertElement.classList.remove('show');
            setTimeout(() => {
                alertElement.remove();
            }, 300);
        }, 5000);
    }
}
