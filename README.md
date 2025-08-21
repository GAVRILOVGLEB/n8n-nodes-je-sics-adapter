# n8n-nodes-je-sics-adapter

N8N Community Node for SICS Flow Adapter integration.

## Architecture

### Project Structure

```
src/
├── infrastructure/          # Types and interfaces
│   └── types/
├── nodes/                  # N8N nodes
│   └── SicsAdapter.node.ts
├── shared/                 # Shared components
│   ├── sics-adapter.ts     # Main adapter
│   ├── version-manager.ts  # Version management
│   ├── config-loader.ts    # Configuration loader
│   ├── action-registry.ts  # Action registry
│   └── execution-context-builder.ts
└── index.ts               # Entry point
```

## Installation

### Via N8N Community Nodes (Recommended)

1. Open N8N
2. Go to **Settings** → **Community Nodes** → **Install**
3. Enter: `n8n-nodes-je-sics-adapter`
4. Click **Install**

### Via npm

```bash
npm install n8n-nodes-je-sics-adapter
```

## Configuration

### Environment Variables

```bash
SICS_BASE_URL=https://api.sics.local
SICS_API_VERSION=v1
SICS_TIMEOUT=30000
SICS_RETRY_ATTEMPTS=3
```

### Team Configuration

Create a configuration file for teams:

```json
{
  "teams": [
    {
      "teamId": "frontend-team",
      "teamName": "Frontend Development Team",
      "supportedVersions": [">=1.0.0 <2.0.0", ">=2.0.0"],
      "defaultVersion": "1.5.0",
      "customActions": [...],
      "featureFlags": {
        "enableAdvancedLogging": true,
        "enableUIComponents": true
      }
    }
  ]
}
```

## Usage

### In N8N

1. Add "SICS Adapter" node to your workflow
2. Select team from dropdown
3. Select version
4. Select action
5. Fill in required parameters

### Programmatic Usage

```typescript
import { SicsAdapter, ConfigLoader } from 'n8n-nodes-je-sics-adapter';

const configLoader = ConfigLoader.getInstance();
const config = configLoader.loadConfig();
const sicsAdapter = new SicsAdapter(config);

// Get available actions
const actions = await sicsAdapter.getAvailableActions('frontend-team', '1.5.0');

// Execute action
const result = await sicsAdapter.executeAction({
  teamId: 'frontend-team',
  version: '1.5.0',
  action: actions[0],
  parameters: { input: 'test data' },
  requestId: 'unique-request-id',
  timestamp: new Date()
});
```

## Versioning

### Semantic Versioning

The package uses semantic versioning (semver) for compatibility management:

- **Major**: Breaking API changes
- **Minor**: New features with backward compatibility
- **Patch**: Bug fixes

### Team Support

Each team can specify supported versions:

```json
{
  "supportedVersions": [
    ">=1.0.0 <2.0.0",  // Support all 1.x versions
    ">=2.0.0"          // Support all 2.x versions and above
  ],
  "defaultVersion": "1.5.0"
}
```

## Development

### Install Dependencies

```bash
npm install
```

### Build

```bash
npm run build
```

### Testing

```bash
npm test
```

### Development with Watch Mode

```bash
npm run dev
```

## Testing

The project includes full test coverage:

- Unit tests for all components
- Integration tests for SICS adapter
- Mocks for external dependencies

```bash
npm test -- --coverage
```

## API Reference

### SicsAdapter

Main class for interacting with SICS Flow Adapter.

#### Methods

- `getAvailableActions(teamId, version?)`: Get available actions
- `getActionById(actionId, teamId, version?)`: Get action by ID
- `executeAction(context)`: Execute action
- `healthCheck()`: Service health check

### VersionManager

Version and team management.

#### Methods

- `isVersionSupported(teamId, version)`: Check version support
- `getDefaultVersion(teamId)`: Get default version
- `filterActionsByVersion(actions, teamId, version)`: Filter actions by version

## Extending Functionality

### Adding New Actions

```typescript
const newAction: SicsAction = {
  id: 'custom-action',
  name: 'Custom Action',
  description: 'My custom action',
  version: '1.0.0',
  team: 'my-team',
  category: SicsActionCategory.DATA_PROCESSING,
  parameters: [...],
  flowAdapterEndpoint: '/flow/custom-action'
};

// Add to team configuration
```

### Creating Custom Validators

```typescript
const customValidator = (value: any, param: SicsActionParameter): boolean => {
  // Your validation logic
  return true;
};
```

## License

MIT

## Support

For questions and support, create an issue in the project repository.
