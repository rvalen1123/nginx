# Setup script for MSC Wound Care Portal integrations

# Colors for output
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Red = [System.ConsoleColor]::Red

Write-Host "MSC Wound Care Portal Integrations Setup" -ForegroundColor $Green
Write-Host "This script will help you set up the integrations with n8n and DocuSeal."
Write-Host

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "Error: .env file not found." -ForegroundColor $Red
    Write-Host "Please create a .env file by copying .env.example:"
    Write-Host "Copy-Item .env.example .env"
    exit 1
}

# Check if docker-compose is installed
try {
    $null = docker-compose --version
}
catch {
    Write-Host "Error: docker-compose is not installed." -ForegroundColor $Red
    Write-Host "Please install Docker Desktop which includes Docker Compose:"
    Write-Host "https://www.docker.com/products/docker-desktop"
    exit 1
}

# Check if Docker is running
try {
    $null = docker info
}
catch {
    Write-Host "Error: Docker is not running." -ForegroundColor $Red
    Write-Host "Please start Docker Desktop and try again."
    exit 1
}

Write-Host "Checking environment variables..." -ForegroundColor $Yellow

# Check if n8n environment variables are set
$envContent = Get-Content .env -Raw
if ($envContent -match "N8N_API_KEY=your-n8n-api-key") {
    Write-Host "Warning: N8N_API_KEY is not set." -ForegroundColor $Yellow
    Write-Host "You will need to set this after n8n is running."
}

# Check if DocuSeal environment variables are set
if ($envContent -match "DOCUSEAL_API_KEY=your-docuseal-api-key") {
    Write-Host "Warning: DOCUSEAL_API_KEY is not set." -ForegroundColor $Yellow
    Write-Host "You will need to set this after DocuSeal is running."
}

Write-Host "Starting services..." -ForegroundColor $Green
docker-compose up -d

Write-Host "Waiting for services to start..." -ForegroundColor $Green
Start-Sleep -Seconds 10

Write-Host "Services started!" -ForegroundColor $Green
Write-Host

Write-Host "n8n is available at:" -ForegroundColor $Yellow -NoNewline
Write-Host " http://localhost:5678"
Write-Host "Username: admin (or as configured in .env)"
Write-Host "Password: password (or as configured in .env)"
Write-Host

Write-Host "DocuSeal is available at:" -ForegroundColor $Yellow -NoNewline
Write-Host " http://localhost:3500"
Write-Host

Write-Host "Next steps:" -ForegroundColor $Green
Write-Host "1. Create an account in DocuSeal"
Write-Host "2. Create templates for IVR, onboarding, agreements, and order forms"
Write-Host "3. Get the API key from DocuSeal and update the DOCUSEAL_API_KEY in .env"
Write-Host "4. Create workflows in n8n for form processing"
Write-Host "5. Get the API key from n8n and update the N8N_API_KEY in .env"
Write-Host "6. Restart the services: docker-compose restart"
Write-Host

Write-Host "For more information, see:" -ForegroundColor $Green
Write-Host "- INTEGRATIONS_README.md"
Write-Host "- https://docs.n8n.io/"
Write-Host "- https://docuseal.co/docs"
Write-Host

Write-Host "Setup complete!" -ForegroundColor $Green

# Open the services in the browser
$openBrowser = Read-Host "Would you like to open n8n and DocuSeal in your browser? (y/n)"
if ($openBrowser -eq "y") {
    Start-Process "http://localhost:5678"
    Start-Process "http://localhost:3500"
}
