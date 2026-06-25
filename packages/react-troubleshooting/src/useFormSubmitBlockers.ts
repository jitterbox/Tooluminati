import { useMemo } from 'react';
import type {
  ActionAvailability,
  ActionAvailabilityProvider,
} from '@tooluminati/diagnostics';
import type { FormDiagnosticSummary } from '@tooluminati/forms';
import { useWebMcpTool } from '@tooluminati/react';
import { createActionAvailabilityTool } from '@tooluminati/diagnostics';

export interface FormSubmitBlockersOptions {
  actionId: string;
  label: string;
  getFormSummary: () => FormDiagnosticSummary;
  getExtraReasons?: () => string[];
}

export function createFormSubmitBlockersProvider(
  options: FormSubmitBlockersOptions,
): ActionAvailabilityProvider {
  return {
    getActionAvailability(actionId) {
      if (actionId !== options.actionId) {
        return undefined;
      }
      const summary = options.getFormSummary();
      const reasons = [
        ...summary.errors.map((e) => `${e.path}: ${e.message}`),
        ...(options.getExtraReasons?.() ?? []),
      ];
      if (summary.submitting) {
        reasons.push('Form is submitting.');
      }
      return {
        actionId,
        label: options.label,
        available: reasons.length === 0,
        reasons,
      };
    },
    listActions(): ActionAvailability[] {
      const action = createFormSubmitBlockersProvider(
        options,
      ).getActionAvailability(options.actionId);
      return action ? [action] : [];
    },
  };
}

export function useFormSubmitBlockers(
  options: FormSubmitBlockersOptions,
): ActionAvailabilityProvider {
  const provider = useMemo(
    () => createFormSubmitBlockersProvider(options),
    [options],
  );
  useWebMcpTool(createActionAvailabilityTool(provider), [provider]);
  return provider;
}
