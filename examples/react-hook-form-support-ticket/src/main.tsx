import { StrictMode, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  type ReactHookFormLike,
  useReactHookFormWebMcpTool,
} from '@tooluminati/forms';
import {
  WebMcpProvider,
  WebMcpSecurityBanner,
} from '@tooluminati/react';

interface TicketValues {
  subject: string;
  message: string;
}

function useMockReactHookForm(
  initial: TicketValues,
): ReactHookFormLike<TicketValues> {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Record<string, { message: string }>>(
    {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  return useMemo(
    () => ({
      getValues: () => values,
      reset: (next) => {
        setValues(next);
        setErrors({});
      },
      trigger: async () => {
        const nextErrors: Record<string, { message: string }> = {};
        if (!values.subject.trim()) {
          nextErrors.subject = { message: 'Subject is required.' };
        }
        if (!values.message.trim()) {
          nextErrors.message = { message: 'Message is required.' };
        }
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
      },
      handleSubmit: (onValid, onInvalid) => async () => {
        setIsSubmitting(true);
        const valid = await (async () => {
          const nextErrors: Record<string, { message: string }> = {};
          if (!values.subject.trim()) {
            nextErrors.subject = { message: 'Subject is required.' };
          }
          if (!values.message.trim()) {
            nextErrors.message = { message: 'Message is required.' };
          }
          setErrors(nextErrors);
          return Object.keys(nextErrors).length === 0;
        })();

        if (valid) {
          await onValid(values);
        } else {
          await onInvalid?.();
        }

        setIsSubmitting(false);
      },
      formState: {
        errors,
        isSubmitting,
        isValidating: false,
        isDirty: true,
        touchedFields: { subject: true, message: true },
      },
    }),
    [errors, isSubmitting, values],
  );
}

function SupportTicketForm() {
  const form = useMockReactHookForm({ subject: '', message: '' });
  const values = form.getValues();

  useReactHookFormWebMcpTool({
    form,
    name: 'submit_support_ticket',
    description: 'Fill and submit the support ticket form.',
    onValidSubmit: async (ticket) => ({
      ticketId: 'demo-123',
      subject: ticket.subject,
    }),
  });

  return (
    <main>
      <WebMcpSecurityBanner />
      <h1>Support Ticket</h1>
      <label>
        Subject
        <input
          value={values.subject}
          onChange={(event) =>
            form.reset({ ...values, subject: event.currentTarget.value })
          }
        />
      </label>
      <label>
        Message
        <textarea
          value={values.message}
          onChange={(event) =>
            form.reset({ ...values, message: event.currentTarget.value })
          }
        />
      </label>
      <button type="button" onClick={() => void form.handleSubmit(() => {})()}>
        Submit ticket
      </button>
    </main>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <WebMcpProvider enabled={import.meta.env.DEV}>
      <SupportTicketForm />
    </WebMcpProvider>
  </StrictMode>,
);
