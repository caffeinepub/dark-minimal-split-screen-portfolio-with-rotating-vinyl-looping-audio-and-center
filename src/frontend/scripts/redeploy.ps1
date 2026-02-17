# shibhi.studio Redeploy Script (PowerShell)
# Performs a clean frontend build and backend deployment with full logging

$ErrorActionPreference = "Stop"

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendDir = Split-Path -Parent $ScriptDir
$ProjectRoot = Split-Path -Parent $FrontendDir
$LogsDir = Join-Path $FrontendDir "logs"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BuildLog = Join-Path $LogsDir "build_$Timestamp.log"
$DeployLog = Join-Path $LogsDir "deploy_$Timestamp.log"

# Create logs directory if it doesn't exist
if (-not (Test-Path $LogsDir)) {
    New-Item -ItemType Directory -Path $LogsDir | Out-Null
}

function Write-Log {
    param($Message, $LogFile)
    $Message | Tee-Object -FilePath $LogFile -Append
}

Write-Log "========================================" $BuildLog
Write-Log "shibhi.studio Redeploy - $(Get-Date)" $BuildLog
Write-Log "========================================" $BuildLog
Write-Log "" $BuildLog

# Step 1: Clean install frontend dependencies
Write-Log "[1/4] Clean installing frontend dependencies..." $BuildLog
Set-Location $FrontendDir
if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }
if (Test-Path "pnpm-lock.yaml") { Remove-Item -Force "pnpm-lock.yaml" }
pnpm install 2>&1 | Tee-Object -FilePath $BuildLog -Append
Write-Log "✓ Dependencies installed" $BuildLog
Write-Log "" $BuildLog

# Step 2: Generate backend bindings
Write-Log "[2/4] Generating backend bindings..." $BuildLog
Set-Location $ProjectRoot
dfx generate backend 2>&1 | Tee-Object -FilePath $BuildLog -Append
Write-Log "✓ Backend bindings generated" $BuildLog
Write-Log "" $BuildLog

# Step 3: Build frontend
Write-Log "[3/4] Building frontend..." $BuildLog
Set-Location $FrontendDir
pnpm run build:skip-bindings 2>&1 | Tee-Object -FilePath $BuildLog -Append
Write-Log "✓ Frontend build complete" $BuildLog
Write-Log "" $BuildLog

# Step 4: Deploy backend
Write-Log "[4/4] Deploying backend canister..." $DeployLog
Set-Location $ProjectRoot
dfx deploy backend 2>&1 | Tee-Object -FilePath $DeployLog -Append
Write-Log "✓ Backend deployed" $DeployLog
Write-Log "" $DeployLog

Write-Log "========================================" $DeployLog
Write-Log "Redeploy complete!" $DeployLog
Write-Log "Build log: $BuildLog" $DeployLog
Write-Log "Deploy log: $DeployLog" $DeployLog
Write-Log "========================================" $DeployLog
