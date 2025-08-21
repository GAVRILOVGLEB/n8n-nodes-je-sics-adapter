import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  SicsAdapterConfig,
  SicsAction,
  SicsExecutionContext,
  SicsExecutionResult,
  SicsError,
  SicsTeamConfig
} from '../infrastructure/types';
import { VersionManager } from './version-manager';

export class SicsAdapter {
  private httpClient: AxiosInstance;
  private versionManager: VersionManager;
  private config: SicsAdapterConfig;

  constructor(config: SicsAdapterConfig) {
    this.config = config;
    this.versionManager = new VersionManager(config.teams);
    
    this.httpClient = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': config.apiVersion
      }
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.httpClient.interceptors.request.use(
      (config) => {
        config.headers['X-Request-ID'] = this.generateRequestId();
        config.headers['X-Timestamp'] = new Date().toISOString();
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config;
        
        if (error.response?.status >= 500 && config._retryCount < this.config.retryAttempts) {
          config._retryCount = (config._retryCount || 0) + 1;
          
          const delay = Math.pow(2, config._retryCount) * 1000;
          await this.sleep(delay);
          
          return this.httpClient(config);
        }
        
        return Promise.reject(error);
      }
    );
  }

  async getAvailableActions(teamId: string, version?: string): Promise<SicsAction[]> {
    try {
      const effectiveVersion = version || this.versionManager.getDefaultVersion(teamId);
      
      if (!effectiveVersion) {
        throw new Error(`No version specified and no default version found for team: ${teamId}`);
      }

      if (!this.versionManager.isVersionSupported(teamId, effectiveVersion)) {
        throw new Error(`Version ${effectiveVersion} is not supported for team: ${teamId}`);
      }

      const teamConfig = this.versionManager.getTeamConfig(teamId);
      const allActions = [...this.config.globalActions];
      
      if (teamConfig?.customActions) {
        allActions.push(...teamConfig.customActions);
      }

      return this.versionManager.filterActionsByVersion(allActions, teamId, effectiveVersion);
    } catch (error) {
      throw this.createSicsError('ACTIONS_FETCH_ERROR', 'Failed to fetch available actions', error);
    }
  }

  async getActionById(actionId: string, teamId: string, version?: string): Promise<SicsAction | null> {
    const actions = await this.getAvailableActions(teamId, version);
    return actions.find(action => action.id === actionId) || null;
  }

  async executeAction(context: SicsExecutionContext): Promise<SicsExecutionResult> {
    const startTime = Date.now();
    
    try {
      if (!this.versionManager.isVersionSupported(context.teamId, context.version)) {
        throw new Error(`Version ${context.version} is not supported for team: ${context.teamId}`);
      }

      const action = await this.getActionById(context.action.id, context.teamId, context.version);
      if (!action) {
        throw new Error(`Action ${context.action.id} not found for team ${context.teamId} version ${context.version}`);
      }

      this.validateParameters(action, context.parameters);

      const payload = {
        action: action.id,
        version: context.version,
        team: context.teamId,
        parameters: context.parameters,
        requestId: context.requestId,
        timestamp: context.timestamp.toISOString()
      };

      const response = await this.httpClient.post(action.flowAdapterEndpoint, payload);

      return {
        success: true,
        data: response.data,
        executionTime: Date.now() - startTime,
        requestId: context.requestId
      };

    } catch (error) {
      return {
        success: false,
        error: this.createSicsError('EXECUTION_ERROR', 'Action execution failed', error),
        executionTime: Date.now() - startTime,
        requestId: context.requestId
      };
    }
  }

  private validateParameters(action: SicsAction, parameters: Record<string, any>): void {
    for (const param of action.parameters) {
      if (param.required && (parameters[param.name] === undefined || parameters[param.name] === null)) {
        throw new Error(`Required parameter '${param.name}' is missing`);
      }

      if (parameters[param.name] !== undefined && param.validation) {
        this.validateParameterValue(param.name, parameters[param.name], param.validation);
      }
    }
  }

  private validateParameterValue(paramName: string, value: any, validation: any): void {
    if (validation.min !== undefined && typeof value === 'number' && value < validation.min) {
      throw new Error(`Parameter '${paramName}' value ${value} is below minimum ${validation.min}`);
    }

    if (validation.max !== undefined && typeof value === 'number' && value > validation.max) {
      throw new Error(`Parameter '${paramName}' value ${value} is above maximum ${validation.max}`);
    }

    if (validation.pattern && typeof value === 'string' && !new RegExp(validation.pattern).test(value)) {
      throw new Error(`Parameter '${paramName}' value does not match required pattern`);
    }
  }

  private createSicsError(code: string, message: string, originalError?: any): SicsError {
    return {
      code,
      message,
      details: originalError?.response?.data || originalError?.message || originalError,
      stack: originalError?.stack
    };
  }

  private generateRequestId(): string {
    return `sics_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getVersionManager(): VersionManager {
    return this.versionManager;
  }

  getConfig(): SicsAdapterConfig {
    return { ...this.config };
  }

  async healthCheck(): Promise<{ status: string; version: string; timestamp: string }> {
    try {
      const response = await this.httpClient.get('/health');
      return response.data;
    } catch (error) {
      throw this.createSicsError('HEALTH_CHECK_ERROR', 'Health check failed', error);
    }
  }
}
