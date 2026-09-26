import type {
  JsonSchema,
  WebMcpToolDescriptor,
} from '@tooluminati/core';

export interface MountedFormSummary {
  name: string;
  submitting?: boolean | undefined;
  validating?: boolean | undefined;
  dirty?: boolean | undefined;
  touched?: boolean | undefined;
  errors: Array<{
    path: string;
    message: string;
    kind?: string | undefined;
  }>;
  schema?: JsonSchema | undefined;
}

export interface MountedFormsRegistry {
  register(summary: MountedFormSummary): () => void;
  unregister(name: string): void;
  list(): MountedFormSummary[];
}

/** @experimental */
export function createMountedFormsRegistry(): MountedFormsRegistry {
  const forms = new Map<string, MountedFormSummary>();

  return {
    register(summary) {
      forms.set(summary.name, summary);
      return () => {
        forms.delete(summary.name);
      };
    },
    unregister(name) {
      forms.delete(name);
    },
    list() {
      return [...forms.values()];
    },
  };
}

/** @experimental */
export function createMountedFormsSummaryTool(
  registry: MountedFormsRegistry,
  name = 'get_mounted_forms_summary',
): WebMcpToolDescriptor<
  Record<string, never>,
  { forms: MountedFormSummary[] }
> {
  return {
    name,
    description:
      'Returns summaries of mounted form diagnostics registered in the app.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, debugging: true },
    execute: () => ({ forms: registry.list() }),
  };
}
