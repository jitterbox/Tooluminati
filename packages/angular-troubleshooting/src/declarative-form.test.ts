import './test-setup';
import { TestBed } from '@angular/core/testing';
import { afterEach, expect, it, vi } from 'vitest';
import * as diagnostics from '@tooluminati/diagnostics';
import {
  respondWithAgentResult,
  isAgentInvokedSubmit,
  ensureDeclarativeFocusStyles,
  WEBMCP_DECLARATIVE_FOCUS_STYLES,
} from './index';

afterEach(() => TestBed.resetTestingModule());
it('exports shared submit and style helpers through the public Angular entry point', async () => {
  expect(respondWithAgentResult).toBe(diagnostics.respondWithAgentResult);
  expect(isAgentInvokedSubmit).toBe(diagnostics.isAgentInvokedSubmit);
  expect(ensureDeclarativeFocusStyles).toBe(
    diagnostics.ensureDeclarativeFocusStyles,
  );
  expect(WEBMCP_DECLARATIVE_FOCUS_STYLES).toBe(
    diagnostics.WEBMCP_DECLARATIVE_FOCUS_STYLES,
  );
  const respondWith = vi.fn();
  const event = Object.assign(new Event('submit', { cancelable: true }), {
    agentInvoked: true,
    respondWith,
  });
  expect(respondWithAgentResult(event, 'saved')).toBe(true);
  await expect(respondWith.mock.calls[0]![0]).resolves.toBe('saved');
});
