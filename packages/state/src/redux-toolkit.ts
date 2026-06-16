import { redactObject } from '@tooluminati/core';
import { createStateSummaryTool } from './selector-tool';

export interface ReduxStoreLike<TState> {
  getState(): TState;
}

function getPathValue(state: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (current && typeof current === 'object') {
      return (current as Record<string, unknown>)[segment];
    }

    return undefined;
  }, state);
}

function pickAllowlistedPaths<TState>(
  state: TState,
  paths: string[],
): Record<string, unknown> {
  return Object.fromEntries(
    paths.map((path) => [path, getPathValue(state, path)]),
  );
}

/** @experimental */
export function createReduxStateSummaryTool<TState, TSummary>(options: {
  store: ReduxStoreLike<TState>;
  selector: (state: TState) => TSummary;
  name?: string;
  description?: string;
  redact?: (summary: TSummary) => unknown;
  pathAllowlist?: string[];
}) {
  const selector = options.pathAllowlist?.length
    ? (state: TState) =>
        pickAllowlistedPaths(state, options.pathAllowlist!) as TSummary
    : options.selector;

  return createStateSummaryTool({
    name: options.name ?? 'get_redux_state_summary',
    description:
      options.description ??
      'Returns an explicit, redacted summary of allowlisted Redux state.',
    getState: () => options.store.getState(),
    selector,
    redact: options.redact ?? ((summary) => redactObject(summary)),
  });
}
