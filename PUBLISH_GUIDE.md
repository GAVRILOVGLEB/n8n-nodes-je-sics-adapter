# 📦 Publishing n8n-nodes-je-sics-adapter to npm registry

For installation via N8N Community Nodes, the package must be published to npm registry.

## 🚀 Preparation for Publishing:

### 1. Package Verification

```bash
# Rebuild
pnpm run build

# Create package
pnpm pack

# Check contents
tar -tzf n8n-nodes-je-sics-adapter-1.0.0.tgz
```

### 2. npm Setup

```bash
# Login to npm (if not already logged in)
npm login

# Check user
npm whoami
```

### 3. Publishing

```bash
# Publish to npm registry
npm publish

# Or if need to publish as scoped package
npm publish --access public
```

## 🔧 After Publishing:

### In N8N:
1. **Settings** → **Community Nodes** → **Install**
2. **Enter**: `n8n-nodes-je-sics-adapter`
3. **Click Install**
4. **Restart N8N**

### Installation Verification:
- "SICS Adapter" node should appear in node list
- Dropdowns should load with data
- Mock server should receive requests

## 📝 Community Nodes Requirements:

✅ **Completed:**
- Name starts with `n8n-nodes-`
- Has `n8n` field in package.json
- Correct keywords specified
- Compatible n8n-workflow version

## 🔄 Package Updates:

```bash
# Increment version
npm version patch  # or minor, major

# Rebuild
pnpm run build

# Publish new version
npm publish
```

## 🧪 Local Testing:

Before publishing, you can test locally:

```bash
# Install from local package
npm install ./n8n-nodes-je-sics-adapter-1.0.0.tgz

# Or via npm link
npm link
# In another project:
npm link n8n-nodes-je-sics-adapter
```

## ⚠️ Important Notes:

1. **Name Uniqueness**: Make sure package name is not taken
2. **Versioning**: Follow semantic versioning
3. **Dependencies**: Use compatible n8n-workflow versions
4. **Testing**: Verify functionality before publishing
5. **Documentation**: README.md should contain usage instructions
