export interface MappedFormError {
  path: string;
  message: string;
  kind?: string | undefined;
}

export interface QuerySummaryPolicyShape {
  allowKeys: unknown[];
  includeData?: boolean | undefined;
  includeDataShape?: boolean | undefined;
}

export interface FormErrorMapper {
  map(error: unknown, path?: string): MappedFormError;
}

export interface QuerySummaryPolicy extends QuerySummaryPolicyShape {
  redact?: ((summary: unknown) => unknown) | undefined;
}

export interface StateRedactionPolicy {
  redact(value: unknown, path?: string): unknown;
}
