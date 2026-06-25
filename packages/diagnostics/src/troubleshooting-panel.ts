import type { WebMcpRegistry } from '@tooluminati/core';
import type { ClientErrorBuffer, ClientErrorSummary } from './errors';
import {
  getGuidanceForClientError,
  getGuidanceForEnvironmentCheck,
  getGuidanceForTimelineEvent,
  timelineEventGroup,
  type TimelineFilterGroup,
} from './troubleshooting-guidance';
import type { TroubleshootingEvent, TroubleshootingTimelineBuffer } from './timeline';
import {
  createWebMcpEnvironmentSummary,
  type WebMcpEnvironmentCheck,
  type WebMcpEnvironmentSummary,
} from './webmcp-environment';

export type TroubleshootingPanelState =
  | 'ok'
  | 'attention'
  | 'unsupported'
  | 'empty';

export interface TroubleshootingPanelSources {
  timeline: TroubleshootingTimelineBuffer;
  environment: () => WebMcpEnvironmentSummary;
  errors: ClientErrorBuffer;
  registry?: WebMcpRegistry | undefined;
}

export interface TroubleshootingPanelEventView {
  id: string;
  category: TroubleshootingEvent['category'];
  group: TimelineFilterGroup;
  title: string;
  time: string;
  detail?: string | undefined;
  metadata?: Record<string, string> | undefined;
  guidance?: string | undefined;
}

export interface TroubleshootingPanelErrorView {
  id: string;
  message: string;
  source: string;
  time: string;
  count: number;
  stack?: string | undefined;
  guidance?: string | undefined;
}

export interface TroubleshootingPanelCheckView extends WebMcpEnvironmentCheck {
  guidance?: string | undefined;
}

export interface TroubleshootingPanelSnapshot {
  supported: boolean;
  toolCount: number;
  origin: string;
  panelState: TroubleshootingPanelState;
  issueCount: number;
  checks: TroubleshootingPanelCheckView[];
  events: TroubleshootingPanelEventView[];
  errors: TroubleshootingPanelErrorView[];
  warnings: string[];
  updatedAt: string;
}

export interface TroubleshootingPanelViewModelOptions {
  eventLimit?: number;
  pollMs?: number | null;
  registry?: WebMcpRegistry | undefined;
}

export interface TroubleshootingPanelViewModel {
  refresh(): TroubleshootingPanelSnapshot;
  subscribe(listener: () => void): () => void;
  dispose(): void;
}

export interface TroubleshootingPanelVisibilityController {
  visible: boolean;
  collapsed: boolean;
  show(): void;
  hide(): void;
  toggle(): void;
  setCollapsed(collapsed: boolean): void;
  subscribe(listener: () => void): () => void;
}

const STORAGE_KEY = 'tooluminati.troubleshootingPanel.collapsed';

function relativeTime(iso: string): string {
  const delta = Date.now() - Date.parse(iso);
  if (Number.isNaN(delta) || delta < 0) {
    return 'now';
  }
  const seconds = Math.round(delta / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.round(seconds / 60);
  return `${minutes}m`;
}

function dedupeErrors(
  errors: ClientErrorSummary[],
): TroubleshootingPanelErrorView[] {
  const counts = new Map<string, number>();
  for (const error of errors) {
    counts.set(error.message, (counts.get(error.message) ?? 0) + 1);
  }
  const seen = new Set<string>();
  const views: TroubleshootingPanelErrorView[] = [];
  for (const error of errors) {
    if (seen.has(error.message)) {
      continue;
    }
    seen.add(error.message);
    const guidance = getGuidanceForClientError(error)?.hint;
    views.push({
      id: error.message,
      message: error.message,
      source: error.source,
      time: relativeTime(error.timestamp),
      count: counts.get(error.message) ?? 1,
      ...(error.stack ? { stack: error.stack } : {}),
      ...(guidance ? { guidance } : {}),
    });
  }
  return views;
}

export function computeTroubleshootingPanelState(
  snapshot: Pick<
    TroubleshootingPanelSnapshot,
    'supported' | 'toolCount' | 'issueCount' | 'events' | 'errors' | 'warnings'
  >,
): TroubleshootingPanelState {
  if (!snapshot.supported) {
    return 'unsupported';
  }
  const hasIncidents =
    snapshot.issueCount > 0 ||
    snapshot.errors.length > 0 ||
    snapshot.events.some(
      (event) =>
        event.group === 'failures' ||
        event.group === 'blocked' ||
        event.category === 'toolchange',
    );
  if (
    !hasIncidents &&
    snapshot.events.length === 0 &&
    snapshot.errors.length === 0
  ) {
    return snapshot.toolCount === 0 ? 'empty' : 'ok';
  }
  if (hasIncidents) {
    return 'attention';
  }
  return 'ok';
}

export function serializeTroubleshootingDiagnostics(
  snapshot: TroubleshootingPanelSnapshot,
): string {
  return JSON.stringify(
    {
      webmcp: {
        supported: snapshot.supported,
        toolCount: snapshot.toolCount,
        origin: snapshot.origin,
        panelState: snapshot.panelState,
      },
      checks: snapshot.checks.map((c) => ({
        label: c.label,
        value: c.value,
        status: c.status,
        ...(c.guidance ? { guidance: c.guidance } : {}),
      })),
      timeline: snapshot.events.map((e) => ({
        category: e.category,
        title: e.title,
        t: e.time,
        ...(e.guidance ? { guidance: e.guidance } : {}),
        ...(e.metadata ? { metadata: e.metadata } : {}),
      })),
      clientErrors: snapshot.errors.map((e) => ({
        message: e.message,
        count: e.count,
        ...(e.guidance ? { guidance: e.guidance } : {}),
      })),
      warnings: snapshot.warnings,
    },
    null,
    2,
  );
}

export function buildTroubleshootingPanelSnapshot(
  sources: TroubleshootingPanelSources,
  options: TroubleshootingPanelViewModelOptions = {},
): TroubleshootingPanelSnapshot {
  const env =
    sources.environment() ??
    createWebMcpEnvironmentSummary({
      ...(sources.registry ? { registry: sources.registry } : {}),
      ...(options.registry ? { registry: options.registry } : {}),
    });
  const eventLimit = options.eventLimit ?? 20;
  const rawEvents = sources.timeline.list({ limit: eventLimit });
  const events: TroubleshootingPanelEventView[] = rawEvents.map((event) => {
    const guidance = getGuidanceForTimelineEvent(event)?.hint;
    return {
      id: event.id,
      category: event.category,
      group: timelineEventGroup(event.category),
      title: event.title,
      time: relativeTime(event.timestamp),
      ...(event.detail ? { detail: event.detail } : {}),
      ...(event.metadata ? { metadata: event.metadata } : {}),
      ...(guidance ? { guidance } : {}),
    };
  });

  const checks: TroubleshootingPanelCheckView[] = env.checks.map((check) => {
    const guidance = getGuidanceForEnvironmentCheck(check)?.hint;
    return {
      ...check,
      ...(guidance ? { guidance } : {}),
    };
  });

  const errors = dedupeErrors(sources.errors.list());
  const warnCount = checks.filter(
    (c) => c.status === 'warn' || c.status === 'fail',
  ).length;
  const incidentEvents = events.filter(
    (event) => event.group === 'failures' || event.group === 'blocked',
  ).length;
  const issueCount = warnCount + errors.length + incidentEvents;
  const snapshot: TroubleshootingPanelSnapshot = {
    supported: env.supported,
    toolCount: env.toolCount,
    origin: env.origin,
    issueCount,
    checks,
    events,
    errors,
    warnings: env.warnings,
    updatedAt: new Date().toISOString(),
    panelState: 'ok',
  };
  snapshot.panelState = computeTroubleshootingPanelState(snapshot);
  return snapshot;
}

export function createTroubleshootingPanelViewModel(
  sources: TroubleshootingPanelSources,
  options: TroubleshootingPanelViewModelOptions = {},
): TroubleshootingPanelViewModel {
  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setInterval> | undefined;

  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  if (options.pollMs && options.pollMs > 0) {
    timer = setInterval(notify, options.pollMs);
  }

  return {
    refresh() {
      return buildTroubleshootingPanelSnapshot(sources, options);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose() {
      listeners.clear();
      if (timer) {
        clearInterval(timer);
      }
    },
  };
}

export function createTroubleshootingPanelVisibilityController(options?: {
  startCollapsed?: boolean;
  storageKey?: string;
}): TroubleshootingPanelVisibilityController {
  const storageKey = options?.storageKey ?? STORAGE_KEY;
  const listeners = new Set<() => void>();
  let visible = true;
  let collapsed = options?.startCollapsed ?? readCollapsed(storageKey);

  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };

  return {
    get visible() {
      return visible;
    },
    get collapsed() {
      return collapsed;
    },
    show() {
      visible = true;
      notify();
    },
    hide() {
      visible = false;
      notify();
    },
    toggle() {
      visible = !visible;
      notify();
    },
    setCollapsed(next) {
      collapsed = next;
      writeCollapsed(storageKey, next);
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function isPanelEnabledByDefault(
  enabled: boolean | 'auto' | undefined,
): boolean {
  if (enabled === true) {
    return true;
  }
  if (enabled === false) {
    return false;
  }
  const nodeEnv =
    typeof process !== 'undefined' ? process.env?.NODE_ENV : undefined;
  if (!nodeEnv || nodeEnv === 'development' || nodeEnv === 'test') {
    return true;
  }
  return nodeEnv !== 'production';
}

export function isPanelUrlOverrideEnabled(
  allowUrlOverride: boolean | undefined,
): boolean {
  if (!allowUrlOverride || typeof window === 'undefined') {
    return false;
  }
  return new URLSearchParams(window.location.search).has('tooluminati-panel');
}

function readCollapsed(storageKey: string): boolean {
  if (typeof sessionStorage === 'undefined') {
    return false;
  }
  return sessionStorage.getItem(storageKey) === '1';
}

function writeCollapsed(storageKey: string, collapsed: boolean): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  sessionStorage.setItem(storageKey, collapsed ? '1' : '0');
}

export function filterPanelEvents(
  events: TroubleshootingPanelEventView[],
  filter: TimelineFilterGroup,
): TroubleshootingPanelEventView[] {
  if (filter === 'all') {
    return events;
  }
  return events.filter((event) => event.group === filter);
}
