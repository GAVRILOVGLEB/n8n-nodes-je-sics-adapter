# Script for building and packaging n8n-nodes-je-sics-adapter

Write-Host "🔨 Building n8n-nodes-je-sics-adapter package..." -ForegroundColor Green

# Remove old package if exists
if (Test-Path "n8n-sics-adapter-1.0.0.tgz") {
    Remove-Item "n8n-sics-adapter-1.0.0.tgz" -Force
    Write-Host "🗑️ Removed old package" -ForegroundColor Yellow
}

if (Test-Path "n8n-nodes-je-sics-adapter-1.0.0.tgz") {
    Remove-Item "n8n-nodes-je-sics-adapter-1.0.0.tgz" -Force
    Write-Host "🗑️ Removed old package" -ForegroundColor Yellow
}

# Build
Write-Host "📦 Compiling TypeScript..." -ForegroundColor Cyan
pnpm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Compilation error!" -ForegroundColor Red
    exit 1
}

# Package
Write-Host "📦 Creating package..." -ForegroundColor Cyan
pnpm pack

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Packaging error!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Package successfully created: n8n-nodes-je-sics-adapter-1.0.2-beta.3.tgz" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. For local testing: ./setup-testing.ps1" -ForegroundColor White
Write-Host "2. For publishing: npm publish" -ForegroundColor White
Write-Host "3. For N8N installation: Settings → Community Nodes → Install → n8n-nodes-je-sics-adapter" -ForegroundColor White
