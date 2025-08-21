export * from './nodes';
export * from './shared';
export * from './infrastructure/types';

import { SicsAdapterNode } from './nodes/SicsAdapter.node';

export const nodes = [SicsAdapterNode];

export default {
  nodes,
};
