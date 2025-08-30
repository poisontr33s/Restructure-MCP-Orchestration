# VS Code GPU Acceleration Benchmark - REAL TESTING
# This script will actually measure if GPU acceleration is working

Write-Host "🔬 VS Code GPU Acceleration Benchmark" -ForegroundColor Green
Write-Host "This will test if GPU acceleration actually improves performance" -ForegroundColor Gray
Write-Host ""

# Function to measure VS Code startup time
function Measure-VSCodeStartup {
    param([string]$LaunchMethod, [string]$LaunchCommand)
    
    Write-Host "Testing: $LaunchMethod" -ForegroundColor Cyan
    
    # Close any existing VS Code instances
    Get-Process -Name "Code" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    
    # Measure startup time
    $startTime = Get-Date
    
    # Launch VS Code
    if ($LaunchMethod -eq "GPU Accelerated") {
        Start-Process -FilePath "$env:USERPROFILE\Desktop\VSCode-HardwareAccelerated.bat" -WindowStyle Hidden
    } else {
        Start-Process -FilePath "$env:LOCALAPPDATA\Programs\Microsoft VS Code\Code.exe" -WindowStyle Hidden
    }
    
    # Wait for VS Code to fully load (when it has multiple processes)
    do {
        Start-Sleep -Milliseconds 100
        $vscodeProcesses = Get-Process -Name "Code" -ErrorAction SilentlyContinue
    } while ($vscodeProcesses.Count -lt 3)  # VS Code typically has 3+ processes when loaded
    
    $endTime = Get-Date
    $startupTime = ($endTime - $startTime).TotalSeconds
    
    # Get memory usage
    $memoryMB = [math]::Round(($vscodeProcesses | Measure-Object -Property WorkingSet64 -Sum).Sum / 1MB, 1)
    
    Write-Host "  Startup time: $([math]::Round($startupTime, 2)) seconds" -ForegroundColor White
    Write-Host "  Memory usage: $memoryMB MB" -ForegroundColor White
    Write-Host "  Process count: $($vscodeProcesses.Count)" -ForegroundColor White
    
    # Close VS Code
    Get-Process -Name "Code" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    
    return @{
        StartupTime = $startupTime
        MemoryMB = $memoryMB
        ProcessCount = $vscodeProcesses.Count
    }
}

# Function to check if GPU is actually being used
function Test-GPUUsage {
    Write-Host "`n🎮 Testing GPU Usage..." -ForegroundColor Cyan
    
    # Start GPU-accelerated VS Code
    Start-Process -FilePath "$env:USERPROFILE\Desktop\VSCode-HardwareAccelerated.bat"
    Start-Sleep -Seconds 5
    
    # Check GPU usage using nvidia-smi if available
    try {
        $nvidiaSmi = Get-Command "nvidia-smi" -ErrorAction SilentlyContinue
        if ($nvidiaSmi) {
            Write-Host "Checking GPU usage with nvidia-smi..." -ForegroundColor Gray
            $gpuInfo = nvidia-smi --query-gpu=utilization.gpu,memory.used --format=csv,noheader,nounits
            Write-Host "GPU Utilization: $gpuInfo" -ForegroundColor White
        } else {
            Write-Host "nvidia-smi not available - checking via Task Manager data..." -ForegroundColor Yellow
            
            # Alternative: Check via WMI (less reliable)
            $gpu = Get-CimInstance -ClassName Win32_PerfRawData_GPUPerformanceCounters_GPUEngine -ErrorAction SilentlyContinue
            if ($gpu) {
                Write-Host "GPU processes detected: $($gpu.Count)" -ForegroundColor White
            } else {
                Write-Host "⚠️  Cannot directly measure GPU usage without nvidia-smi" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "❌ Could not check GPU usage: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Close VS Code
    Get-Process -Name "Code" -ErrorAction SilentlyContinue | Stop-Process -Force
}

# Main benchmark
Write-Host "🚀 Running Benchmark Tests..." -ForegroundColor Green
Write-Host "This will test startup times with and without GPU acceleration" -ForegroundColor Gray
Write-Host ""

# Test 1: Regular VS Code
Write-Host "Test 1: Regular VS Code (Software Rendering)" -ForegroundColor Yellow
$regularResults = Measure-VSCodeStartup -LaunchMethod "Regular" -LaunchCommand "standard"

Write-Host ""

# Test 2: GPU Accelerated VS Code
Write-Host "Test 2: GPU Accelerated VS Code" -ForegroundColor Yellow
if (Test-Path "$env:USERPROFILE\Desktop\VSCode-HardwareAccelerated.bat") {
    $gpuResults = Measure-VSCodeStartup -LaunchMethod "GPU Accelerated" -LaunchCommand "gpu"
} else {
    Write-Host "❌ GPU accelerated launcher not found!" -ForegroundColor Red
    exit 1
}

# Test 3: GPU Usage Check
Test-GPUUsage

# Results comparison
Write-Host "`n📊 Benchmark Results" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green

$startupImprovement = (($regularResults.StartupTime - $gpuResults.StartupTime) / $regularResults.StartupTime) * 100
$memoryDifference = $gpuResults.MemoryMB - $regularResults.MemoryMB

Write-Host "Startup Time:" -ForegroundColor Cyan
Write-Host "  Regular:        $([math]::Round($regularResults.StartupTime, 2)) seconds" -ForegroundColor White
Write-Host "  GPU Accelerated: $([math]::Round($gpuResults.StartupTime, 2)) seconds" -ForegroundColor White
if ($startupImprovement -gt 0) {
    Write-Host "  Improvement:    $([math]::Round($startupImprovement, 1))% faster" -ForegroundColor Green
} else {
    Write-Host "  Change:         $([math]::Round($startupImprovement, 1))% (slower)" -ForegroundColor Red
}

Write-Host "`nMemory Usage:" -ForegroundColor Cyan
Write-Host "  Regular:        $($regularResults.MemoryMB) MB" -ForegroundColor White
Write-Host "  GPU Accelerated: $($gpuResults.MemoryMB) MB" -ForegroundColor White
Write-Host "  Difference:     $([math]::Round($memoryDifference, 1)) MB" -ForegroundColor White

# Verdict
Write-Host "`n🎯 Verdict:" -ForegroundColor Green
if ($startupImprovement -gt 5) {
    Write-Host "✅ GPU acceleration provides measurable improvement!" -ForegroundColor Green
} elseif ($startupImprovement -gt 0) {
    Write-Host "⚠️  Minor improvement - may not be significant" -ForegroundColor Yellow
} else {
    Write-Host "❌ No improvement detected - GPU acceleration may not be working" -ForegroundColor Red
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Check Task Manager → Performance → GPU while VS Code is running" -ForegroundColor White
Write-Host "2. Look for 'Code.exe' under GPU processes" -ForegroundColor White
Write-Host "3. Compare GPU usage between regular and accelerated launches" -ForegroundColor White
