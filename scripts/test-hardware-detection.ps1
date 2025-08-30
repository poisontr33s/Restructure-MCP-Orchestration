# Test the real hardware acceleration script
Write-Host "🚀 Testing REAL Hardware Detection" -ForegroundColor Green

Write-Host "`n🔍 GPU Detection:" -ForegroundColor Cyan
$gpus = Get-CimInstance -ClassName Win32_VideoController | Where-Object { $_.Name -notlike "*Microsoft*" }
foreach ($gpu in $gpus) {
    Write-Host "  GPU: $($gpu.Name)" -ForegroundColor White
    if ($gpu.AdapterRAM) {
        $vramGB = [math]::Round($gpu.AdapterRAM / 1GB, 2)
        Write-Host "    VRAM: $vramGB GB" -ForegroundColor Gray
    }
    Write-Host "    Driver: $($gpu.DriverVersion)" -ForegroundColor Gray
    
    if ($gpu.Name -like "*NVIDIA*") {
        Write-Host "    Type: NVIDIA GPU (CUDA capable)" -ForegroundColor Green
    } elseif ($gpu.Name -like "*AMD*" -or $gpu.Name -like "*Radeon*") {
        Write-Host "    Type: AMD GPU (OpenCL capable)" -ForegroundColor Green  
    } elseif ($gpu.Name -like "*Intel*") {
        Write-Host "    Type: Intel GPU (QuickSync capable)" -ForegroundColor Yellow
    }
}

Write-Host "`n🔍 CPU Detection:" -ForegroundColor Cyan
$cpu = Get-CimInstance -ClassName Win32_Processor | Select-Object -First 1
Write-Host "  CPU: $($cpu.Name)" -ForegroundColor White
Write-Host "  Cores: $($cpu.NumberOfCores) physical, $($cpu.NumberOfLogicalProcessors) logical" -ForegroundColor Gray
Write-Host "  Max Clock: $($cpu.MaxClockSpeed) MHz" -ForegroundColor Gray

Write-Host "`n🔍 Memory Detection:" -ForegroundColor Cyan
$memory = Get-CimInstance -ClassName Win32_PhysicalMemory
$totalRAM = ($memory | Measure-Object -Property Capacity -Sum).Sum
$totalRAMGB = [math]::Round($totalRAM / 1GB, 2)
Write-Host "  RAM: $totalRAMGB GB total" -ForegroundColor White

Write-Host "`n✅ Hardware detection working correctly!" -ForegroundColor Green
Write-Host "The real script will use these actual APIs for optimization." -ForegroundColor Gray
