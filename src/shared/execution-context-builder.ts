import { SicsExecutionContext, SicsAction } from '../infrastructure/types';

export class ExecutionContextBuilder {
  private context: Partial<SicsExecutionContext> = {};

  static create(): ExecutionContextBuilder {
    return new ExecutionContextBuilder();
  }

  withTeam(teamId: string): ExecutionContextBuilder {
    this.context.teamId = teamId;
    return this;
  }

  withVersion(version: string): ExecutionContextBuilder {
    this.context.version = version;
    return this;
  }

  withAction(action: SicsAction): ExecutionContextBuilder {
    this.context.action = action;
    return this;
  }

  withParameters(parameters: Record<string, any>): ExecutionContextBuilder {
    this.context.parameters = { ...parameters };
    return this;
  }

  addParameter(key: string, value: any): ExecutionContextBuilder {
    if (!this.context.parameters) {
      this.context.parameters = {};
    }
    this.context.parameters[key] = value;
    return this;
  }

  withRequestId(requestId: string): ExecutionContextBuilder {
    this.context.requestId = requestId;
    return this;
  }

  withTimestamp(timestamp: Date): ExecutionContextBuilder {
    this.context.timestamp = timestamp;
    return this;
  }

  withCurrentTimestamp(): ExecutionContextBuilder {
    this.context.timestamp = new Date();
    return this;
  }

  generateRequestId(prefix: string = 'sics'): ExecutionContextBuilder {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    this.context.requestId = `${prefix}_${timestamp}_${random}`;
    return this;
  }

  build(): SicsExecutionContext {
    if (!this.context.teamId) {
      throw new Error('Team ID is required');
    }
    
    if (!this.context.version) {
      throw new Error('Version is required');
    }
    
    if (!this.context.action) {
      throw new Error('Action is required');
    }
    
    if (!this.context.parameters) {
      this.context.parameters = {};
    }
    
    if (!this.context.requestId) {
      this.generateRequestId();
    }
    
    if (!this.context.timestamp) {
      this.withCurrentTimestamp();
    }

    return this.context as SicsExecutionContext;
  }

  clone(): ExecutionContextBuilder {
    const builder = new ExecutionContextBuilder();
    builder.context = { 
      ...this.context,
      parameters: this.context.parameters ? { ...this.context.parameters } : undefined
    };
    return builder;
  }

  reset(): ExecutionContextBuilder {
    this.context = {};
    return this;
  }

  getPartialContext(): Partial<SicsExecutionContext> {
    return { ...this.context };
  }

  validate(): string[] {
    const errors: string[] = [];

    if (!this.context.teamId) {
      errors.push('Team ID is required');
    }

    if (!this.context.version) {
      errors.push('Version is required');
    }

    if (!this.context.action) {
      errors.push('Action is required');
    } else {
      if (!this.context.action.id) {
        errors.push('Action ID is required');
      }
      if (!this.context.action.flowAdapterEndpoint) {
        errors.push('Action flow adapter endpoint is required');
      }
    }

    if (this.context.parameters && this.context.action) {
      const requiredParams = this.context.action.parameters.filter(p => p.required);
      for (const param of requiredParams) {
        if (this.context.parameters[param.name] === undefined || 
            this.context.parameters[param.name] === null) {
          errors.push(`Required parameter '${param.name}' is missing`);
        }
      }
    }

    return errors;
  }

  isValid(): boolean {
    return this.validate().length === 0;
  }
}
