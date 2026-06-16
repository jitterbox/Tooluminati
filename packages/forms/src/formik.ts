import { useWebMcpFormTool } from './useWebMcpFormTool';
import type { FormError, WebMcpFormToolOptions } from './types';

export interface FormikLike<TValues> {
  values: TValues;
  errors?: unknown;
  touched?: unknown;
  isSubmitting?: boolean;
  isValidating?: boolean;
  setValues(values: TValues): void | Promise<void>;
  validateForm(): Promise<unknown>;
  submitForm(): Promise<void>;
}

export interface FormikWebMcpOptions<TValues>
  extends Pick<
    WebMcpFormToolOptions<TValues>,
    'name' | 'description' | 'schema' | 'validateArgs' | 'annotations'
  > {
  formik: FormikLike<TValues>;
}

function flattenErrors(errors: unknown, prefix = ''): FormError[] {
  if (!errors || typeof errors !== 'object') {
    return [];
  }

  return Object.entries(errors as Record<string, unknown>).flatMap(
    ([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'string') {
        return [{ path, message: value }];
      }
      return flattenErrors(value, path);
    },
  );
}

export function useFormikWebMcpTool<TValues>({
  formik,
  ...options
}: FormikWebMcpOptions<TValues>): void {
  useWebMcpFormTool({
    ...options,
    getValues: () => formik.values,
    setValues: (values) => formik.setValues(values),
    getErrors: () => flattenErrors(formik.errors),
    getSummary: () => ({
      submitting: formik.isSubmitting,
      validating: formik.isValidating,
      touched: Boolean(formik.touched),
    }),
    submit: async () => {
      const errors = await formik.validateForm();
      const flattened = flattenErrors(errors);
      if (flattened.length > 0) {
        return { success: false, errors: flattened };
      }
      await formik.submitForm();
      return { success: true };
    },
  });
}
