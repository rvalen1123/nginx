/**
 * Server-side integrations with n8n and DocuSeal
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const express = require('express');

// Configuration from environment variables
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
            ivr: process.env.DOCUSEAL_IVR_TEMPLATE_ID,
            onboarding: process.env.DOCUSEAL_ONBOARDING_TEMPLATE_ID,
            agreement: process.env.DOCUSEAL_AGREEMENT_TEMPLATE_ID,
            order: process.env.DOCUSEAL_ORDER_TEMPLATE_ID
        },
        projectId: process.env.DOCUSEAL_PROJECT_ID,
        serviceId: process.env.DOCUSEAL_SERVICE_ID
    }
};

/**
 * Initialize the integrations module
 * @param {Object} app - Express app instance
 * @param {Object} prisma - Prisma client instance
 */
function initIntegrations(app, prisma) {
    // Add middleware to parse JSON
    app.use(express.json());
    
    // Add DocuSeal webhook endpoint
    app.post('/api/webhooks/docuseal', async (req, res) => {
        try {
            const { event, data } = req.body;
            
            // Validate webhook signature if DocuSeal provides one
            // This is a security best practice
            
            console.log(`Received DocuSeal webhook: ${event}`);
            
            // Handle different event types
            switch (event) {
                case 'submission.completed':
                    await handleDocuSealSubmissionCompleted(data, prisma);
                    break;
                case 'submission.opened':
                    await handleDocuSealSubmissionOpened(data, prisma);
                    break;
                default:
                    console.log(`Unhandled DocuSeal event: ${event}`);
            }
            
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error handling DocuSeal webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    // Add n8n webhook endpoint
    app.post('/api/webhooks/n8n', async (req, res) => {
        try {
            const { event, data } = req.body;
            
            console.log(`Received n8n webhook: ${event}`);
            
            // Handle different event types
            switch (event) {
                case 'workflow.completed':
                    await handleN8nWorkflowCompleted(data, prisma);
                    break;
                default:
                    console.log(`Unhandled n8n event: ${event}`);
            }
            
            res.status(200).json({ success: true });
        } catch (error) {
            console.error('Error handling n8n webhook:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    });
    
    console.log('Integrations initialized');
}

/**
 * Handle DocuSeal submission completed event
 * @param {Object} data - Event data
 * @param {Object} prisma - Prisma client instance
 */
async function handleDocuSealSubmissionCompleted(data, prisma) {
    try {
        // Get submission details
        const submissionId = data.submission_id;
        const submission = await getDocuSealSubmission(submissionId);
        
        // Determine form type from template
        const templateId = submission.template_id;
        const formType = getFormTypeFromTemplateId(templateId);
        
        // Trigger n8n workflow
        await triggerN8nWorkflow('docuseal-submission-completed', {
            submissionId,
            formType,
            submission
        });
        
        // Update document status in database if we have a document ID
        if (submission.metadata && submission.metadata.documentId) {
            await updateDocumentStatus(
                submission.metadata.documentId, 
                'completed',
                prisma
            );
        }
        
        console.log(`DocuSeal submission ${submissionId} processed`);
    } catch (error) {
        console.error('Error handling DocuSeal submission completed:', error);
        throw error;
    }
}

/**
 * Handle DocuSeal submission opened event
 * @param {Object} data - Event data
 * @param {Object} prisma - Prisma client instance
 */
async function handleDocuSealSubmissionOpened(data, prisma) {
    try {
        // Get submission details
        const submissionId = data.submission_id;
        const submission = await getDocuSealSubmission(submissionId);
        
        // Trigger n8n workflow
        await triggerN8nWorkflow('docuseal-submission-opened', {
            submissionId,
            submission
        });
        
        // Update document status in database if we have a document ID
        if (submission.metadata && submission.metadata.documentId) {
            await updateDocumentStatus(
                submission.metadata.documentId, 
                'viewed',
                prisma
            );
        }
        
        console.log(`DocuSeal submission ${submissionId} opened`);
    } catch (error) {
        console.error('Error handling DocuSeal submission opened:', error);
        throw error;
    }
}

/**
 * Handle n8n workflow completed event
 * @param {Object} data - Event data
 * @param {Object} prisma - Prisma client instance
 */
async function handleN8nWorkflowCompleted(data, prisma) {
    try {
        const { workflowId, executionId, result } = data;
        
        console.log(`n8n workflow ${workflowId} completed with execution ${executionId}`);
        
        // Handle specific workflows
        if (workflowId === 'form-submission-processor') {
            await handleFormSubmissionProcessed(result, prisma);
        }
    } catch (error) {
        console.error('Error handling n8n workflow completed:', error);
        throw error;
    }
}

/**
 * Handle form submission processed by n8n
 * @param {Object} result - Workflow result
 * @param {Object} prisma - Prisma client instance
 */
async function handleFormSubmissionProcessed(result, prisma) {
    try {
        const { documentId, formType, status } = result;
        
        // Update document status in database
        await updateDocumentStatus(documentId, status, prisma);
        
        console.log(`Form submission ${documentId} processed with status: ${status}`);
    } catch (error) {
        console.error('Error handling form submission processed:', error);
        throw error;
    }
}

/**
 * Get form type from template ID
 * @param {string} templateId - DocuSeal template ID
 * @returns {string} - Form type
 */
function getFormTypeFromTemplateId(templateId) {
    const templates = config.docuSeal.templates;
    
    for (const [type, id] of Object.entries(templates)) {
        if (id === templateId) {
            return type;
        }
    }
    
    return 'unknown';
}

/**
 * Update document status in database
 * @param {string} documentId - Document ID
 * @param {string} status - New status
 * @param {Object} prisma - Prisma client instance
 */
async function updateDocumentStatus(documentId, status, prisma) {
    try {
        // Update document status in database
        await prisma.documents.update({
            where: { documentId },
            data: { status }
        });
        
        console.log(`Document ${documentId} status updated to ${status}`);
    } catch (error) {
        console.error('Error updating document status:', error);
        throw error;
    }
}

/**
 * Get DocuSeal submission
 * @param {string} submissionId - Submission ID
 * @returns {Promise<Object>} - Submission data
 */
async function getDocuSealSubmission(submissionId) {
    try {
        const response = await axios.get(
            `${config.docuSeal.baseUrl}/api/submissions/${submissionId}`,
            {
                headers: {
                    'Authorization': `Bearer ${config.docuSeal.apiKey}`
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error getting DocuSeal submission:', error);
        throw error;
    }
}

/**
 * Create DocuSeal submission
 * @param {string} templateId - Template ID
 * @param {Object} data - Submission data
 * @returns {Promise<Object>} - Created submission
 */
async function createDocuSealSubmission(templateId, data) {
    try {
        const response = await axios.post(
            `${config.docuSeal.baseUrl}/api/templates/${templateId}/submissions`,
            {
                submitter: {
                    email: data.email,
                    name: data.name
                },
                fields: data.fields || {},
                metadata: data.metadata || {}
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config.docuSeal.apiKey}`
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error creating DocuSeal submission:', error);
        throw error;
    }
}

/**
 * Trigger n8n workflow
 * @param {string} workflowId - Workflow ID
 * @param {Object} data - Workflow data
 * @returns {Promise<Object>} - Workflow execution result
 */
async function triggerN8nWorkflow(workflowId, data) {
    try {
        const response = await axios.post(
            `${config.n8n.baseUrl}/api/v1/workflows/${workflowId}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-N8N-API-KEY': config.n8n.apiKey
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error triggering n8n workflow:', error);
        throw error;
    }
}

/**
 * Send webhook to n8n
 * @param {string} webhookPath - Webhook path
 * @param {Object} data - Webhook data
 * @returns {Promise<Object>} - Webhook response
 */
async function sendN8nWebhook(webhookPath, data) {
    try {
        const response = await axios.post(
            `${config.n8n.baseUrl}${webhookPath}`,
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error sending n8n webhook:', error);
        throw error;
    }
}

module.exports = {
    initIntegrations,
    createDocuSealSubmission,
    triggerN8nWorkflow,
    sendN8nWebhook,
    getDocuSealSubmission
};
