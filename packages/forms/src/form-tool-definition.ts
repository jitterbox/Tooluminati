import type { JsonSchema } from '@tooluminati/core';

/** @internal Declarative-compat metadata; not shipped as a browser polyfill. */
export interface FormToolDefinition<TValues = Record<string, unknown>> {
  name: string;
  description: string;
  schema?: JsonSchema;
  getValues: () => TValues;
  setValues: (values: TValues) => void | Promise<void>;
  submit: () => unknown | Promise<unknown>;
}
