export interface StateSummaryToolOptions<TState, TSummary> {
  name: string;
  description: string;
  getState: () => TState;
  selector: (state: TState) => TSummary;
  redact?: ((summary: TSummary) => unknown) | undefined;
}

export interface QuerySummary {
  key: unknown;
  status?: string | undefined;
  fetchStatus?: string | undefined;
  stale?: boolean | undefined;
  updatedAt?: number | undefined;
  error?: string | undefined;
  dataShape?: unknown;
}
