import { createStateSummaryTool } from './selector-tool';

export interface ZustandStoreLike<TState> {
  getState(): TState;
}

export function createZustandStateSummaryTool<TState, TSummary>(options: {
  store: ZustandStoreLike<TState>;
  selector: (state: TState) => TSummary;
  name?: string;
  description?: string;
  redact?: (summary: TSummary) => unknown;
}) {
  return createStateSummaryTool({
    name: options.name ?? 'get_zustand_state_summary',
    description:
      options.description ??
      'Returns an explicit summary from an allowlisted Zustand selector.',
    getState: () => options.store.getState(),
    selector: options.selector,
    redact: options.redact,
  });
}
