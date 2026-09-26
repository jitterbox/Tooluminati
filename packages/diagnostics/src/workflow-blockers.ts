import type { WebMcpToolDescriptor } from '@tooluminati/core';
import type { ActionAvailabilityProvider } from './action-availability';
import type { ClientErrorSummary } from './errors';
import type { MountedFormSummary } from './mounted-forms';

export interface FormDiagnosticSummary {
  name: string;
  valid: boolean;
  submitting?: boolean | undefined;
  blockers: string[];
}

export interface DeclarativeFormSummary {
  toolName: string;
  formId?: string | undefined;
  autoSubmit?: boolean | undefined;
}

export interface QuerySummary {
  queryKey: string;
  status: string;
  error?: string | undefined;
  isFetching?: boolean | undefined;
}

export interface WorkflowBlockersSources {
  actionProvider?: ActionAvailabilityProvider | undefined;
  formSummaries?: () => FormDiagnosticSummary[];
  declarativeFormSummaries?: () => DeclarativeFormSummary[];
  querySummaries?: () => QuerySummary[];
  recentErrors?: () => ClientErrorSummary[];
  hydrationHealth?: () => { healthy: boolean; issues: string[] };
  featureFlags?: () => Record<string, boolean>;
}

export interface WorkflowBlockersResult {
  actions: Array<{
    actionId: string;
    available: boolean;
    reasons: string[];
  }>;
  forms: FormDiagnosticSummary[];
  declarativeForms: DeclarativeFormSummary[];
  queries: QuerySummary[];
  errors: ClientErrorSummary[];
  hydration?: { healthy: boolean; issues: string[] };
  featureFlags?: Record<string, boolean>;
}

export function createWorkflowBlockersTool(
  sources: WorkflowBlockersSources,
  name = 'get_workflow_blockers',
): WebMcpToolDescriptor<Record<string, never>, WorkflowBlockersResult> {
  return {
    name,
    description:
      'Aggregates action, form, query, and error blockers for the current workflow.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
      debugging: true,
    },
    execute: () => {
      const actions =
        sources.actionProvider?.listActions?.().map((action) => ({
          actionId: action.actionId,
          available: action.available,
          reasons: action.available ? [] : action.reasons,
        })) ?? [];

      const result: WorkflowBlockersResult = {
        actions,
        forms: sources.formSummaries?.() ?? [],
        declarativeForms: sources.declarativeFormSummaries?.() ?? [],
        queries: sources.querySummaries?.() ?? [],
        errors: sources.recentErrors?.() ?? [],
      };

      const hydration = sources.hydrationHealth?.();
      if (hydration) {
        result.hydration = hydration;
      }

      const flags = sources.featureFlags?.();
      if (flags) {
        result.featureFlags = flags;
      }

      return result;
    },
  };
}

export function formSummaryFromMounted(
  form: MountedFormSummary,
): FormDiagnosticSummary {
  const blockers = form.errors.map((e) => `${e.path}: ${e.message}`);
  if (form.submitting) {
    blockers.push('Form is submitting.');
  }
  return {
    name: form.name,
    valid: blockers.length === 0,
    submitting: form.submitting,
    blockers,
  };
}

export function discoverDeclarativeForms(
  root: ParentNode = typeof document !== 'undefined' ? document : (null as never),
): DeclarativeFormSummary[] {
  if (!root) {
    return [];
  }
  const summaries = new Map<string, DeclarativeFormSummary>();

  for (const form of root.querySelectorAll('form[toolname]')) {
    const el = form as HTMLFormElement;
    summaries.set(el.getAttribute('toolname') ?? 'unknown', {
      toolName: el.getAttribute('toolname') ?? 'unknown',
      ...(el.id ? { formId: el.id } : {}),
      autoSubmit: el.hasAttribute('toolautosubmit'),
    });
  }

  return [...summaries.values()];
}
