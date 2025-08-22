@echo off
echo Testing fixed SICS Adapter configuration...

echo.
echo Step 1: Clean old files...
if exist dist rmdir /s /q dist
if exist n8n-nodes-je-sics-adapter-*.tgz del n8n-nodes-je-sics-adapter-*.tgz

echo.
echo Step 2: Install dependencies...
npm install

echo.
echo Step 3: Build TypeScript...
npm run build

echo.
echo Step 4: Verify build structure...
if exist "dist\nodes\SicsAdapter\SicsAdapter.node.js" (
    echo ✅ SICS node file created successfully
) else (
    echo ❌ SICS node file not found
    exit /b 1
)

if exist "dist\index.js" (
    echo ✅ Index file created successfully
) else (
    echo ❌ Index file not found
    exit /b 1
)

echo.
echo Step 5: Create package...
npm pack

echo.
echo Step 6: Verify package...
if exist "n8n-nodes-je-sics-adapter-1.0.31.tgz" (
    echo ✅ Package created: n8n-nodes-je-sics-adapter-1.0.31.tgz
    echo.
    echo 🎉 SICS Adapter is ready with working configuration!
    echo.
    echo Next steps:
    echo 1. cd testing-env
    echo 2. npm uninstall n8n-nodes-je-sics-adapter
    echo 3. npm install ../n8n-nodes-je-sics-adapter-1.0.31.tgz
    echo 4. npx n8n start
    echo.
    echo The node should now appear as "SICS Adapter" in n8n UI.
) else (
    echo ❌ Package creation failed
    exit /b 1
)

pause
