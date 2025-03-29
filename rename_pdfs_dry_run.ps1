# Rename PDF files based on patterns for manufacturer, product, and file type (DRY RUN MODE)
param(
    [string]$rootFolder = "pdfs"
)

Write-Host "RUNNING IN DRY RUN MODE - No files will be renamed" -ForegroundColor Yellow
Write-Host "Review the output and log file, then use rename_pdfs.ps1 to perform actual renaming" -ForegroundColor Yellow
Write-Host "----------------------------------------------------------------------" -ForegroundColor Yellow

# Define manufacturer mapping (folder name to standardized name)
$manufacturerMapping = @{
    "ACZ" = "ACZ"
    "Advanced Health (Complete AA)" = "Advanced_Health"
    "Amnio Amp-MSC BAA" = "Amnio_Amp"
    "AmnioBand" = "AmnioBand"
    "BioWerX" = "BioWerX"
    "BioWound" = "BioWound"
    "Convergent" = "Convergent"
    "Extremity Care" = "Extremity_Care" 
    "HealingBiologix" = "HealingBiologix"
    "Helicoll Studies" = "Helicoll"
    "Legacy" = "Legacy"
    "Microlyte" = "Microlyte"
    "MSC Forms" = "MSC"
    "New Horizons" = "New_Horizons"
    "ORION Case Study" = "ORION"
    "SKYE" = "SKYE"
    "Stability Bio" = "Stability_Bio"
    "Total Ancillary" = "Total_Ancillary"
}

# Define file type patterns
$fileTypePatterns = @{
    "ivr" = @("IVR", "Insurance Verification", "Verification")
    "onboarding" = @("Account", "Onboarding", "New_Account", "Set Up", "Setup", "Set-Up")
    "agreement" = @("BAA", "Agreement", "Terms", "Contract")
    "order" = @("Order Form", "Order", "OrderForm")
}

# Product name extraction heuristics (specific to each manufacturer)
$productMapping = @{
    "ACZ" = @{
        "RevoShield" = "RevoShield"
        "Derm-Maxx" = "DermMaxx"
        "Membrane Wrap" = "MembraneWrap"
    }
    "Advanced_Health" = @{
        "Complete AA" = "CompleteAA"
    }
    "Amnio_Amp" = @{
        "AmnioAMP" = "AmnioAMP"
        "Microlyte" = "Microlyte"
    }
    "AmnioBand" = @{
        "AmnioBand" = "AmnioBand"
    }
    "BioWerX" = @{
        "XWrap" = "XWrap"
        "BioWerX" = "BioWerX"
    }
    "BioWound" = @{
        "Amnio-Maxx" = "AmnioMaxx"
        "Biowound" = "BioWound"
    }
    "Extremity_Care" = @{
        "Complete FT" = "CompleteFT"
        "Coll-e-Derm" = "CollEDerm"
        "Xcellerate" = "Xcellerate"
    }
    "HealingBiologix" = @{
        "HealingBiologix" = "HealingBiologix"
    }
    "Helicoll" = @{
        "Helicoll" = "Helicoll"
    }
    "Legacy" = @{
        "IMPAX" = "IMPAX"
        "SUREGraft" = "SUREGraft"
        "ZENITH" = "ZENITH"
    }
    "Microlyte" = @{
        "Microlyte" = "Microlyte"
    }
    "ORION" = @{
        "ORION" = "ORION"
    }
    "SKYE" = @{
        "WoundPlus" = "WoundPlus"
        "BioECM" = "BioECM"
    }
    "Stability_Bio" = @{
        "Amnio Quad Core" = "AmnioQuadCore"
        "Amnio Tri Core" = "AmnioTriCore"
        "AmnioCore" = "AmnioCore"
        "AmnioCore Pro" = "AmnioCoreProo"
    }
    "Total_Ancillary" = @{
        "Biovance" = "Biovance"
        "Helicoll" = "Helicoll"
        "RevoShield" = "RevoShield"
    }
}

# Create a log file
$logFile = Join-Path $PWD "pdf_rename_dry_run_log.txt"
"PDF Renaming Dry Run Log - $(Get-Date)" | Out-File $logFile
"NO FILES WILL BE RENAMED IN DRY RUN MODE" | Out-File $logFile -Append

# Function to determine file type
function Get-FileType {
    param([string]$fileName)
    
    foreach($type in $fileTypePatterns.Keys) {
        foreach($pattern in $fileTypePatterns[$type]) {
            if($fileName -match $pattern) {
                return $type
            }
        }
    }
    return "other"
}

# Function to extract product name
function Get-ProductName {
    param(
        [string]$fileName,
        [string]$manufacturer
    )
    
    # Check manufacturer-specific product mappings
    if($productMapping.ContainsKey($manufacturer)) {
        foreach($product in $productMapping[$manufacturer].Keys) {
            if($fileName -match $product) {
                return $productMapping[$manufacturer][$product]
            }
        }
    }
    
    # Some common patterns for product names
    if($fileName -match "([A-Za-z0-9]+(?:[-_][A-Za-z0-9]+)*)\s*(?:Form|IVR|Agreement|BAA)") {
        return $matches[1].Trim()
    }
    
    # Default to "generic" if we can't determine product
    return "generic"
}

# Statistics
$totalFiles = 0
$filesToRename = 0
$filesByType = @{}

# Process all files recursively
Get-ChildItem -Path $rootFolder -Recurse -File | ForEach-Object {
    $file = $_
    $totalFiles++
    $dirName = Split-Path -Leaf (Split-Path -Parent $file.FullName)
    
    # Skip if not a manufacturer directory
    if(-not $manufacturerMapping.ContainsKey($dirName)) {
        Write-Host "Skipping file in non-manufacturer directory: $($file.FullName)" -ForegroundColor Gray
        return
    }
    
    $manufacturer = $manufacturerMapping[$dirName]
    $fileName = $file.Name
    $fileType = Get-FileType $fileName
    
    # Only process supported file types
    if($fileType -ne "other") {
        $filesToRename++
        
        # Update statistics
        if(-not $filesByType.ContainsKey($fileType)) {
            $filesByType[$fileType] = 0
        }
        $filesByType[$fileType]++
        
        $product = Get-ProductName $fileName $manufacturer
        $extension = $file.Extension.ToLower()
        
        $newName = "{0}_{1}_{2}{3}" -f $manufacturer, $product, $fileType, $extension
        $newPath = Join-Path (Split-Path -Parent $file.FullName) $newName
        
        # Check for duplicate filenames
        if(Test-Path $newPath) {
            $newName = "{0}_{1}_{2}_{3}{4}" -f $manufacturer, $product, $fileType, (Get-Random -Minimum 1000 -Maximum 9999), $extension
            $newPath = Join-Path (Split-Path -Parent $file.FullName) $newName
        }
        
        # Log and display the rename operation
        $logMessage = "[DRY RUN] Would rename: '$($file.FullName)' to '$newPath'"
        $logMessage | Out-File $logFile -Append
        Write-Host $logMessage -ForegroundColor Green
    }
    else {
        Write-Host "Skipping file with unknown type: $($file.FullName)" -ForegroundColor Gray
    }
}

# Print statistics
Write-Host "`nRenaming Statistics:" -ForegroundColor Cyan
Write-Host "Total files found: $totalFiles" -ForegroundColor Cyan
Write-Host "Files to be renamed: $filesToRename" -ForegroundColor Cyan
Write-Host "Files by type:" -ForegroundColor Cyan
foreach($type in $filesByType.Keys) {
    Write-Host "  - $type : $($filesByType[$type])" -ForegroundColor Cyan
}

Write-Host "`nDry run complete. See $logFile for details." -ForegroundColor Yellow
Write-Host "To perform actual renaming, run the rename_pdfs.ps1 script." -ForegroundColor Yellow
