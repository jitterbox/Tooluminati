import type { WebMcpToolDescriptor } from '@tooluminati/core';
import type { ConfirmationPolicy } from './types';

export function createConfirmationPolicy(
  predicate: (tool: WebMcpToolDescriptor) => boolean = (tool) =>
    tool.confirmBeforeExecute === true ||
    tool.annotations?.readOnlyHint === false,
): ConfirmationPolicy {
  return {
    requiresConfirmation: predicate,
  };
}

export const defaultConfirmationPolicy = createConfirmationPolicy();
