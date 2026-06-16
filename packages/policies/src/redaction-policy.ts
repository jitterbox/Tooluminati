import {
  redactObject,
  type RedactObjectOptions,
} from '@tooluminati/core';
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
