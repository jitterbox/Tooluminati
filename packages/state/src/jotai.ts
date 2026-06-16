import { createStateSummaryTool } from './selector-tool';

export function createJotaiStateSummaryTool<TSummary>(options: {
  getSummary: () => TSummary;
  name?: string;
  description?: string;
  redact?: (summary: TSummary) => unknown;
}) {
  return createStateSummaryTool({
    name: options.name ?? 'get_jotai_state_summary',
    description:
      options.description ??
      'Returns an explicit summary from allowlisted Jotai atoms.',
    getState: options.getSummary,
    selector: (summary) => summary,
    redact: options.redact,
  });
}
