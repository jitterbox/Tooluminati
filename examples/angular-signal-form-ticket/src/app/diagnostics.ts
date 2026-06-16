import { isDevMode, signal } from '@angular/core';
import { provideWebMcpRegistry } from '@tooluminati/angular';
import { provideWebMcpFormTool } from '@tooluminati/angular-forms';
import type { FormError } from '@tooluminati/forms';

export interface TicketValues {
  subject: string;
  message: string;
}

const values = signal<TicketValues>({ subject: '', message: '' });
const submitting = signal(false);
export const submittedId = signal<string | null>(null);

function getErrors(): FormError[] {
  const current = values();
  const errors: FormError[] = [];

  if (!current.subject.trim()) {
    errors.push({ path: 'subject', message: 'Subject is required.' });
  }

  if (!current.message.trim()) {
    errors.push({ path: 'message', message: 'Message is required.' });
  }

  return errors;
}

export function updateTicketField(
  field: keyof TicketValues,
  value: string,
): void {
  values.update((current) => ({ ...current, [field]: value }));
}

export function getTicketValues(): TicketValues {
  return values();
}

export const ticketValues = values;
export const ticketSubmitting = submitting;

export const appProviders = [
  provideWebMcpRegistry({ enabled: isDevMode() }),
  provideWebMcpFormTool({
    name: 'submit_support_ticket',
    description: 'Fill and submit the support ticket form.',
    getValues: () => values(),
    setValues: (next) => values.set(next),
    getErrors,
    getSummary: () => ({
      submitting: submitting(),
      dirty: true,
      touched: true,
    }),
    submit: async () => {
      submitting.set(true);
      const errors = getErrors();

      if (errors.length > 0) {
        submitting.set(false);
        return { success: false, errors };
      }

      submittedId.set('demo-123');
      submitting.set(false);
      return {
        success: true,
        data: { ticketId: 'demo-123', subject: values().subject },
      };
    },
  }),
];
