@echo off
echo Building n8n-nodes-sics-adapter package...

echo.
echo Step 1: Installing dependencies...
pnpm install

echo.
echo Step 2: Building TypeScript...
pnpm run build

echo.
echo Step 3: Creating package...
pnpm pack

echo.
echo Package created: n8n-nodes-sics-adapter-1.0.0.tgz
echo.
echo Next steps:
echo 1. Run setup-testing: powershell -ExecutionPolicy Bypass -File setup-testing.ps1
echo 2. Or publish to npm: npm publish
echo.
pause
