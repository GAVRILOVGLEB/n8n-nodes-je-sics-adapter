import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeConnectionType,
} from 'n8n-workflow';

export class SicsAdapter implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'SICS Adapter',
    name: 'sicsAdapter',
    icon: 'fa:cogs',
    group: ['transform'],
    version: 1,
    description: 'Execute SICS Flow Adapter actions',
    defaults: {
      name: 'SICS Adapter',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Action',
            value: 'action',
          },
        ],
        default: 'action',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['action'],
          },
        },
        options: [
          {
            name: 'Execute Action',
            value: 'executeAction',
            action: 'Execute a SICS action',
          },
        ],
        default: 'executeAction',
      },
      {
        displayName: 'Team',
        name: 'team',
        type: 'string',
        default: 'default-team',
        placeholder: 'Enter team name',
        description: 'The SICS team identifier',
        displayOptions: {
          show: {
            operation: ['executeAction'],
            resource: ['action'],
          },
        },
      },
      {
        displayName: 'Action Name',
        name: 'actionName',
        type: 'string',
        default: 'test-action',
        placeholder: 'Enter action name',
        description: 'The SICS action to execute',
        displayOptions: {
          show: {
            operation: ['executeAction'],
            resource: ['action'],
          },
        },
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        default: 'Hello from SICS Adapter!',
        placeholder: 'Enter message',
        description: 'The message to process',
        displayOptions: {
          show: {
            operation: ['executeAction'],
            resource: ['action'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];
    const resource = this.getNodeParameter('resource', 0);
    const operation = this.getNodeParameter('operation', 0);

    for (let i = 0; i < items.length; i++) {
      try {
        if (resource === 'action') {
          if (operation === 'executeAction') {
            const team = this.getNodeParameter('team', i) as string;
            const actionName = this.getNodeParameter('actionName', i) as string;
            const message = this.getNodeParameter('message', i) as string;

            const response: any = {
              success: true,
              team,
              actionName,
              message,
              timestamp: new Date().toISOString(),
              nodeVersion: '1.0.31',
              processed: true,
            };

            const newItem: INodeExecutionData = {
              json: {
                ...items[i].json,
                sicsAdapter: response,
              },
            };

            returnData.push(newItem);
          }
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
              success: false,
            },
          });
          continue;
        }
        throw new NodeOperationError(this.getNode(), error as Error, {
          itemIndex: i,
        });
      }
    }

    return [returnData];
  }
}
