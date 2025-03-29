# PDF Processing for DocuSeal

This set of scripts helps you organize and rename PDF files for use with DocuSeal. The workflow consists of three main steps:

1. **Dry Run** - Preview how files will be renamed without making changes
2. **Rename Files** - Rename files according to a standardized pattern
3. **Prepare for DocuSeal** - Organize renamed files by type for DocuSeal upload

## File Naming Convention

Files will be renamed following this pattern:

```
manufacturer_product_filetype.extension
```

For example:

- `ACZ_RevoShield_ivr.pdf`
- `BioWound_generic_agreement.pdf`
- `Advanced_Health_CompleteAA_order.pdf`

## Script Descriptions

### 1. Dry Run Script (`rename_pdfs_dry_run.ps1`)

This script shows you what changes would be made without actually renaming any files.

**Usage:**

```powershell
.\rename_pdfs_dry_run.ps1
```

**Output:**

- Console output showing planned renames
- Log file: `pdf_rename_dry_run_log.txt`
- Statistics on file types found

### 2. Rename Script (`rename_pdfs.ps1`)

This script performs the actual renaming of files based on patterns.

**Usage:**

```powershell
.\rename_pdfs.ps1
```

**Output:**

- Renamed files in their original directories
- Log file: `pdf_rename_log.txt`

### 3. DocuSeal Preparation Script (`prepare_for_docuseal.ps1`)

This script organizes renamed files by type for easier DocuSeal upload.

**Usage:**

```powershell
.\prepare_for_docuseal.ps1
```

**Output:**

- Organized files in `docuseal_upload` directory:
  - `ivr_forms/` - Insurance Verification Request forms
  - `onboarding_forms/` - Account setup and onboarding forms
  - `agreements/` - BAA and other agreements
  - `order_forms/` - Product order forms

## Recommended Workflow

1. **Review Files First**

   ```powershell
   .\rename_pdfs_dry_run.ps1
   ```

   Review the output to ensure files will be renamed correctly.

2. **Rename Files**

   ```powershell
   .\rename_pdfs.ps1
   ```

   This will rename all files according to the pattern.

3. **Organize for DocuSeal**

   ```powershell
   .\prepare_for_docuseal.ps1
   ```

   This will copy and organize files by type in the `docuseal_upload` directory.

4. **Upload to DocuSeal**
   - Go to your DocuSeal account
   - Create templates for each form type
   - Upload the organized files from the `docuseal_upload` directory

## Customization

If you need to customize the scripts:

- **Add New Manufacturers**: Edit the `$manufacturerMapping` variable
- **Add New Products**: Edit the `$productMapping` variable
- **Change File Types**: Edit the `$fileTypePatterns` variable

## Troubleshooting

- If files aren't being renamed as expected, check the log files for details
- If a file type isn't recognized, it may not contain one of the keywords in `$fileTypePatterns`
- If a product isn't recognized, it will default to "generic"

## Support

For any issues or questions, please contact your system administrator.
