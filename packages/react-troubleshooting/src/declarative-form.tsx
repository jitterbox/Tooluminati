import {
  type FormEventHandler,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  type FormHTMLAttributes,
} from 'react';

type AgentSubmitEvent = SubmitEvent & { agentInvoked?: boolean };

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
    const submitEvent = event.nativeEvent as AgentSubmitEvent;
    if (submitEvent.agentInvoked) {
      handler(event);
    }
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
