class FormProgress {
  constructor(containerId, steps, currentStep = 0) {
    this.container = document.getElementById(containerId);
    this.steps = steps;
    this.currentStep = currentStep;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = 'form-progress-wrapper';

    const stepsHtml = this.steps.map((step, index) => `
      <div class="form-progress-step ${index <= this.currentStep ? 'active' : ''}" data-step="${index}">
        <button class="step-button ${index <= this.currentStep ? 'active' : ''}" 
                ${index > this.currentStep ? 'disabled' : ''}>
          ${index < this.currentStep ? 
            '<svg class="check-icon" viewBox="0 0 24 24"><path d="M20 6L9 17L4 12"></path></svg>' : 
            `<span class="step-number">${index + 1}</span>`}
        </button>
        <span class="step-label">${step}</span>
        ${index < this.steps.length - 1 ? 
          `<div class="progress-line ${index < this.currentStep ? 'active' : ''}"></div>` : 
          ''}
      </div>
    `).join('');

    wrapper.innerHTML = stepsHtml;
    this.container.innerHTML = '';
    this.container.appendChild(wrapper);

    // Add event listeners
    wrapper.querySelectorAll('.step-button').forEach(button => {
      button.addEventListener('click', (e) => {
        const step = parseInt(e.target.closest('.form-progress-step').dataset.step);
        if (step < this.currentStep) {
          this.setCurrentStep(step);
        }
      });
    });
  }

  setCurrentStep(step) {
    if (step >= 0 && step < this.steps.length) {
      this.currentStep = step;
      this.render();
      // Dispatch custom event
      this.container.dispatchEvent(new CustomEvent('stepChange', { 
        detail: { step: this.currentStep } 
      }));
    }
  }

  next() {
    this.setCurrentStep(this.currentStep + 1);
  }

  previous() {
    this.setCurrentStep(this.currentStep - 1);
  }
} 