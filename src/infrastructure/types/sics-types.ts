export interface SicsAction {
  id: string;
  name: string;
  description: string;
  version: string;
  team: string;
  category: SicsActionCategory;
  parameters: SicsActionParameter[];
  flowAdapterEndpoint: string;
  deprecated?: boolean;
  minVersion?: string;
  maxVersion?: string;
}

export interface SicsActionParameter {
  name: string;
  displayName: string;
  type: SicsParameterType;
  required: boolean;
  description?: string;
  default?: any;
  options?: SicsParameterOption[];
  validation?: SicsParameterValidation;
}

export interface SicsParameterOption {
  name: string;
  value: any;
  description?: string;
}

export interface SicsParameterValidation {
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: string;
}

export enum SicsActionCategory {
  DATA_PROCESSING = 'data_processing',
  INTEGRATION = 'integration',
  TRANSFORMATION = 'transformation',
  VALIDATION = 'validation',
  NOTIFICATION = 'notification',
  UTILITY = 'utility'
}

export enum SicsParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  DATE = 'date',
  FILE = 'file',
  JSON = 'json',
  OPTIONS = 'options'
}

export interface SicsVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

export interface SicsTeamConfig {
  teamId: string;
  teamName: string;
  supportedVersions: string[];
  defaultVersion: string;
  customActions?: SicsAction[];
  featureFlags?: Record<string, boolean>;
}

export interface SicsAdapterConfig {
  baseUrl: string;
  apiVersion: string;
  timeout: number;
  retryAttempts: number;
  teams: SicsTeamConfig[];
  globalActions: SicsAction[];
}

export interface SicsExecutionContext {
  teamId: string;
  version: string;
  action: SicsAction;
  parameters: Record<string, any>;
  requestId: string;
  timestamp: Date;
}

export interface SicsExecutionResult {
  success: boolean;
  data?: any;
  error?: SicsError;
  executionTime: number;
  requestId: string;
}

export interface SicsError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}
