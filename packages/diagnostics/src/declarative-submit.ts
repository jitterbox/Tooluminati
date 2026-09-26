export const WEBMCP_DECLARATIVE_FOCUS_STYLES = `
form:tool-form-active {
  outline: light-dark(#0aadf2, #0aadf2) dashed 1px;
  outline-offset: -1px;
}

:tool-submit-active {
  outline: light-dark(#fecd10, #fecd10) dashed 1px;
  outline-offset: -1px;
}
`;

type AgentSubmitEvent = SubmitEvent & {
  agentInvoked?: boolean;
  respondWith?: (result: Promise<unknown>) => void;
};

export function isAgentInvokedSubmit(event: Event): boolean {
  return Boolean((event as AgentSubmitEvent).agentInvoked);
}

export function respondWithAgentResult(
  event: Event,
  result: unknown,
): boolean {
  const submit = event as AgentSubmitEvent;
  if (!submit.agentInvoked || typeof submit.respondWith !== 'function') {
    return false;
  }

  submit.preventDefault();
  submit.respondWith(Promise.resolve(result));
  return true;
}

export function ensureDeclarativeFocusStyles(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const id = 'tooluminati-webmcp-declarative-focus';
  if (document.getElementById(id)) {
    return;
  }

  const style = document.createElement('style');
  style.id = id;
  style.textContent = WEBMCP_DECLARATIVE_FOCUS_STYLES;
  document.head.appendChild(style);
}
