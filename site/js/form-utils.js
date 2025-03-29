/**
 * Form Utilities for MSC Wound Care Forms
 * Provides common JavaScript functionality for form handling
 */

/**
 * Initialize a signature pad
 * @param {string} canvasId - ID of the canvas element
 * @param {string} hiddenInputId - ID of the hidden input to store signature data
 */
const initSignaturePad = (canvasId, hiddenInputId) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  
  // Set canvas dimensions
  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Set line style
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000';
  };
  
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Drawing event handlers
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    lastX = currentX;
    lastY = currentY;
  });
  
  canvas.addEventListener('mouseup', () => {
    isDrawing = false;
    updateHiddenInput();
  });
  
  canvas.addEventListener('mouseleave', () => {
    if (isDrawing) {
      isDrawing = false;
      updateHiddenInput();
    }
  });
  
  // Touch events for mobile
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    lastX = touch.clientX - rect.left;
    lastY = touch.clientY - rect.top;
    isDrawing = true;
  });
  
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(currentX, currentY);
    ctx.stroke();
    
    lastX = currentX;
    lastY = currentY;
  });
  
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    isDrawing = false;
    updateHiddenInput();
  });
  
  // Update hidden input with canvas data
  const updateHiddenInput = () => {
    const hiddenInput = document.getElementById(hiddenInputId);
    if (hiddenInput) {
      hiddenInput.value = canvas.toDataURL();
    }
  };
};

/**
 * Clear a signature pad
 * @param {string} canvasId - ID of the canvas element
 * @param {string} hiddenInputId - ID of the hidden input
 */
const clearSignature = (canvasId, hiddenInputId) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const hiddenInput = document.getElementById(hiddenInputId);
  if (hiddenInput) {
    hiddenInput.value = '';
  }
};

// If running in a browser context, add to the window object
if (typeof window !== 'undefined') {
  window.initSignaturePad = initSignaturePad;
  window.clearSignature = clearSignature;
}

// If in Node.js, export the functions
if (typeof module !== 'undefined') {
  module.exports = {
    initSignaturePad,
    clearSignature
  };
}
