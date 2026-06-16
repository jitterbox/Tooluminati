import {
  redactObject,
  type RedactObjectOptions,
} from '@react-webmcp-diagnostics/core';
import type { RedactionPolicy } from './types';

export function createRedactionPolicy(
  options: RedactObjectOptions = {},
): RedactionPolicy {
  return {
    redact(value) {
      return redactObject(value, options);
    },
  };
}

export const defaultRedactionPolicy = createRedactionPolicy();
