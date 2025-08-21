import axios from 'axios';
import { SicsAdapter } from '../sics-adapter';
import { SicsAdapterConfig, SicsExecutionContext, SicsAction } from '../../infrastructure/types';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Testing SicsAdapter: ', () => {
  let sicsAdapter: SicsAdapter;
  let mockConfig: SicsAdapterConfig;

  beforeEach(() => {
    mockConfig = {
      baseUrl: 'https://test-api.sics.local',
      apiVersion: 'v1',
      timeout: 10000,
      retryAttempts: 2,
      teams: [
        {
          teamId: 'test-team',
          teamName: 'Test Team',
          supportedVersions: ['>=1.0.0'],
          defaultVersion: '1.0.0',
          featureFlags: {}
        }
      ],
      globalActions: [
        {
          id: 'test-action',
          name: 'Test Action',
          description: 'Test action description',
          version: '1.0.0',
          team: 'test-team',
          category: 'data_processing' as any,
          parameters: [
            {
              name: 'input',
              displayName: 'Input Data',
              type: 'json' as any,
              required: true
            }
          ],
          flowAdapterEndpoint: '/flow/test-action'
        }
      ]
    };

    mockedAxios.create.mockReturnValue(mockedAxios);
    sicsAdapter = new SicsAdapter(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAvailableActions', () => {
    it('should return available actions for team and version', async () => {
      const actions = await sicsAdapter.getAvailableActions('test-team', '1.0.0');
      
      expect(actions).toHaveLength(1);
      expect(actions[0].id).toBe('test-action');
    });

    it('should use default version when version not specified', async () => {
      const actions = await sicsAdapter.getAvailableActions('test-team');
      
      expect(actions).toHaveLength(1);
      expect(actions[0].id).toBe('test-action');
    });

    it('should throw error for unsupported version', async () => {
      await expect(
        sicsAdapter.getAvailableActions('test-team', '0.5.0')
      ).rejects.toThrow('Version 0.5.0 is not supported for team: test-team');
    });

    it('should throw error for non-existent team', async () => {
      await expect(
        sicsAdapter.getAvailableActions('non-existent-team')
      ).rejects.toThrow('No version specified and no default version found for team: non-existent-team');
    });
  });

  describe('getActionById', () => {
    it('should return action by id', async () => {
      const action = await sicsAdapter.getActionById('test-action', 'test-team', '1.0.0');
      
      expect(action).toBeDefined();
      expect(action?.id).toBe('test-action');
    });

    it('should return null for non-existent action', async () => {
      const action = await sicsAdapter.getActionById('non-existent', 'test-team', '1.0.0');
      
      expect(action).toBeNull();
    });
  });

  describe('executeAction', () => {
    let mockContext: SicsExecutionContext;
    let mockAction: SicsAction;

    beforeEach(() => {
      mockAction = mockConfig.globalActions[0];
      mockContext = {
        teamId: 'test-team',
        version: '1.0.0',
        action: mockAction,
        parameters: {
          input: { test: 'data' }
        },
        requestId: 'test-request-123',
        timestamp: new Date('2023-01-01T00:00:00Z')
      };
    });

    it('should execute action successfully', async () => {
      const mockResponse = {
        data: { result: 'success', processedData: { test: 'processed' } }
      };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await sicsAdapter.executeAction(mockContext);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse.data);
      expect(result.requestId).toBe('test-request-123');
      expect(result.executionTime).toBeGreaterThan(0);
      
      expect(mockedAxios.post).toHaveBeenCalledWith('/flow/test-action', {
        action: 'test-action',
        version: '1.0.0',
        team: 'test-team',
        parameters: { input: { test: 'data' } },
        requestId: 'test-request-123',
        timestamp: '2023-01-01T00:00:00.000Z'
      });
    });

    it('should handle execution failure', async () => {
      const mockError = new Error('Network error');
      mockedAxios.post.mockRejectedValue(mockError);

      const result = await sicsAdapter.executeAction(mockContext);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('EXECUTION_ERROR');
      expect(result.error?.message).toBe('Action execution failed');
      expect(result.requestId).toBe('test-request-123');
    });

    it('should validate required parameters', async () => {
      mockContext.parameters = {};

      const result = await sicsAdapter.executeAction(mockContext);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Action execution failed');
      expect(result.error?.details).toContain('Required parameter \'input\' is missing');
    });

    it('should throw error for unsupported version', async () => {
      mockContext.version = '0.5.0';

      const result = await sicsAdapter.executeAction(mockContext);

      expect(result.success).toBe(false);
      expect(result.error?.details).toContain('Version 0.5.0 is not supported for team: test-team');
    });
  });

  describe('healthCheck', () => {
    it('should perform health check successfully', async () => {
      const mockHealthResponse = {
        data: {
          status: 'healthy',
          version: '1.0.0',
          timestamp: '2023-01-01T00:00:00Z'
        }
      };
      mockedAxios.get.mockResolvedValue(mockHealthResponse);

      const result = await sicsAdapter.healthCheck();

      expect(result).toEqual(mockHealthResponse.data);
      expect(mockedAxios.get).toHaveBeenCalledWith('/health');
    });

    it('should handle health check failure', async () => {
      const mockError = new Error('Service unavailable');
      mockedAxios.get.mockRejectedValue(mockError);

      await expect(sicsAdapter.healthCheck()).rejects.toThrow('Health check failed');
    });
  });

  describe('configuration', () => {
    it('should return version manager', () => {
      const versionManager = sicsAdapter.getVersionManager();
      
      expect(versionManager).toBeDefined();
      expect(versionManager.getDefaultVersion('test-team')).toBe('1.0.0');
    });

    it('should return configuration', () => {
      const config = sicsAdapter.getConfig();
      
      expect(config).toEqual(mockConfig);
      expect(config).not.toBe(mockConfig);
    });
  });
});
