# 🚀 Testing SICS Adapter in N8N

Instructions for running and testing SICS Adapter in N8N.

## 📁 Project Structure:

```
n8n-nodes-je-sics-adapter/
├── src/                     # Source code
├── dist/                    # Built files
├── testing-env/             # N8N testing environment
│   └── package.json         # N8N project
├── n8n-nodes-je-sics-adapter-1.0.0.tgz  # Ready package for Community Nodes
├── mock-sics-server.js      # Mock server
└── setup-testing.ps1        # Automated setup script
```

## 🚀 Quick Start:

### Automated Setup (Recommended):

```powershell
# Run setup script
./setup-testing.ps1
```

### Manual Setup:

#### 1. Install N8N

```powershell
cd testing-env
npm install
```

#### 2. Install SICS Package

```powershell
npm install ../n8n-nodes-je-sics-adapter-1.0.0.tgz
```

#### 3. Setup Environment Variables

```powershell
$env:SICS_BASE_URL = "http://localhost:3001/api"
$env:SICS_API_VERSION = "v1"
$env:SICS_TIMEOUT = "30000"
$env:SICS_RETRY_ATTEMPTS = "3"
```

#### 4. Start Services

**Terminal 1** (Mock server):
```powershell
cd ..
pnpm run mock-server
```

**Terminal 2** (N8N):
```powershell
cd testing-env
npx n8n start
```

## 🎯 Testing:

1. **Open N8N**: http://localhost:5678
2. **Create new workflow**
3. **Find "SICS Adapter"** in node list
4. **Configure parameters**:
   - Team: `Test Team`
   - Version: `1.0.0`
   - Action: `Test Action`
   - Message: `"Hello from N8N!"`
5. **Execute workflow**

## 🔧 Installation via Community Nodes (Recommended):

### In N8N UI:
1. **Settings** → **Community Nodes** → **Install**
2. **Enter**: `n8n-nodes-je-sics-adapter`
3. **Click Install**

> ⚠️ **Important**: Package must be published to npm registry for Community Nodes installation

### Alternative Installation:

### Manual Copy:
```powershell
New-Item -ItemType Directory -Path "$env:USERPROFILE\.n8n\nodes" -Force
Copy-Item -Recurse "dist/*" "$env:USERPROFILE\.n8n\nodes/" -Force
```

## ✅ Expected Result:

```json
{
  "success": true,
  "result": {
    "processed": true,
    "message": "Successfully processed \"Hello from N8N!\" for team test-team",
    "timestamp": "2025-08-21T..."
  },
  "_sics": {
    "action": "test-action",
    "version": "1.0.0",
    "team": "test-team"
  }
}
```

## 🧪 Additional Tests:

- **Data Transform**: Data transformation
- **Data Validate**: Schema validation  
- **Send Notification**: Send notifications

**Mock server**: http://localhost:3001/api/health
