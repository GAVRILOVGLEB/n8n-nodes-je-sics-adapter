# 🔨 Build Instructions for n8n-nodes-je-sics-adapter

Due to terminal encoding issues, execute commands manually:

## 📦 Step-by-Step Build:

### 1. Install Dependencies
Open a new PowerShell terminal and execute:
```powershell
pnpm install
```

### 2. Build TypeScript
```powershell
pnpm run build
```

### 3. Create Package
```powershell
pnpm pack
```

### 4. Verify Result
File should appear: `n8n-nodes-je-sics-adapter-1.0.0.tgz`

## 🚀 After Build:

### Local Testing:
```powershell
powershell -ExecutionPolicy Bypass -File setup-testing.ps1
```

### Or manually:
1. **Go to testing-env:**
   ```powershell
   cd testing-env
   ```

2. **Install N8N:**
   ```powershell
   npm install
   ```

3. **Install our package:**
   ```powershell
   npm install ../n8n-nodes-je-sics-adapter-1.0.0.tgz
   ```

4. **Start Mock server** (in separate terminal):
   ```powershell
   cd ..
   pnpm run mock-server
   ```

5. **Start N8N:**
   ```powershell
   npx n8n start
   ```

## 🌐 Testing:

1. Open: http://localhost:5678
2. Settings → Community Nodes → Install
3. Enter: `n8n-nodes-je-sics-adapter`
4. Or find "SICS Adapter" in node list

## 📤 Publishing:

After successful testing:
```powershell
npm publish
```

## ✅ Success Verification:

- ✅ File `n8n-nodes-je-sics-adapter-1.0.0.tgz` created
- ✅ Mock server running on port 3001
- ✅ N8N running on port 5678
- ✅ "SICS Adapter" node appears in list
- ✅ Dropdowns load with data
- ✅ Workflow executes successfully

**Ready for use! 🎉**
