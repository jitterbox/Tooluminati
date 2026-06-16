import type { FormError } from './types';

/** @experimental */
export class FormValidationError extends Error {
  readonly errors: FormError[];

  constructor(message: string, errors: FormError[]) {
    super(message);
    this.name = 'FormValidationError';
    this.errors = errors;
  }
}
