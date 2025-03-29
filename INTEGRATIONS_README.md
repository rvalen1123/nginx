# MSC Wound Care Portal Integrations

This document explains how to set up and use the integrations with n8n and DocuSeal for the MSC Wound Care Portal.

## Overview

The MSC Wound Care Portal integrates with two external services:

1. **n8n** - A workflow automation tool that allows you to create workflows for form processing, notifications, and more.
2. **DocuSeal** - A document management tool that allows you to create, sign, and manage documents.

These integrations enable automated workflows for form submissions, document signing, and more.

## Setup

### Environment Variables

The following environment variables need to be set in your `.env` file:

```
# n8n Integration
N8N_URL=https://primary-production-bef7.up.railway.app
N8N_API_KEY=your-n8n-api-key
N8N_ENCRYPTION_KEY=j_IOl7Rdwmm*FRi_jrKFbieN_bYhXh5s
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=password
WEBHOOK_URL=https://primary-production-bef7.up.railway.app
N8N_EDITOR_BASE_URL=https://primary-production-bef7.up.railway.app
N8N_PORT=5678

# DocuSeal Integration
DOCUSEAL_URL=https://docuseal-railway-production-d8fb.up.railway.app
DOCUSEAL_API_KEY=your-docuseal-api-key
DOCUSEAL_IVR_TEMPLATE_ID=ivr_forms
DOCUSEAL_ONBOARDING_TEMPLATE_ID=onboarding_forms
DOCUSEAL_AGREEMENT_TEMPLATE_ID=agreements
DOCUSEAL_ORDER_TEMPLATE_ID=order_forms
DOCUSEAL_SECRET_KEY_BASE=docuseal-secret-key
DOCUSEAL_PROJECT_ID=15051973-727e-46e2-8188-cf053238698e
DOCUSEAL_SERVICE_ID=745a1146-a8da-4997-b9ba-6658c5c2cfc0
```

### Docker Compose

The `docker-compose.yml` file includes services for the frontend, backend, and n8n. You can start them with:

```bash
docker-compose up -d
```

This will start the following services:
- Frontend (Nginx)
- Backend (Node.js)
- n8n

## n8n Integration

### Accessing n8n

n8n is hosted on Railway at:

```
https://primary-production-bef7.up.railway.app
```

For local development, you can access n8n at:

```
http://localhost:5678
```

Use the credentials specified in your `.env` file:
- Username: `N8N_BASIC_AUTH_USER` (default: admin)
- Password: `N8N_BASIC_AUTH_PASSWORD` (default: password)

### Creating Workflows

In n8n, you can create workflows for:

1. **Form Submission Processing** - Process form submissions from the MSC Wound Care Portal
2. **Document Signing** - Process document signing events from DocuSeal
3. **Notifications** - Send notifications to users when forms are submitted or documents are signed

Example workflow for form submission processing:

1. Create a new workflow in n8n
2. Add a "Webhook" trigger node
3. Configure the webhook to listen for POST requests at `/webhook/msc-wound-care/form-submission`
4. Add nodes to process the form data (e.g., send emails, update database, etc.)
5. Activate the workflow

## DocuSeal Integration

### Accessing DocuSeal

DocuSeal is hosted on Railway at:

```
https://docuseal-railway-production-d8fb.up.railway.app
```

Railway Project ID: `15051973-727e-46e2-8188-cf053238698e`
Railway Service ID: `745a1146-a8da-4997-b9ba-6658c5c2cfc0`

### Creating Templates

In DocuSeal, you can create templates for:

1. **IVR Forms** - Insurance Verification Request forms
2. **Onboarding Forms** - Customer onboarding forms
3. **Agreement Forms** - Business Associate Agreements and other agreements
4. **Order Forms** - Product order forms

The templates should be created with the IDs specified in your `.env` file:
- `DOCUSEAL_IVR_TEMPLATE_ID` (default: ivr_forms)
- `DOCUSEAL_ONBOARDING_TEMPLATE_ID` (default: onboarding_forms)
- `DOCUSEAL_AGREEMENT_TEMPLATE_ID` (default: agreements)
- `DOCUSEAL_ORDER_TEMPLATE_ID` (default: order_forms)

### Embedding Forms

You can embed DocuSeal forms in your application using the `loadDocuSealEmbed` function from `site/js/integrations.js`:

```javascript
// Example: Load an IVR form
Integrations.loadDocuSealEmbed('ivr_forms', 'formContainer', {
  name: 'John Doe',
  email: 'john.doe@example.com',
  // Other prefill data
});
```

## Webhook Endpoints

The following webhook endpoints are available:

### DocuSeal Webhooks

- `/api/webhooks/docuseal` - Receives events from DocuSeal (e.g., submission completed, submission opened)

### n8n Webhooks

- `/api/webhooks/n8n` - Receives events from n8n (e.g., workflow completed)

## JavaScript API

The following JavaScript functions are available for client-side integration:

### n8n Functions

- `Integrations.triggerN8nWorkflow(workflowId, data)` - Trigger an n8n workflow
- `Integrations.sendN8nWebhook(webhookPath, data)` - Send a webhook to n8n

### DocuSeal Functions

- `Integrations.getDocuSealTemplates()` - Get DocuSeal templates
- `Integrations.createDocuSealSubmission(templateId, data)` - Create a DocuSeal submission
- `Integrations.loadDocuSealEmbed(templateId, containerId, prefillData)` - Load a DocuSeal form in an iframe

### Form Submission

- `Integrations.handleFormSubmissionWithIntegration(formType, formData)` - Handle form submission with n8n integration

## Server-Side API

The following server-side functions are available for integration:

### n8n Functions

- `triggerN8nWorkflow(workflowId, data)` - Trigger an n8n workflow
- `sendN8nWebhook(webhookPath, data)` - Send a webhook to n8n

### DocuSeal Functions

- `createDocuSealSubmission(templateId, data)` - Create a DocuSeal submission
- `getDocuSealSubmission(submissionId)` - Get a DocuSeal submission

## Railway Deployment

To deploy this application to Railway:

1. Create a new project in Railway
2. Connect your GitHub repository
3. Add the required environment variables
4. Deploy the application

Railway will automatically detect the `docker-compose.yml` file and deploy the services.

## Troubleshooting

### n8n Issues

- Check the n8n logs: `docker-compose logs n8n`
- Verify that the n8n service is running: `docker-compose ps`
- Check that the n8n API key is correct in your `.env` file

### DocuSeal Issues

- Check that the DocuSeal URL is correct in your `.env` file
- Verify that you can access the DocuSeal instance at the URL
- Check that the DocuSeal API key is correct in your `.env` file
