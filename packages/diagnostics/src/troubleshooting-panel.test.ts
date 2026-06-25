import { describe, expect, it } from 'vitest';
import { ClientErrorBuffer } from './errors';
import {
  buildTroubleshootingPanelSnapshot,
  computeTroubleshootingPanelState,
  createTroubleshootingPanelVisibilityController,
  filterPanelEvents,
  serializeTroubleshootingDiagnostics,
} from './troubleshooting-panel';
import { TroubleshootingTimelineBuffer } from './timeline';
import { createWebMcpEnvironmentSummary } from './webmcp-environment';

const globalObject = {
  window: {},
  document: { modelContext: {} },
  location: { origin: 'https://app.test' },
} as unknown as typeof globalThis;

describe('troubleshooting panel snapshot', () => {
  it('computes attention when warnings and errors exist', () => {
    const timeline = new TroubleshootingTimelineBuffer();
    const errors = new ClientErrorBuffer();
    errors.push({
      message: 'TypeError: boom',
      source: 'app.tsx',
      timestamp: new Date().toISOString(),
    });
    const snapshot = buildTroubleshootingPanelSnapshot({
      timeline,
      errors,
      environment: () =>
        createWebMcpEnvironmentSummary({
          globalObject: {
            window: {},
            document: { modelContext: {}, domain: 'x.com' },
            location: { origin: 'https://app.test' },
          } as unknown as typeof globalThis,
        }),
    });
    expect(snapshot.panelState).toBe('attention');
    expect(snapshot.errors[0]?.count).toBe(1);
  });

  it('serializes diagnostics JSON for copy', () => {
    const snapshot = buildTroubleshootingPanelSnapshot({
      timeline: new TroubleshootingTimelineBuffer(),
      errors: new ClientErrorBuffer(),
      environment: () => createWebMcpEnvironmentSummary({ globalObject }),
    });
    const json = serializeTroubleshootingDiagnostics(snapshot);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    expect(parsed).toHaveProperty('webmcp');
    expect(parsed).toHaveProperty('timeline');
  });

  it('filters timeline events by group', () => {
    const timeline = new TroubleshootingTimelineBuffer();
    timeline.push({
      category: 'fetch_failure',
      title: 'fail',
      method: 'GET',
      url: '/api',
    });
    timeline.push({
      category: 'route_change',
      title: 'nav',
      to: '/x',
    });
    const snapshot = buildTroubleshootingPanelSnapshot({
      timeline,
      errors: new ClientErrorBuffer(),
      environment: () => createWebMcpEnvironmentSummary({ globalObject }),
    });
    const failures = filterPanelEvents(snapshot.events, 'failures');
    expect(failures).toHaveLength(1);
  });
});

describe('computeTroubleshootingPanelState', () => {
  it('returns unsupported when WebMCP is missing', () => {
    expect(
      computeTroubleshootingPanelState({
        supported: false,
        toolCount: 0,
        issueCount: 0,
        events: [],
        errors: [],
        warnings: [],
      }),
    ).toBe('unsupported');
  });

  it('returns attention when only timeline failures exist', () => {
    const timeline = new TroubleshootingTimelineBuffer();
    timeline.push({
      category: 'fetch_failure',
      title: 'GET /api — 403',
      method: 'GET',
      url: '/api',
      status: 403,
    });
    const snapshot = buildTroubleshootingPanelSnapshot({
      timeline,
      errors: new ClientErrorBuffer(),
      environment: () => createWebMcpEnvironmentSummary({ globalObject }),
    });
    expect(snapshot.panelState).toBe('attention');
  });
});

describe('visibility controller', () => {
  it('toggles collapsed state', () => {
    const controller = createTroubleshootingPanelVisibilityController({
      startCollapsed: true,
      storageKey: 'test.collapsed',
    });
    expect(controller.collapsed).toBe(true);
    controller.setCollapsed(false);
    expect(controller.collapsed).toBe(false);
  });
});
