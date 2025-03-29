// AI Agent Implementation for MSC Wound Care
// This code would be used in an n8n "Function" node to process user messages
// and generate appropriate AI responses with form actions

/**
 * Main function to process user input and generate AI responses
 * @param {Object} input - The input data from the webhook
 * @param {string} input.message - The user's message
 * @param {Object} input.formContext - Current form context (if any)
 * @param {string} input.sessionId - Session identifier
 * @returns {Object} - The AI response with any form actions
 */
function processAIRequest(input) {
    // Extract input data
    const userMessage = input.message;
    const formContext = input.formContext || {};
    const sessionId = input.sessionId || `session_${Date.now()}`;
    
    // Prepare system prompt based on context
    const systemPrompt = createSystemPrompt(formContext);
    
    // Call the AI model (Claude in this case, via n8n's Anthropic node)
    // This would be handled by a separate node in n8n
    
    // For simulation, let's create a response handler function
    function handleAIResponse(aiResponse) {
      // Process the response to extract any form actions
      const formActions = extractFormActions(aiResponse, formContext);
      
      // Return the final response
      return {
        message: aiResponse,
        formActions,
        sessionId,
        timestamp: new Date().toISOString()
      };
    }
    
    // In actual implementation, this would be the response from the AI model
    // being passed to the handler
    return { 
      systemPrompt,
      userMessage,
      formContext,
      sessionId
    };
  }
  
  /**
   * Creates a tailored system prompt based on the current form context
   * @param {Object} formContext - The current form context
   * @returns {string} - The system prompt for the AI model
   */
  function createSystemPrompt(formContext) {
    let basePrompt = `You are an AI assistant for MSC Wound Care, specializing in helping healthcare providers complete forms for wound care products, insurance verification, and customer onboarding.
  
  You have access to the following forms:
  1. Customer Onboarding Form - For establishing new accounts with wound care manufacturers
  2. Insurance Verification Request Form - For checking patient insurance coverage
  3. Order Form - For ordering wound care products
  
  When responding to a user, provide helpful, specific guidance. You can suggest appropriate values for form fields, explain what information is needed, and help troubleshoot common issues.
  
  For wound care products, you understand common treatments like advanced dressings, negative pressure wound therapy, cellular and tissue-based products, and compression therapy. You can explain insurance requirements and coding considerations for these products.
  
  Keep responses concise, professional, and supportive. Use medical terminology when appropriate but explain concepts clearly. Remember that patients' protected health information (PHI) must be handled securely.`;
  
    // If we have form context, add specifics about the current form
    if (formContext && formContext.formType) {
      basePrompt += `\n\nThe user is currently working with the ${formContext.formType} form.`;
      
      // Add form-specific context
      switch (formContext.formType) {
        case 'onboarding':
          basePrompt += `\n
  This form is used to establish new accounts with wound care product manufacturers. 
  Key fields include:
  - Provider information (name, credentials, NPI, tax ID)
  - Practice/facility information (name, address, specialty)
  - Agreement to manufacturer terms and conditions
  
  You can help with:
  - Explaining what various credentials mean (MD, DO, DPM, etc.)
  - Clarifying the difference between individual and group NPIs
  - Explaining what ISO and GPO affiliations are
  - Helping select appropriate facility types and specialties`;
          break;
          
        case 'insurance-verification':
          basePrompt += `\n
  This form is used to verify patient insurance coverage for wound care products.
  Key fields include:
  - Patient information (name, DOB, address, phone)
  - Insurance information (primary/secondary, policy numbers, etc.)
  - Wound information (type, location, size, duration)
  - Provider information
  - Product selection
  
  You can help with:
  - Explaining what documents are needed for verification
  - Clarifying insurance terms and coverage requirements
  - Explaining coverage criteria for specific wound types
  - Suggesting appropriate product categories for specific wounds`;
          break;
          
        case 'order':
          basePrompt += `\n
  This form is used to order wound care products.
  Key fields include:
  - Order information (order number, PO number, date)
  - Facility information
  - Shipping details
  - Product selection (with sizes, quantities)
  
  You can help with:
  - Explaining what a PO number is
  - Clarifying shipping options
  - Suggesting appropriate products for different wound types
  - Explaining product sizing guidelines`;
          break;
      }
      
      // If we have partial form data, include field-specific context
      if (formContext.formData && Object.keys(formContext.formData).length > 0) {
        basePrompt += `\n\nThe user has already filled out the following information:\n`;
        
        // Include up to 5 key fields to avoid making the prompt too long
        const fields = Object.entries(formContext.formData);
        const fieldsToInclude = fields.slice(0, 5);
        
        fieldsToInclude.forEach(([key, value]) => {
          if (value && value.toString().trim() !== '') {
            basePrompt += `- ${formatFieldName(key)}: ${value}\n`;
          }
        });
        
        if (fields.length > 5) {
          basePrompt += `- ... and ${fields.length - 5} more fields\n`;
        }
      }
    }
    
    return basePrompt;
  }
  
  /**
   * Formats field names to be more human-readable
   * @param {string} fieldName - The raw field name from the form
   * @returns {string} - Human-readable field name
   */
  function formatFieldName(fieldName) {
    return fieldName
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  /**
   * Extracts form actions from the AI response
   * @param {string} aiResponse - The raw AI response
   * @param {Object} formContext - The current form context
   * @returns {Object|null} - Form actions to be executed, or null if none
   */
  function extractFormActions(aiResponse, formContext) {
    // Initialize actions object
    let formActions = null;
    
    // Check for field suggestions
    // Pattern: "I suggest using [value] for the [field name]" or similar patterns
    const fieldSuggestionPatterns = [
      /I suggest (?:using|entering|putting) ["'](.+?)["'] (?:for|in) the (.+?)(?:\s|\.|\,)/i,
      /The (.+?) should be ["'](.+?)["']/i,
      /Enter ["'](.+?)["'] (?:for|in) the (.+?)(?:\s|\.|\,)/i,
      /fill (?:in |out )?(?:the )?(.+?) with ["'](.+?)["']/i
    ];
    
    for (const pattern of fieldSuggestionPatterns) {
      const match = aiResponse.match(pattern);
      if (match) {
        // Extract the suggested value and field name
        // Note: Some patterns capture field first, value second and vice versa
        const [field, value] = pattern === fieldSuggestionPatterns[0] || pattern === fieldSuggestionPatterns[2] 
          ? [match[2], match[1]] 
          : [match[1], match[2]];
        
        // Convert to field ID
        const fieldId = field
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        
        formActions = {
          fillField: {
            formId: formContext.formType === 'onboarding' ? 'onboardingForm' : 
                   formContext.formType === 'insurance-verification' ? 'ivrForm' : 'orderForm',
            fieldId: fieldId,
            value: value
          }
        };
        
        break;
      }
    }
    
    // Check for navigation suggestions
    // Pattern: "You should go to [form name]" or similar
    const navigationPatterns = [
      /You should (?:go|navigate) to the (.+?)(?:\s|\.|\,|form)/i,
      /I recommend (?:using|checking) the (.+?)(?:\s|\.|\,|form)/i,
      /Switch to the (.+?)(?:\s|\.|\,|form)/i
    ];
    
    for (const pattern of navigationPatterns) {
      const match = aiResponse.match(pattern);
      if (match) {
        const formName = match[1].toLowerCase().trim();
        
        let url = '/';
        if (formName.includes('onboarding')) {
          url = '/onboarding.html';
        } else if (formName.includes('insurance') || formName.includes('verification') || formName.includes('ivr')) {
          url = '/insurance-verification.html';
        } else if (formName.includes('order')) {
          url = '/order-form.html';
        } else if (formName.includes('product') || formName.includes('education')) {
          url = '/product-education.html';
        }
        
        formActions = formActions || {};
        formActions.navigate = { url };
        
        break;
      }
    }
    
    // Check for help text suggestions
    // Pattern: "Here's more information about [field]" or similar
    const helpPatterns = [
      /(?:Here's|Here is) more information about the (.+?)[:|\s|\.|\,]/i,
      /The (.+?) field is used to (.+?)(?:\.|\,)/i
    ];
    
    for (const pattern of helpPatterns) {
      const match = aiResponse.match(pattern);
      if (match) {
        const fieldName = match[1].toLowerCase().trim();
        
        // Convert to field ID
        const fieldId = fieldName
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        
        // Extract the help text - this could be more sophisticated
        const helpText = pattern === helpPatterns[0]
          ? aiResponse.split(match[0])[1].trim().split('.')[0] + '.'
          : match[2] + '.';
        
        formActions = formActions || {};
        formActions.showHelp = {
          fieldId,
          helpText
        };
        
        break;
      }
    }
    
    return formActions;
  }
  
  // Export for n8n function node
  module.exports = {
    processAIRequest,
    createSystemPrompt,
    extractFormActions
  };
  
  // Example usage in n8n function node:
  // ===================================
  // const { processAIRequest } = require('ai-agent');
  // 
  // // Get input data from previous node
  // const input = {
  //   message: $input.item.json.message,
  //   formContext: $input.item.json.formContext,
  //   sessionId: $input.item.json.sessionId
  // };
  // 
  // // Process the request
  // const result = processAIRequest(input);
  // 
  // // Return the result for the next node
  // return {
  //   json: result
  // };