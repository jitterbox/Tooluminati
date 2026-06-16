import { signal } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { createStateSummaryTool } from '@tooluminati/state';

describe('provideSignalStateWebMcpTools helpers', () => {
  it('reads the latest signal value through selector', () => {
    const state = signal({ count: 1, secret: 'hidden' });
    const tool = createStateSummaryTool({
      name: 'get_signal_state_summary',
      description: 'Summary',
      getState: () => state(),
      selector: (value) => ({ count: value.count }),
    });

    state.set({ count: 2, secret: 'hidden' });
    expect(tool.execute({}, {} as never)).toEqual({ count: 2 });
  });

  it('supports redux-like store snapshots', () => {
    const store = {
      getState: () => ({ user: { name: 'Ada' }, token: 'secret' }),
    };

    const tool = createStateSummaryTool({
      name: 'get_redux_state_summary',
      description: 'Summary',
      getState: () => store.getState(),
      selector: (state) => ({ userName: state.user.name }),
    });

    expect(tool.execute({}, {} as never)).toEqual({ userName: 'Ada' });
  });
});
