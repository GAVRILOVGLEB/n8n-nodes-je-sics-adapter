import { SicsAdapterConfig, SicsAction, SicsTeamConfig } from '../infrastructure/types';

export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: SicsAdapterConfig | null = null;

  private constructor() {}

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  loadConfig(configPath?: string): SicsAdapterConfig {
    if (this.config) {
      return this.config;
    }

    this.config = this.getDefaultConfig();

    if (configPath) {
      try {
        const fs = require('fs');
        const path = require('path');
        const resolvedPath = path.resolve(configPath);
        const configData = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
        this.config = this.mergeConfigs(this.config, configData);
      } catch (error) {
        throw new Error(`Failed to load custom config from ${configPath}: ${error}`);
      }
    }

    this.validateConfig(this.config);
    return this.config;
  }

  private getDefaultConfig(): SicsAdapterConfig {
    return {
      baseUrl: process.env.SICS_BASE_URL || 'https://api.sics.local',
      apiVersion: process.env.SICS_API_VERSION || 'v1',
      timeout: parseInt(process.env.SICS_TIMEOUT || '30000'),
      retryAttempts: parseInt(process.env.SICS_RETRY_ATTEMPTS || '3'),
      teams: this.getDefaultTeams(),
      globalActions: this.getDefaultActions(),
    };
  }

  private getDefaultTeams(): SicsTeamConfig[] {
    return [
      {
        teamId: 'default',
        teamName: 'Default Team',
        supportedVersions: ['>=1.0.0'],
        defaultVersion: '1.0.0',
        featureFlags: {
          enableAdvancedLogging: true,
          enableRetry: true,
        },
      },
    ];
  }

  private getDefaultActions(): SicsAction[] {
    return [
      {
        id: 'data-transform',
        name: 'Data Transform',
        description: 'Transform data using predefined rules',
        version: '1.0.0',
        team: 'default',
        category: 'data_processing' as any,
        parameters: [
          {
            name: 'input',
            displayName: 'Input Data',
            type: 'json' as any,
            required: true,
            description: 'Data to be transformed',
          },
          {
            name: 'transformRules',
            displayName: 'Transform Rules',
            type: 'json' as any,
            required: true,
            description: 'Transformation rules to apply',
          },
        ],
        flowAdapterEndpoint: '/flow/data-transform',
      },
      {
        id: 'data-validate',
        name: 'Data Validate',
        description: 'Validate data against schema',
        version: '1.0.0',
        team: 'default',
        category: 'validation' as any,
        parameters: [
          {
            name: 'data',
            displayName: 'Data',
            type: 'json' as any,
            required: true,
            description: 'Data to validate',
          },
          {
            name: 'schema',
            displayName: 'Validation Schema',
            type: 'json' as any,
            required: true,
            description: 'JSON schema for validation',
          },
        ],
        flowAdapterEndpoint: '/flow/data-validate',
      },
      {
        id: 'send-notification',
        name: 'Send Notification',
        description: 'Send notification via multiple channels',
        version: '1.0.0',
        team: 'default',
        category: 'notification' as any,
        parameters: [
          {
            name: 'message',
            displayName: 'Message',
            type: 'string' as any,
            required: true,
            description: 'Notification message',
          },
          {
            name: 'channels',
            displayName: 'Channels',
            type: 'options' as any,
            required: true,
            description: 'Notification channels',
            options: [
              { name: 'Email', value: 'email' },
              { name: 'Slack', value: 'slack' },
              { name: 'Teams', value: 'teams' },
              { name: 'SMS', value: 'sms' },
            ],
          },
          {
            name: 'priority',
            displayName: 'Priority',
            type: 'options' as any,
            required: false,
            description: 'Notification priority',
            default: 'normal',
            options: [
              { name: 'Low', value: 'low' },
              { name: 'Normal', value: 'normal' },
              { name: 'High', value: 'high' },
              { name: 'Critical', value: 'critical' },
            ],
          },
        ],
        flowAdapterEndpoint: '/flow/send-notification',
      },
    ];
  }

  private mergeConfigs(
    defaultConfig: SicsAdapterConfig,
    customConfig: Partial<SicsAdapterConfig>
  ): SicsAdapterConfig {
    return {
      ...defaultConfig,
      ...customConfig,
      teams: customConfig.teams || defaultConfig.teams,
      globalActions: [...defaultConfig.globalActions, ...(customConfig.globalActions || [])],
    };
  }

  private validateConfig(config: SicsAdapterConfig): void {
    if (!config.baseUrl) {
      throw new Error('baseUrl is required in SICS adapter configuration');
    }

    if (!config.apiVersion) {
      throw new Error('apiVersion is required in SICS adapter configuration');
    }

    if (config.timeout <= 0) {
      throw new Error('timeout must be a positive number');
    }

    if (config.retryAttempts < 0) {
      throw new Error('retryAttempts must be a non-negative number');
    }

    if (!Array.isArray(config.teams) || config.teams.length === 0) {
      throw new Error('At least one team configuration is required');
    }

    if (!Array.isArray(config.globalActions)) {
      throw new Error('globalActions must be an array');
    }

    config.teams.forEach((team, index) => {
      if (!team.teamId) {
        throw new Error(`Team at index ${index} is missing teamId`);
      }
      if (!team.teamName) {
        throw new Error(`Team at index ${index} is missing teamName`);
      }
      if (!Array.isArray(team.supportedVersions) || team.supportedVersions.length === 0) {
        throw new Error(`Team ${team.teamId} must have at least one supported version`);
      }
      if (!team.defaultVersion) {
        throw new Error(`Team ${team.teamId} is missing defaultVersion`);
      }
    });
  }

  getConfig(): SicsAdapterConfig | null {
    return this.config;
  }

  reloadConfig(configPath?: string): SicsAdapterConfig {
    this.config = null;
    return this.loadConfig(configPath);
  }
}
