import { useWebMcpFormTool } from './useWebMcpFormTool';
import type { FormError, WebMcpFormToolOptions } from './types';

export interface ReactHookFormLike<TValues> {
  getValues(): TValues;
  reset(values: TValues): void;
  trigger(): Promise<boolean>;
  handleSubmit(
    onValid: (values: TValues) => void | Promise<void>,
    onInvalid?: () => void | Promise<void>,
  ): () => Promise<void> | void;
  formState: {
    errors?: unknown;
    isSubmitting?: boolean;
    isValidating?: boolean;
    isDirty?: boolean;
    touchedFields?: unknown;
  };
}

export interface ReactHookFormWebMcpOptions<TValues>
  extends Pick<
    WebMcpFormToolOptions<TValues>,
    'name' | 'description' | 'schema' | 'validateArgs' | 'annotations'
  > {
  form: ReactHookFormLike<TValues>;
  onValidSubmit: (values: TValues) => unknown | Promise<unknown>;
}

export function flattenReactHookFormErrors(
  errors: unknown,
  prefix = '',
): FormError[] {
  if (!errors || typeof errors !== 'object') {
    return [];
  }

  return Object.entries(errors as Record<string, any>).flatMap(
    ([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value?.message || value?.type) {
        return [
          {
            path,
            message: String(value.message ?? value.type),
            kind: value.type ? String(value.type) : undefined,
          },
        ];
      }

      return flattenReactHookFormErrors(value, path);
    },
  );
}

export function useReactHookFormWebMcpTool<TValues>({
  form,
  onValidSubmit,
  ...options
}: ReactHookFormWebMcpOptions<TValues>): void {
  useWebMcpFormTool({
    ...options,
    getValues: () => form.getValues(),
    setValues: async (values) => {
      form.reset(values);
      await form.trigger();
    },
    getErrors: () => flattenReactHookFormErrors(form.formState.errors),
    getSummary: () => ({
      submitting: form.formState.isSubmitting,
      validating: form.formState.isValidating,
      dirty: form.formState.isDirty,
      touched: Boolean(form.formState.touchedFields),
    }),
    submit: async () => {
      let valid = false;
      let data: unknown;

      await form.handleSubmit(
        async (values) => {
          valid = true;
          data = await onValidSubmit(values);
        },
        async () => {
          valid = false;
        },
      )();

      if (valid) {
        return { success: true, data };
      }

      return {
        success: false,
        errors: flattenReactHookFormErrors(form.formState.errors),
      };
    },
  });
}
