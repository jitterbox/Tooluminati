import type { RefObject } from 'react';
import { useWebMcpFormTool } from './useWebMcpFormTool';
import type { WebMcpFormToolOptions } from './types';

export interface NativeFormWebMcpOptions
  extends Pick<
    WebMcpFormToolOptions<Record<string, unknown>>,
    'name' | 'description' | 'schema' | 'validateArgs' | 'annotations'
  > {
  formRef: RefObject<HTMLFormElement | null>;
}

export function formDataToObject(form: HTMLFormElement): Record<string, unknown> {
  return Object.fromEntries(new FormData(form).entries());
}

export function useNativeFormWebMcpTool(
  options: NativeFormWebMcpOptions,
): void {
  if (!options.schema) {
    throw new Error('Native form WebMCP tools require an explicit schema.');
  }

  useWebMcpFormTool({
    ...options,
    getValues: () => {
      const form = options.formRef.current;
      return form ? formDataToObject(form) : {};
    },
    setValues: (values) => {
      const form = options.formRef.current;
      if (!form) {
        return;
      }

      for (const [name, value] of Object.entries(values)) {
        const field = form.elements.namedItem(name);
        if (field && 'value' in field) {
          (field as unknown as HTMLInputElement).value = String(value ?? '');
        }
      }
    },
    getErrors: () => [],
    submit: () => {
      const form = options.formRef.current;
      if (!form) {
        return { success: false, message: 'Form is not mounted.' };
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        return { success: false, message: 'Native form validation failed.' };
      }

      form.requestSubmit();
      return { success: true, message: 'Native form submitted.' };
    },
  });
}
