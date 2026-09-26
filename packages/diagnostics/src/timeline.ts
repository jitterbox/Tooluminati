import type { WebMcpToolDescriptor } from '@tooluminati/core';
import type { ClientErrorBuffer, ClientErrorSummary } from './errors';

export type TroubleshootingEventCategory =
  | 'client_error'
  | 'fetch_failure'
  | 'route_change'
  | 'action_blocked'
  | 'tool_activated'
  | 'tool_cancelled'
  | 'agent_form_submit'
  | 'toolchange'
  | 'custom';

export interface TroubleshootingEventBase {
  id: string;
  category: TroubleshootingEventCategory;
  timestamp: string;
  title: string;
  detail?: string | undefined;
  metadata?: Record<string, string> | undefined;
  untrusted?: boolean | undefined;
}

export interface ClientErrorTimelineEvent extends TroubleshootingEventBase {
  category: 'client_error';
  message: string;
  source?: string | undefined;
}

export interface FetchFailureTimelineEvent extends TroubleshootingEventBase {
  category: 'fetch_failure';
  method: string;
  url: string;
  status?: number | undefined;
  durationMs?: number | undefined;
}

export interface RouteChangeTimelineEvent extends TroubleshootingEventBase {
  category: 'route_change';
  from?: string | undefined;
  to: string;
}

export interface ActionBlockedTimelineEvent extends TroubleshootingEventBase {
  category: 'action_blocked';
  actionId: string;
  reasons: string[];
}

export interface ToolLifecycleTimelineEvent extends TroubleshootingEventBase {
  category: 'tool_activated' | 'tool_cancelled' | 'agent_form_submit';
  toolName?: string | undefined;
  formId?: string | undefined;
}

export interface ToolChangeTimelineEvent extends TroubleshootingEventBase {
  category: 'toolchange';
  added: string[];
  removed: string[];
}

export interface CustomTimelineEvent extends TroubleshootingEventBase {
  category: 'custom';
}

export type TroubleshootingEvent =
  | ClientErrorTimelineEvent
  | FetchFailureTimelineEvent
  | RouteChangeTimelineEvent
  | ActionBlockedTimelineEvent
  | ToolLifecycleTimelineEvent
  | ToolChangeTimelineEvent
  | CustomTimelineEvent;

export interface TroubleshootingTimelineBufferOptions {
  maxSize?: number;
  redact?: (event: TroubleshootingEvent) => TroubleshootingEvent;
}

const DEFAULT_MAX_SIZE = 50;
const DEFAULT_TOOL_LIMIT = 20;

const VALID_CATEGORIES = new Set<TroubleshootingEventCategory>([
  'client_error',
  'fetch_failure',
  'route_change',
  'action_blocked',
  'tool_activated',
  'tool_cancelled',
  'agent_form_submit',
  'toolchange',
  'custom',
]);

let nextEventId = 0;

function createEventId(): string {
  nextEventId += 1;
  return `tlm-${nextEventId}`;
}

function stripQuerySecrets(url: string): string {
  try {
    const parsed = new URL(url, 'http://local');
    parsed.search = '';
    return parsed.pathname + (parsed.hash || '');
  } catch {
    return url.split('?')[0] ?? url;
  }
}

export type TroubleshootingEventInput =
  | Omit<ClientErrorTimelineEvent, 'id' | 'timestamp'>
  | Omit<FetchFailureTimelineEvent, 'id' | 'timestamp'>
  | Omit<RouteChangeTimelineEvent, 'id' | 'timestamp'>
  | Omit<ActionBlockedTimelineEvent, 'id' | 'timestamp'>
  | Omit<ToolLifecycleTimelineEvent, 'id' | 'timestamp'>
  | Omit<ToolChangeTimelineEvent, 'id' | 'timestamp'>
  | Omit<CustomTimelineEvent, 'id' | 'timestamp'>;

export class TroubleshootingTimelineBuffer {
  private readonly events: TroubleshootingEvent[] = [];
  private readonly maxSize: number;
  private readonly redact?: (
    event: TroubleshootingEvent,
  ) => TroubleshootingEvent;

  constructor(options: TroubleshootingTimelineBufferOptions | number = {}) {
    if (typeof options === 'number') {
      this.maxSize = options;
    } else {
      this.maxSize = options.maxSize ?? DEFAULT_MAX_SIZE;
      if (options.redact) {
        this.redact = options.redact;
      }
    }
  }

  push(
    event: TroubleshootingEventInput & {
      id?: string;
      timestamp?: string;
    },
  ): TroubleshootingEvent {
    const stored: TroubleshootingEvent = {
      ...event,
      id: event.id ?? createEventId(),
      timestamp: event.timestamp ?? new Date().toISOString(),
    } as TroubleshootingEvent;

    const finalEvent = this.redact?.(stored) ?? stored;
    this.events.unshift(finalEvent);
    this.events.splice(this.maxSize);
    return finalEvent;
  }

  list(options?: {
    categories?: TroubleshootingEventCategory[];
    since?: string;
    limit?: number;
  }): TroubleshootingEvent[] {
    const limit = Math.max(
      0,
      Math.min(options?.limit ?? DEFAULT_TOOL_LIMIT, DEFAULT_TOOL_LIMIT),
    );
    let result = [...this.events];

    if (options?.since) {
      const sinceMs = Date.parse(options.since);
      if (Number.isNaN(sinceMs)) {
        return [];
      }
      result = result.filter((e) => Date.parse(e.timestamp) >= sinceMs);
    }

    if (options?.categories?.length) {
      const cats = new Set(options.categories);
      result = result.filter((e) => cats.has(e.category));
    }

    return result.slice(0, limit);
  }

  summary(events: TroubleshootingEvent[] = this.events): {
    total: number;
    byCategory: Record<string, number>;
  } {
    const byCategory: Record<string, number> = {};
    for (const event of events) {
      byCategory[event.category] = (byCategory[event.category] ?? 0) + 1;
    }
    return { total: events.length, byCategory };
  }

  clear(): void {
    this.events.splice(0);
  }
}

export interface FetchFailureTrackerOptions {
  buffer: TroubleshootingTimelineBuffer;
  enabled?: boolean;
  redactBody?: boolean;
  ignoreUrls?: RegExp;
}

let fetchTrackerCount = 0;
let originalFetch: typeof fetch | undefined;

export function createFetchFailureTracker(
  options: FetchFailureTrackerOptions,
): () => void {
  if (options.enabled === false || typeof window === 'undefined') {
    return () => {};
  }

  if (fetchTrackerCount === 0) {
    originalFetch = window.fetch.bind(window);
  }
  fetchTrackerCount += 1;
  const baseFetch = originalFetch as typeof fetch;

  window.fetch = async (input, init) => {
    const started = performance.now();
    const method = (init?.method ?? 'GET').toUpperCase();
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    if (options.ignoreUrls?.test(url)) {
      return baseFetch(input, init);
    }

    try {
      const response = await baseFetch(input, init);
      if (!response.ok) {
        const detail =
          options.redactBody === false
            ? `HTTP request failed before UI state updated.`
            : 'HTTP request failed before UI state updated.';
        options.buffer.push({
          category: 'fetch_failure',
          title: `${method} ${stripQuerySecrets(url)} — ${response.status}`,
          method,
          url: stripQuerySecrets(url),
          status: response.status,
          durationMs: Math.round(performance.now() - started),
          detail,
          metadata: {
            host: safeHost(url),
            status: String(response.status),
          },
        });
      }
      return response;
    } catch (error) {
      options.buffer.push({
        category: 'fetch_failure',
        title: `${method} ${stripQuerySecrets(url)} — network error`,
        method,
        url: stripQuerySecrets(url),
        durationMs: Math.round(performance.now() - started),
        detail:
          error instanceof Error ? error.message : 'Network request failed.',
        metadata: { host: safeHost(url) },
      });
      throw error;
    }
  };

  return () => {
    fetchTrackerCount = Math.max(0, fetchTrackerCount - 1);
    if (fetchTrackerCount === 0 && originalFetch) {
      window.fetch = originalFetch;
      originalFetch = undefined;
    }
  };
}

function safeHost(url: string): string {
  try {
    return new URL(url, window.location.origin).host;
  } catch {
    return 'unknown';
  }
}

export function createTimelineFromErrorBuffer(
  buffer: ClientErrorBuffer,
  timeline: TroubleshootingTimelineBuffer,
): () => void {
  const originalPush = buffer.push.bind(buffer);
  buffer.push = (error: ClientErrorSummary) => {
    originalPush(error);
    timeline.push({
      category: 'client_error',
      title: error.message,
      message: error.message,
      source: error.source,
      detail: 'Client error captured by diagnostics buffer.',
      metadata: {
        source: error.source,
        ...(error.route ? { route: error.route } : {}),
      },
      untrusted: true,
    });
  };
  return () => {
    buffer.push = originalPush;
  };
}

export interface WebMcpLifecycleCollectorOptions {
  buffer: TroubleshootingTimelineBuffer;
  enabled?: boolean;
}

export function createWebMcpLifecycleCollector(
  options: WebMcpLifecycleCollectorOptions,
): () => void {
  if (options.enabled === false || typeof window === 'undefined') {
    return () => {};
  }

  const cleanups: Array<() => void> = [];

  const onToolActivated = (event: Event) => {
    const detail = (event as CustomEvent).detail as
      | { toolName?: string; form?: HTMLFormElement }
      | undefined;
    options.buffer.push({
      category: 'tool_activated',
      title: `agent activated ${detail?.toolName ?? 'form tool'}`,
      toolName: detail?.toolName,
      formId: detail?.form?.id,
      detail: 'Declarative form tool activated by the agent.',
    });
  };

  const onToolCancel = (event: Event) => {
    const detail = (event as CustomEvent).detail as { toolName?: string };
    options.buffer.push({
      category: 'tool_cancelled',
      title: `agent cancelled ${detail?.toolName ?? 'form tool'}`,
      toolName: detail?.toolName,
      detail: 'Agent cancelled a declarative form tool.',
    });
  };

  const onAgentFormSubmit = (event: Event) => {
    const submitEvent = event as SubmitEvent & { agentInvoked?: boolean };
    if (!submitEvent.agentInvoked) {
      return;
    }
    const form = event.target as HTMLFormElement | null;
    const toolName = form?.getAttribute('toolname') ?? 'form';
    options.buffer.push({
      category: 'agent_form_submit',
      title: `agent submitted ${toolName}`,
      toolName,
      formId: form?.id,
      detail: 'Agent invoked declarative form submit.',
    });
  };

  const onToolChange = () => {
    options.buffer.push({
      category: 'toolchange',
      title: 'tool registry changed',
      added: [],
      removed: [],
      detail: 'WebMCP tool registry changed on document.modelContext.',
    });
  };

  window.addEventListener('toolactivated', onToolActivated);
  window.addEventListener('toolcancel', onToolCancel);
  window.addEventListener('submit', onAgentFormSubmit, true);
  cleanups.push(() => {
    window.removeEventListener('toolactivated', onToolActivated);
    window.removeEventListener('toolcancel', onToolCancel);
    window.removeEventListener('submit', onAgentFormSubmit, true);
  });

  const modelContext = (
    document as Document & { modelContext?: EventTarget }
  ).modelContext;
  if (modelContext?.addEventListener) {
    modelContext.addEventListener('toolchange', onToolChange);
    cleanups.push(() => {
      modelContext.removeEventListener('toolchange', onToolChange);
    });
  }

  return () => {
    for (const cleanup of cleanups) {
      cleanup();
    }
  };
}

export interface TroubleshootingTimelineToolInput {
  categories?: string[];
  since?: string;
  limit?: number;
}

export function createTroubleshootingTimelineTool(
  buffer: TroubleshootingTimelineBuffer,
  name = 'get_troubleshooting_timeline',
): WebMcpToolDescriptor<
  TroubleshootingTimelineToolInput,
  {
    events: TroubleshootingEvent[];
    summary: { total: number; byCategory: Record<string, number> };
  }
> {
  return {
    name,
    description:
      'Returns a bounded, redacted timeline of recent runtime incidents.',
    inputSchema: {
      type: 'object',
      properties: {
        categories: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional event categories to include.',
        },
        since: {
          type: 'string',
          description: 'ISO timestamp; only events after this time.',
        },
        limit: {
          type: 'integer',
          maximum: DEFAULT_TOOL_LIMIT,
          description: 'Max events to return (cap 20).',
        },
      },
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
      untrustedContentHint: true,
      debugging: true,
    },
    validateArgs(args) {
      if (typeof args !== 'object' || args === null) {
        return {};
      }
      const input = args as TroubleshootingTimelineToolInput;
      if (input.categories?.length) {
        const invalid = input.categories.filter(
          (category) =>
            !VALID_CATEGORIES.has(category as TroubleshootingEventCategory),
        );
        if (invalid.length) {
          throw new Error(`Unknown timeline categories: ${invalid.join(', ')}`);
        }
      }
      if (input.limit !== undefined && input.limit < 0) {
        throw new Error('limit must be >= 0.');
      }
      return input;
    },
    execute: (input) => {
      const events = buffer.list({
        ...(input.categories?.length
          ? {
              categories: input.categories as TroubleshootingEventCategory[],
            }
          : {}),
        ...(input.since ? { since: input.since } : {}),
        ...(input.limit !== undefined ? { limit: input.limit } : {}),
      });
      return {
        events,
        summary: buffer.summary(events),
      };
    },
  };
}
