/**
 * MSC Wound Care Portal - IVR Form Specific Functionality
 * Extends the core form-handler.js with IVR-specific features
 * Version 1.0.0
 */

document.addEventListener('DOMContentLoaded', function() {
  // Initialize IVR form specific functionality
  initIVRForm();
});

/**
 * Initialize IVR form specific functionality
 */
function initIVRForm() {
  // Get the IVR form
  const ivrForm = document.getElementById('ivrForm');
  if (!ivrForm) return;
  
  // Fetch manufacturers for dropdown
  fetchManufacturers();
  
  // Fetch sales reps for dropdown
  fetchSalesReps();
  
  // Add steps 3 and 4 that were not included in the HTML
  addMissingSteps();
  
  // Set up any IVR-specific validation rules
  setupIVRValidation();
}

/**
 * Fetch manufacturers for the dropdown
 */
function fetchManufacturers() {
  fetch('api/manufacturers')
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById('manufacturer');
      if (!select) return;
      
      // Clear existing options except the first one
      while (select.options.length > 1) {
        select.remove(1);
      }
      
      // Add new options
      data.forEach(manufacturer => {
        const option = document.createElement('option');
        option.value = manufacturer.manufacturerId;
        option.textContent = manufacturer.name;
        select.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error loading manufacturers:', error);
      showAlert('Failed to load manufacturers. Please try again later.', 'danger');
    });
}

/**
 * Fetch sales reps for the dropdown
 */
function fetchSalesReps() {
  fetch('api/users?role=REP')
    .then(response => response.json())
    .then(data => {
      const select = document.getElementById('sales_rep');
      if (!select) return;
      
      // Clear existing options except the first one
      while (select.options.length > 1) {
        select.remove(1);
      }
      
      // Add new options
      data.forEach(rep => {
        const option = document.createElement('option');
        option.value = rep.userId;
        option.textContent = rep.name;
        select.appendChild(option);
      });
    })
    .catch(error => {
      console.error('Error loading sales reps:', error);
      showAlert('Failed to load sales representatives. Please try again later.', 'danger');
    });
}

/**
 * Add missing steps 3 and 4 to the form
 */
function addMissingSteps() {
  const ivrForm = document.getElementById('ivrForm');
  if (!ivrForm) return;
  
  // Check if steps 3 and 4 already exist
  if (ivrForm.querySelector('.form-step[data-step="3"]') && 
      ivrForm.querySelector('.form-step[data-step="4"]')) {
    return;
  }
  
  // Get step 2 to insert after
  const step2 = ivrForm.querySelector('.form-step[data-step="2"]');
  if (!step2) return;
  
  // Create step 3: Provider & Facility Information
  const step3 = document.createElement('div');
  step3.className = 'form-step';
  step3.dataset.step = '3';
  
  step3.innerHTML = `
    <div class="form-section">
      <div class="form-section-title">Provider Information</div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label for="provider_name">Provider Name <span class="text-danger">*</span></label>
            <input type="text" id="provider_name" name="providerInfo.providerName" class="form-control" required>
            <div class="invalid-feedback">Please enter the provider's name</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label for="provider_npi">Provider NPI <span class="text-danger">*</span></label>
            <input type="text" id="provider_npi" name="providerInfo.providerNPI" class="form-control" required>
            <div class="invalid-feedback">Please enter the provider's NPI</div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label for="provider_specialty">Provider Specialty</label>
            <input type="text" id="provider_specialty" name="providerInfo.providerSpecialty" class="form-control">
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label for="provider_phone">Provider Phone <span class="text-danger">*</span></label>
            <input type="tel" id="provider_phone" name="providerInfo.providerPhone" class="form-control" required>
            <div class="invalid-feedback">Please enter the provider's phone number</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="form-section">
      <div class="form-section-title">Facility Information</div>
      
      <div class="row">
        <div class="col-12">
          <div class="form-group">
            <label for="facility_name">Facility Name <span class="text-danger">*</span></label>
            <input type="text" id="facility_name" name="facilityInfo.facilityName" class="form-control" required>
            <div class="invalid-feedback">Please enter the facility name</div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-12">
          <div class="form-group">
            <label for="facility_address">Facility Address <span class="text-danger">*</span></label>
            <input type="text" id="facility_address" name="facilityInfo.facilityAddress" class="form-control" required>
            <div class="invalid-feedback">Please enter the facility address</div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-4">
          <div class="form-group">
            <label for="facility_city">City <span class="text-danger">*</span></label>
            <input type="text" id="facility_city" name="facilityInfo.facilityCity" class="form-control" required>
            <div class="invalid-feedback">Please enter the city</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="form-group">
            <label for="facility_state">State <span class="text-danger">*</span></label>
            <input type="text" id="facility_state" name="facilityInfo.facilityState" class="form-control" required>
            <div class="invalid-feedback">Please enter the state</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="form-group">
            <label for="facility_zip">ZIP Code <span class="text-danger">*</span></label>
            <input type="text" id="facility_zip" name="facilityInfo.facilityZip" class="form-control" required>
            <div class="invalid-feedback">Please enter the ZIP code</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row mt-4">
      <div class="col-md-6">
        <button type="button" class="btn btn-secondary" data-action="back">Back</button>
      </div>
      <div class="col-md-6">
        <button type="button" class="btn btn-primary" data-action="next">Continue to Wound & Product</button>
      </div>
    </div>
  `;
  
  // Create step 4: Wound & Product Information
  const step4 = document.createElement('div');
  step4.className = 'form-step';
  step4.dataset.step = '4';
  
  step4.innerHTML = `
    <div class="form-section">
      <div class="form-section-title">Wound Information</div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label for="wound_location">Wound Location <span class="text-danger">*</span></label>
            <input type="text" id="wound_location" name="woundInfo.woundLocation" class="form-control" required>
            <div class="invalid-feedback">Please enter the wound location</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label for="wound_type">Wound Type <span class="text-danger">*</span></label>
            <select id="wound_type" name="woundInfo.woundType" class="form-control" required>
              <option value="">Select Wound Type</option>
              <option value="diabetic_ulcer">Diabetic Ulcer</option>
              <option value="pressure_ulcer">Pressure Ulcer</option>
              <option value="venous_ulcer">Venous Ulcer</option>
              <option value="arterial_ulcer">Arterial Ulcer</option>
              <option value="surgical_wound">Surgical Wound</option>
              <option value="traumatic_wound">Traumatic Wound</option>
              <option value="other">Other</option>
            </select>
            <div class="invalid-feedback">Please select a wound type</div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-4">
          <div class="form-group">
            <label for="wound_length">Length (cm) <span class="text-danger">*</span></label>
            <input type="number" id="wound_length" name="woundInfo.woundLength" class="form-control" step="0.1" min="0" required>
            <div class="invalid-feedback">Please enter the wound length</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="form-group">
            <label for="wound_width">Width (cm) <span class="text-danger">*</span></label>
            <input type="number" id="wound_width" name="woundInfo.woundWidth" class="form-control" step="0.1" min="0" required>
            <div class="invalid-feedback">Please enter the wound width</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="form-group">
            <label for="wound_depth">Depth (cm)</label>
            <input type="number" id="wound_depth" name="woundInfo.woundDepth" class="form-control" step="0.1" min="0">
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label for="wound_duration">Duration <span class="text-danger">*</span></label>
            <div class="row">
              <div class="col-6">
                <input type="number" id="wound_duration" name="woundInfo.woundDuration" class="form-control" min="1" required>
                <div class="invalid-feedback">Please enter the duration</div>
              </div>
              <div class="col-6">
                <select id="wound_duration_unit" name="woundInfo.woundDurationUnit" class="form-control" required>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label for="wound_stage">Wound Stage/Grade</label>
            <select id="wound_stage" name="woundInfo.woundStage" class="form-control">
              <option value="">Select Stage/Grade (if applicable)</option>
              <option value="stage_1">Stage I</option>
              <option value="stage_2">Stage II</option>
              <option value="stage_3">Stage III</option>
              <option value="stage_4">Stage IV</option>
              <option value="unstageable">Unstageable</option>
              <option value="suspected_dti">Suspected Deep Tissue Injury</option>
              <option value="not_applicable">Not Applicable</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <div class="form-section">
      <div class="form-section-title">Product Information</div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label for="product_name">Product Name <span class="text-danger">*</span></label>
            <input type="text" id="product_name" name="productInfo.productName" class="form-control" required>
            <div class="invalid-feedback">Please enter the product name</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label for="product_size">Product Size <span class="text-danger">*</span></label>
            <input type="text" id="product_size" name="productInfo.productSize" class="form-control" required>
            <div class="invalid-feedback">Please enter the product size</div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-md-6">
          <div class="form-group">
            <label for="product_quantity">Quantity <span class="text-danger">*</span></label>
            <input type="number" id="product_quantity" name="productInfo.productQuantity" class="form-control" min="1" required>
            <div class="invalid-feedback">Please enter the quantity</div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-group">
            <label for="application_frequency">Application Frequency <span class="text-danger">*</span></label>
            <select id="application_frequency" name="productInfo.applicationFrequency" class="form-control" required>
              <option value="">Select Frequency</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
              <option value="other">Other</option>
            </select>
            <div class="invalid-feedback">Please select an application frequency</div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-12">
          <div class="form-group">
            <label for="treatment_notes">Treatment Notes</label>
            <textarea id="treatment_notes" name="productInfo.treatmentNotes" class="form-control" rows="3"></textarea>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row mt-4">
      <div class="col-md-6">
        <button type="button" class="btn btn-secondary" data-action="back">Back</button>
      </div>
      <div class="col-md-6">
        <button type="button" class="btn btn-primary" data-action="next">Continue to Documents</button>
      </div>
    </div>
  `;
  
  // Insert steps after step 2
  step2.insertAdjacentElement('afterend', step3);
  step3.insertAdjacentElement('afterend', step4);
  
  // Re-initialize multi-step navigation
  setupMultiStepNavigation(ivrForm);
}

/**
 * Set up IVR-specific validation rules
 */
function setupIVRValidation() {
  const ivrForm = document.getElementById('ivrForm');
  if (!ivrForm) return;
  
  // Add validation for NPI number
  const npiInput = ivrForm.querySelector('#provider_npi');
  if (npiInput) {
    npiInput.addEventListener('blur', function() {
      // NPI is a 10-digit number
      const isValid = /^\d{10}$/.test(this.value);
      
      if (isValid) {
        this.classList.remove('is-invalid');
      } else {
        this.classList.add('is-invalid');
        const feedback = this.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
          feedback.textContent = 'Please enter a valid 10-digit NPI number';
        }
      }
    });
  }
  
  // Add validation for wound measurements
  const woundLengthInput = ivrForm.querySelector('#wound_length');
  const woundWidthInput = ivrForm.querySelector('#wound_width');
  
  if (woundLengthInput && woundWidthInput) {
    // Calculate wound area when either dimension changes
    const calculateArea = function() {
      const length = parseFloat(woundLengthInput.value) || 0;
      const width = parseFloat(woundWidthInput.value) || 0;
      
      if (length > 0 && width > 0) {
        const area = length * width;
        
        // You could display this somewhere or use it for validation
        console.log(`Wound area: ${area.toFixed(2)} cm²`);
        
        // Example: Add a data attribute with the calculated area
        woundLengthInput.closest('.form-section').dataset.woundArea = area.toFixed(2);
      }
    };
    
    woundLengthInput.addEventListener('input', calculateArea);
    woundWidthInput.addEventListener('input', calculateArea);
  }
}
