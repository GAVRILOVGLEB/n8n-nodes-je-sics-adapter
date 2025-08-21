import { INodeProperties, INodeType, INodeTypeDescription, NodePropertyTypes } from 'n8n-workflow';
import { SicsAction, SicsActionParameter, SicsParameterType } from './sics-types';

export interface SicsNodeProperties extends INodeProperties {
  sicsAction?: string;
  sicsVersion?: string;
  sicsTeam?: string;
}

export interface SicsNodeTypeDescription extends INodeTypeDescription {
  version: number | number[];
  sicsVersion?: string;
  supportedTeams?: string[];
}

export interface SicsNodeExecutionData {
  json: Record<string, any>;
  binary?: Record<string, any>;
  pairedItem?: {
    item: number;
    input?: number;
  };
}

export interface SicsNodeContext {
  teamId: string;
  version: string;
  nodeVersion: number;
  workflowId: string;
  executionId: string;
}

export const mapSicsParameterToNodeProperty = (param: SicsActionParameter): INodeProperties => {
  const baseProperty: INodeProperties = {
    displayName: param.displayName,
    name: param.name,
    type: mapSicsTypeToN8nType(param.type),
    required: param.required,
    default: param.default || getDefaultValueForType(param.type),
    description: param.description || '',
  };

  if (param.options) {
    baseProperty.options = param.options.map(opt => ({
      name: opt.name,
      value: opt.value,
      description: opt.description,
    }));
  }

  if (param.validation) {
    if (param.validation.min !== undefined) {
      baseProperty.typeOptions = {
        ...baseProperty.typeOptions,
        minValue: param.validation.min,
      };
    }
    if (param.validation.max !== undefined) {
      baseProperty.typeOptions = {
        ...baseProperty.typeOptions,
        maxValue: param.validation.max,
      };
    }
  }

  return baseProperty;
};

const mapSicsTypeToN8nType = (sicsType: SicsParameterType): NodePropertyTypes => {
  switch (sicsType) {
    case SicsParameterType.STRING:
      return 'string';
    case SicsParameterType.NUMBER:
      return 'number';
    case SicsParameterType.BOOLEAN:
      return 'boolean';
    case SicsParameterType.OBJECT:
    case SicsParameterType.JSON:
      return 'json';
    case SicsParameterType.ARRAY:
      return 'collection';
    case SicsParameterType.DATE:
      return 'dateTime';
    case SicsParameterType.FILE:
      return 'string';
    case SicsParameterType.OPTIONS:
      return 'options';
    default:
      return 'string';
  }
};

const getDefaultValueForType = (type: SicsParameterType): any => {
  switch (type) {
    case SicsParameterType.STRING:
      return '';
    case SicsParameterType.NUMBER:
      return 0;
    case SicsParameterType.BOOLEAN:
      return false;
    case SicsParameterType.OBJECT:
    case SicsParameterType.JSON:
      return {};
    case SicsParameterType.ARRAY:
      return [];
    case SicsParameterType.DATE:
      return '';
    default:
      return '';
  }
};
