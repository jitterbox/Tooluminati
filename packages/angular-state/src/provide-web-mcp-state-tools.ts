import {
  EnvironmentProviders,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  type Signal,
} from '@angular/core';
import type { WebMcpToolDescriptor } from '@tooluminati/core';
import { registerWebMcpTools } from '@tooluminati/angular';
import {
  createReduxStateSummaryTool,
  createStateSummaryTool,
  type ReduxStoreLike,
} from '@tooluminati/state';

export function provideNgRxWebMcpTools<TState, TSummary>(options: {
  store: ReduxStoreLike<TState>;
  selector: (state: TState) => TSummary;
  name?: string;
  description?: string;
  redact?: (summary: TSummary) => unknown;
  pathAllowlist?: string[];
}): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      registerWebMcpTools(
        [createReduxStateSummaryTool(options) as WebMcpToolDescriptor],
        { source: 'diagnostic' },
      );
    }),
  ]);
}

export function provideSignalStateWebMcpTools<TState, TSummary>(options: {
  state: Signal<TState>;
  selector: (state: TState) => TSummary;
  name?: string;
  description?: string;
  redact?: (summary: TSummary) => unknown;
}): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      registerWebMcpTools(
        [
          createStateSummaryTool({
            name: options.name ?? 'get_signal_state_summary',
            description:
              options.description ??
              'Returns a safe summary of selected signal-backed state.',
            getState: () => options.state(),
            selector: options.selector,
            redact: options.redact,
          }) as WebMcpToolDescriptor,
        ],
        { source: 'diagnostic' },
      );
    }),
  ]);
}
