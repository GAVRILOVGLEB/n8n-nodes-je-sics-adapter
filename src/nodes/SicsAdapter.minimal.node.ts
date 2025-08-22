import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
  NodeConnectionType,
} from 'n8n-workflow';

export class SicsAdapterNode implements INodeType {
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
    properties: [
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        default: 'Hello from SICS Adapter!',
        placeholder: 'Enter a test message',
        description: 'The message to process',
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const message = this.getNodeParameter('message', i) as string;

        const newItem: INodeExecutionData = {
          json: {
            success: true,
            message: message,
            timestamp: new Date().toISOString(),
            processed: true,
          },
        };

        returnData.push(newItem);
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: (error as Error).message,
            },
          });
          continue;
        }
        throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
      }
    }

    return [returnData];
  }
}
