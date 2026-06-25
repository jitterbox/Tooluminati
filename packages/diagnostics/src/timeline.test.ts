import { describe, expect, it, vi } from 'vitest';
import {
  TroubleshootingTimelineBuffer,
  createFetchFailureTracker,
  createTroubleshootingTimelineTool,
} from './timeline';

describe('TroubleshootingTimelineBuffer', () => {
  it('stores events newest first with limit enforcement', () => {
    const buffer = new TroubleshootingTimelineBuffer({ maxSize: 2 });
    buffer.push({
      category: 'route_change',
      title: 'a',
      to: '/a',
    });
    buffer.push({
      category: 'route_change',
      title: 'b',
      to: '/b',
    });
    buffer.push({
      category: 'route_change',
      title: 'c',
      to: '/c',
    });

    const events = buffer.list();
    expect(events).toHaveLength(2);
    expect(events[0]?.title).toBe('c');
  });

  it('filters by category and respects tool limit cap', () => {
    const buffer = new TroubleshootingTimelineBuffer();
    for (let i = 0; i < 25; i += 1) {
      buffer.push({
        category: 'client_error',
        title: `err-${i}`,
        message: `err-${i}`,
      });
    }

    const filtered = buffer.list({
      categories: ['client_error'],
      limit: 100,
    });
    expect(filtered).toHaveLength(20);
  });

  it('redacts events when configured', () => {
    const buffer = new TroubleshootingTimelineBuffer({
      redact: (event) => ({
        ...event,
        title: event.title.replace(/secret/gi, '[redacted]'),
      }),
    });
    buffer.push({
      category: 'custom',
      title: 'secret value',
    });
    expect(buffer.list()[0]?.title).toBe('[redacted] value');
  });
});

describe('createFetchFailureTracker', () => {
  it('records non-ok fetch responses', async () => {
    const buffer = new TroubleshootingTimelineBuffer();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false, status: 403 }) as Response),
    );
    const restore = createFetchFailureTracker({ buffer });

    await fetch('/api/checkout?token=abc');
    restore();
    vi.unstubAllGlobals();

    const events = buffer.list({ categories: ['fetch_failure'] });
    expect(events).toHaveLength(1);
    expect(events[0]?.title).toContain('403');
    const fetchEvent = events[0];
    if (fetchEvent?.category === 'fetch_failure') {
      expect(fetchEvent.url).not.toContain('token');
    }
  });
});

describe('createTroubleshootingTimelineTool', () => {
  it('returns bounded events and summary', async () => {
    const buffer = new TroubleshootingTimelineBuffer();
    buffer.push({
      category: 'action_blocked',
      title: 'submit blocked',
      actionId: 'submit',
      reasons: ['invalid'],
    });
    buffer.push({
      category: 'client_error',
      title: 'err',
      message: 'err',
    });
    const tool = createTroubleshootingTimelineTool(buffer);
    const result = await tool.execute({ categories: ['action_blocked'] }, {} as never);
    expect(result.events).toHaveLength(1);
    expect(result.summary.total).toBe(1);
  });

  it('rejects negative limits', () => {
    const tool = createTroubleshootingTimelineTool(new TroubleshootingTimelineBuffer());
    expect(() => tool.validateArgs?.({ limit: -1 })).toThrow('limit must be >= 0');
  });
});
