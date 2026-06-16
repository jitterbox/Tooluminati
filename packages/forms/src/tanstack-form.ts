import { useWebMcpFormTool } from './useWebMcpFormTool';
import type { FormError, WebMcpFormToolOptions } from './types';

export interface TanStackFormLike<TValues> {
  state: {
    values: TValues;
    errors?: unknown[];
    isSubmitting?: boolean;
    isValidating?: boolean;
    isDirty?: boolean;
  };
  setFieldValue?: (field: string, value: unknown) => void;
  handleSubmit: () => void | Promise<void>;
}

export interface TanStackFormWebMcpOptions<TValues>
  extends Pick<
    WebMcpFormToolOptions<TValues>,
    'name' | 'description' | 'schema' | 'validateArgs' | 'annotations'
  > {
  form: TanStackFormLike<TValues>;
}

function flattenTanStackErrors(errors: unknown[] = []): FormError[] {
  return errors.map((error, index) => ({
    path:
      typeof error === 'object' && error && 'path' in error
        ? String((error as { path: unknown }).path)
        : String(index),
    message:
      typeof error === 'object' && error && 'message' in error
        ? String((error as { message: unknown }).message)
        : String(error),
  }));
}

export function useTanStackFormWebMcpTool<TValues>({
  form,
  ...options
}: TanStackFormWebMcpOptions<TValues>): void {
  useWebMcpFormTool({
    ...options,
    getValues: () => form.state.values,
    setValues: (values) => {
      for (const [field, value] of Object.entries(
        values as Record<string, unknown>,
      )) {
        form.setFieldValue?.(field, value);
      }
    },
    getErrors: () => flattenTanStackErrors(form.state.errors),
    getSummary: () => ({
      submitting: form.state.isSubmitting,
      validating: form.state.isValidating,
      dirty: form.state.isDirty,
    }),
    submit: async () => {
      await form.handleSubmit();
      const errors = flattenTanStackErrors(form.state.errors);
      return errors.length > 0 ? { success: false, errors } : { success: true };
    },
  });
}
