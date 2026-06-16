import type { JsonSchema } from '@tooluminati/core';

export function inferSchemaFromValue(value: unknown): JsonSchema | undefined {
  if (typeof value === 'string') {
    return { type: 'string' };
  }

  if (typeof value === 'number') {
    return { type: 'number' };
  }

  if (typeof value === 'boolean') {
    return { type: 'boolean' };
  }

  if (value === null || value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return undefined;
    }

    const items = inferSchemaFromValue(value[0]);
    return items ? { type: 'array', items } : undefined;
  }

  if (typeof value === 'object') {
    const properties: Record<string, JsonSchema> = {};
    const required: string[] = [];

    for (const [key, childValue] of Object.entries(
      value as Record<string, unknown>,
    )) {
      const childSchema = inferSchemaFromValue(childValue);
      if (!childSchema) {
        return undefined;
      }

      properties[key] = childSchema;
      if (childValue !== undefined) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required,
      additionalProperties: false,
    };
  }

  return undefined;
}
