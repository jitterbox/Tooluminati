import type { TroubleshootingEvent } from './timeline';
import type { ClientErrorSummary } from './errors';
import type { WebMcpEnvironmentCheck } from './webmcp-environment';

export interface TroubleshootingGuidanceEntry {
  title: string;
  hint: string;
  severity: 'info' | 'warn' | 'error';
}

export const TROUBLESHOOTING_GUIDANCE: Record<string, TroubleshootingGuidanceEntry> =
  {
    'document.modelContext': {
      title: 'WebMCP host missing',
      hint:
        'No document.modelContext on this page. Enable WebMCP in Chrome or ' +
        'attach the Model Context Inspector Extension. Tools cannot register ' +
        'until this resolves.',
      severity: 'error',
    },
    'navigator.modelContext': {
      title: 'Deprecated fallback in use',
      hint:
        'Migrate from navigator.modelContext to document.modelContext. The ' +
        'fallback is not a supported long-term surface.',
      severity: 'warn',
    },
    'origin-isolation': {
      title: 'Origin isolation review',
      hint:
        'Origin-Agent-Cluster may be ?0 when document.domain is set. Remove ' +
        'document.domain writes or set Origin-Agent-Cluster: ?1.',
      severity: 'warn',
    },
    'permissions-policy': {
      title: 'Permissions-Policy review',
      hint:
        'Cross-origin iframes may block tools unless Permissions-Policy allows ' +
        'the tools feature for this origin.',
      severity: 'warn',
    },
    'tool-count': {
      title: 'No tools registered',
      hint:
        'Verify WebMcpProvider or provideWebMcpRegistry is mounted and tools ' +
        'are registered in the current route scope.',
      severity: 'warn',
    },
    'output-budget': {
      title: 'Tool output budget exceeded',
      hint:
        'A tool emitted more than the recommended ~1.5K chars. Trim fields or ' +
        'enable redaction to stay within Chrome guidance.',
      severity: 'warn',
    },
    fetch_failure: {
      title: 'Fetch failure',
      hint:
        'Inspect get_troubleshooting_timeline and get_workflow_blockers for ' +
        'structured HTTP failure context.',
      severity: 'error',
    },
    client_error: {
      title: 'Client error',
      hint:
        'See get_recent_client_errors and the timeline client_error entries ' +
        'for redacted stack traces in dev.',
      severity: 'error',
    },
    action_blocked: {
      title: 'Action blocked',
      hint:
        'Call why_is_action_unavailable or get_workflow_blockers for reasons ' +
        'beyond disabled=true in the DOM.',
      severity: 'warn',
    },
    toolchange: {
      title: 'Tool registry changed',
      hint:
        'Tools were added or removed. Check route mounts and scoped providers ' +
        'if the count is unexpected.',
      severity: 'info',
    },
    WebMcpUnavailable: {
      title: 'WebMCP unavailable',
      hint:
        'Tooluminati could not find document.modelContext. Registration was ' +
        'deferred until a host becomes available.',
      severity: 'error',
    },
    TypeError: {
      title: 'Runtime TypeError',
      hint:
        'Check component props and optional chaining. Errors are captured by ' +
        'WebMcpErrorBoundary when enabled.',
      severity: 'error',
    },
    NetworkError: {
      title: 'Network failure',
      hint:
        'Verify API availability and CORS. Timeline fetch_failure entries ' +
        'include status and timing.',
      severity: 'error',
    },
  };

export function getGuidanceForEnvironmentCheck(
  check: WebMcpEnvironmentCheck,
): TroubleshootingGuidanceEntry | undefined {
  if (check.hint) {
    return {
      title: check.label,
      hint: check.hint,
      severity:
        check.status === 'fail'
          ? 'error'
          : check.status === 'warn'
            ? 'warn'
            : 'info',
    };
  }
  return TROUBLESHOOTING_GUIDANCE[check.id];
}

export function getGuidanceForTimelineEvent(
  event: TroubleshootingEvent,
): TroubleshootingGuidanceEntry | undefined {
  const base = TROUBLESHOOTING_GUIDANCE[event.category];
  if (base) {
    return {
      ...base,
      hint: event.detail ? `${base.hint} ${event.detail}` : base.hint,
    };
  }
  return undefined;
}

export function getGuidanceForClientError(
  error: ClientErrorSummary,
): TroubleshootingGuidanceEntry | undefined {
  for (const key of ['WebMcpUnavailable', 'TypeError', 'NetworkError']) {
    if (error.message.includes(key)) {
      return TROUBLESHOOTING_GUIDANCE[key];
    }
  }
  return TROUBLESHOOTING_GUIDANCE.client_error;
}

export type TimelineFilterGroup =
  | 'all'
  | 'failures'
  | 'blocked'
  | 'tools'
  | 'nav';

export function timelineEventGroup(
  category: TroubleshootingEvent['category'],
): TimelineFilterGroup {
  if (category === 'fetch_failure' || category === 'client_error') {
    return 'failures';
  }
  if (category === 'action_blocked') {
    return 'blocked';
  }
  if (
    category === 'tool_activated' ||
    category === 'tool_cancelled' ||
    category === 'toolchange'
  ) {
    return 'tools';
  }
  if (category === 'route_change' || category === 'agent_form_submit') {
    return 'nav';
  }
  return 'all';
}
