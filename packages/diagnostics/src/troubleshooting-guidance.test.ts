import { describe, expect, it } from 'vitest';
import {
  TROUBLESHOOTING_GUIDANCE,
  getGuidanceForClientError,
  getGuidanceForEnvironmentCheck,
  timelineEventGroup,
} from './troubleshooting-guidance';

describe('troubleshooting guidance', () => {
  it('returns environment check guidance by id', () => {
    const guidance = getGuidanceForEnvironmentCheck({
      id: 'document.modelContext',
      label: 'document.modelContext',
      value: 'missing',
      status: 'fail',
    });
    expect(guidance?.severity).toBe('error');
    expect(TROUBLESHOOTING_GUIDANCE['document.modelContext']).toBeDefined();
  });

  it('matches client error patterns', () => {
    const guidance = getGuidanceForClientError({
      message: 'NetworkError: failed to fetch',
      source: 'api.ts',
      timestamp: new Date().toISOString(),
    });
    expect(guidance?.title).toBe('Network failure');
  });

  it('groups timeline categories', () => {
    expect(timelineEventGroup('fetch_failure')).toBe('failures');
    expect(timelineEventGroup('tool_activated')).toBe('tools');
    expect(timelineEventGroup('route_change')).toBe('nav');
  });
});
