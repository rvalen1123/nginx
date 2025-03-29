# MSC Wound Care Portal

A comprehensive portal for managing wound care forms, insurance verification requests, and customer onboarding.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/o3MbZe)

## ✨ Features

- Multi-container Docker setup with NGINX, Node.js, n8n, and DocuSeal
- PDF processing and organization for form templates
- Integration with n8n for workflow automation
- Integration with DocuSeal for document signing
- Responsive web interface for form submission and management
- API endpoints for form submission and data retrieval
- Database integration with SQL Server via Prisma ORM

## 🚀 Quick Start

1. Clone the repository
2. Copy `.env.example` to `.env` and update the environment variables
3. Run `docker-compose up -d` to start all services
4. Access the application at `http://localhost`

## 📋 Available Forms

- **Insurance Verification Request (IVR)** - Request insurance verification for wound care products
- **Customer Onboarding** - Onboard new customers with necessary information
- **Business Associate Agreements** - Manage BAA agreements with partners
- **Order Forms** - Submit orders for wound care products

## 🔌 Integrations

The portal integrates with:

- **n8n** - For workflow automation (form processing, notifications, etc.)
- **DocuSeal** - For document signing and management

For detailed information about the integrations, see [INTEGRATIONS_README.md](INTEGRATIONS_README.md).

## 🛠️ Development

### Prerequisites

- Docker and Docker Compose
- Node.js 18+
- SQL Server (or use the Docker container)

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Access the application at `http://localhost:3000`

### PDF Processing

The repository includes scripts for processing PDF forms:

- `rename_pdfs_dry_run.ps1` - Preview PDF renaming without making changes
- `rename_pdfs.ps1` - Rename PDFs according to standardized patterns
- `prepare_for_docuseal.ps1` - Organize PDFs for DocuSeal upload

For more information, see [PDF_PROCESSING_README.md](PDF_PROCESSING_README.md).

## 🚢 Deployment

### Railway Deployment

1. Create a new project in Railway
2. Connect your GitHub repository
3. Add the required environment variables
4. Deploy the application

Railway will automatically detect the `docker-compose.yml` file and deploy the services.

## 📝 Notes

- The application uses NGINX as a reverse proxy to serve static files and proxy API requests to the backend
- The backend is built with Express.js and uses Prisma ORM for database access
- The frontend is built with vanilla JavaScript and CSS for simplicity
