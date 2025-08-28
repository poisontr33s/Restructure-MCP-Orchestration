# Documentation Consolidation Script
# Captain Guthilda's Maritime Documentation Organizing Ritual

param(
    [string]$WorkspacePath = ".",
    [switch]$DryRun = $false,
    [switch]$Aggressive = $false
)

Write-Host "🏴‍☠️ Captain Guthilda's Documentation Consolidation Ritual Starting..." -ForegroundColor Cyan

# Create consolidated documentation directory
$ConsolidatedDir = Join-Path $WorkspacePath "docs-consolidated"
$ArchiveDir = Join-Path $WorkspacePath "docs-archive"

if (-not $DryRun) {
    if (-not (Test-Path $ConsolidatedDir)) {
        New-Item -ItemType Directory -Path $ConsolidatedDir -Force | Out-Null
        Write-Host "📁 Created consolidated docs directory: $ConsolidatedDir" -ForegroundColor Green
    }
    
    if (-not (Test-Path $ArchiveDir)) {
        New-Item -ItemType Directory -Path $ArchiveDir -Force | Out-Null
        Write-Host "📁 Created archive directory: $ArchiveDir" -ForegroundColor Green
    }
}

# Define consolidation groups
$ConsolidationGroups = @{
    "SETUP-INSTALLATION" = @{
        "Primary" = "MULTI-LANGUAGE-PORTABLE-SETUP.md"
        "Consolidate" = @(
            "PORTABLE-JAVA21-SETUP.md",
            "PORTABLE-SETUP-SUCCESS.md",
            "JAVA21-COMPLETION-REPORT.md",
            "SETUP-JAVA21-DEVELOPMENT.md"
        )
        "OutputFile" = "docs-consolidated/UNIFIED-SETUP-GUIDE.md"
    }
    
    "AUTONOMOUS-ORCHESTRATION" = @{
        "Primary" = "VSCODE-SAFE-MARITIME-ORCHESTRATOR.md"
        "Consolidate" = @(
            "AUTONOMOUS-ORCHESTRATION-GUIDE.md",
            "AUTONOMOUS-ORCHESTRATION-README.md",
            "AUTONOMOUS-EXECUTION-PLAN.md"
        )
        "OutputFile" = "docs-consolidated/AUTONOMOUS-ORCHESTRATION-MASTER.md"
    }
    
    "META-COGNITIVE-FRAMEWORK" = @{
        "Primary" = "MARITIME-META-COGNITIVE-INTEGRATION.md"
        "Consolidate" = @(
            "GPU-NATIVE-IDE-ARCHITECTURE.md"
        )
        "OutputFile" = "docs-consolidated/META-COGNITIVE-FRAMEWORK.md"
    }
    
    "META-PACKAGE-ARCHITECTURE" = @{
        "Primary" = "META-PACKAGE-ORCHESTRATION-README.md"
        "Consolidate" = @(
            "META-PACKAGE-ORCHESTRATION.md",
            "JAVA-EXOTIC-PACKAGE-ORCHESTRATION.md",
            "JAVA-POLYGLOT-ORCHESTRATION-GUIDE.md"
        )
        "OutputFile" = "docs-consolidated/META-PACKAGE-ARCHITECTURE.md"
    }
    
    "SYSTEM-HEALTH-CASCADE-PREVENTION" = @{
        "Primary" = "COMPLETE-CASCADE-PREVENTION-STRATEGY.md"
        "Consolidate" = @(
            "HIERARCHICAL-CASCADE-PREVENTION.md",
            "MONOREPO-HEALTH-RESTORATION.md",
            "CODE-QUALITY-IMPROVEMENTS.md"
        )
        "OutputFile" = "docs-consolidated/SYSTEM-HEALTH-PREVENTION.md"
    }
    
    "SUCCESS-ANALYTICS" = @{
        "Primary" = "AUTONOMOUS-ORCHESTRATION-ANALYSIS.md"
        "Consolidate" = @(
            "MARITIME-META-COGNITIVE-SUCCESS-REPORT.md",
            "AUTONOMOUS-SYSTEM-SUCCESS-REPORT.md",
            "DRY-RUN-TEST-RESULTS.md",
            "MONOREPO-RESTORATION-SUCCESS.md",
            "POPUP-SABOTAGE-REPORT.md"
        )
        "OutputFile" = "docs-consolidated/SUCCESS-ANALYTICS-REPORT.md"
    }
}

# Files to keep as-is (core documentation)
$KeepAsIs = @(
    "README.md",
    "README-JAVA21.md",
    "CLAUDE-COPILOT-COLLABORATION.md",
    "custom-instructions.md",
    "ARTIFACT-V4-MIGRATION.md",
    "INTELLIGENT-WORKSPACE-DUPLICATION-GUIDE.md",
    "DIGRESSION-POCKET-1-GRAMMAR-TIDYING.md"
)

# Function to read file content safely
function Get-FileContentSafe {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        try {
            return Get-Content $FilePath -Raw -Encoding UTF8
        }
        catch {
            Write-Warning "Could not read file: $FilePath - $($_.Exception.Message)"
            return ""
        }
    }
    else {
        Write-Warning "File not found: $FilePath"
        return ""
    }
}

# Function to create consolidated file
function New-ConsolidatedFile {
    param(
        [string]$GroupName,
        [hashtable]$GroupConfig,
        [string]$WorkspacePath,
        [bool]$DryRun
    )
    
    Write-Host "🔧 Processing group: $GroupName" -ForegroundColor Yellow
    
    $outputPath = Join-Path $WorkspacePath $GroupConfig.OutputFile
    $consolidatedContent = @()
    
    # Add header
    $consolidatedContent += "# $($GroupName.Replace('-', ' ').ToUpper())"
    $consolidatedContent += ""
    $consolidatedContent += "**Consolidated by Captain Guthilda's Maritime Documentation Ritual**"
    $consolidatedContent += "**Consolidation Date**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $consolidatedContent += ""
    $consolidatedContent += "---"
    $consolidatedContent += ""
    
    # Add primary file content
    $primaryPath = Join-Path $WorkspacePath $GroupConfig.Primary
    $primaryContent = Get-FileContentSafe -FilePath $primaryPath
    if ($primaryContent) {
        $consolidatedContent += "## PRIMARY CONTENT: $($GroupConfig.Primary)"
        $consolidatedContent += ""
        $consolidatedContent += $primaryContent
        $consolidatedContent += ""
        $consolidatedContent += "---"
        $consolidatedContent += ""
    }
    
    # Add consolidated files
    foreach ($file in $GroupConfig.Consolidate) {
        $filePath = Join-Path $WorkspacePath $file
        $fileContent = Get-FileContentSafe -FilePath $filePath
        if ($fileContent) {
            $consolidatedContent += "## CONSOLIDATED CONTENT: $file"
            $consolidatedContent += ""
            $consolidatedContent += $fileContent
            $consolidatedContent += ""
            $consolidatedContent += "---"
            $consolidatedContent += ""
        }
    }
    
    # Add footer
    $consolidatedContent += "## CONSOLIDATION METADATA"
    $consolidatedContent += ""
    $consolidatedContent += "**Primary Source**: $($GroupConfig.Primary)"
    $consolidatedContent += "**Consolidated Sources**:"
    foreach ($file in $GroupConfig.Consolidate) {
        $consolidatedContent += "- $file"
    }
    $consolidatedContent += ""
    $consolidatedContent += "**Generated**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    $consolidatedContent += "**Maritime Ritual**: Captain Guthilda's Documentation Consolidation"
    
    if (-not $DryRun) {
        try {
            $consolidatedContent -join "`n" | Out-File -FilePath $outputPath -Encoding UTF8 -Force
            Write-Host "✅ Created consolidated file: $($GroupConfig.OutputFile)" -ForegroundColor Green
        }
        catch {
            Write-Error "Failed to create consolidated file: $outputPath - $($_.Exception.Message)"
        }
    }
    else {
        Write-Host "📝 [DRY RUN] Would create: $($GroupConfig.OutputFile)" -ForegroundColor Cyan
    }
    
    return @{
        "SourceFiles" = @($GroupConfig.Primary) + $GroupConfig.Consolidate
        "OutputFile" = $GroupConfig.OutputFile
        "Success" = $true
    }
}

# Process all consolidation groups
$ProcessedFiles = @()
$ConsolidationResults = @()

foreach ($groupName in $ConsolidationGroups.Keys) {
    $result = New-ConsolidatedFile -GroupName $groupName -GroupConfig $ConsolidationGroups[$groupName] -WorkspacePath $WorkspacePath -DryRun $DryRun
    $ConsolidationResults += $result
    $ProcessedFiles += $result.SourceFiles
}

# Archive processed files
if (-not $DryRun -and $Aggressive) {
    Write-Host "🗂️ Archiving processed files..." -ForegroundColor Yellow
    
    foreach ($file in $ProcessedFiles) {
        $sourcePath = Join-Path $WorkspacePath $file
        if (Test-Path $sourcePath) {
            $archivePath = Join-Path $ArchiveDir $file
            try {
                Move-Item -Path $sourcePath -Destination $archivePath -Force
                Write-Host "📦 Archived: $file" -ForegroundColor Gray
            }
            catch {
                Write-Warning "Could not archive file: $file - $($_.Exception.Message)"
            }
        }
    }
}

# Generate consolidation report
$reportContent = @()
$reportContent += "# DOCUMENTATION CONSOLIDATION REPORT"
$reportContent += ""
$reportContent += "**Date**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$reportContent += "**Operation**: Captain Guthilda's Maritime Documentation Ritual"
$reportContent += "**Mode**: $(if ($DryRun) { 'DRY RUN' } else { 'ACTIVE' })"
$reportContent += "**Aggressive Archive**: $Aggressive"
$reportContent += ""
$reportContent += "## CONSOLIDATION RESULTS"
$reportContent += ""

foreach ($result in $ConsolidationResults) {
    $reportContent += "### $($result.OutputFile)"
    $reportContent += "**Status**: $(if ($result.Success) { '✅ SUCCESS' } else { '❌ FAILED' })"
    $reportContent += "**Source Files**:"
    foreach ($file in $result.SourceFiles) {
        $reportContent += "- $file"
    }
    $reportContent += ""
}

$reportContent += "## SUMMARY"
$reportContent += "- **Total Groups Processed**: $($ConsolidationGroups.Count)"
$reportContent += "- **Total Files Consolidated**: $($ProcessedFiles.Count)"
$reportContent += "- **Files Archived**: $(if ($Aggressive) { $ProcessedFiles.Count } else { 0 })"
$reportContent += ""
$reportContent += "_The maritime documentation waters have been organized by Captain Guthilda's wisdom._"

$reportPath = Join-Path $WorkspacePath "DOCUMENTATION-CONSOLIDATION-REPORT.md"
if (-not $DryRun) {
    $reportContent -join "`n" | Out-File -FilePath $reportPath -Encoding UTF8 -Force
    Write-Host "📊 Generated consolidation report: $reportPath" -ForegroundColor Green
}

Write-Host "🏴‍☠️ Captain Guthilda's Documentation Consolidation Complete!" -ForegroundColor Cyan
Write-Host "📊 Processed $($ConsolidationGroups.Count) groups, $($ProcessedFiles.Count) files" -ForegroundColor White

if ($DryRun) {
    Write-Host "🧪 DRY RUN MODE - No files were modified" -ForegroundColor Yellow
    Write-Host "💡 Run with -DryRun:`$false to execute consolidation" -ForegroundColor Cyan
    Write-Host "💡 Add -Aggressive to archive original files after consolidation" -ForegroundColor Cyan
}
