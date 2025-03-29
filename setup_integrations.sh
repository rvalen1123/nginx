#!/bin/bash
# Setup script for MSC Wound Care Portal integrations

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}MSC Wound Care Portal Integrations Setup${NC}"
echo "This script will help you set up the integrations with n8n and DocuSeal."
echo

# Check if .env file exists
if [ ! -f .env ]; then
  echo -e "${RED}Error: .env file not found.${NC}"
  echo "Please create a .env file by copying .env.example:"
  echo "cp .env.example .env"
  exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
  echo -e "${RED}Error: docker-compose is not installed.${NC}"
  echo "Please install Docker and Docker Compose:"
  echo "https://docs.docker.com/compose/install/"
  exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
  echo -e "${RED}Error: Docker is not running.${NC}"
  echo "Please start Docker and try again."
  exit 1
fi

echo -e "${YELLOW}Checking environment variables...${NC}"

# Check if n8n environment variables are set
if grep -q "N8N_API_KEY=your-n8n-api-key" .env; then
  echo -e "${YELLOW}Warning: N8N_API_KEY is not set.${NC}"
  echo "You will need to set this after n8n is running."
fi

# Check if DocuSeal environment variables are set
if grep -q "DOCUSEAL_API_KEY=your-docuseal-api-key" .env; then
  echo -e "${YELLOW}Warning: DOCUSEAL_API_KEY is not set.${NC}"
  echo "You will need to set this after DocuSeal is running."
fi

echo -e "${GREEN}Starting services...${NC}"
docker-compose up -d

echo -e "${GREEN}Waiting for services to start...${NC}"
sleep 10

echo -e "${GREEN}Services started!${NC}"
echo

echo -e "${YELLOW}n8n is available at:${NC} http://localhost:5678"
echo "Username: admin (or as configured in .env)"
echo "Password: password (or as configured in .env)"
echo

echo -e "${YELLOW}DocuSeal is available at:${NC} http://localhost:3500"
echo

echo -e "${GREEN}Next steps:${NC}"
echo "1. Create an account in DocuSeal"
echo "2. Create templates for IVR, onboarding, agreements, and order forms"
echo "3. Get the API key from DocuSeal and update the DOCUSEAL_API_KEY in .env"
echo "4. Create workflows in n8n for form processing"
echo "5. Get the API key from n8n and update the N8N_API_KEY in .env"
echo "6. Restart the services: docker-compose restart"
echo

echo -e "${GREEN}For more information, see:${NC}"
echo "- INTEGRATIONS_README.md"
echo "- https://docs.n8n.io/"
echo "- https://docuseal.co/docs"
echo

echo -e "${GREEN}Setup complete!${NC}"
