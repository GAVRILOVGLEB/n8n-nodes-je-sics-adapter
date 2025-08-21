# 🔧 Troubleshooting n8n Package Loading Error

## Error: "The specified package could not be loaded"

This error typically occurs due to one of several issues. Follow these steps to resolve:

## 🔍 Step 1: Verify Package Structure

### Check Required Files:
```bash
# Verify these files exist:
dist/index.js                    # Main entry point
dist/nodes/SicsAdapter.node.js   # Node definition
package.json                     # Package configuration
```

### Verify package.json n8n Section:
```json
{
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [],
    "nodes": [
      "dist/nodes/SicsAdapter.node.js"
    ]
  }
}
```

## 🔨 Step 2: Clean Build

Execute these commands in order:

```bash
# 1. Clean old packages
del n8n-*sics-adapter*.tgz

# 2. Clean dist directory  
rmdir /s dist

# 3. Rebuild TypeScript
npx tsc

# 4. Verify node file exists
dir dist\nodes\SicsAdapter.node.js

# 5. Create package
npm pack

# 6. Verify package created
dir n8n-nodes-je-sics-adapter-1.0.2-beta.2.tgz
```

## 🧪 Step 3: Test Installation

```bash
# Navigate to testing environment
cd testing-env

# Remove old installation
npm uninstall n8n-nodes-je-sics-adapter

# Install new package
npm install ../n8n-nodes-je-sics-adapter-1.0.2-beta.2.tgz

# Verify installation
npm list n8n-nodes-je-sics-adapter
```

## 🔍 Step 4: Check Common Issues

### Issue 1: Missing Keywords
Ensure package.json has required keywords:
```json
{
  "keywords": [
    "n8n-community-node-package",
    "n8n",
    "n8n-nodes"
  ]
}
```

### Issue 2: Wrong Node Export
Check that `dist/nodes/SicsAdapter.node.js` exports the class:
```javascript
exports.SicsAdapterNode = SicsAdapterNode;
```

### Issue 3: Incorrect Main Entry
Verify `dist/index.js` exports nodes array:
```javascript
exports.nodes = [SicsAdapter_node_1.SicsAdapterNode];
```

### Issue 4: TypeScript Compilation Errors
Check for compilation errors:
```bash
npx tsc --noEmit
```

## 🚀 Step 5: Alternative Installation Methods

### Method 1: Direct Copy
```bash
# Create N8N nodes directory
mkdir %USERPROFILE%\.n8n\nodes

# Copy compiled files
xcopy /s dist %USERPROFILE%\.n8n\nodes\
```

### Method 2: Global Install
```bash
# Install globally
npm install -g ./n8n-nodes-je-sics-adapter-1.0.2-beta.2.tgz

# Restart N8N
```

### Method 3: Environment Variables
```bash
# Set custom nodes path
set N8N_CUSTOM_EXTENSIONS=%CD%\dist
set N8N_NODES_INCLUDE=n8n-nodes-je-sics-adapter

# Start N8N
npx n8n start
```

## 📋 Step 6: Verification Checklist

- [ ] Package built successfully
- [ ] `dist/nodes/SicsAdapter.node.js` exists
- [ ] `package.json` has correct n8n configuration
- [ ] Keywords include required n8n tags
- [ ] Package installed without errors
- [ ] N8N restarted after installation
- [ ] Node appears in N8N node list

## 🔧 Quick Fix Script

Create `quick-fix.bat`:
```batch
@echo off
echo Fixing n8n package...
del n8n-*sics-adapter*.tgz 2>nul
rmdir /s /q dist 2>nul
npx tsc
npm pack
echo Package ready: n8n-nodes-je-sics-adapter-1.0.2-beta.2.tgz
```

Run: `quick-fix.bat`

## 📞 Still Having Issues?

If the package still won't load:

1. Check N8N logs for detailed error messages
2. Verify n8n-workflow version compatibility
3. Try with a minimal node configuration
4. Test with N8N development mode: `npx n8n start --dev`

**The most common cause is missing or incorrect TypeScript compilation. Always verify `dist/` directory structure matches the `package.json` n8n configuration.**
