/**
 * Order Form Handler
 * Manages the order form functionality and data submission
 * Version 1.0.0
 */

// Define the order form steps
const ORDER_FORM_STEPS = [
    { step: 1, name: 'Products' },
    { step: 2, name: 'Customer' },
    { step: 3, name: 'Shipping' },
    { step: 4, name: 'Payment' },
    { step: 5, name: 'Review' }
];

// Make sure we don't redefine the global function
if (typeof window.initOrderForm !== 'function') {
    window.initOrderForm = function() {
        console.log('Initializing Order Form');
        new OrderForm().init();
    };
}

/**
 * Order Form Manager Class
 */
class OrderForm {
    constructor() {
        this.form = null;
        this.progressContainer = null;
        this.currentStep = 1;
        this.totalSteps = ORDER_FORM_STEPS.length;
        this.products = [];
    }

    async init() {
        console.log('Order Form init started');
        
        // Find the form
        this.form = document.getElementById('orderForm');
        if (!this.form) {
            console.error('Order Form not found on page');
            return;
        }
        
        console.log('Order Form found:', this.form);
        
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
        
        // Initialize product list
        this.initializeProductList();
        
        // Show the first step
        this.showStep(this.currentStep);
        
        console.log('Order Form initialization complete');
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
        
        ORDER_FORM_STEPS.forEach(step => {
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
            <span>Step <span id="currentStep">1</span> of ${ORDER_FORM_STEPS.length}</span>
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
        
        // Add product button
        const addProductButton = this.form.querySelector('[data-action="add-product"]');
        if (addProductButton) {
            addProductButton.addEventListener('click', () => this.addProduct());
        }
        
        // Use same billing address checkbox
        const sameAddressCheckbox = this.form.querySelector('#same_address');
        if (sameAddressCheckbox) {
            sameAddressCheckbox.addEventListener('change', () => this.toggleBillingAddress());
        }
    }
    
    async loadFormData() {
        console.log('Loading form data');
        
        try {
            // Load products
            const productData = await this.fetchProducts();
            this.populateProductDropdown(productData);
            
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
    
    async fetchProducts() {
        try {
            const response = await fetch('/api/products');
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.warn('Using mock product data due to API error:', error);
            // Mock data for testing
            return [
                { id: 101, name: 'Advanced Wound Gel', price: 29.99, sku: 'AWG-001', category: 'Gels' },
                { id: 102, name: 'Hydrocolloid Dressing', price: 15.99, sku: 'HCD-002', category: 'Dressings' },
                { id: 103, name: 'Antimicrobial Gauze', price: 12.50, sku: 'AMG-003', category: 'Gauze' },
                { id: 201, name: 'Collagen Matrix', price: 45.99, sku: 'CLM-004', category: 'Matrix' },
                { id: 202, name: 'Foam Dressing', price: 18.75, sku: 'FMD-005', category: 'Dressings' },
                { id: 301, name: 'Alginate Dressing', price: 22.99, sku: 'ALD-006', category: 'Dressings' },
                { id: 302, name: 'Negative Pressure System', price: 199.99, sku: 'NPS-007', category: 'Systems' },
                { id: 401, name: 'Silver Dressing', price: 24.99, sku: 'SLD-008', category: 'Dressings' },
                { id: 501, name: 'Bioactive Dressing', price: 35.50, sku: 'BAD-009', category: 'Dressings' },
                { id: 502, name: 'Skin Substitute', price: 149.99, sku: 'SKS-010', category: 'Substitutes' }
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
            if (option.price) optionElement.dataset.price = option.price;
            if (option.sku) optionElement.dataset.sku = option.sku;
            
            select.appendChild(optionElement);
        });
        
        console.log(`Successfully populated select #${elementId}`);
    }
    
    populateProductDropdown(products) {
        this.populateSelect('product_select', products);
    }
    
    initializeProductList() {
        const productList = this.form.querySelector('#product_list');
        if (!productList) {
            console.error('Product list container not found');
            return;
        }
        
        // Create table if not exists
        if (!productList.querySelector('table')) {
            const table = document.createElement('table');
            table.className = 'table product-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="product_items"></tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" class="text-end">Subtotal:</td>
                        <td class="subtotal">$0.00</td>
                        <td></td>
                    </tr>
                </tfoot>
            `;
            productList.appendChild(table);
        }
    }
    
    addProduct() {
        const productSelect = this.form.querySelector('#product_select');
        const quantityInput = this.form.querySelector('#product_quantity');
        
        if (!productSelect || !quantityInput) {
            console.error('Product select or quantity input not found');
            return;
        }
        
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
        
        console.log('Adding product:', product);
        
        // Add to products array
        this.products.push(product);
        
        // Update product list
        this.updateProductList();
        
        // Reset inputs
        productSelect.selectedIndex = 0;
        quantityInput.value = 1;
    }
    
    updateProductList() {
        const productItems = this.form.querySelector('#product_items');
        const subtotalEl = this.form.querySelector('.subtotal');
        
        if (!productItems || !subtotalEl) {
            console.error('Product items or subtotal element not found');
            return;
        }
        
        // Clear current items
        productItems.innerHTML = '';
        
        // Calculate subtotal
        let subtotal = 0;
        
        // Add products
        this.products.forEach((product, index) => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${product.name} <small class="text-muted">(SKU: ${product.sku})</small></td>
                <td>${product.quantity}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>$${product.total.toFixed(2)}</td>
                <td>
                    <button type="button" class="btn btn-sm btn-danger" data-action="remove-product" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            productItems.appendChild(row);
            subtotal += product.total;
            
            // Add remove button event listener
            const removeButton = row.querySelector('[data-action="remove-product"]');
            removeButton.addEventListener('click', () => this.removeProduct(index));
        });
        
        // Update subtotal
        subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
        
        // Update hidden input for order items
        const orderItemsInput = this.form.querySelector('#order_items');
        if (orderItemsInput) {
            orderItemsInput.value = JSON.stringify(this.products);
        }
        
        // Update UI based on product count
        const noProductsMessage = this.form.querySelector('#no_products_message');
        const productTable = this.form.querySelector('.product-table');
        
        if (noProductsMessage && productTable) {
            if (this.products.length === 0) {
                noProductsMessage.style.display = 'block';
                productTable.style.display = 'none';
            } else {
                noProductsMessage.style.display = 'none';
                productTable.style.display = 'table';
            }
        }
    }
    
    removeProduct(index) {
        if (index >= 0 && index < this.products.length) {
            this.products.splice(index, 1);
            this.updateProductList();
        }
    }
    
    toggleBillingAddress() {
        const sameAddressCheckbox = this.form.querySelector('#same_address');
        const billingAddressSection = this.form.querySelector('#billing_address_section');
        
        if (!sameAddressCheckbox || !billingAddressSection) return;
        
        billingAddressSection.style.display = sameAddressCheckbox.checked ? 'none' : 'block';
        
        // Toggle required attribute on billing fields
        const billingFields = billingAddressSection.querySelectorAll('input, select');
        billingFields.forEach(field => {
            field.required = !sameAddressCheckbox.checked && field.dataset.required === 'true';
        });
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
        // If we're on the products step, check if we have any products
        if (this.currentStep === 1 && this.products.length === 0) {
            showAlert('Please add at least one product before continuing', 'warning');
            return false;
        }
        
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
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing Order...';
        }
        
        try {
            // Collect form data
            const formData = new FormData(this.form);
            
            // Add product items
            formData.append('products', JSON.stringify(this.products));
            
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
            showAlert('Order submitted successfully! Order number: ' + (result.orderId || 'N/A'), 'success');
            
            // Reset form after delay
            setTimeout(() => {
                this.form.reset();
                this.products = [];
                this.updateProductList();
                this.showStep(1);
            }, 3000);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            showAlert('Error submitting order. Please try again.', 'error');
        } finally {
            // Reset button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Place Order';
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