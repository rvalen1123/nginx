/**
 * Integrations with n8n and DocuSeal
 * This file contains functions to interact with n8n workflows and DocuSeal forms
 */

// Configuration
const config = {
    n8n: {
        baseUrl: process.env.N8N_URL || 'https://primary-production-bef7.up.railway.app',
        apiKey: process.env.N8N_API_KEY || '',
        webhooks: {
            formSubmission: '/webhook/msc-wound-care/form-submission',
            documentSigned: '/webhook/msc-wound-care/document-signed'
        }
    },
    docuSeal: {
        baseUrl: process.env.DOCUSEAL_URL || 'https://docuseal-railway-production-d8fb.up.railway.app',
        apiKey: process.env.DOCUSEAL_API_KEY || '',
        templates: {
            ivr: 'ivr_forms',
            onboarding: 'onboarding_forms',
            agreement: 'agreements',
            order: 'order_forms'
        }
    }
};

/**
 * Trigger an n8n workflow
 * @param {string} workflowId - The ID of the workflow to trigger
 * @param {Object} data - The data to send to the workflow
 * @returns {Promise<Object>} - The response from n8n
 */
async function triggerN8nWorkflow(workflowId, data) {
    try {
        const response = await fetch(`${config.n8n.baseUrl}/api/v1/workflows/${workflowId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-N8N-API-KEY': config.n8n.apiKey
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`n8n API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error triggering n8n workflow:', error);
        throw error;
    }
}

/**
 * Send a webhook to n8n
 * @param {string} webhookPath - The path of the webhook
 * @param {Object} data - The data to send to the webhook
 * @returns {Promise<Object>} - The response from n8n
 */
async function sendN8nWebhook(webhookPath, data) {
    try {
        const response = await fetch(`${config.n8n.baseUrl}${webhookPath}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`n8n webhook error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error sending n8n webhook:', error);
        throw error;
    }
}

/**
 * Get DocuSeal templates
 * @returns {Promise<Array>} - Array of templates
 */
async function getDocuSealTemplates() {
    try {
        const response = await fetch(`${config.docuSeal.baseUrl}/api/templates`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${config.docuSeal.apiKey}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`DocuSeal API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error getting DocuSeal templates:', error);
        throw error;
    }
}

/**
 * Create a DocuSeal submission
 * @param {string} templateId - The ID of the template
 * @param {Object} data - The data to prefill in the template
 * @returns {Promise<Object>} - The response from DocuSeal
 */
async function createDocuSealSubmission(templateId, data) {
    try {
        const response = await fetch(`${config.docuSeal.baseUrl}/api/templates/${templateId}/submissions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.docuSeal.apiKey}`
            },
            body: JSON.stringify({
                submitter: {
                    email: data.email,
                    name: data.name
                },
                fields: data.fields || {}
            })
        });
        
        if (!response.ok) {
            throw new Error(`DocuSeal API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating DocuSeal submission:', error);
        throw error;
    }
}

/**
 * Load a DocuSeal form in an iframe
 * @param {string} templateId - The ID of the template
 * @param {string} containerId - The ID of the container element
 * @param {Object} prefillData - Data to prefill in the form
 */
function loadDocuSealEmbed(templateId, containerId, prefillData = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = `${config.docuSeal.baseUrl}/embed/templates/${templateId}`;
    iframe.style.width = '100%';
    iframe.style.height = '800px';
    iframe.style.border = 'none';
    
    // Add message listener for communication with iframe
    window.addEventListener('message', (event) => {
        if (event.origin !== config.docuSeal.baseUrl) return;
        
        if (event.data.type === 'docuseal:submit') {
            // Notify backend of submission
            sendN8nWebhook(config.n8n.webhooks.documentSigned, event.data);
        }
    });
    
    // Add prefill data if provided
    if (Object.keys(prefillData).length > 0) {
        const prefillParam = encodeURIComponent(JSON.stringify(prefillData));
        iframe.src += `?prefill=${prefillParam}`;
    }
    
    container.appendChild(iframe);
}

/**
 * Handle form submission with n8n integration
 * @param {string} formType - The type of form (ivr, onboarding, agreement, order)
 * @param {FormData} formData - The form data
 * @returns {Promise<Object>} - The response from the backend
 */
async function handleFormSubmissionWithIntegration(formType, formData) {
    try {
        // First, submit the form to our backend
        const response = await fetch(`/api/submit-${formType}`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        // Then, trigger n8n workflow
        const formDataObj = {};
        formData.forEach((value, key) => {
            formDataObj[key] = value;
        });
        
        await sendN8nWebhook(config.n8n.webhooks.formSubmission, {
            formType,
            documentId: result.documentId,
            formData: formDataObj
        });
        
        return result;
    } catch (error) {
        console.error('Error handling form submission with integration:', error);
        throw error;
    }
}

// Export functions
window.Integrations = {
    triggerN8nWorkflow,
    sendN8nWebhook,
    getDocuSealTemplates,
    createDocuSealSubmission,
    loadDocuSealEmbed,
    handleFormSubmissionWithIntegration
};
