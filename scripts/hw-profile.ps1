param(
  [string]$OutDir = (Join-Path $PSScriptRoot '..' 'docs' 'repo-index')
)

$ErrorActionPreference = 'SilentlyContinue'

function Invoke-CmdSafe {
  param([string]$File, [string[]]$CmdArgs)
  try {
    $pinfo = New-Object System.Diagnostics.ProcessStartInfo
    $pinfo.FileName = $File
    $pinfo.Arguments = ($CmdArgs -join ' ')
    $pinfo.UseShellExecute = $false
    $pinfo.RedirectStandardOutput = $true
    $pinfo.RedirectStandardError = $true
    $p = [System.Diagnostics.Process]::Start($pinfo)
    $p.WaitForExit(5000) | Out-Null
    $stdout = $p.StandardOutput.ReadToEnd()
    if (-not $stdout) { $stdout = $p.StandardError.ReadToEnd() }
    return $stdout.Trim()
  } catch {
    return $null
  }
}

function Get-FileVersionSafe {
  param([string]$Path)
  try { return (Get-Item $Path).VersionInfo.FileVersion } catch { return $null }
}

function Get-NvidiaInfo {
  $hasSmi = $null -ne (Get-Command nvidia-smi -EA SilentlyContinue)
  if (-not $hasSmi) { return @{ present = $false } }
  $q = Invoke-CmdSafe 'nvidia-smi' @('--query-gpu=name,driver_version,memory.total,compute_mode', '--format=csv,noheader')
  $cuda = Invoke-CmdSafe 'nvidia-smi' @()
  $cudaVer = ($cuda | Select-String -Pattern 'CUDA Version:\s*([0-9.]+)').Matches.Groups[1].Value
  $list = @()
  if ($q) {
    $q.Split([Environment]::NewLine) | ForEach-Object {
      if (-not $_) { return }
      $parts = ($_.Split(',') | ForEach-Object { $_.Trim() })
      $list += [ordered]@{ name=$parts[0]; driver=$parts[1]; vram=$parts[2]; computeMode=$parts[3] }
    }
  }
  return @{ present = $true; cudaVersion=$cudaVer; gpus=$list }
}

function Get-CudaToolkitInfo {
  $nvcc = Invoke-CmdSafe 'nvcc' @('--version')
  if (-not $nvcc) { return @{ present = $false } }
  $toolVer = ($nvcc | Select-String -Pattern 'release\s*([0-9.]+)').Matches.Groups[1].Value
  return @{ present = $true; nvcc=$true; version=$toolVer }
}

function Get-CuDNNInfo {
  $roots = @(
    'C:\\Program Files\\NVIDIA GPU Computing Toolkit\\CUDA',
    'C:\\Program Files\\NVIDIA Corporation',
    'C:\\Program Files\\NVIDIA GPU Computing Toolkit'
  )
  $dll = Get-ChildItem -EA SilentlyContinue -Path $roots -Recurse -Filter 'cudnn*.dll' | Select-Object -First 1
  if (-not $dll) { return @{ present = $false } }
  return @{ present = $true; path=$dll.FullName; version=(Get-FileVersionSafe $dll.FullName) }
}

function Get-TensorRTInfo {
  $trx = Invoke-CmdSafe 'trtexec' @('--version')
  if ($trx) { return @{ present = $true; trtexec=$true; version=$trx } }
  $roots = @('C:\\Program Files\\NVIDIA Corporation','C:\\Program Files\\NVIDIA GPU Computing Toolkit')
  $dll = Get-ChildItem -EA SilentlyContinue -Path $roots -Recurse -Filter 'nvinfer*.dll' | Select-Object -First 1
  if ($dll) { return @{ present = $true; trtexec=$false; version=(Get-FileVersionSafe $dll.FullName); path=$dll.FullName } }
  return @{ present = $false }
}

function Get-DirectXInfo {
  $tmp = Join-Path $env:TEMP 'dxdiag.txt'
  try { & dxdiag /t $tmp | Out-Null } catch {}
  if (-not (Test-Path $tmp)) { return @{ present = $false } }
  $txt = Get-Content -Raw $tmp
  $dxver = ($txt | Select-String -Pattern 'DirectX Version:\s*(.*)').Matches.Groups[1].Value
  $wddm = ($txt | Select-String -Pattern 'Driver Model:\s*(WDDM\s*[^\r\n]*)').Matches.Groups[1].Value
  return @{ present = $true; directX=$dxver; wddm=$wddm; path=$tmp }
}

function Get-DirectMLInfo {
  $ver = Get-FileVersionSafe 'C:\\Windows\\System32\\DirectML.dll'
  return @{ present = [bool]$ver; version=$ver }
}

function Get-VulkanInfo {
  $info = Invoke-CmdSafe 'vulkaninfo' @()
  if ($info) {
    $vr = ($info | Select-String -Pattern 'Vulkan Instance Version:\s*([0-9A-Za-z_.-]+)').Matches.Groups[1].Value
    return @{ present = $true; runtime=$vr; source='vulkaninfo' }
  }
  try {
    $drv = Get-Item 'HKLM:\SOFTWARE\Khronos\Vulkan\Drivers' -EA SilentlyContinue
  $has = $null -ne $drv
    return @{ present = $has; source='registry' }
  } catch { return @{ present = $false } }
}

function Get-WSLInfo {
  $status = Invoke-CmdSafe 'wsl' @('--status')
  $list = Invoke-CmdSafe 'wsl' @('-l','-q')
  if ($list) {
    $distros = $list -split "`r?`n" | Where-Object { $_ } | ForEach-Object { $_.Trim() }
    $statusLines = @()
    if ($status) { $statusLines = $status -split "`r?`n" | Select-Object -First 6 }
    return @{ present = $true; distros=$distros; status=$statusLines }
  } elseif ($status) {
    $statusLines = $status -split "`r?`n" | Select-Object -First 6
    return @{ present = $true; distros=@(); status=$statusLines }
  } else {
    return @{ present = $false }
  }
}

function Get-Toolchain {
  $node = Invoke-CmdSafe 'node' @('-v')
  $pnpm = Invoke-CmdSafe 'pnpm' @('-v')
  $cmake = Invoke-CmdSafe 'cmake' @('-version')
  $ninja = Invoke-CmdSafe 'ninja' @('--version')
  $python = Invoke-CmdSafe 'python' @('--version')
  return @{ node=$node; pnpm=$pnpm; cmake=$cmake; ninja=$ninja; python=$python }
}

# Collect
# OS info (friendly, compact)
$osInfoLines = systeminfo | Select-String 'OS Name|OS Version' | ForEach-Object { $_.Line.Trim() }
$osInfo = ($osInfoLines -join '; ')
$gpu = Get-NvidiaInfo
$cuda = Get-CudaToolkitInfo
$cudnn = Get-CuDNNInfo
$tensorrt = Get-TensorRTInfo
$dx = Get-DirectXInfo
$dml = Get-DirectMLInfo
$vk = Get-VulkanInfo
$wsl = Get-WSLInfo
$tools = Get-Toolchain

$report = [ordered]@{
  meta = [ordered]@{ when = (Get-Date).ToUniversalTime().ToString('s') + 'Z'; os = $osInfo }
  gpu = $gpu
  cuda = $cuda
  cudnn = $cudnn
  tensorrt = $tensorrt
  directx = $dx
  directml = $dml
  vulkan = $vk
  wsl = $wsl
  tools = $tools
}

# Ensure out dir and write
if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Force -Path $OutDir | Out-Null }
$jsonPath = Join-Path $OutDir 'hardware-profile.json'
$mdPath = Join-Path $OutDir 'hardware-profile.md'

$json = $report | ConvertTo-Json -Depth 6
Set-Content -Path $jsonPath -Value $json -Encoding UTF8

# Markdown summary
$md = @()
$md += "# Hardware Profile"
$md += "- Generated: $($report.meta.when)"
$md += "- OS: $($report.meta.os)"
$md += ""
$md += "## GPU/NVIDIA"
if ($gpu.present) {
  $md += "- CUDA Version (driver): $($gpu.cudaVersion)"
  foreach ($g in $gpu.gpus) { $md += "- GPU: $($g.name) | Driver: $($g.driver) | VRAM: $($g.vram)" }
} else { $md += "- NVIDIA GPU not detected or nvidia-smi not found" }
$md += ""
$md += "## CUDA/cuDNN/TensorRT"
$md += "- CUDA Toolkit: $(if($cuda.present){$cuda.version}else{'not found'})"
$md += "- cuDNN: $(if($cudnn.present){$cudnn.version}else{'not found'})"
$md += "- TensorRT: $(if($tensorrt.present){$tensorrt.version}else{'not found'})"
$md += ""
$md += "## Graphics Runtimes"
$md += "- DirectX: $(if($dx.present){$dx.directX}else{'not found'}) | WDDM: $(if($dx.present){$dx.wddm}else{'n/a'})"
$md += "- DirectML: $(if($dml.present){$dml.version}else{'not found'})"
$md += "- Vulkan: $(if($vk.present){$vk.runtime}else{'not found'})"
$md += ""
$md += "## WSL"
$md += "- Present: $($wsl.present)"
if ($wsl.present -and $wsl.distros) { $md += "- Distros: $($wsl.distros -join ', ')" }
$md += ""
$md += "## Toolchain"
$md += "- Node: $($tools.node) | pnpm: $($tools.pnpm)"
$md += "- CMake: $($tools.cmake -split "`n" | Select-Object -First 1) | Ninja: $($tools.ninja) | Python: $($tools.python)"

Set-Content -Path $mdPath -Value ($md -join "`r`n") -Encoding UTF8

Write-Host "Hardware profile written to:`n- $jsonPath`n- $mdPath"
