import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  INodeProperties,
  INodePropertyOptions,
  NodeOperationError,
  NodeConnectionType,
} from 'n8n-workflow';

import { SicsAdapter, ConfigLoader } from '../shared';
import {
  SicsAction,
  SicsExecutionContext,
  SicsTeamConfig,
  mapSicsParameterToNodeProperty,
} from '../infrastructure/types';

export class SicsAdapterNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'SICS Adapter',
    name: 'sicsAdapter',
    icon: 'fa:cogs',
    group: ['transform'],
    version: [1, 2],
    subtitle: '={{$parameter["action"] + " (v" + $parameter["version"] + ")"}}',
    description: 'Execute SICS Flow Adapter actions with version management',
    defaults: {
      name: 'SICS Adapter',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [],
    properties: [
      {
        displayName: 'Team',
        name: 'team',
        type: 'options',
        options: [],
        default: 'default',
        required: true,
        description: 'Select the development team configuration',
      },
      {
        displayName: 'Version',
        name: 'version',
        type: 'options',
        options: [],
        default: '1.0.0',
        required: true,
        description: 'Select the SICS version to use',
        displayOptions: {
          show: {
            team: [''],
          },
        },
      },
      {
        displayName: 'Action',
        name: 'action',
        type: 'options',
        options: [],
        default: '',
        required: true,
        description: 'Select the SICS action to execute',
        displayOptions: {
          show: {
            team: [''],
            version: [''],
          },
        },
      },
      {
        displayName: 'Additional Fields',
        name: 'additionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        options: [],
        displayOptions: {
          show: {
            action: [''],
          },
        },
      },
    ],
  };

  methods = {
    loadOptions: {
      async getTeams(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const configLoader = ConfigLoader.getInstance();
          const config = configLoader.loadConfig();
          const sicsAdapter = new SicsAdapter(config);

          const teams = sicsAdapter.getVersionManager().getAllTeams();

          return teams.map((team: SicsTeamConfig) => ({
            name: team.teamName,
            value: team.teamId,
            description: `Supported versions: ${team.supportedVersions.join(', ')}`,
          }));
        } catch (error) {
          throw new NodeOperationError(this.getNode(), `Failed to load teams: ${error}`);
        }
      },

      async getVersions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const teamId = this.getNodeParameter('team', 0) as string;
          if (!teamId) {
            return [];
          }

          const configLoader = ConfigLoader.getInstance();
          const config = configLoader.loadConfig();
          const sicsAdapter = new SicsAdapter(config);

          const teamConfig = sicsAdapter.getVersionManager().getTeamConfig(teamId);
          if (!teamConfig) {
            return [];
          }

          return teamConfig.supportedVersions.map((version: string) => ({
            name: version,
            value: version,
            description: version === teamConfig.defaultVersion ? 'Default version' : '',
          }));
        } catch (error) {
          throw new NodeOperationError(this.getNode(), `Failed to load versions: ${error}`);
        }
      },

      async getActions(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
        try {
          const teamId = this.getNodeParameter('team', 0) as string;
          const version = this.getNodeParameter('version', 0) as string;

          if (!teamId || !version) {
            return [];
          }

          const configLoader = ConfigLoader.getInstance();
          const config = configLoader.loadConfig();
          const sicsAdapter = new SicsAdapter(config);

          const actions = await sicsAdapter.getAvailableActions(teamId, version);

          return actions.map((action: SicsAction) => ({
            name: action.name,
            value: action.id,
            description: action.description,
          }));
        } catch (error) {
          throw new NodeOperationError(this.getNode(), `Failed to load actions: ${error}`);
        }
      },
    },
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    try {
      const configLoader = ConfigLoader.getInstance();
      const config = configLoader.loadConfig();
      const sicsAdapter = new SicsAdapter(config);

      for (let i = 0; i < items.length; i++) {
        const teamId = this.getNodeParameter('team', i) as string;
        const version = this.getNodeParameter('version', i) as string;
        const actionId = this.getNodeParameter('action', i) as string;
        const additionalFields = this.getNodeParameter('additionalFields', i, {}) as Record<
          string,
          any
        >;

        const action = await sicsAdapter.getActionById(actionId, teamId, version);
        if (!action) {
          throw new NodeOperationError(
            this.getNode(),
            `Action ${actionId} not found for team ${teamId} version ${version}`,
            { itemIndex: i }
          );
        }

        const parameters: Record<string, any> = {
          ...additionalFields,
          ...items[i].json,
        };

        const context: SicsExecutionContext = {
          teamId,
          version,
          action,
          parameters,
          requestId: `n8n_${this.getExecutionId()}_${i}`,
          timestamp: new Date(),
        };

        const result = await sicsAdapter.executeAction(context);

        if (!result.success) {
          if (this.continueOnFail()) {
            returnData.push({
              json: {
                error: result.error,
                executionTime: result.executionTime,
                requestId: result.requestId,
              },
              pairedItem: { item: i },
            });
            continue;
          } else {
            throw new NodeOperationError(
              this.getNode(),
              `SICS execution failed: ${result.error?.message}`,
              {
                itemIndex: i,
                description: result.error?.details,
              }
            );
          }
        }

        returnData.push({
          json: {
            ...result.data,
            _sics: {
              executionTime: result.executionTime,
              requestId: result.requestId,
              action: actionId,
              version,
              team: teamId,
            },
          },
          pairedItem: { item: i },
        });
      }
    } catch (error) {
      if (this.continueOnFail()) {
        return [
          [
            {
              json: {
                error: (error as Error).message,
                stack: (error as Error).stack,
              },
            },
          ],
        ];
      }
      throw error;
    }

    return [returnData];
  }
}
