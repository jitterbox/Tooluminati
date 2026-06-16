import { describe, expect, it } from 'vitest';
import { inferSchemaFromValue } from './infer-schema';

describe('inferSchemaFromValue', () => {
  it('infers primitive types', () => {
    expect(inferSchemaFromValue('hello')).toEqual({ type: 'string' });
    expect(inferSchemaFromValue(42)).toEqual({ type: 'number' });
    expect(inferSchemaFromValue(3.14)).toEqual({ type: 'number' });
    expect(inferSchemaFromValue(true)).toEqual({ type: 'boolean' });
  });

  it('returns undefined for null, undefined, and empty arrays', () => {
    expect(inferSchemaFromValue(null)).toBeUndefined();
    expect(inferSchemaFromValue(undefined)).toBeUndefined();
    expect(inferSchemaFromValue([])).toBeUndefined();
  });

  it('infers nested object schemas', () => {
    expect(
      inferSchemaFromValue({ name: 'Ada', age: 30, active: true }),
    ).toEqual({
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'number' },
        active: { type: 'boolean' },
      },
      required: ['name', 'age', 'active'],
      additionalProperties: false,
    });
  });
});
