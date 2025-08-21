# Script for setting up SICS Adapter testing environment

Write-Host "🧹 Setting up SICS Adapter testing environment..." -ForegroundColor Green

# First rebuild package with new name
Write-Host "📦 Rebuilding package..." -ForegroundColor Yellow
pnpm run build
pnpm pack

# Check and create testing-env folder
if (-not (Test-Path "testing-env")) {
    New-Item -ItemType Directory -Path "testing-env" -Force | Out-Null
    Write-Host "✅ Created testing-env folder" -ForegroundColor Green
}

# Go to testing-env folder
Set-Location "testing-env"

# Install N8N if not installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing N8N..." -ForegroundColor Yellow
    npm install
}

# Install our package
Write-Host "📦 Installing SICS Adapter..." -ForegroundColor Yellow
npm install ../n8n-nodes-je-sics-adapter-1.0.2-beta.2.tgz

# Setup environment variables
$env:SICS_BASE_URL = "http://localhost:3001/api"
$env:SICS_API_VERSION = "v1"
$env:SICS_TIMEOUT = "30000"
$env:SICS_RETRY_ATTEMPTS = "3"

Write-Host "✅ Environment variables configured" -ForegroundColor Green

# Create folder for custom N8N nodes
$n8nNodesPath = "$env:USERPROFILE\.n8n\nodes"
if (-not (Test-Path $n8nNodesPath)) {
    New-Item -ItemType Directory -Path $n8nNodesPath -Force | Out-Null
    Write-Host "✅ Created ~/.n8n/nodes folder" -ForegroundColor Green
}

# Copy our node files
Copy-Item -Recurse "../dist/*" $n8nNodesPath -Force
Write-Host "✅ Node files copied to ~/.n8n/nodes" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start mock server in separate terminal:" -ForegroundColor White
Write-Host "   cd .. && pnpm run mock-server" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Start N8N:" -ForegroundColor White
Write-Host "   npx n8n start" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Open browser: http://localhost:5678" -ForegroundColor White
Write-Host "4. Find 'SICS Adapter' in node list" -ForegroundColor White
