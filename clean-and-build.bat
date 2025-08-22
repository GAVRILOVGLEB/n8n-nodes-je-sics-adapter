@echo off
echo Cleaning and rebuilding SICS Adapter with fixed configuration...

echo.
echo Step 1: Clean everything...
if exist dist rmdir /s /q dist
if exist node_modules rmdir /s /q node_modules
if exist n8n-nodes-je-sics-adapter-*.tgz del n8n-nodes-je-sics-adapter-*.tgz

echo.
echo Step 2: Fresh install dependencies...
npm install

echo.
echo Step 3: Check n8n-workflow version...
npm list n8n-workflow

echo.
echo Step 4: Build TypeScript...
npm run build

echo.
echo Step 5: Verify build structure...
if exist "dist\nodes\SicsAdapter\SicsAdapter.node.js" (
    echo ✅ SICS node file created successfully
) else (
    echo ❌ SICS node file not found
    echo.
    echo Checking dist structure:
    dir dist /s
    exit /b 1
)

if exist "dist\index.js" (
    echo ✅ Index file created successfully
) else (
    echo ❌ Index file not found
    exit /b 1
)

echo.
echo Step 6: Create package...
npm pack

echo.
echo Step 7: Verify package...
if exist "n8n-nodes-je-sics-adapter-1.0.31.tgz" (
    echo ✅ Package created: n8n-nodes-je-sics-adapter-1.0.31.tgz
    echo.
    echo 🎉 SICS Adapter built successfully!
    echo.
    echo Next steps:
    echo 1. cd testing-env
    echo 2. npm uninstall n8n-nodes-je-sics-adapter
    echo 3. npm install ../n8n-nodes-je-sics-adapter-1.0.31.tgz
    echo 4. npx n8n start
    echo.
) else (
    echo ❌ Package creation failed
    exit /b 1
)

pause
