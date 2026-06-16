import type {
  JsonSchema,
  WebMcpToolAnnotations,
} from '@react-webmcp-diagnostics/core';

export interface FormError {
  path: string;
  message: string;
  kind?: string | undefined;
}

export interface FormDiagnosticSummary {
  name: string;
  submitting?: boolean | undefined;
  validating?: boolean | undefined;
  dirty?: boolean | undefined;
  touched?: boolean | undefined;
  errors: FormError[];
  schema?: JsonSchema | undefined;
  values?: unknown;
}

export type FormSubmitResult =
  | { success: true; message?: string; data?: unknown }
  | { success: false; message?: string; errors?: FormError[] };

export interface WebMcpFormToolOptions<TValues> {
  name: string;
  description: string;
  schema?: JsonSchema;
  getValues: () => TValues;
  setValues: (values: TValues) => void | Promise<void>;
  submit: () => FormSubmitResult | Promise<FormSubmitResult>;
  getErrors?: () => FormError[];
  getSummary?: () => Partial<FormDiagnosticSummary>;
  validateArgs?: ((args: unknown) => TValues) | undefined;
  annotations?: WebMcpToolAnnotations | undefined;
  redactValues?: ((values: TValues) => unknown) | undefined;
  redactResult?: ((result: unknown) => unknown) | undefined;
  includeValidationSummary?: boolean | undefined;
}
