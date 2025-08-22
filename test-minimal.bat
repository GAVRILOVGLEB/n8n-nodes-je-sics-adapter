@echo off
echo Testing minimal SICS Adapter configuration...

echo.
echo Step 1: Clean build...
if exist dist rmdir /s /q dist
if exist n8n-nodes-je-sics-adapter-*.tgz del n8n-nodes-je-sics-adapter-*.tgz

echo.
echo Step 2: Build TypeScript...
npx tsc

echo.
echo Step 3: Verify minimal node file...
if exist "dist\nodes\SicsAdapter.minimal.node.js" (
    echo ✅ Minimal node file created
) else (
    echo ❌ Minimal node file missing
    exit /b 1
)

echo.
echo Step 4: Create package...
npm pack

echo.
echo Step 5: Verify package...
if exist "n8n-nodes-je-sics-adapter-1.0.2-beta.3.tgz" (
    echo ✅ Package created successfully
    echo.
    echo Next steps:
    echo 1. cd testing-env
    echo 2. npm uninstall n8n-nodes-je-sics-adapter
    echo 3. npm install ../n8n-nodes-je-sics-adapter-1.0.2-beta.3.tgz
    echo 4. npx n8n start
    echo.
    echo The minimal node should appear as "SICS Adapter" with a simple message field.
) else (
    echo ❌ Package creation failed
)

pause
