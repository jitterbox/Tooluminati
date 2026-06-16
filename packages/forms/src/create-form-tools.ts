import type { WebMcpToolDescriptor } from '@tooluminati/core';
import { inferSchemaFromValue } from './infer-schema';
import type {
  FormDiagnosticSummary,
  FormError,
  WebMcpFormToolOptions,
} from './types';

function formatFormErrors(errors: FormError[], message?: string): string {
  const lines = errors.map((error) =>
    `${error.path ? `${error.path}: ` : ''}${error.message || error.kind}`,
  );

  return [message, ...lines].filter(Boolean).join('\n');
}

function applyRedactResult<T>(
  result: T,
  redactResult?: (value: unknown) => unknown,
): T {
  if (!redactResult) {
    return result;
  }

  return redactResult(result) as T;
}

export function createFormValidationSummaryTool<TValues>(
  options: WebMcpFormToolOptions<TValues>,
): WebMcpToolDescriptor<Record<string, never>, FormDiagnosticSummary> {
  const schema = options.schema ?? inferSchemaFromValue(options.getValues());

  return {
    name: `${options.name}_validation_summary`,
    description:
      'Returns form schema, validation messages, and submitting/validating state without submitting.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
    execute: () => {
      const summary: FormDiagnosticSummary = {
        name: options.name,
        errors: options.getErrors?.() ?? [],
        schema,
        ...options.getSummary?.(),
      };

      if (options.redactValues) {
        return {
          ...summary,
          values: options.redactValues(options.getValues()),
        };
      }

      return summary;
    },
  };
}

export function createFormSubmitTool<TValues>(
  options: WebMcpFormToolOptions<TValues>,
): WebMcpToolDescriptor {
  const schema = options.schema ?? inferSchemaFromValue(options.getValues());

  if (!schema) {
    throw new Error(
      `Could not infer WebMCP schema for form "${options.name}". ` +
        'Provide an explicit schema or use concrete non-null defaults.',
    );
  }

  return {
    name: options.name,
    description: options.description,
    inputSchema: schema,
    annotations: {
      readOnlyHint: false,
      ...options.annotations,
    },
    validateArgs: options.validateArgs,
    execute: async (rawArgs) => {
      const values = options.validateArgs
        ? options.validateArgs(rawArgs)
        : (rawArgs as TValues);
      await options.setValues(values);
      const result = await options.submit();

      if (result.success) {
        let output: unknown = result.message ?? 'Form submitted successfully.';
        if (result.data !== undefined) {
          output = {
            message: output,
            data: options.redactValues
              ? options.redactValues(result.data as TValues)
              : result.data,
          };
        }

        return applyRedactResult(output, options.redactResult);
      }

      const errors = result.errors ?? options.getErrors?.() ?? [];
      return applyRedactResult(
        {
          content: [
            {
              type: 'text',
              text: `Form submission failed:\n${formatFormErrors(
                errors,
                result.message,
              )}`,
            },
          ],
          isError: true,
        },
        options.redactResult,
      );
    },
  };
}

export function createWebMcpFormTools<TValues>(
  options: WebMcpFormToolOptions<TValues>,
): WebMcpToolDescriptor[] {
  const includeValidationSummary = options.includeValidationSummary ?? true;
  const submitTool = createFormSubmitTool(options);

  if (includeValidationSummary) {
    return [
      submitTool,
      createFormValidationSummaryTool(options) as WebMcpToolDescriptor,
    ];
  }

  return [submitTool];
}
