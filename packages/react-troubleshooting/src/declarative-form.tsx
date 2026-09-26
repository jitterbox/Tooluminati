import {
  type FormEventHandler,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type FormHTMLAttributes,
} from 'react';
import {
  isAgentInvokedSubmit,
  respondWithAgentResult,
} from '@tooluminati/diagnostics';

export {
  isAgentInvokedSubmit,
  respondWithAgentResult,
  WEBMCP_DECLARATIVE_FOCUS_STYLES,
  ensureDeclarativeFocusStyles,
} from '@tooluminati/diagnostics';

export interface WebMcpFormProps extends FormHTMLAttributes<HTMLFormElement> {
  toolName: string;
  toolDescription: string;
  toolAutoSubmit?: boolean;
  children: ReactNode;
}

export function WebMcpForm({
  toolName,
  toolDescription,
  toolAutoSubmit,
  children,
  ...props
}: WebMcpFormProps) {
  return (
    <form
      {...props}
      toolname={toolName}
      tooldescription={toolDescription}
      {...(toolAutoSubmit ? { toolautosubmit: '' as const } : {})}
    >
      {children}
    </form>
  );
}

export function WebMcpInput(
  props: InputHTMLAttributes<HTMLInputElement> & {
    toolParamDescription?: string;
  },
) {
  const { toolParamDescription, ...rest } = props;
  return (
    <input
      {...rest}
      {...(toolParamDescription
        ? { toolparamdescription: toolParamDescription }
        : {})}
    />
  );
}

export function WebMcpSelect(
  props: SelectHTMLAttributes<HTMLSelectElement> & {
    toolParamDescription?: string;
  },
) {
  const { toolParamDescription, ...rest } = props;
  return (
    <select
      {...rest}
      {...(toolParamDescription
        ? { toolparamdescription: toolParamDescription }
        : {})}
    />
  );
}

export function WebMcpTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement> & {
    toolParamDescription?: string;
  },
) {
  const { toolParamDescription, ...rest } = props;
  return (
    <textarea
      {...rest}
      {...(toolParamDescription
        ? { toolparamdescription: toolParamDescription }
        : {})}
    />
  );
}

export function useAgentInvokedSubmit(
  handler: FormEventHandler<HTMLFormElement>,
): FormEventHandler<HTMLFormElement> {
  return (event) => {
    if (isAgentInvokedSubmit(event.nativeEvent)) {
      handler(event);
    }
  };
}

export function useAgentSubmitRespondWith(
  getResult: () => unknown | Promise<unknown>,
): FormEventHandler<HTMLFormElement> {
  return (event) => {
    const nativeEvent = event.nativeEvent as SubmitEvent & {
      respondWith?: unknown;
    };
    if (
      !isAgentInvokedSubmit(nativeEvent) ||
      typeof nativeEvent.respondWith !== 'function'
    ) {
      return;
    }
    // Supply respondWith synchronously; capture synchronous handler failures in its promise.
    respondWithAgentResult(nativeEvent, Promise.resolve().then(getResult));
  };
}

export interface DeclarativeFormToolEventsOptions {
  formSelector?: string;
}

export function useDeclarativeFormToolEvents(
  _options: DeclarativeFormToolEventsOptions = {},
): void {
  // Agent form submits are captured by createWebMcpLifecycleCollector().
}
