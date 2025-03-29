# Prepare renamed PDF files for DocuSeal upload
# This script organizes renamed files by type for easier DocuSeal upload
param(
    [string]$sourceFolder = "pdfs",
    [string]$outputFolder = "docuseal_upload"
)

# Create output directory structure
$ivrFolder = Join-Path $outputFolder "ivr_forms"
$onboardingFolder = Join-Path $outputFolder "onboarding_forms"
$agreementFolder = Join-Path $outputFolder "agreements"
$orderFolder = Join-Path $outputFolder "order_forms"

# Create folders if they don't exist
$folders = @($outputFolder, $ivrFolder, $onboardingFolder, $agreementFolder, $orderFolder)
foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -Path $folder -ItemType Directory -Force | Out-Null
        Write-Host "Created folder: $folder" -ForegroundColor Green
    }
}

# Statistics
$totalFiles = 0
$copiedFiles = @{
    "ivr" = 0
    "onboarding" = 0
    "agreement" = 0
    "order" = 0
}

# Find all renamed files (following the pattern manufacturer_product_filetype.ext)
Write-Host "Searching for renamed files..." -ForegroundColor Cyan
$renamedFiles = Get-ChildItem -Path $sourceFolder -Recurse -File | Where-Object {
    $_.Name -match '^[^_]+_[^_]+_(ivr|onboarding|agreement|order).*\.(pdf|docx)$'
}

$totalFiles = $renamedFiles.Count
Write-Host "Found $totalFiles renamed files to organize" -ForegroundColor Cyan

# Copy files to appropriate folders
foreach ($file in $renamedFiles) {
    # Extract file type from filename
    if ($file.Name -match '_(ivr|onboarding|agreement|order)') {
        $fileType = $matches[1]
        
        # Determine destination folder
        $destFolder = switch ($fileType) {
            "ivr" { $ivrFolder }
            "onboarding" { $onboardingFolder }
            "agreement" { $agreementFolder }
            "order" { $orderFolder }
        }
        
        # Copy file to destination
        $destPath = Join-Path $destFolder $file.Name
        Copy-Item -Path $file.FullName -Destination $destPath -Force
        
        # Update statistics
        $copiedFiles[$fileType]++
        
        Write-Host "Copied: $($file.Name) to $destFolder" -ForegroundColor Green
    }
}

# Print summary
Write-Host "`nDocuSeal Upload Preparation Complete" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow
Write-Host "Total files processed: $totalFiles" -ForegroundColor Cyan
Write-Host "Files by category:" -ForegroundColor Cyan
Write-Host "  - IVR Forms: $($copiedFiles['ivr'])" -ForegroundColor Cyan
Write-Host "  - Onboarding Forms: $($copiedFiles['onboarding'])" -ForegroundColor Cyan
Write-Host "  - Agreements: $($copiedFiles['agreement'])" -ForegroundColor Cyan
Write-Host "  - Order Forms: $($copiedFiles['order'])" -ForegroundColor Cyan
Write-Host "`nFiles are organized in: $outputFolder" -ForegroundColor Yellow
Write-Host "You can now upload these organized files to DocuSeal" -ForegroundColor Yellow
