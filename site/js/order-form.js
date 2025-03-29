/**
 * Order Form Functionality
 */

function initOrderForm() {
    // Initialize multi-step form
    const formSteps = [
        {
            id: 'order-step1',
            validate: validateOrderStep1
        },
        {
            id: 'order-step2',
            validate: validateOrderStep2
        },
        {
            id: 'order-step3',
            validate: validateOrderStep3
        },
        {
            id: 'order-step4',
            validate: validateOrderStep4
        },
        {
            id: 'order-step5',
            validate: validateOrderStep5
        }
    ];
    
    const multiStepForm = initMultiStepForm({
        formId: 'orderForm',
        steps: formSteps,
        onStepChange: handleOrderStepChange,
        onSubmit: handleOrderFormSubmit
    });
    
    // Load form data
    loadOrderFormData();
    
    // Initialize product management
    initProductManagement();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('orderDate').value = today;
    
    // Initialize conditional fields
    setupOrderConditionalFields();
    
    // Load data from APIs
    async function loadOrderFormData() {
        try {
            // Load sales reps
            await populateSelectFromApi(
                'orderRepId',
                '/api/users?role=REP',
                'userId',
                'name'
            );
            
            // Load practices for the selected rep
            const repSelector = document.getElementById('orderRepId');
            if (repSelector) {
                repSelector.addEventListener('change', async () => {
                    const repId = repSelector.value;
                    if (repId) {
                        await populateSelectFromApi(
                            'orderPracticeId',
                            `/api/users/${repId}/practices`,
                            'practiceId',
                            'name'
                        );
                    } else {
                        // Clear practices if no rep selected
                        const practiceSelect = document.getElementById('orderPracticeId');
                        if (practiceSelect) {
                            practiceSelect.innerHTML = '<option value="">Select Practice</option>';
                        }
                    }
                });
            }
            
            // Load facilities based on practice selection
            const practiceSelector = document.getElementById('orderPracticeId');
            if (practiceSelector) {
                practiceSelector.addEventListener('change', async () => {
                    const practiceId = practiceSelector.value;
                    if (practiceId) {
                        // Load facilities
                        await populateSelectFromApi(
                            'orderFacilityId',
                            `/api/practices/${practiceId}/facilities`,
                            'facilityId',
                            'facilityName'
                        );
                        
                        // Load physicians
                        await populateSelectFromApi(
                            'orderPhysicianId',
                            `/api/practices/${practiceId}/physicians`,
                            'physicianId',
                            'name'
                        );
                    } else {
                        // Clear facilities and physicians if no practice selected
                        const facilitySelect = document.getElementById('orderFacilityId');
                        if (facilitySelect) {
                            facilitySelect.innerHTML = '<option value="">Select Facility</option>';
                        }
                        
                        const physicianSelect = document.getElementById('orderPhysicianId');
                        if (physicianSelect) {
                            physicianSelect.innerHTML = '<option value="">Select Physician</option>';
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error loading order form data:', error);
            showAlert('Error loading form data. Please try again later.', 'error');
        }
    }
    
    // Product management
    function initProductManagement() {
        // Add product button
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', addProduct);
        }
        
        // Initialize remove buttons on existing products
        document.querySelectorAll('.remove-product-btn').forEach(button => {
            button.addEventListener('click', removeProduct);
        });
        
        // Set up price calculation events
        document.querySelectorAll('[id^="quantity-"], [id^="unitPrice-"]').forEach(input => {
            input.addEventListener('input', updatePrice);
        });
    }
    
    // Add a new product
    function addProduct() {
        const productContainer = document.getElementById('productContainer');
        if (!productContainer) return;
        
        const productCount = productContainer.querySelectorAll('.product-item').length;
        const newProductIndex = productCount;
        
        // Create the HTML for the new product
        const productHtml = `
            <div class="product-item" data-product-index="${newProductIndex}">
                <button type="button" class="remove-product-btn">Remove</button>
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="manufacturer-${newProductIndex}" class="block text-sm font-medium text-gray-700 mb-1">
                                Manufacturer <span class="text-red-500">*</span>
                            </label>
                            <select id="manufacturer-${newProductIndex}" name="products[${newProductIndex}].manufacturer" required class="manufacturer-select w-full p-2 border rounded-md">
                                <option value="">Select Manufacturer</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label for="productCode-${newProductIndex}" class="block text-sm font-medium text-gray-700 mb-1">
                                Product Code <span class="text-red-500">*</span>
                            </label>
                            <select id="productCode-${newProductIndex}" name="products[${newProductIndex}].productCode" required class="product-select w-full p-2 border rounded-md">
                                <option value="">Select Product</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-col-full">
                        <div class="form-group">
                            <label for="description-${newProductIndex}" class="block text-sm font-medium text-gray-700 mb-1">
                                Description <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="description-${newProductIndex}" name="products[${newProductIndex}].description" required class="w-full p-2 border rounded-md">
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="size-${newProductIndex}" class="block text-sm font-medium text-gray-700 mb-1">
                                Size <span class="text-red-500">*</span>
                            </label>
                            <input type="text" id="size-${newProductIndex}" name="products[${newProductIndex}].size" required class="w-full p-2 border rounded-md">
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label for="quantity-${newProductIndex}" class="block text-sm font-medium text-gray-700 mb-1">
                                Quantity <span class="text-red-500">*</span>
                            </label>
                            <input type="number" id="quantity-${newProductIndex}" name="products[${newProductIndex}].quantity" required min="1" value="1" class="w-full p-2 border rounded-md">
                        </div>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label for="unitPrice-${newProductIndex}" class="block text-sm font-medium text-gray-700 mb-1">
                                Unit Price <span class="text-red-500">*</span>
                            </label>
                            <input type="number" id="unitPrice-${newProductIndex}" name="products[${newProductIndex}].unitPrice" required step="0.01" class="w-full p-2 border rounded-md">
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label for="totalPrice-${newProductIndex}" class="block text-sm font-medium text-gray-700 mb-1">
                                Total Price
                            </label>
                            <input type="number" id="totalPrice-${newProductIndex}" name="products[${newProductIndex}].totalPrice" readonly class="w-full p-2 border rounded-md bg-gray-50">
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add the new product to the container
        productContainer.insertAdjacentHTML('beforeend', productHtml);
        
        // Add event listeners to the new product
        const newProduct = productContainer.lastElementChild;
        
        // Remove button
        newProduct.querySelector('.remove-product-btn').addEventListener('click', removeProduct);
        
        // Price calculation
        newProduct.querySelector(`#quantity-${newProductIndex}`).addEventListener('input', updatePrice);
        newProduct.querySelector(`#unitPrice-${newProductIndex}`).addEventListener('input', updatePrice);
        
        // Load manufacturers for the new product
        populateSelectFromApi(
            `manufacturer-${newProductIndex}`,
            '/api/manufacturers',
            'manufacturerId',
            'name'
        );
        
        // Add event listener to load products when manufacturer changes
        const manufacturerSelect = newProduct.querySelector(`#manufacturer-${newProductIndex}`);
        manufacturerSelect.addEventListener('change', async () => {
            const manufacturerId = manufacturerSelect.value;
            if (manufacturerId) {
                await populateSelectFromApi(
                    `productCode-${newProductIndex}`,
                    `/api/manufacturers/${manufacturerId}/products`,
                    'productId',
                    'name',
                    true
                );
            } else {
                const productSelect = document.getElementById(`productCode-${newProductIndex}`);
                productSelect.innerHTML = '<option value="">Select Product</option>';
            }
        });
        
        // Products may auto-fill description, size, and unit price
        const productSelect = newProduct.querySelector(`#productCode-${newProductIndex}`);
        productSelect.addEventListener('change', async () => {
            const productId = productSelect.value;
            if (productId) {
                try {
                    const response = await fetch(`/api/products/${productId}`);
                    const product = await response.json();
                    
                    // Auto-fill fields
                    document.getElementById(`description-${newProductIndex}`).value = product.name;
                    document.getElementById(`size-${newProductIndex}`).value = product.size || '';
                    
                    // Get current price
                    if (product.productPricing && product.productPricing.length > 0) {
                        const currentPrice = product.productPricing[0];
                        document.getElementById(`unitPrice-${newProductIndex}`).value = currentPrice.price;
                        updatePrice.call(document.getElementById(`unitPrice-${newProductIndex}`));
                    }
                } catch (error) {
                    console.error('Error getting product details:', error);
                }
            }
        });
    }
    
    // Remove a product
    function removeProduct() {
        const productItem = this.closest('.product-item');
        if (!productItem) return;
        
        const productContainer = document.getElementById('productContainer');
        
        // Check if it's the last product
        if (productContainer.querySelectorAll('.product-item').length <= 1) {
            alert('You must have at least one product in the order.');
            return;
        }
        
        // Remove the product
        productItem.remove();
        
        // Renumber remaining products
        renumberProducts();
    }
    
    // Renumber products after deletion
    function renumberProducts() {
        const productItems = document.querySelectorAll('.product-item');
        
        productItems.forEach((item, index) => {
            // Update data attribute
            item.dataset.productIndex = index;
            
            // Update input names
            item.querySelectorAll('input, select').forEach(input => {
                const name = input.name.replace(/products\[\d+\]/, `products[${index}]`);
                input.name = name;
                
                // Update IDs
                const id = input.id.replace(/\-\d+$/, `-${index}`);
                input.id = id;
            });
            
            // Update labels
            item.querySelectorAll('label').forEach(label => {
                const forAttr = label.getAttribute('for').replace(/\-\d+$/, `-${index}`);
                label.setAttribute('for', forAttr);
            });
        });
    }
    
    // Update total price
    function updatePrice() {
        const input = this;
        const productIndex = input.id.split('-')[1];
        
        const quantityInput = document.getElementById(`quantity-${productIndex}`);
        const unitPriceInput = document.getElementById(`unitPrice-${productIndex}`);
        const totalPriceInput = document.getElementById(`totalPrice-${productIndex}`);
        
        if (quantityInput && unitPriceInput && totalPriceInput) {
            const quantity = parseFloat(quantityInput.value) || 0;
            const unitPrice = parseFloat(unitPriceInput.value) || 0;
            
            const totalPrice = quantity * unitPrice;
            totalPriceInput.value = totalPrice.toFixed(2);
        }
        
        // Update the order total
        updateOrderTotal();
    }
    
    // Update the order total
    function updateOrderTotal() {
        let orderTotal = 0;
        
        document.querySelectorAll('[id^="totalPrice-"]').forEach(input => {
            orderTotal += parseFloat(input.value) || 0;
        });
        
        const orderTotalElement = document.getElementById('orderTotal');
        if (orderTotalElement) {
            orderTotalElement.textContent = orderTotal.toFixed(2);
        }
    }
    
    // Handle conditional fields visibility
    function setupOrderConditionalFields() {
        // Billing address same as shipping
        const sameAsShipping = document.getElementById('sameAsShipping');
        const billingFields = document.getElementById('billingFields');
        
        if (sameAsShipping && billingFields) {
            sameAsShipping.addEventListener('change', function() {
                billingFields.style.display = this.checked ? 'none' : 'block';
            });
            
            // Initial state
            billingFields.style.display = sameAsShipping.checked ? 'none' : 'block';
        }
    }
    
    // When a step changes, perform any special handling
    function handleOrderStepChange(stepIndex, stepId) {
        // If we're on the review step, generate the summary
        if (stepId === 'order-step5') {
            generateOrderSummary();
        }
    }
    
    // Generate order summary for review
    function generateOrderSummary() {
        const orderSummary = document.getElementById('orderSummary');
        if (!orderSummary) return;
        
        // Basic order info
        const orderNumber = document.getElementById('orderNumber').value;
        const orderDate = document.getElementById('orderDate').value;
        const facilityName = document.getElementById('orderFacilityId').options[document.getElementById('orderFacilityId').selectedIndex]?.text || 'N/A';
        
        // Generate products HTML
        let productsHtml = '';
        document.querySelectorAll('.product-item').forEach(item => {
            const index = item.dataset.productIndex;
            const description = document.getElementById(`description-${index}`).value;
            const size = document.getElementById(`size-${index}`).value;
            const quantity = document.getElementById(`quantity-${index}`).value;
            const unitPrice = document.getElementById(`unitPrice-${index}`).value;
            const totalPrice = document.getElementById(`totalPrice-${index}`).value;
            
            productsHtml += `
                <tr>
                    <td class="p-2 border-b">${description}</td>
                    <td class="p-2 border-b">${size}</td>
                    <td class="p-2 border-b text-center">${quantity}</td>
                    <td class="p-2 border-b text-right">$${parseFloat(unitPrice).toFixed(2)}</td>
                    <td class="p-2 border-b text-right">$${parseFloat(totalPrice).toFixed(2)}</td>
                </tr>
            `;
        });
        
        // Calculate order total
        let orderTotal = 0;
        document.querySelectorAll('[id^="totalPrice-"]').forEach(input => {
            orderTotal += parseFloat(input.value) || 0;
        });
        
        // Generate complete summary
        orderSummary.innerHTML = `
            <div class="mb-6">
                <h4 class="text-lg font-semibold mb-2">Order Details</h4>
                <div class="bg-gray-50 p-4 rounded">
                    <p><strong>Order Number:</strong> ${orderNumber}</p>
                    <p><strong>Order Date:</strong> ${orderDate}</p>
                    <p><strong>Facility:</strong> ${facilityName}</p>
                </div>
            </div>
            
            <div class="mb-6">
                <h4 class="text-lg font-semibold mb-2">Products</h4>
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="bg-gray-50">
                                <th class="p-2 text-left">Description</th>
                                <th class="p-2 text-left">Size</th>
                                <th class="p-2 text-center">Qty</th>
                                <th class="p-2 text-right">Unit Price</th>
                                <th class="p-2 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productsHtml}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" class="p-2 text-right font-semibold">Order Total:</td>
                                <td class="p-2 text-right font-semibold">$${orderTotal.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            
            <div>
                <h4 class="text-lg font-semibold mb-2">Shipping Information</h4>
                <div class="bg-gray-50 p-4 rounded">
                    <p>${document.getElementById('shippingAddressLine1').value}</p>
                    ${document.getElementById('shippingAddressLine2').value ? `<p>${document.getElementById('shippingAddressLine2').value}</p>` : ''}
                    <p>${document.getElementById('shippingCity').value}, ${document.getElementById('shippingState').value} ${document.getElementById('shippingZipCode').value}</p>
                    <strong>Shipping Method:</strong> ${document.getElementById('shippingMethod').options[document.getElementById('shippingMethod').selectedIndex]?.text || 'N/A'}
                </div>
            </div>
        `;
    }
    
    // Validate Order Step 1: Order Information
    function validateOrderStep1() {
        let isValid = true;
        
        isValid = validateField('orderNumber', Validators.required) && isValid;
        isValid = validateField('orderDate', Validators.required) && isValid;
        isValid = validateField('orderRepId', Validators.required) && isValid;
        
        return isValid;
    }
    
    // Validate Order Step 2: Facility Information
    function validateOrderStep2() {
        let isValid = true;
        
        isValid = validateField('orderPracticeId', Validators.required) && isValid;
        isValid = validateField('orderFacilityId', Validators.required) && isValid;
        isValid = validateField('contactName', Validators.required) && isValid;
        isValid = validateField('contactPhone', Validators.required) && isValid;
        
        return isValid;
    }
    
    // Validate Order Step 3: Shipping Information
    function validateOrderStep3() {
        let isValid = true;
        
        isValid = validateField('shippingAddressLine1', Validators.required) && isValid;
        isValid = validateField('shippingCity', Validators.required) && isValid;
        isValid = validateField('shippingState', Validators.required) && isValid;
        isValid = validateField('shippingZipCode', Validators.required) && isValid;
        isValid = validateField('shippingMethod', Validators.required) && isValid;
        
        // Validate billing fields if they're visible
        if (document.getElementById('sameAsShipping') && !document.getElementById('sameAsShipping').checked) {
            isValid = validateField('billingAddressLine1', Validators.required) && isValid;
            isValid = validateField('billingCity', Validators.required) && isValid;
            isValid = validateField('billingState', Validators.required) && isValid;
            isValid = validateField('billingZipCode', Validators.required) && isValid;
        }
        
        return isValid;
    }
    
    // Validate Order Step 4: Products
    function validateOrderStep4() {
        let isValid = true;
        
        // Validate each product
        document.querySelectorAll('.product-item').forEach(item => {
            const index = item.dataset.productIndex;
            
            isValid = validateField(`manufacturer-${index}`, Validators.required) && isValid;
            isValid = validateField(`productCode-${index}`, Validators.required) && isValid;
            isValid = validateField(`description-${index}`, Validators.required) && isValid;
            isValid = validateField(`size-${index}`, Validators.required) && isValid;
            isValid = validateField(`quantity-${index}`, Validators.required) && isValid;
            isValid = validateField(`unitPrice-${index}`, Validators.required) && isValid;
        });
        
        return isValid;
    }
    
    // Validate Order Step 5: Review & Submit
    function validateOrderStep5() {
        return true; // No additional validation needed
    }
    
    // Handle order form submission
    async function handleOrderFormSubmit(formData) {
        try {
            // Show loading state
            const submitButton = document.getElementById('submitOrderForm');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="loading-spinner mr-2"></span>
                Submitting...
            `;
            
            // Send the form data to the server
            const response = await fetch('/api/submit-order', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Show success message
                showAlert('Order submitted successfully!', 'success');
                
                // Optionally redirect to order confirmation
                setTimeout(() => {
                    window.location.href = `/orders/${result.orderId}`;
                }, 2000);
            } else {
                // Show error message
                showAlert(`Error: ${result.message || 'Unknown error'}`, 'error');
                
                // Re-enable submit button
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        } catch (error) {
            console.error('Order submission error:', error);
            showAlert('An error occurred. Please try again.', 'error');
            
            // Re-enable submit button
            const submitButton = document.getElementById('submitOrderForm');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Submit Order';
        }
    }
}