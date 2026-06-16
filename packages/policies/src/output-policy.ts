import { enforceOutputBudget } from '@react-webmcp-diagnostics/core';
import type { OutputPolicy } from './types';

export interface OutputPolicyOptions {
  maxChars?: number;
  truncate?: boolean;
}

export function createOutputPolicy(
  options: OutputPolicyOptions = {},
): OutputPolicy {
  return {
    enforce(value) {
      return enforceOutputBudget(
        value,
        options.maxChars ?? 1500,
        options.truncate ?? false,
      );
    },
  };
}

export const defaultOutputPolicy = createOutputPolicy();
