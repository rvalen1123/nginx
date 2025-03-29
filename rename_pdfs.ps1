# Rename PDF files based on patterns for manufacturer, product, and file type
param(
    [string]$rootFolder = "pdfs"
)

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
$logFile = Join-Path $PWD "pdf_rename_log.txt"
"PDF Renaming Log - $(Get-Date)" | Out-File $logFile

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

# Process all files recursively
Get-ChildItem -Path $rootFolder -Recurse -File | ForEach-Object {
    $file = $_
    $dirName = Split-Path -Leaf (Split-Path -Parent $file.FullName)
    
    # Skip if not a manufacturer directory
    if(-not $manufacturerMapping.ContainsKey($dirName)) {
        Write-Host "Skipping file in non-manufacturer directory: $($file.FullName)"
        return
    }
    
    $manufacturer = $manufacturerMapping[$dirName]
    $fileName = $file.Name
    $fileType = Get-FileType $fileName
    
    # Only process supported file types
    if($fileType -ne "other") {
        $product = Get-ProductName $fileName $manufacturer
        $extension = $file.Extension.ToLower()
        
        $newName = "{0}_{1}_{2}{3}" -f $manufacturer, $product, $fileType, $extension
        $newPath = Join-Path (Split-Path -Parent $file.FullName) $newName
        
        # Avoid duplicate filenames
        if(Test-Path $newPath) {
            $newName = "{0}_{1}_{2}_{3}{4}" -f $manufacturer, $product, $fileType, (Get-Random -Minimum 1000 -Maximum 9999), $extension
            $newPath = Join-Path (Split-Path -Parent $file.FullName) $newName
        }
        
        # Log and rename
        $logMessage = "Renamed: '$($file.FullName)' to '$newPath'"
        $logMessage | Out-File $logFile -Append
        Write-Host $logMessage
        
        # Rename the file
        Rename-Item -Path $file.FullName -NewName $newName -Force
    }
    else {
        Write-Host "Skipping file with unknown type: $($file.FullName)"
    }
}

Write-Host "Renaming complete. See $logFile for details."
