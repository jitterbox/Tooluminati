import { redactObject } from '@react-webmcp-diagnostics/core';
import { createStateSummaryTool } from './selector-tool';

export interface ReduxStoreLike<TState> {
  getState(): TState;
}

export function createReduxStateSummaryTool<TState, TSummary>(options: {
  store: ReduxStoreLike<TState>;
  selector: (state: TState) => TSummary;
  name?: string;
  description?: string;
  redact?: (summary: TSummary) => unknown;
}) {
  return createStateSummaryTool({
    name: options.name ?? 'get_redux_state_summary',
    description:
      options.description ??
      'Returns an explicit, redacted summary of allowlisted Redux state.',
    getState: () => options.store.getState(),
    selector: options.selector,
    redact: options.redact ?? ((summary) => redactObject(summary)),
  });
}
