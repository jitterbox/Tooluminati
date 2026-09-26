import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { WebMcpForm, useAgentSubmitRespondWith } from './declarative-form';

describe('WebMcpForm', () => {
  it('renders WebMCP declarative spec attributes on the form', () => {
    const element = WebMcpForm({
      toolName: 'update_address',
      toolDescription: 'Update shipping address',
      toolAutoSubmit: true,
      children: null,
    });
    expect(element.props.toolname).toBe('update_address');
    expect(element.props.tooldescription).toBe('Update shipping address');
    expect(element.props.toolautosubmit).toBe('');
  });
});

// Exercise React's nativeEvent bridge with real DOM submission events.

afterEach(cleanup);
function Fixture({ getResult }: { getResult: () => unknown }) {
  return (
    <form data-testid="form" onSubmit={useAgentSubmitRespondWith(getResult)} />
  );
}
it.each([false, undefined])(
  'does not run result work for a human submit (%s)',
  (agentInvoked) => {
    const getResult = vi.fn();
    const { getByTestId } = render(<Fixture getResult={getResult} />);
    const respondWith = vi.fn();
    const event = Object.assign(
      new Event('submit', { bubbles: true, cancelable: true }),
      { agentInvoked, respondWith },
    );
    fireEvent(getByTestId('form'), event);
    expect(getResult).not.toHaveBeenCalled();
    expect(respondWith).not.toHaveBeenCalled();
    expect(event.defaultPrevented).toBe(false);
  },
);
it('does not run work if respondWith is unavailable', () => {
  const getResult = vi.fn();
  const { getByTestId } = render(<Fixture getResult={getResult} />);
  fireEvent(
    getByTestId('form'),
    Object.assign(new Event('submit', { bubbles: true }), {
      agentInvoked: true,
    }),
  );
  expect(getResult).not.toHaveBeenCalled();
});
it.each(['value', 'promise', 'throw', 'reject'] as const)(
  'delivers %s results to the browser',
  async (mode) => {
    const error = new Error('save failed');
    const getResult = vi.fn(() => {
      if (mode === 'throw') throw error;
      if (mode === 'reject') return Promise.reject(error);
      return mode === 'promise' ? Promise.resolve('saved') : 'saved';
    });
    const respondWith = vi.fn();
    const { getByTestId } = render(<Fixture getResult={getResult} />);
    const event = Object.assign(
      new Event('submit', { bubbles: true, cancelable: true }),
      { agentInvoked: true, respondWith },
    );
    fireEvent(getByTestId('form'), event);
    expect(respondWith).toHaveBeenCalledOnce();
    expect(event.defaultPrevented).toBe(true);
    const result = respondWith.mock.calls[0]![0];
    if (mode === 'throw' || mode === 'reject')
      await expect(result).rejects.toBe(error);
    else await expect(result).resolves.toBe('saved');
    expect(getResult).toHaveBeenCalledOnce();
  },
);
