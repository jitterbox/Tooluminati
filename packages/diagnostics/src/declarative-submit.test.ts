import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ensureDeclarativeFocusStyles,
  isAgentInvokedSubmit,
  respondWithAgentResult,
  WEBMCP_DECLARATIVE_FOCUS_STYLES,
} from './declarative-submit';

afterEach(() => {
  vi.unstubAllGlobals();
  document.getElementById('tooluminati-webmcp-declarative-focus')?.remove();
});
function submit(agentInvoked?: boolean, respondWith?: unknown) {
  return Object.assign(new Event('submit', { cancelable: true }), {
    agentInvoked,
    respondWith,
  });
}
describe('agent results', () => {
  it.each([false, undefined])(
    'leaves human submits untouched (%s)',
    (agentInvoked) => {
      const respondWith = vi.fn();
      const event = submit(agentInvoked, respondWith);
      expect(isAgentInvokedSubmit(event)).toBe(false);
      expect(respondWithAgentResult(event, 'done')).toBe(false);
      expect(event.defaultPrevented).toBe(false);
      expect(respondWith).not.toHaveBeenCalled();
    },
  );
  it.each([undefined, true, 'invalid'])(
    'ignores unsupported respondWith %s',
    (respondWith) => {
      const event = submit(true, respondWith);
      expect(respondWithAgentResult(event, 'done')).toBe(false);
      expect(event.defaultPrevented).toBe(false);
    },
  );
  it('passes a resolved promise synchronously and prevents default submission', async () => {
    const respondWith = vi.fn();
    const event = submit(true, respondWith);
    expect(respondWithAgentResult(event, { saved: true })).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(respondWith).toHaveBeenCalledOnce();
    await expect(respondWith.mock.calls[0]![0]).resolves.toEqual({
      saved: true,
    });
  });
  it('preserves rejection for the browser consumer', async () => {
    const error = new Error('save failed');
    const result = Promise.reject(error);
    const respondWith = vi.fn();
    respondWithAgentResult(submit(true, respondWith), result);
    expect(respondWith.mock.calls[0]![0]).toBe(result);
    await expect(result).rejects.toBe(error);
  });
});
describe('declarative focus styles', () => {
  it('injects one shared style node across repeated calls', () => {
    ensureDeclarativeFocusStyles();
    const style = document.getElementById(
      'tooluminati-webmcp-declarative-focus',
    );
    ensureDeclarativeFocusStyles();
    expect(
      document.querySelectorAll('#tooluminati-webmcp-declarative-focus'),
    ).toHaveLength(1);
    expect(style?.parentElement).toBe(document.head);
    expect(style?.textContent).toBe(WEBMCP_DECLARATIVE_FOCUS_STYLES);
    expect(style?.textContent).toContain('form:tool-form-active');
    expect(style?.textContent).toContain(':tool-submit-active');
  });
  it('does nothing during SSR', () => {
    vi.stubGlobal('document', undefined);
    expect(ensureDeclarativeFocusStyles).not.toThrow();
  });
});
